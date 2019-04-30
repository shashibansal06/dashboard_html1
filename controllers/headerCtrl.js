angular.module("ignitrack").controller("headerCtrl", function ($scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, $cookieStore, BASE_PATH, $timeout) {
   
    /*
     * @name : header project bropdown
     * @Discription : dropdwon that retain value od project id globally
     */

    $scope.reload_state = [
        "editProject", "projectView"
    ];
    $scope.baseurl = BASE_PATH;
    $scope.globalProjectListOnChange = function () {
        if ($scope.projectheaderId != null) {

            $cookieStore.put('globalProjectId', $scope.projectheaderId);
            $rootScope.globalProjectId = $scope.projectheaderId;
            $window.scrollTo(0, 0);

            //Change page data if project and id on the url params is changed from the drop down
            var is_found = false;
            for (var i = 0, len = $scope.reload_state.length; i < len; i++) {
                if ($scope.reload_state[i] === $state.current.name) {
                    is_found = true;
                    $state.go('' + $state.current.name + '', {id: $scope.projectheaderId._id}, {reload: true});
                    break;
                }
            }
            if (is_found == false) {
                $state.reload();
            }
        } else {
            $cookieStore.remove('globalProjectId');
            $cookieStore.put('globalProjectId', $scope.projectheaderId);
            $rootScope.globalProjectId = $scope.projectheaderId;
        }
    }
    
    
    $rootScope.$on("CallNotifications", function (event, args) {
        $scope.getNotifications();
    });
    
    
    $scope.skipNotification = 0;
    $scope.limitNotification = 50;
    $scope.side_notifications = [];
    $scope.notificationLoadMore = false;
    $scope.notificationLoadMoreMsg = false;
    
    $scope.getNotifications = function () {
        var request = { skip: $scope.skipNotification, limit: $scope.limitNotification };
        
        commonService.getNotifications(request, function (response) {
            if (response.data.statusCode == 200) {
                $rootScope.side_undreadNotifications = 0;
                $scope.side_notifications = response.data.data.data;
                $scope.side_notifications_total = response.data.data.total_count;
                
                if ($scope.side_notifications.length == $scope.side_notifications_total) {
                    $scope.notificationLoadMore = false;
                } else {
                    $scope.notificationLoadMore = true;
                }
            }
        });
    }
    
    $scope.loadMoreNotification = function () {
        
        $scope.skipNotification += $scope.limitNotification;
        
        var request = {skip: $scope.skipNotification, limit: $scope.limitNotification};
        commonService.getNotifications(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.side_undreadNotifications = 0;
                
                angular.forEach(response.data.data.data, function (response) {
                    $scope.side_notifications.push(response);
                });
                
                if ($scope.side_notifications.length == response.data.data.total_count) {
                    $scope.notificationLoadMore = false;
                    $scope.notificationLoadMoreMsg = true;
                } else {
                    $scope.notificationLoadMore = true;
                }
            }
        });

    }
    
    $scope.getUnreadNotifications = function () {
        commonService.getUnreadNotifications(function (response) {
            if (response.data.statusCode == 200) {
                $rootScope.side_undreadNotifications = response.data.data;
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
            }
        });
    }


});