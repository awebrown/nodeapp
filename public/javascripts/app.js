var app = angular.module('flapperNews', ['ui.router'])

/*
You may be wondering why we're using the keyword factory instead of service. In angular, factory and service are related in that they are both instances of a third entity called provider.
What we're doing here is creating a new object that has an array property called posts. We then return that variable so that our o object essentially becomes exposed to any other Angular module that cares to inject it. You'll note that we could have simply exported the posts array directly, however, by exporting an object that contains the posts array we can add new objects and methods to our services in the future.
*/

.config([
	'$stateProvider',
	'$urlRouterProvider', 
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					postPromise: ['posts', function(posts){
						return posts.getAll();
					}]
				}
			})
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl',
				resolve: {
	    			post: ['$stateParams', 'posts', function($stateParams, posts) {
	      				return posts.get($stateParams.id);
	    			}]
	  			}
			});
			$urlRouterProvider.otherwise('home');
		}])

.factory('posts', ['$http', function($http){
	//service body
	var o = {
		posts: []
	};
	o.get = function(id) {
	  	return $http.get('/posts/' + id).then(function(res){
	    	return res.data;
  		});
  	};

	o.getAll = function() {
    	return $http.get('/posts').success(function(data){
      		angular.copy(data, o.posts);
    	});
  	};

  	o.create = function(post) {
  		return $http.post('/posts/', post).success(function(data){
    		o.posts.push(data);
  		});
  	};

	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
		.success(function(data){
			post.upvotes += 1;
		});
  	};

  	o.addComment = function(id, comment) {
  		return $http.post('/posts/' + id + '/comments', comment);
	};

	o.upvoteComment = function(post, comment) {
  		return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
    		.success(function(data){
      		comment.upvotes += 1;
    	});
	};
	return o;
}])

.controller('MainCtrl', [
	'$scope', 
	'posts', 
	function($scope, posts){

		$scope.posts = posts.posts;

		$scope.addPost = function() {
			if($scope.title === '') {return;}
			posts.create({
				title: $scope.title, 
				link: $scope.link,
			});
			$scope.title = '';
			$scope.link = '';
		};

		$scope.incrementUpvotes = function(post) {
				posts.upvote(post);
			};
	}])

.controller('PostsCtrl', [
	'$scope',
	'posts', 
	'post', 
	function($scope, posts, post){
		$scope.post = post;

		$scope.addComment = function(){
			if($scope.body === ''){return;}
			posts.addComment(post._id, {
				body: $scope.body,
				author: 'user',
			}).success(function(comment){
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
		};
		
		$scope.incrementUpvotes = function(comment){
  			posts.upvoteComment(post, comment);
		};
	}]);






















