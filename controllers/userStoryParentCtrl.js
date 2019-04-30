angular.module("ignitrack").controller("userStoryParentCtrl", function ($q, $scope, $interpolate, $state, $rootScope, $window) {
    $scope.userStoryId = $state.params.id;
    $scope.userStoryPid = $state.params.pid;
    $scope.userStoryViewType = $state.params.type;

});
