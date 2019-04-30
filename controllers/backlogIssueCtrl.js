/*
 * @file: backlogIssueCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("backlogIssueCtrl", function ($scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, activityService, userStoryService, issuesService, BASE_PATH, $timeout, $injector, $filter) {

    /*
     * set basic parameters
     */
    $scope.baseUrl = BASE_PATH;
    $scope.skip = 0;
    $scope.skip_comment = 0;
    $scope.limit_comment = 10;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;

    /*
     * Reset Filter
     */
    $scope.clearFilter = function () {
        $state.reload();
    }

    /*
     * 
     * @name : get Issue Assigne
     * @description : get all the user who are added in project on which issue created
     */
    $scope.Assignee = function () {
        issuesService.getUsers({project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.issues_assignee = response.data.data.resources;
            }
        });
    }

    /*
     * 
     * @name : get all issues
     * @description : function to get all issues of a project
     */
    $scope.getUserStories = function () {
        var request = {
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
        }
        issuesService.getUserStories(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.issues_userStory = response.data.data;

            }
        });
    }

    /*
     * 
     * @name : open modal to add quick issues
     */
    $scope.addQuickModal = function () {
        $scope.Url = $scope.baseUrl + 'attachment/admin/';

        $scope.Assignee();
        $scope.getPlatform();
        ModalService.showModal({
            templateUrl: 'views/backlogs/add_issues.html',
            controller: 'backlogIssueChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }


    /*
     * 
     * @name : open modal window to add issue with details
     */
    $scope.addIssueDetailpModal = function () {
        $scope.Assignee();
        $scope.getPlatform();
        $scope.getUserStories();
        ModalService.showModal({
            templateUrl: 'views/backlogs/add_issues_details.html',
            controller: 'backlogIssueChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }


    $scope.Platform = [];
    $scope.OperatingSystem = [];
    $scope.Browser = [];
    $scope.status = [];
    $scope.Severity = [];
    $scope.issues = {};

    /*
     * 
     * @name : get issue reporting dropdown values
     * @description : function to get platform, operating system,browser,statues of issues, severity
     */
    $scope.getPlatform = function () {
        issuesService.getPlatformIssue({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.Platform = response.data.result.Platform;
                $scope.OperatingSystem = response.data.result.OperatingSystem;
                $scope.Browser = response.data.result.Browser;
                $scope.status = response.data.result.status;
                //  console.log($scope.status);
                $scope.issues.status = $scope.status[2];

                $scope.Severity = response.data.result.Severity;
            }
        });
    }


    /*
     * @name : issues modal to edit & update
     */
    $scope.issue_info = {};

    $scope.issueModal = function (id, type) {
        $scope.issueComment.comment_description = "";
        $scope.Url = $scope.baseUrl + 'attachment/admin/';
        $scope.getPlatform();
        $scope.Assignee();
        $scope.getUserStories();

        commonService.loadingPopup(); // start processing popup
        var request = {issue_Id: id, type: '2'};

        issuesService.getParticularIssue(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.issue_info = response.data.result.allissue[0];
                if ($scope.issue_info.efforts && $scope.issue_info.efforts.length > 0) {
                    $scope.efforts = $scope.issue_info.efforts.slice(-1).pop();
                    $scope.issue_info.efforts = $scope.efforts.efforts;
                    // console.log($scope.issue_info.efforts);
                }

                $timeout(commonService.closePopup(), 200); // hide processing popup
                ModalService.showModal({
                    templateUrl: 'views/backlogs/issue_track.html',
                    controller: 'backlogIssueChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    modal.element.modal();

                });
            } else {
                var data = {title: 'oops', text: 'Error occurred. Please try after some time.', type: 'error'};
                commonService.showMessage(data);
            }
        });
    }



    /*
     * @name : post comment on issue
     * @description : function to post comment on issues
     */
    $scope.issueComment = {};
    $scope.commentPost = function (commentforms) {
        commonService.loadingPopup();

        var request = {
            task_Id: $scope.issue_info._id,
            comment_description: $scope.issueComment.comment_description,
        };
        issuesService.commentIssue(request, function (response) {
            if (response.data.statusCode == 200) {
                commentforms.$setUntouched();
                $scope.issueComment.comment_description = "";
                angular.element('#comment_description').val('');
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"});
                $scope.getComments();
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }


    /*
     * @name : get all comments
     * @description : function to get all comments of issues
     */
    $scope.list = [];
    $scope.getComments = function () {
        $scope.Url = $scope.baseUrl + 'attachment/admin/';
        var request = {
            task_Id: $scope.issue_info._id,
            skip: $scope.skip_comment,
            limit: $scope.limit_comment,
        };
        issuesService.getCommentIssue(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.list = response.data.data.comment;

                if ($scope.list.length == response.data.data.totalComment) {
                    $scope.loadmoreButton = false;
                } else {
                    $scope.loadmoreButton = true;
                }
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * @name : load more on comments
     * @description : function to get commenmts with pagination
     */
    $scope.loadmoreButton = true;
    $scope.loadMore = function () {

        $scope.skip_comment += $scope.limit_comment;


        var request = {
            task_Id: $scope.issue_info._id, //'58f8a5a6d0f4655a3cc16bba'
            skip: $scope.skip_comment,
            limit: $scope.limit_comment,
        }


        issuesService.getCommentIssue(request, function (response) {
            if (response.data.statusCode == 200) {
                angular.forEach(response.data.data.comment, function (response) {
                    $scope.list.push(response);
                });
                if ($scope.list.length == response.data.data.totalComment) {
                    $scope.loadmoreButton = false;
                } else {
                    $scope.loadmoreButton = true;
                }

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * @name : get all issues
     * @description : function to get  all issues of a selected project
     */
    $scope.search = '';
    $scope.assigne_id = '';
    $scope.status_id = '';

    $scope.getAllIssues = function (change) {
        $scope.getPlatform();
        $scope.Assignee();
        $scope.project_id = ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id;
        if (change == 'asigne' || change == 'status' || change == 'search') {
            $scope.limit = 10;
            $scope.skip = 0;
            $scope.currentPage = 1;

        }
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;
        commonService.loadingPopup();
        var request = {
            search: ($scope.search != undefined) ? $scope.search : '',
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            skip: $scope.skip,
            limit: $scope.limit,
            assigned_to_id: ($scope.assigne_id && $scope.assigne_id != undefined && $scope.assigne_id != '') ? $scope.assigne_id._id : '',
            status_id: ($scope.status_id != undefined && $scope.status_id != '') ? $scope.status_id._id : '',
            type: '2'
        };
        issuesService.getIssues(request, function (response) {
            if (response.data.statusCode == 200) {

                $scope.CountData = response.data.data.CountData
                $scope.issues = response.data.data.allIssues;
                for (var i = 0; i < $scope.issues.length; i++) {
                    if ($scope.issues[i].efforts) {
                        $scope.issues[i].efforts = $scope.issues[i].efforts.slice(-1).pop();
                    }
                }

                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * 
     * @name : delete issue
     * @param issue is issue id, project is project id, type = 2 issue type
     * @description : function to delete issue on the basis of issue , project id
     */
    $scope.deleteIssue = function (issue, project, type) {
        swal({
            title: "Are you sure you want to Delete this?",
            text: "You will not be able to recover this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false,
            html: false
        },
        function (isConfirm) {
            if (isConfirm) {
                var request = {
                    project_id: project,
                    issue_id: issue,
                    type: '2'
                };
                issuesService.deleteIssue(request, function (response) {
                    if (response.data.statusCode == 200) {
                        swal({
                            title: "Success!",
                            text: response.data.message,
                            type: 'success',
                            confirmButtonText: "OK"
                        },
                        function () {
                            $scope.getAllIssues(); // Load all Issues data
                        });


                    } else {
                        swal("Oops...", response.data.message, response.data.status);
                    }
                });
            }

        });
    }

    $rootScope.$on("CallAllIssues", function (event, args) {
        $scope.getAllIssues();
    });

});

/*
 * Backlog Issue Child Controller
 */

angular.module("ignitrack").controller("backlogIssueChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, userStoryService, issuesService, Upload, API_URL, close, $element) {

    /*
     * @name : Add issue
     * @description : function to add issue
     */
    $scope.issues = [];

    $scope.addIssues = function () {
        commonService.loadingPopup();
        var request = {
            name: $scope.issues.title,
            description: $scope.issues.summary,
            assigned_to: $scope.issues.assigne_id._id,
            severity: $scope.issues.severity._id,
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
        };
        issuesService.addissue(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    $rootScope.$emit("CallAllIssues");
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * @name : add issue with details
     * @description : function to add issue with all details
     */
    $scope.addIssuesdetail = function () {
        commonService.loadingPopup();
        var request = {
            name: $scope.issues.title,
            description: $scope.issues.summary,
            assigned_to: ($scope.issues.assigne_id == null && $scope.issues.assigne_id == undefined) ? '' : $scope.issues.assigne_id._id,
            severity: ($scope.issues.severity == null && $scope.issues.severity == undefined) ? '' : $scope.issues.severity._id,
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            platformId: ($scope.issues.Platform == null && $scope.issues.Platform == undefined) ? '' : $scope.issues.Platform._id,
            operatingSystemId: ($scope.issues.OperatingSystem == null && $scope.issues.OperatingSystem == undefined) ? '' : $scope.issues.OperatingSystem._id,
            browserId: ($scope.issues.Browser == null && $scope.issues.Browser == undefined) ? '' : $scope.issues.Browser._id,
            attachments: $scope.issues.attachments,
            stepsToReproduce: $scope.issues.text,
            expectedResult: $scope.issues.result,
            actualResult: $scope.issues.Act_result,
            // status: ($scope.issues.status == null && $scope.issues.status == undefined) ? '' : $scope.issues.status._id,
            user_story_id: ($scope.issues.user_story_id == null && $scope.issues.user_story_id == undefined) ? '' : $scope.issues.user_story_id._id,
            url: $scope.issues.url,
        };
        Upload.upload({
            method: 'POST',
            url: API_URL + 'Issue/addIssue',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            arrayKey: '',
            data: request
        }).then(function (response) {
            if (response.data.statusCode == 200) {
                swal({
                    title: "Success!",
                    text: response.data.message,
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {
                    $scope.closeModal();
                    $rootScope.$emit("CallAllIssues");
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        }, function (response) {
            if (response.status > 0) {
                var data = {title: 'oops', text: response.data, type: 'error'};
                commonService.showMessage(data);
                //$scope.errorMsg = response.status + ': ' + response.data;
            }
        }, function (evt) {
            $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    }

    /*
     * 
     * @name : Update issue
     * @description : function to update issue details
     */
    $scope.updateIssue = function () {
        commonService.loadingPopup();

        var request = {
            name: $scope.issue_info.name,
            description: $scope.issue_info.description,
            issue_id: $scope.issue_info._id,
            assigned_to: ($scope.issue_info.assigned_to == null && $scope.issue_info.assigned_to == undefined) ? '' : $scope.issue_info.assigned_to._id,
            severity: ($scope.issue_info.severity == null && $scope.issue_info.severity == undefined) ? '' : $scope.issue_info.severity._id,
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            platformId: ($scope.issue_info.issue_details.platformId == null && $scope.issue_info.issue_details.platformId == undefined) ? '' : $scope.issue_info.issue_details.platformId._id,
            operatingSystemId: ($scope.issue_info.issue_details.operatingSystemId == null && $scope.issue_info.issue_details.operatingSystemId == undefined) ? '' : $scope.issue_info.issue_details.operatingSystemId._id,
            browserId: ($scope.issue_info.issue_details.browserId == null && $scope.issue_info.issue_details.browserId == undefined) ? '' : $scope.issue_info.issue_details.browserId._id,
            stepsToReproduce: $scope.issue_info.issue_details.stepsToReproduce,
            expectedResult: $scope.issue_info.issue_details.expectedResult,
            actualResult: $scope.issue_info.issue_details.actualResult,
            status: ($scope.issue_info.status == null && $scope.issue_info.status == undefined) ? '' : $scope.issue_info.status._id,
            user_story_id: ($scope.issue_info.user_story_id == null && $scope.issue_info.user_story_id == undefined) ? '' : $scope.issue_info.user_story_id._id,
            url: ($scope.issue_info.url == undefined) ? '' : $scope.issue_info.url,
            //   attachments: ($scope.issue_info.attachments.name == null && $scope.issue_info.attachments.name == undefined) ? '':$scope.issue_info.attachments.name ,
            effortLoggedHour: $scope.ctrl.timepicker ? $scope.ctrl.timepicker : delete $scope.ctrl.timepicker,
        };

        /* SEND REQUEST ON SERVER */
        Upload.upload({
            method: 'PUT',
            url: API_URL + 'Issue/updateIssue',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            arrayKey: '',
            data: request
        }).then(function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    $rootScope.$emit("CallAllIssues");
                });

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * @name : upload pics in an issue
     */
    $scope.attachments = {};
    $scope.uploadpic = function (files) {
        $scope.file_max_limit = false;
        if (files.length > 0) {

            if (files.length > 5) {
                $scope.file_max_limit = true;
                return false;
            }
            commonService.loadingPopup();
            var request = {
                type: 2,
                file: files,
                task_id: $scope.issue_info._id,
                project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id
            }
            Upload.upload({
                method: 'PUT',
                url: API_URL + 'projects/upload_project_attachment',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                arrayKey: '',
                data: request
            }).then(function (response) {
                if (response.data.statusCode == 200) {
                    angular.element("input[type='file']").val(null);
                    swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"});
                    $scope.getAttachments();
                    $timeout(commonService.closePopup(), 200);
                } else {
                    commonService.closePopup();
                    swal("Oops...", response.data.message, response.data.status);
                }
            });
        }
    }

    /*
     * @name : get issue attachments
     * @description : function to get all attachments of issue
     */
    $scope.getAttachments = function () {
        commonService.loadingPopup();
        var request = {
            skip: 0,
            limit: 100,
            task_id: $scope.issue_info._id
        };

        issuesService.getAttachments(request, function (response) {
            if (response.data.statusCode == 200) {
                // $scope.attachments = response.data.data.attachment
                $scope.issue_info.attachments = [];
                angular.forEach(response.data.data.attachment, function (response) {
                    $scope.issue_info.attachments.unshift(response);
                })
                $timeout(commonService.closePopup(), 200);
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * @name : delete issue attachment
     * @description : function to delete issue attachment
     */
    $scope.deleteIssueAttachments = function (array, id, index) {
        swal({
            title: "Are you sure you want to Delete this?",
            text: "You will not be able to recover this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false,
            html: false
        },
        function (isConfirm) {
            if (isConfirm) {
                var request = {
                    attachmentId: id,
                };
                issuesService.deleteAttachments(request, function (response) {
                    if (response.data.statusCode == 200) {

                        array.splice(index, 1);

                        swal({
                            title: "Success!",
                            text: response.data.message,
                            type: 'success',
                            confirmButtonText: "OK"
                        });

                    } else {
                        swal("Oops...", response.data.message, response.data.status);
                    }
                });
            }

        });
    }

    $scope.closeModal = function () {
        $element.modal('hide'); //  Manually hide the modal using bootstrap.
        close(null, 500); //  Now close as normal, but give 500ms for bootstrap to animate
    };

});
