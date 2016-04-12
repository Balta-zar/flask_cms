// initialize data to null
var data = null;
var posts = null;
var comments = null;
var old_comment = '';
var old_author = '';

$.ajaxSetup({
    async: false
});

function load_informations(rezultat) {
    data = rezultat;
    create_left_menu(); // without ajax. Just with informations from server. TODO send only posts from server. Not all things
    prikazi_home_page();
}

function create_left_menu() {
    if (data === null) {data=[];} // ako nema nikakvih podataka u data (skoro nemoguce) pravim prazan niz da ne bi doslo do greske u for petlji
    var html = '<ul class="levi_meni">' +
                    '<li id="post-1" onclick="prikazi_home_page()">Home</li>';
                $.each(data, function(key, val){
                    html += '<li id="post'+val.id+'" onclick="prikazi_komentare('+val.id+')">'+val.post+'</li>';
                });
       html += '</ul>';
    $('#place_for_left_menu').html(html);
}

function view_place_for_comment(post_id) {
    modify = document.getElementById('new_comment');
    html = '<form onsubmit="posalji_komentar('+post_id+'); return false;">' +
                '<textarea id="textarea" name=\"textarea\" placeholder=\"Type your comment here\"></textarea>' +
                '<br>' +
                '<input id="author" type="text" name="author" placeholder="Your name">' +
                '<br>' +
                '<input type="submit" name="submit" value="Send comment">' +
            '</form>';
    modify.innerHTML = html;
    document.getElementById('pre_send_comment').style.display = 'none';
}

function prikazi_home_page() {
    $('.levi_meni li').removeClass("active");
    $('#post-1').addClass("active");

    html = '<h2>HOME PAGE</h2><br>';
    html += '<div class="home_page">' +
                'Zovem se Bojan Baltić' +
            '</div>';
    $('#comments').html(html);
}

function prikazi_komentare(post_id){
    $('.levi_meni li').removeClass("active");
    $('#post'+post_id).addClass("active");
    var html = ''
    $.getJSON('http://127.0.0.1:5000/api/comments/'+post_id, function(data){
        html += '<h2>'+ data[0].post +'</h2><br>'
        if (typeof data[0].comment === 'undefined') { // there are no comments
            html += '<h2>Nema komentara</h2><hr>';
        }
        else {
            $.each(data, function(key, val){
                // prolazak samo kroz komentare koji pripadaju postu sa oznacenim post_id
                html += '<div class="comment">' +
                            val.comment +
                            '<div class=\"about_author\">' +
                                val.author +
                            '</div>' +
                        '</div>' +
                        '<hr>';
            });
        }
        //html += '<h3>Ostavite komentar</h3><br>';
        //html += '<form onsubmit="posalji_komentar('+post_id+'); return false;">' +
        //            '<textarea style="width: 50%;" id="textarea" name=\"textarea\" placeholder=\"Type your comment here\">'+old_comment+'</textarea>' +
        //            '<br>' +
        //            '<input id="author" type="text" name="author" placeholder="Your name" value="'+old_author+'">' +
        //            '<br>' +
        //            '<input type="submit" name="submit" value="Send comment">' +
        //        '</form>';
        $('#comments').html(html);
    });
}

function posalji_komentar(post_id) {
    var comment = document.getElementById("textarea").value;
    var author = document.getElementById("author").value;
    console.log(comment);
    if (comment === '' || author === '') {
        // do nothing. TODO return information to user
        old_comment = comment;
        old_author = author;
    }
    else {
        old_comment = '';
        old_author = '';
        $.getJSON('http://127.0.0.1:5000/_posalji_komentar', {
            comment: comment,
            author: author,
            post_id: post_id
        });
    }

    prikazi_komentare(post_id);
}

function view_place_for_post() {
    modify = document.getElementById('place_for_post');
    html = '<form action=\"\" method=\"post\">' +
                '<textarea name=\"textarea\" placeholder=\"Type your post here\"></textarea>' +
                '<br>' +
                '<input type="submit" name="submit" value="Send post">' +
            '</form>';

    modify.innerHTML = html;
    // document.getElementById('button_for_post').style.display = 'none'
}