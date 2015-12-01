// The original version of this comes from "Node.js, MongoDB, and AngularJS Web Development", an video book by Brad Dayley.
// The orignial version of this can be found here:
// http://www.informit.com/content/images/9780133929201/downloads/NodeMongoAngular_final_code.zip .
var app = angular.module('myApp', []);
app.controller('tableController', function($scope, $http) {
  $scope.words = [];
  $scope.contains = '';
  $scope.newWord = ''; // NEW
  $scope.addedWord = ''; // NEW
  $scope.limit = 5;
  $scope.skip = 0;
  $scope.skipEnd = 0;
  //+ add sort and direction to scope
  $scope.sortFields = ['Word', 'First', 'Last', 'Length',
                       'Vowels', 'Consonants'];
  $scope.sortField ="Word";
  $scope.direction = "asc";

  $scope.getWords = function(){
    $http({url: 'http://localhost:8081/words', method: "GET",
           params:{ limit:$scope.limit,
                    skip:$scope.skip,
                    //+ add sort field and direction to query parameters
                    sort:$scope.sortField,
                    direction:$scope.direction,
                    contains:$scope.contains,
					newWord: $scope.newWord // added new word parameter
					}})
    .success(function(data, status, headers, config) {
        $scope.words = data;
        $scope.skipEnd = $scope.skip + $scope.words.length;
      })
     .error(function(data, status, headers, config) {
        $scope.words = [];
        $scope.skipEnd = $scope.skip + $scope.words.length;
      });
  };

  $scope.find = function(){
    $scope.skip = 0;
    $scope.getWords();
  };

  // new method for the Add button
  $scope.add = function(){
	  if ($scope.newWord) {
		  $scope.addedWord = "Added: " + $scope.newWord;
		$scope.getWords();
		$scope.newWord = '';
	  } else {
		  $scope.addedWord = "";
	  }
  };

  $scope.next = function(){
    // if($scope.words.length === $scope.limit){ // original, doesn't work because of different data types
    if($scope.words.length == $scope.limit){
      $scope.skip += parseInt($scope.limit);
      $scope.getWords();
    }
  };

  $scope.prev = function(){
    if($scope.skip > 0){
      if($scope.skip >= parseInt($scope.limit)){
        $scope.skip -= parseInt($scope.limit);
      } else{
        $scope.skip = 0;
      }
      $scope.getWords();
    }
  };
});