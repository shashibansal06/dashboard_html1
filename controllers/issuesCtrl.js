/*
 * @file: dashboardCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("issuesCtrl", function ($scope, $interpolate, $state, $rootScope, $window, ModalService, issuesService,$stateParams) {

   

    /* Function to get Assignee */
    $scope.Assignee = function () {
        issuesService.getUsers({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.issues_assignee = response.data.data;
            }
        });
    }

    /* Function to Add Modal */
    $scope.addQuickModal = function () {
        $scope.Assignee();
        ModalService.showModal({
            templateUrl: 'views/backlogs/add_issues.html',
            controller: 'backlogCtrl',
            scope: $scope

        }).then(function (modal) {
            modal.element.modal();
            angular.element(document).on('shown.bs.modal', function (e) {
                angular.element('input:visible:enabled:first', e.target).focus();
            });
        });
    }


    /* Function to Add Issues quickly */
    $scope.issues = [];
    $scope.addIssues = function () {
        var request = {name: $scope.issues.title, description: $scope.issues.summary, assigned_to: $scope.issues.assigne_id._id, severity: $scope.issues.severity, };
        console.log(request);
        issuesService.addissue(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.issues = response.data.data;

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /* Function to get Assignee in details issues */
    $scope.addIssueDetailpModal = function () {
        $scope.Assignee();
        ModalService.showModal({
            templateUrl: 'views/backlogs/add_issues_details.html',
            controller: 'issuesCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
            angular.element(document).on('shown.bs.modal', function (e) {
                angular.element('input:visible:enabled:first', e.target).focus();
            });
        });
    }

    /* Function to Add Issues in Details */
    $scope.addIssuesDetail = function () {
        var request = {};
        issuesService.detailIssues(request, function (response) {
            if (response.data.status == 200) {
                $scope.issues = response.data.data;
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }


});
