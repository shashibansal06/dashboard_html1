angular.module("ignitrack").controller("estimationCtrl", function ($scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, BASE_PATH, $timeout, estimationService) {

    $scope.baseUrl = BASE_PATH;
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;

    /*
     * @name : get admin list of estimations
     * @Description : function that return data according
     *
     */
    $scope.getEstimationList = function () {
        commonService.loadingPopup();
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;
        $scope.request = {
            skip: $scope.skip,
            limit: $scope.limit
        }
        estimationService.getEstimations($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.totalRecords = response.data.total;
                $scope.list = response.data.results;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }

    /*
     * @name : view estimation per US wise
     * @description : deatils of estimation on each US team wise
     */
    $scope.estimationView = function () {
        commonService.loadingPopup();
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;
        $scope.request = {
            team_id: $state.params.id,
            skip: $scope.skip,
            limit: $scope.limit
        }
        estimationService.getEstimationDetails($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.totalRecords = response.data.results.total;
                $scope.list = response.data.results.data;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }

    /*
     * @name : open total phase estimation
     * @description : to view all phase total estimation
     */
    $scope.estimatedtimeModal = function (team_id) {
        commonService.loadingPopup();
        $scope.request = {team_id: team_id};
        estimationService.getPhaseEstimation($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.lists = response.data.results;
                $timeout(commonService.closePopup(), 200); // hide processing popup
                ModalService.showModal({
                    templateUrl: 'views/backlogs/estimted_phase.html',
                    controller: 'estimationCtrl',
                    scope: $scope
                }).then(function (modal) {
                    modal.element.modal();
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });


    }

    /*
     * @name : approve team estimation
     * @description : function to approve one team estimations 
     */
    $scope.approveTeamEstimation = function (id) {
        swal({
            title: "Approve Estimation",
            text: "Are you sure you want to approve team estimation ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, approve",
            closeOnConfirm: false,
            html: false
        }, function () {
            estimationService.approveEstimation({'team_id': id}, function (response) {
                if (response.data.statusCode == 200) {
                    console.log(response.data);
                    swal({
                        title: "Success!",
                        text: response.data.message,
                        type: 'success',
                        confirmButtonText: "Ok"
                    }, function () {
                        $scope.getEstimationList();
                    });
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            })
        });
    }

});