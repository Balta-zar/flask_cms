angular.module('IndexModule', [])
.controller('IndexController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
  // U dokumentaciji pise da je lose imati $scope.varijablu vec da je potrebno napraviti objekat
  // $scope.MyControllerObject = {};
  // i onda nakon toga koristimo varijable $scope.MyControllerObject.variable = ...;
  // "Ne znam na cemu su bili kad su smisljali ovo, ali bih voleo da mi daju malo"
  $scope.variable = {};
  $scope.retrieve = function(){
    var request = {method: 'GET', url: '/api/comments/'+$scope.variable.post_id};
    $http(request)
    .then(function(response){
      $scope.variable.data = response.data;
      if (typeof($scope.variable.data[0].comment) === 'undefined') {
        $scope.variable.data = [{comment: 'There are no comments', author: ''}];
      }
    }, function(response){
      $scope.variable.data = [{comment: 'Nije moguce ostvariti konekciju sa serverom', author: ''}];
    });
  };
  
  $scope.send_comment = function(id){
    var request = {
      method: 'GET', // TODO nekad kasnije implementirati preko POST. Problem je na serverskoj strani
      url: '/_posalji_komentar?post_id='+id+'&comment='+$scope.variable.comment+'&author='+$scope.variable.author
    };
    $http(request)
    .then(function(response){
      $scope.retrieve();
      $scope.reset();
    }, function(response){
      $scope.variable.data = [{comment: 'Nije moguce ostvariti konekciju sa serverom', author: ''}];
      $scope.reset();
    });
  };
  
  $scope.reset = function(){
    $scope.variable.comment = '';
    $scope.variable.author = '';
  };
  
}]);

// ****************************************************************

angular.module('ProbaModule', [])
.controller('ProbaController', ['$scope', '$http', '$routeParams', '$location', '$route', function ($scope, $http, $routeParams, $location, $route) {
  // U dokumentaciji pise da je lose imati $scope.varijablu vec da je potrebno napraviti objekat
  // $scope.MyControllerObject = {};
  // i onda nakon toga koristimo varijable $scope.MyControllerObject.variable = ...;
  // "Ne znam na cemu su bili kad su smisljali ovo, ali bih voleo da mi daju malo"
  $scope.variable = {};
  var request = {method: 'GET', url: '/api/comments/'+$routeParams.postId};
  $http(request)
  .then(function(response){
    $scope.variable.data = response.data;
    if (typeof($scope.variable.data[0].comment) === 'undefined') {
      $scope.variable.data[0]["comment"] = 'There are no comments';
      $scope.variable.data[0]["author"] = '';
    }
  }, function(response){
    $scope.variable.data = [{comment: 'Nije moguce ostvariti konekciju sa serverom', author: ''}];
  });
  
  $scope.send_comment = function(){
    if ($scope.variable.comment.replace(' ', '') === '' || $scope.variable.author.replace(' ', '') === '') {
        return;
    }
    var request = {
      method: 'GET', // TODO nekad kasnije implementirati preko POST. Problem je na serverskoj strani
      url: '/_posalji_komentar?post_id='+$routeParams.postId+'&comment='+$scope.variable.comment+'&author='+$scope.variable.author
    };
    $http(request)
    .then(function(response){
      $route.reload();
      $scope.reset();
    }, function(response){
      $scope.variable.data = [{comment: 'Nije moguce ostvariti konekciju sa serverom', author: ''}];
      $scope.reset();
    });
  };
  
  $scope.getId = function(){
    if (typeof($routeParams.postId) === 'undefined') {
        return -1;
    }
    return(parseInt($routeParams.postId));
  };
  
  $scope.reset = function(){
    $scope.variable.comment = '';
    $scope.variable.author = '';
  };
  
}]);