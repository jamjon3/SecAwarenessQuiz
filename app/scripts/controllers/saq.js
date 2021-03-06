/**
 * Copyright 2015 University of South Florida
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (window, angular, undefined) {
    'use strict';
    angular
    .module('saqApp')
    .controller('saqCtrl', ['$scope','$rootScope','$window','$location','$routeParams','$q','saqService', function ($scope,$rootScope,$window,$location,$routeParams,$q,saqService) { 
        if('id' in $routeParams) {
            $scope.id = $routeParams.id;
            // create session identifier - timestamp
            $scope.session_ts = (new Date()).getTime() / 1000;
        }
        // load a set of quiz items
        $scope.getItems = function() {
            // create quiz identifier - timestamp
            $scope.quiz_ts = (new Date()).getTime() / 1000;
            $scope.graded = false;
            $scope.message = "";
            saqService.getSAQ($scope.id, $scope.session_ts, $scope.quiz_ts).then(function(data){
                $scope.items = data.data.data.questions.data;
            },function(response) {
                var data = response.data,
                    status = response.status;
                alert("Error! Security Awareness Quiz could not retrieve questions "+JSON.stringify(response));
            });
        };
        $scope.getItems();
        
        // return false if any of the items have not been answered, true otherwise.
        $scope.quizComplete = function() {
            if (typeof $scope.items === "undefined"){
                return false;
            }
            for (var i=0; i < $scope.items.length; i++) {
                if (typeof $scope.items[i].selected === "undefined") {
                    return false;
                }
            }
            return true;
        };
        
        // return false if selected answer if not correct, true otherwise.
        $scope.itemCorrect = function(sa_id) {
            if ($scope.items[sa_id].selected.toString() !== $scope.items[sa_id].answer) {
                return false;
            }
            return true;
        };
        
        // return false if quiz contains any incorrect items, true otherwise.
        $scope.quizPassed = function() {                  
            for (var i=0; i < $scope.items.length; i++) {
                if ($scope.items[i].selected.toString() !== $scope.items[i].answer) {
                    return false;
                }
            }
            return true;
        }
        
        // update result and correct count in database
        $scope.quizUpdate = function() {
            var correct = 0;                     
            for (var i=0; i < $scope.items.length; i++) {
                if ($scope.items[i].selected.toString() === $scope.items[i].answer) {
                    correct++;
                }
            }
            // update database and return pass/fail
            saqService.updateSAQ($scope.id, $scope.session_ts, $scope.quiz_ts, correct).then(function(data){
                $scope.result = data.data.data.result;
            },function(response) {
                var data = response.data,
                    status = response.status;
                alert("Error! Security Awareness Quiz could not be completed "+JSON.stringify(response));
            });
        };
        
        // process submits
        $scope.submit = function(action) {
            $rootScope.loading = true;
            if (action === 1) { // record supplied answers and get correct answers with explanations
                $scope.graded = true;
                var promisemap = {};
                angular.forEach($scope.items,function(item,index) {
                    promisemap[item.sa_id] = saqService.recordSAQItem($scope.id,$scope.quiz_ts,item.sa_id,item.selected);
                });
                $q.all(promisemap).then(function(answers) {
                    for (var i=0; i < $scope.items.length; i++) {
                        angular.forEach(answers,function(answer,key) {
                            if($scope.items[i]['sa_id'] === key) {
                                $scope.items[i].answer = answer.data.data.answer;
                                $scope.items[i].explanation = answer.data.data.explanation;
                            }
                        });
                    }                   
                    if ($scope.quizPassed()) {
                        $scope.message = "Congratulations, you passed the quiz!";
                    } else {
                        $scope.message = "You must answer all questions correctly to pass this quiz.";
                    }
                    // either way, update the quiz record in db
                    $scope.quizUpdate();
                    $rootScope.loading = false;
                });
                
            } else if (action === 2) { // reload the items
                $scope.getItems();
                $rootScope.loading = false;
            } else { // return to una by triggering the close of the iFrame
                $rootScope.loading = false;
                $window.parent.postMessage(JSON.stringify({saq: true}), "*");
            }
        };
                
    }]);
    
})(window, window.angular);

