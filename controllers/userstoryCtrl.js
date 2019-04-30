angular.module("ignitrack").controller("userstoryCtrl", function ($q, $cookieStore, $scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, taskService, userStoryService, BASE_PATH, API_URL, $timeout, Upload, $stateParams) {
    $scope.baseUrl = BASE_PATH;
    $scope.heading = "User-story";
    $scope.userStoryId = $state.params.id;
    $scope.userStoryPid = $state.params.pid;
    $scope.userStoryViewType = $state.params.type;

    console.log($state.current.name);
//Function to update comments on real time basis
    $scope.$on('eventUserStory', function (event, data) {

        if ($state.current.name == "main.userstory.section") {
            $state.reload();
        }
    });

    /*
     *  @ Name  : Get User story descriptions
     *  @ Description :- Get user story's basic details 
     * 
     */
    $scope.getUsDescription = function () {
        commonService.loadingPopup(); // start processing popup
        var request = {userStory_id: $scope.userStoryId, type: 1};
        var methods = {
            user_story: userStoryService.getUserStoryDetails(request),
            priority: userStoryService.priorityStatus({type: 4}),
            status: userStoryService.getSystemStatus({type: 1, is_user_defined_status: false}),
            epic_theme_data: userStoryService.getEpicAndTheme()
        };
        /* Fetch data in Que*/
        var set = 0;
        $q.all(methods).then(function (methods) {
            var response = _.filter(methods, function (obj) {
                if (obj.data.type && obj.data.type != undefined) {
                    swal("Oops...", obj.data.message, 'error');
                    set = 1;
                } else {
                    return obj.status != 200 || !obj.data || obj.data.statusCode != 200
                }
            });
            if (set == 1) {
                $scope.user_story_data = false;
                return false;
            }
            else if (response.length > 0) {
                swal("Oops...", 'Technical error. Please try again later', 'error');
            } else {
                $scope.user_story_data = true;
                //console.log(methods.status.data.data);
                $scope.userstory_detail = methods.user_story.data.result;
                if (methods.user_story.data.result.revision) {
                    $scope.userstory_detail_revisions = methods.user_story.data.result.revision;
                } else {
                    $scope.userstory_detail_revisions = '';
                }
                $scope.userstory_detail.status = (methods.user_story.data.result.status != undefined) ? methods.user_story.data.result.status._id : '';

                $scope.epic_data = methods.epic_theme_data.data.result.epic;
                $scope.theme_data = methods.epic_theme_data.data.result.theme;
                $scope.priority_data = methods.priority.data.data;
                $scope.status_data = methods.status.data.data;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            }
        });
    }


    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;


    $scope.currentPageCheckList = 1;
    $scope.checklist_skip = 0;
    $scope.checklist_limit = 10;

    $scope.currentPageTestCase = 1;
    $scope.testcase_skip = 0;
    $scope.testcase_limit = 10;


    $scope.skip = 0;
    $scope.limit = 10;
    $scope.comments = {};


    $scope.skipTask = 0;
    $scope.limitTask = 10;
    $scope.limitUSTask = 10;
    $scope.limitUSIssue = 10;
    $scope.currentPageTaskHistory = 1;
    $scope.currentPageTask = 1;
    $scope.currentPageIssue = 1;
    $scope.maxSize = 5;

    /* Function to get check list data*/
    $scope.getCheckList = function (called_from) {
        commonService.loadingPopup(); // start processing popup
        if (!$state.params.id) {
            $state.go('main.backlogs');
        }

        if (called_from == 'add') {
            $scope.currentPageCheckList = 1;
            var request = {
                task_id: $scope.userStoryId,
                type: 0,
                skip: 0,
                limit: $scope.checklist_limit
            };
        } else {
            $scope.checklist_skip = ($scope.currentPageCheckList - 1) * $scope.checklist_limit;
            var request = {
                task_id: $scope.userStoryId,
                type: 0,
                skip: $scope.checklist_skip,
                limit: $scope.checklist_limit
            };
        }
        userStoryService.getCheckListData(request, function (response) {

            if (response.data.statusCode == 200) {
                $scope.user_story_data = true;
                $scope.checklist_data = response.data.result.result;
                $scope.checklist_data_total = response.data.result.total || 0;
                commonService.closePopup();
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    $scope.getTestCaseList = function (called_from) {

        if (!$state.params.id) {
            $state.go('main.backlogs');
        }

        commonService.loadingPopup(); // start processing popup
        if (called_from == 'add') {
            $scope.currentPageTestCase = 1;
            var request = {
                task_id: $scope.userStoryId,
                type: 1,
                skip: 0,
                limit: $scope.testcase_limit
            };
        } else {
            $scope.testcase_skip = ($scope.currentPageTestCase - 1) * $scope.testcase_limit;
            var request = {
                task_id: $scope.userStoryId,
                type: 1,
                skip: $scope.testcase_skip,
                limit: $scope.testcase_limit
            };
        }
        userStoryService.getCheckListData(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.user_story_data = true;
                $scope.testcase_data = response.data.result.result;
                $scope.testcase_data_total = response.data.result.total || 0;
                commonService.closePopup();
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }

        });
    }


    $scope.checkListModal = function (type) {
        commonService.loadingPopup(); // start processing popup
        $scope.checklist = {};

        if (type && type == 0) {
            $scope.checklist.type = 0;
            ModalService.showModal({
                templateUrl: 'views/user-story/checklist_modal.html',
                scope: $scope,
                controller: "userstoryChildCtrl",
            }).then(function (modal) {
                commonService.closePopup();
                modal.element.modal();
                /*angular.element(document).on('shown.bs.modal', function (e) {
                 angular.element('input:visible:enabled:first', e.target).focus();
                 });*/
            });
        } else {
            userStoryService.priorityStatus({type: 4}, function (response) {
                commonService.closePopup();
                if (response.data.statusCode == 200) {
                    $scope.priority_status = [];
                    $scope.priority_status = response.data.data;
                    $scope.checklist.type = 1;
                    ModalService.showModal({
                        templateUrl: 'views/user-story/testcase_modal.html',
                        scope: $scope,
                        controller: "userstoryChildCtrl",
                    }).then(function (modal) {
                        commonService.closePopup();
                        modal.element.modal();
                    });
                }
            });
        }
    }


    /*
     * 
     * FUnction to view all task history
     */
    $scope.viewHistory = function () {
        commonService.loadingPopup();

        $scope.skipTask = ($scope.currentPageTaskHistory - 1) * $scope.limitTask;
        var request = {task_id: $stateParams.id, project_id: $stateParams.pid, skip: $scope.skipTask, limit: $scope.limitTask, isUserStories: true};
        userStoryService.getUserStoryHistory(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.userstory_history = response.data.result.data;
                $scope.totalUSHistoryCount = response.data.result.totalRecords;
            } else {
                commonService.closePopup();
                swal("Oops...", response.data.message, response.data.status);
            }
        })
    }

    $scope.getSprintdata = function () {
        var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};
        taskService.getSprints(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.sprint_data = response.data.data;
                $scope.sprint_id = {_id: $scope.sprint_data[0]._id, sprint_name: $scope.sprint_data[0].sprint_name};
                $scope.viewTask();
                $scope.viewIssue();
            } else {
                commonService.closePopup();
                swal("Oops...", response.data.message, response.data.status);
            }
        })
    }

    /*
     * 
     * FUnction to view all task of user story
     */
    $scope.viewTask = function () {
        // $scope.userstory_task_data = [];
        commonService.loadingPopup();
        $scope.skipTask = ($scope.currentPageTask - 1) * $scope.limitUSTask;
        var request = {user_story_id: $stateParams.id, sprint_id: $scope.sprint_id._id, skip: $scope.skipTask, limit: $scope.limitUSTask};
        userStoryService.getUsTask(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.user_story_data_tasks = response.data.data.tasks;
                $scope.totalUsTaskCount = response.data.data.total_tasks;
            } else {
                commonService.closePopup();
                swal("Oops...", response.data.message, response.data.status);
            }
        })
    }


    /*
     * 
     * FUnction to view all task of user story
     */
    $scope.viewIssue = function () {
        //$scope.userstory_history = [];
        commonService.loadingPopup();

        $scope.skipTask = ($scope.currentPageIssue - 1) * $scope.limitUSIssue;
        var request = {user_story_id: $stateParams.id, sprint_id: $scope.sprint_id._id, skip: $scope.skipTask, limit: $scope.limitUSIssue};
        userStoryService.getUsIssue(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.user_story_data_issues = response.data.data.issues;
                $scope.totalUsIssueCount = response.data.data.total_issues;
            } else {
                commonService.closePopup();
                swal("Oops...", response.data.message, response.data.status);
            }
        })
    }

    /**Update checklist**/
    $scope.updateCheckList = function (type) {

        commonService.loadingPopup(); // start processing popup
        $scope.checklists = [];
        if (type && type == '0') {
            angular.forEach($scope.checklist_data, function (item) {
                $scope.checklists.push({
                    checklist_id: item._id,
                    status: item.status
                });
            });
        } else {
            angular.forEach($scope.testcase_data, function (item) {
                $scope.checklists.push({
                    checklist_id: item._id,
                    status: item.status
                });
            });
        }

        userStoryService.updateCheckList({checklists: $scope.checklists}, function (response) {

            if (response.data.statusCode == 200) {
                swal({
                    title: "Success!",
                    text: response.data.message,
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {

                    if (type && type == '0') {
                        $scope.getCheckList();
                    }
                    if (type && type == '1') {
                        $scope.getTestCaseList();
                    }
                });


            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /* Check all user stories */
    $scope.checkListAll = function (type) {
        if (type && type == '0') {
            if ($scope.main_checklist == true) {
                for (var i = 0; i < $scope.checklist_data.length; i++) {
                    $scope.checklist_data[i].status = 1;
                }
            } else {
                for (var i = 0; i < $scope.checklist_data.length; i++) {
                    $scope.checklist_data[i].status = 0;
                }
            }
        } else {

            if ($scope.main_test_case == true) {
                for (var i = 0; i < $scope.testcase_data.length; i++) {
                    $scope.testcase_data[i].status = 1;
                }
            } else {
                for (var i = 0; i < $scope.testcase_data.length; i++) {
                    $scope.testcase_data[i].status = 0;
                }
            }
        }
    }

    /* @Function to update user stories with detail
     * 
     */
    $scope.updateUserStory = function () {

        commonService.loadingPopup(); // start processing popup

        var request = {
            project_id: $scope.userstory_detail.project_id,
            userStory_id: $scope.userStoryId,
            name: $scope.userstory_detail.name,
            role: $scope.userstory_detail.user_story_details.role,
            feature: $scope.userstory_detail.user_story_details.feature,
            context: $scope.userstory_detail.user_story_details.context,
            event: $scope.userstory_detail.user_story_details.event,
            outcome: $scope.userstory_detail.user_story_details.outcome,
            epic_id: ($scope.userstory_detail.user_story_details.epic_id != undefined) ? $scope.userstory_detail.user_story_details.epic_id : '',
            status_id: ($scope.userstory_detail.status != undefined) ? $scope.userstory_detail.status : '',
            priority_id: ($scope.userstory_detail.user_story_details.priority_id != undefined) ? $scope.userstory_detail.user_story_details.priority_id : '',
            theme_id: ($scope.userstory_detail.user_story_details.theme_id != undefined) ? $scope.userstory_detail.user_story_details.theme_id : ''
        };
        if ($scope.userstory_detail.image != undefined) {
            request.screen_image = $scope.userstory_detail.image;
        }

        /* Update user story */
        Upload.upload({
            method: 'POST',
            url: API_URL + 'userStory/updateUserStrory',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            arrayKey: '',
            data: request
        }).then(function (response) {
            if (response.data.statusCode == 200) {
                swal({
                    title: "Success!",
                    text: 'User story updated successfully',
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {
                    $state.reload();
                });

            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
        /*		
         userStoryService.updateUserStory(request, function (response) {
         if (response.data.statusCode == 200) {
         
         var data = {title: 'Success', text: 'User story updated successfully', type: 'success'};
         commonService.showMessage(data);
         } else {
         commonService.closePopup();
         var data = {title: 'oops', text: response.data.message, type: 'error'};
         commonService.showMessage(data);
         }
         });
         */
    }


    //Function to delete attachment of a user story
    $scope.deleteCheckList = function (checklist_id, type) {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true,
            html: false
        }, function () {
            var request = {checklist_id: checklist_id}
            userStoryService.deleteCheckList(request, function (response) {

                if (response.data.statusCode == 200) {

                    var data = {title: 'Success', text: 'Record deleted successfully', type: 'success'};
                    commonService.showMessage(data);

                    if (type == '0') {
                        $scope.getCheckList('add');
                    }
                    if (type == '1') {
                        $scope.getTestCaseList('add');
                    }


                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        });
    }

    angular.element(document).on('hidden.bs.modal', function (e) {
        if (angular.element('.modal-backdrop').length > 0) {
            angular.element('body').addClass('modal-open');
        }
    });

    /*
     * Function to upload attachments to a project
     * */
    $scope.uploadFiles = function (files, project_id) {
        $scope.file_max_limit = false;
        if (files && files.length) {
            if (parseInt(files.length) > 5) {
                $scope.file_max_limit = true;
                return false;
            }
            Upload.upload({
                method: 'PUT',
                url: $scope.baseUrl + 'v1/projects/upload_project_attachment',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                arrayKey: '',
                data: {
                    file: files,
                    task_id: $scope.userStoryId,
                    project_id: project_id,
                    type: 4
                }
            }).then(function (response) {
                if (response.data.statusCode == 200) {
                    $scope.userstoryprogress = 0;
                    $scope.getAttachments($scope.userStoryId);
                } else {
                    $scope.userstoryprogress = 0;
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            }, function (response) {
                if (response.status > 0) {
                    $scope.userstoryprogress = 0;
                    var data = {title: 'oops', text: response.data, type: 'error'};
                    commonService.showMessage(data);
                    //$scope.errorMsg = response.status + ': ' + response.data;
                }
            }, function (evt) {
                $scope.userstoryprogress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };

    /***********************Function to Add Comments in the Admin Section*****************************************/


    $scope.commentPost = function () {
        var request = {task_Id: $scope.userStoryId, comment_description: $scope.comments.comment_description, type: 4}
        var task_id = $scope.userStoryId;
        userStoryService.createComments(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.comments.comment_description = '';
                $scope.submitted = false;
                $scope.commentform.$setUntouched();
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"});
                $scope.getComments($scope.userStoryId);
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*****************Function to Show All Comments in the Admin Section**********************************************/

    $scope.list = [];

    $scope.loadMore = function () {
        // console.log($scope.userstory_detail.comments);
        $scope.skip += $scope.limit;

        var request = {task_Id: $scope.userStoryId, skip: $scope.skip, limit: $scope.limit};
        userStoryService.getComments(request, function (response) {
            if (response.data.statusCode == 200) {
                angular.forEach(response.data.data.comment, function (response) {
                    $scope.comments.push(response);
                });
                if ($scope.comments.length == response.data.data.totalComment) {
                    $scope.loadmoreButton = false;
                } else {
                    $scope.loadmoreButton = true;
                }

                $timeout(function () {
                    var scroller = document.getElementById("autoscroll");
                    scroller.scrollTop = scroller.scrollHeight;
                }, 0, false);

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });

    }

    $scope.getComments = function () {
        $scope.url = $scope.baseUrl + 'attachment/admin/';
        var request = {task_Id: $scope.userStoryId, skip: $scope.skip, limit: $scope.limit};
        userStoryService.getComments(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.user_story_data = true;
                $scope.comments = response.data.data.comment;
                if ($scope.comments.length == response.data.data.totalComment) {
                    $scope.loadmoreButton = false;
                } else {
                    $scope.loadmoreButton = true;
                }
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }
    /***********************Function to Add Comments in the Admin Section*****************************************/

    //get attachment 
    $scope.attachments = {};
    $scope.getAttachments = function () {
        commonService.loadingPopup(); // start processing popup
        var request = {isScreenImage: false, task_id: $scope.userStoryId, skip: $scope.skip, limit: 100};
        userStoryService.getAttachments(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.user_story_data = true;
                $scope.attachment_project_id = $scope.userStoryPid;
                $scope.attachments = response.data.data.attachment;
                $timeout(commonService.closePopup(), 200); // hide processing popup

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    //Function to delete attachment of a user story
    $scope.deleteAttachment = function (userStoryId, id) {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false,
            html: false
        }, function () {
            var request = {attachmentId: id, task_id: userStoryId, is_userStory: true}
            userStoryService.deleteAttachment(request, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.getAttachments();
                    var data = {title: 'Success', text: 'Attachment deleted successfully', type: 'success'};
                    commonService.showMessage(data);
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        });
    }

    /*
     * 
     * @function : to view userstory attachment preview
     * @returns {undefined}
     */
    $scope.attachmentModal = function (asset) {
        $scope.url = $scope.baseUrl + 'attachment/admin/';
        $scope.data = asset;

        ModalService.showModal({
            templateUrl: 'views/user-story/attachment_view.html',
            controller: 'userstoryChildCtrl',
            scope: $scope

        }).then(function (modal) {
            modal.element.modal();
        });
    }
});


angular.module("ignitrack").controller("userstoryChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, userStoryService, Upload, API_URL, close, $element) {

    /*Function to create checklist and test case on the basis of type 0-checklist 1- test case*/
    $scope.addCheckList = function () {
        commonService.loadingPopup(); // start processing popup

        if ($scope.checklist.type == '0') {
            var request = {
                task_id: $scope.userStoryId,
                type: $scope.checklist.type,
                title: $scope.checklist.title
            };
        } else {
            var request = {
                task_id: $scope.userStoryId,
                type: $scope.checklist.type,
                title: $scope.checklist.title,
                summary: $scope.checklist.summary,
                testSteps: $scope.checklist.testSteps,
                testData: $scope.checklist.testData,
                result: $scope.checklist.result,
                priority: $scope.checklist.priority
            };
        }

        userStoryService.addChecklist(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                var type = $scope.checklist.type == '0' ? 'Check list' : 'Test cases';
                swal({
                    title: "Success!",
                    text: type + ' added successfully',
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {
                    /* On success */
                    if ($scope.checklist.type == '0') {
                        $scope.getCheckList('add');
                        type = 'Check list';
                    }
                    if ($scope.checklist.type == '1') {
                        $scope.getTestCaseList('add');
                        type = 'Test cases';
                    }
                    /* **********  ******** */
                });


                // angular.element('.close_modal').trigger('click');

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
