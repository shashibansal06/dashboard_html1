/*
 * @file: backlogCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("backlogCtrl", function ($scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, activityService,userStoryService, BASE_PATH, $timeout) {
    $scope.heading = "Backlogs";
    var action = $state.current.name;
});


angular.module("ignitrack").controller("backlogChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, userStoryService, Upload, API_URL, close, $element) {

    $scope.closeModal = function () {
        $element.modal('hide');  //  Manually hide the modal using bootstrap.
        close(null, 500);//  Now close as normal, but give 500ms for bootstrap to animate
    };

});



