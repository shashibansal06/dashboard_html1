/*
 * @file: taskCtrl.js
 * @description:
 * */
angular.module("ignitrack").controller("taskParentCtrl", function ($q, $timeout, $scope, $state, $rootScope, $window, jwtHelper) {
    $scope.heading = "Tasks";
    $scope.task_id = $state.params.id;
    $scope.pid = $state.params.pid;
 
});
