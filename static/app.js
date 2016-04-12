var proba = angular.module('proba', ['ngRoute', 'ProbaModule']);

// menjanje {{ some_var }} u {a some_var a} zbog konflikta sa Jinja2 template
// druga opcija je koriscenje {% raw %} {% endraw %} -> ovim se iskljucuje Jinja2 na tom delu koda
// Cenim da je bolje prvo resenje
// Moguce je i {{ '{{ some_var }}' }} ili menjanje Jinja2 iz {{}} u nesto drugo ali to su glupa resenja
// Postoji i neki Flask-Triangle, ali mislim da je ovo mnogo lakse resenje
proba.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{a');
  $interpolateProvider.endSymbol('a}');
}]);


proba.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'static/views/home_page.html',
        controller: 'ProbaController'
    })
    
    .when('/post/:postId', {
        templateUrl: 'static/views/comments.html',
        controller: 'ProbaController'
    })
    
    .otherwise({
        redirectTo: '/'
    });
}]);

// *************************************************************** //

var index = angular.module('index', ['ngRoute', 'IndexModule']);

index.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{a');
  $interpolateProvider.endSymbol('a}');
}]);
