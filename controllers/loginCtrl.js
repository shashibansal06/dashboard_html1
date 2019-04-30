/*
 * @file: loginCtrl.js
 * @description:This file is used to control all function related to users
 */

angular.module("ignitrack").controller("loginCtrl", function ($scope, $cookieStore, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, userService) {
    $scope.heading = "Login";
    $scope.welcome= false;
    /*
     * @name : Login
     * @Discription : User login used for every user
     */
    $scope.login = function () {   
    $scope.welcome= true;   
        $scope.user.type = 0;
        $scope.user.remember = ($scope.user.remember) ? true : false;
        $rootScope.is_remember_me = $scope.user.remember;
        $rootScope.login_email = $scope.user.email;
        $rootScope.login_password = $scope.user.password;
        console.log($scope.user);
        commonService.loadingPopup(); // start processing popup
        userService.userLogin($scope.user, function (response) {
            if (response.data.statusCode == 200) {
                //socket.connect();
                //
              //socketEventService.verifyConnectionNew({token: response.headers('x-logintoken')});
              //alert("HI")
                //socketEventService.on_welcome();
            } else {
                 $scope.welcome= false;
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }


    /*
     * @name : forgotPasswordModal
     * @Description : Function to open forgot password modal
     */
    $scope.forgotPasswordModal = function () {
        ModalService.showModal({
            templateUrl: 'directive_templates/modals/forgot_password.html',
            controller: 'loginChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
            angular.element(document).on('shown.bs.modal', function (e) {
                angular.element('input:visible:enabled:first', e.target).focus();
            });
        });
    }


    /*
     * @name : getLoginDetail
     * @Discription : check if user login already
     */
    $scope.getLoginDetail = function () {
        var data = $cookieStore.get('user_credentials') || '';
        if (data.remember && data.remember != undefined && data.remember == true) {
            $scope.user = {email: data.email, password: data.password, remember: true}
        } else {
            $scope.user = {remember: false, email: '', password: ''}
        }
    }


});

angular.module("ignitrack").controller("loginChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, userService, close, $element) {

    // Submit data to the server
    $scope.forgotPassword = function () {
        var request = {email: $scope.email, type: 1};
        userService.forgotPassword(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                var data = {title: 'Success', text: response.data.message, type: 'success'};
                commonService.showMessage(data);
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    $scope.closeModal = function () {
        $element.modal('hide');  //  Manually hide the modal using bootstrap.
        close(null, 500);//  Now close as normal, but give 500ms for bootstrap to animate
    };
});