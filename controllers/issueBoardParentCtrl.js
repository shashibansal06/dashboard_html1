/*
 * @file: taskCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("issueBoardParentCtrl", function ($q, $timeout, $scope, $state, $rootScope, $window, jwtHelper ) {
    $scope.id = $state.params.id;
    $scope.pid = $state.params.pid;

});
