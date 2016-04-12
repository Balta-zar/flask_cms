#!/usr/bin/env python2.7
#                                           these four for sessions
from flask import Flask, render_template, request, session, url_for, escape, redirect, flash, json, jsonify, make_response

app = Flask(__name__)

from functools import wraps
import hashlib

from flask_sqlalchemy import SQLAlchemy

app.secret_key = 'secret_key'

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://cms:@localhost/cms'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SQLALCHEMY_POOL_SIZE'] = 30
app.config['SQLALCHEMY_POOL_RECYCLE'] = 280

db = SQLAlchemy(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    password = db.Column(db.String(40))
    first_name = db.Column(db.String(40))
    last_name = db.Column(db.String(30))

    def __init__(self, username, password, first_name, last_name):
        self.username = username
        self.password = password
        self.first_name = first_name
        self.last_name = last_name

class Posts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post = db.Column(db.Text)

    def __init__(self, post):
        self.post = post

class Post_comments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer)
    author = db.Column(db.String(40))
    comment = db.Column(db.Text)

    def __init__(self, post_id, author, comment):
        self.post_id = post_id
        self.author = author
        self.comment = comment

def login_required(test):
    @wraps(test)
    def wrap(*args, **kwargs):
        if 'user_id' in session:
            return test(*args, **kwargs)
        else:
            flash('You need to login first.')
            return redirect(url_for('admin_login'))
    return wrap

def logout_required(test):
    @wraps(test)
    def wrap(*args, **kwargs):
        if ('user_id' in session):
            flash('You need to logout first')
            return redirect(url_for('admin'))
        else:
            return test(*args, **kwargs)
    return wrap

@app.route('/')
@app.route('/index')
#@login_required
def index():
    posts = Posts.query.all()
    return render_template('index.html', posts = posts)

@app.route('/admin', methods=['POST', 'GET'])
@login_required
def admin():
    # POST request -> adding new post
    if request.method == 'POST':
        post = request.form['textarea']
        new_post = Posts(post)
        db.session.add(new_post)
        db.session.commit()

    # GET request
    # find logged user, all posts and comments
    user = Users.query.filter_by(id=session['user_id']).first()
    posts = Posts.query.all()
    comments = Post_comments.query.all()
    return render_template('admin.html', user = user, posts = posts, comments = comments)

@app.route('/admin/login', methods=['POST', 'GET'])
@logout_required
def admin_login():
    # POST request
    if request.method == 'POST':
        # Handle Login button
        if request.form['submit'] == 'Login':
            username = request.form['login_username']
            password = hashlib.md5(request.form['login_password']).hexdigest()

            # It is secure from SQL injection. I'm 99% sure because I tried to hack with "password".
            # That password is malicious for application without SqlAlchemy and without MySQLdb.escape_string(string)
            user = Users.query.filter_by(username=username).filter_by(password=password).first()
            if (user is not None):
                session['user_id'] = user.id
                flash('You were successfully loged in')
                return redirect(url_for('admin')) # TODO Add admin page
            else:
                flash('Invalid username/password combination')

    return render_template('login.html')


# Delete post. URL: /admin/delete_post/post_id
@app.route('/admin/delete_post/<int:id>')
@login_required
def delete_post(id):
    id = str(id)
    post_to_delete = Posts.query.filter_by(id=id).first()
    comments_to_delete = Post_comments.query.filter_by(post_id = id).all() # Comments that belong to that post
    for comment_to_delete in comments_to_delete:
        db.session.delete(comment_to_delete)
    db.session.delete(post_to_delete)
    db.session.commit()
    return redirect(url_for('admin'))

# Delete comment URL: /admin/delete_comment/comment_id
@app.route('/admin/delete_comment/<int:id>')
@login_required
def delete_comment(id):
    id = str(id)
    comment_to_delete = Post_comments.query.filter_by(id=id).first()
    db.session.delete(comment_to_delete)
    db.session.commit()
    return redirect(url_for('admin'))

@app.route('/admin/logout')
@login_required
def admin_logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

@app.route('/_posalji_komentar')
def posalji_kom():
    post_id = request.args.get('post_id')
    comment = request.args.get('comment').strip()
    author = request.args.get('author').strip()
    
    # Serverska provera da li je klijent upisao nesto u polje komentar i autor
    if (post_id=='' or comment=='' or author==''):
        # Nije potreban deskriptivan odgovor zasto ga redirektujem jer je pokusao da unese URL sa praznim komentarom
        # Na klijentskoj strani se vrsi provera da li pokusava tako nesto i na klijentskoj strani se daje lep odgovor
        return 'Ne biste smeli da budete ovde. Ili imate jako star racunar ili ste pokusali nesto sto nije lepo :)'
        return redirect(url_for('index'))

    # Zastita od pisanja URL-a sa unesenim pogresnim post_id, odnosno sa post_id koji ne postoji u bazi podataka
    all_posts = Posts.query.filter_by(id=post_id).first()
    if all_posts is None:
        return 'Dosta bolji pokusaj od ostavljanja praznog komentara :)'
    new_comment = Post_comments(post_id, author, comment)
    db.session.add(new_comment)
    db.session.commit()
    return 'You succesfuly added comment'

# Mozda cu koristiti kasnije
@app.route('/_api_posts')
def api_posts():
    posts = Posts.query.all()
    rezultat = []
    for post in posts:
        rezultat.append({'post_id': post.id,
                         'post': post.post})
    return json.dumps(rezultat);

@app.route('/api/comments/<int:id>')
def api_comments_for_post(id):
    rezultat = []
    comments = Post_comments.query.filter_by(post_id=id).all() # return list of objects
    post = Posts.query.filter_by(id=id).first()
    if not comments: # if list is empty (no results)
        rezultat.append({'post': post.post})
    else:
        for comment in comments:
            rezultat.append({'id': comment.id,
                             'post_id': comment.post_id,
                             'author': comment.author,
                             'comment': comment.comment})
    rezultat[0]['post'] = post.post # add post in first dictionary
    return json.dumps(rezultat)

@app.route('/proba')
def proba():
    posts = Posts.query.all();
    return render_template('proba.html', posts = posts)

if __name__ == '__main__':
    app.run(debug=True)