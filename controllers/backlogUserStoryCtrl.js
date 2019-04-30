angular.module("ignitrack").controller("backlogUserStoryCtrl", function ($q, $scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, activityService, userStoryService, BASE_PATH, $timeout, Upload) {

    $scope.baseUrl = BASE_PATH;
    $scope.idsChecklist = [];
    /* Set active tab */
    $scope.view = 'grid';


    $scope.clearFilter = function () {
        $state.reload();
    }

    /*
     * @name : get back log user story data
     * @Description : function that return data according
     *
     */

    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.search = '';

    $scope.getUserStories = function (change) {
        commonService.loadingPopup(); // start processing popup
        $scope.masterChecklist = false;
        $scope.idsChecklist = [];
        if (change == 'search') {
            $scope.limit = 10;
            $scope.skip = 0;
            $scope.currentPage = 1;

        }
        $scope.phase_id = ($scope.phase != null || $scope.phase != undefined) ? $scope.phase._id : '';
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;
        if ($scope.phase != null) {
            var request = {
                project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id,
                phase_id: $scope.phase._id,
                type: 1,
                searchText: $scope.search,
                skip: $scope.skip,
                limit: $scope.limit
            };
        } else {
            var request = {
                project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id,
                type: 1,
                searchText: $scope.search,
                skip: $scope.skip,
                limit: $scope.limit

            }
        }
        userStoryService.getUserStories(request, function (response) {
            if (response.data.statusCode == 200) {
                $timeout(commonService.closePopup(), 200); // hide processing popup

                $scope.backlogUserStorydata = response.data.data;

                for (var i = 0; i < $scope.backlogUserStorydata.allUserStories.length; i++) {
                    $scope.backlogUserStorydata.allUserStories[i]['isChecked'] = false;
                    if ($scope.backlogUserStorydata.allUserStories[i].attachments.length > 0) {
                        var image_name = $scope.backlogUserStorydata.allUserStories[i].attachments[0].name;
                        var final_image_name = image_name.split('.');
                        $scope.backlogUserStorydata.allUserStories[i]['file_extension'] = final_image_name[1];
                    } else {
                        $scope.backlogUserStorydata.allUserStories[i]['file_extension'] = '';
                    }
                }

            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /* Check all user stories */
    $scope.checkAll = function () {
        if ($scope.masterChecklist == true) {
            var ckeckList = [];
            for (var i = 0; i < $scope.backlogUserStorydata.allUserStories.length; i++) {
                $scope.backlogUserStorydata.allUserStories[i].isChecked = true;
                ckeckList.push($scope.backlogUserStorydata.allUserStories[i]._id);
            }
            $scope.idsChecklist = angular.copy(ckeckList);
        } else if ($scope.masterChecklist == false) {
            for (i = 0; i < $scope.backlogUserStorydata.allUserStories.length; i++) {
                $scope.backlogUserStorydata.allUserStories[i].isChecked = false;
            }
            $scope.idsChecklist = [];
        }
    }

    /* Check uncheck user stories */
    $scope.checkUnCheck = function (value, key, id) {
        $scope.idsChecklist = [];
        for (var i = 0; i < $scope.backlogUserStorydata.allUserStories.length; i++) {
            if ($scope.backlogUserStorydata.allUserStories[i].isChecked == true) {
                $scope.idsChecklist.push($scope.backlogUserStorydata.allUserStories[i]._id);
            }
        }
    }

    /*
     * @name : delete user stories in bulk
     * 
     */
    $scope.deleteUserStoryModal = function () {
        if ($scope.idsChecklist.length > 0) {
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
                $scope.bulkUserStoryDelete();
            });
        } else {
            var data = {title: 'oops', text: 'Please select user stories first.', type: 'error'};
            commonService.showMessage(data);
        }
    }

    $scope.bulkUserStoryDelete = function () {
        /*  If user confirm then delete user stories */
        var request = {project_id: $rootScope.globalProjectId._id, userStoryIds: $scope.idsChecklist, type: 1};
        userStoryService.deleteUserStory(request, function (response) {
            if (response.data.statusCode == 200) {
                swal({
                    title: "Success!",
                    text: response.data.message,
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {
                    $scope.getUserStories();
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });

    }
    /***** DELETE USER STORY IN BULK IN ENDS HERE *****/
    /*
     * @name : delete user stories by id
     *
     */
    $scope.usDelete = function (id) {
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
            var ids = [];
            ids.push(id);
            var request = {project_id: $rootScope.globalProjectId._id, userStoryIds: ids, type: 1};
            userStoryService.deleteUserStory(request, function (response) {
                if (response.data.statusCode == 200) {
                    swal({
                        title: "Success!",
                        text: response.data.message,
                        type: 'success',
                        confirmButtonText: "Ok"
                    }, function () {
                        $scope.getUserStories();
                    });
                } else {
                    swal("Oops...", response.data.message, response.data.status);
                }
            });
        });
    }

    /*
     * @name : backlog user story view change
     */
    $scope.userStoryView = function (view) {
        $scope.view = view;
    }
    /*
     * @name : Add user stories in backlog section
     * @Description : function that add user stories.
     * @Author : Navneet
     */
    $scope.addUserStory = function () {
        if ($rootScope.globalProjectId == null || $rootScope.globalProjectId == '') {
            var data = {title: 'oops', text: 'Please select project in which do you want to add user stories.', type: 'error'};
            commonService.showMessage(data);
            return false;
        }
        $scope.step = 1;
        $scope.submitted = false;
        ModalService.showModal({
            templateUrl: 'views/backlogs/add_user_story_modal.html',
            controller: 'backlogUserStoryChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }

    /*
     * @name : copyIntoPhase
     * @Description : function that user story to phase .
     * @Author : Navneet
     */
    $scope.copyIntoPhase = function () {
        if ($scope.phase == null) {
            /* if no any user story selected then show popup */
            if ($scope.idsChecklist.length > 0) {
                ModalService.showModal({
                    templateUrl: 'views/backlogs/copy-to-phase.html',
                    controller: 'backlogUserStoryChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    modal.element.modal();
                });
            } else {
                var data = {title: 'oops', text: 'Please select user stories first.', type: 'error'};
                commonService.showMessage(data);
            }

        } else {
            swal("Oops...", 'Only un-assigned user story can copy to phase.', 'error');
        }
    }

    /*
     * @name : estimation
     * @Description : function that open a popup for estimations .
     * @Author : Navneet
     */
    $scope.estimateUserStoriesModal = function () {
        if ($scope.phase != null) {
            if ($scope.idsChecklist.length > 0) {
                // fetch resources of a project
                var request = {project_id: $rootScope.globalProjectId._id};
                userStoryService.getResources(request, function (response) {
                    if (response.data.statusCode == 200) {
                        $scope.project_available_resources = response.data.data.resources;
                        $scope.project_assigned_resources = [];
                        ModalService.showModal({
                            templateUrl: 'views/backlogs/estimate_stories.html',
                            controller: 'backlogUserStoryChildCtrl',
                            scope: $scope
                        }).then(function (modal) {
                            modal.element.modal();
                        });
                    } else {
                        swal("Oops...", response.data.message, response.data.status);
                    }
                });
            } else {
                var data = {title: 'oops', text: 'Please select user stories first.', type: 'error'};
                commonService.showMessage(data);
            }
        } else {
            swal("Oops...", 'Please select a phase for send estimation.', 'error');
        }
    }
    /*******************************
     Backlog user story detail popup view
     ********************************/
    /*
     * @name : get all status of priority
     */
    $scope.priority_status = [];
    $scope.getPriorityStatus = function () {
        userStoryService.priorityStatus({type: 4}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.priority_status = response.data.data;
            }
        });
    }


    /*
     * Backlog user story detail view model
     * url :- /backlogs/backlog-user-stories
     */
    $scope.list = {};
    $scope.userStoryModal = function (id) {

        commonService.loadingPopup(); // start processing popup
        var request = {userStory_id: id, type: 1};

        var methods = {
            user_story: userStoryService.getUserStoryDetails(request),
            priority: userStoryService.priorityStatus({type: 4}),
            status: userStoryService.priorityStatus({type: 1}),
            epic_theme_data: userStoryService.getEpicAndTheme(),
            checklist_data: userStoryService.getCheckListData({task_id: id, type: 0, skip: $scope.checklist_skip, limit: $scope.checklist_limit}),
            testcase_data: userStoryService.getCheckListData({task_id: id, type: 1, skip: $scope.testcase_skip, limit: $scope.testcase_limit})
        };
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
                return false;
            }
            else if (response.length > 0) {
                swal("Oops...", 'Technical error. Please try again later', 'error');
            } else {
                $scope.userstory_detail = methods.user_story.data.result;
                $scope.userstory_detail.status = (methods.user_story.data.result.status != undefined) ? methods.user_story.data.result.status._id : '';

                $scope.epic_data = methods.epic_theme_data.data.result.epic;
                $scope.theme_data = methods.epic_theme_data.data.result.theme;
                $scope.priority_data = methods.priority.data.data;
                $scope.status_data = methods.status.data.data;

                $scope.checklist_data = methods.checklist_data.data.result.result;
                $scope.checklist_data_total = methods.checklist_data.data.result.total || 0;

                $scope.testcase_data = methods.testcase_data.data.result.result;
                $scope.testcase_data_total = methods.testcase_data.data.result.total || 0;


                var controller_object = this;

                ModalService.showModal({
                    templateUrl: 'views/backlogs/user_story_modal.html',
                    controller: function ($scope, $element, close) {

                        /* Function to get check list data*/
                        $scope.getCheckList = function (called_from) {
                            if (called_from == 'add') {

                                $scope.currentPageCheckList = 1;
                                var request = {
                                    task_id: $scope.userstory_detail._id,
                                    type: 0,
                                    skip: 0,
                                    limit: $scope.checklist_limit
                                };
                            } else {
                                $scope.checklist_skip = ($scope.currentPageCheckList - 1) * $scope.checklist_limit;
                                var request = {
                                    task_id: $scope.userstory_detail._id,
                                    type: 0,
                                    skip: $scope.checklist_skip,
                                    limit: $scope.checklist_limit
                                };
                            }
                            userStoryService.getCheckListData(request, function (response) {
                                if (response.data.statusCode == 200) {
                                    $scope.checklist_data = response.data.result.result;
                                    $scope.checklist_data_total = response.data.result.total || 0;

                                } else {
                                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                                    commonService.showMessage(data);
                                }
                            });
                        }

                        $scope.getTestCaseList = function (called_from) {
                            if (called_from == 'add') {
                                $scope.currentPageTestCase = 1;
                                var request = {
                                    task_id: $scope.userstory_detail._id,
                                    type: 1,
                                    skip: 0,
                                    limit: $scope.testcase_limit
                                };
                            } else {
                                $scope.testcase_skip = ($scope.currentPageTestCase - 1) * $scope.testcase_limit;
                                var request = {
                                    task_id: $scope.userstory_detail._id,
                                    type: 1,
                                    skip: $scope.testcase_skip,
                                    limit: $scope.testcase_limit
                                };
                            }
                            userStoryService.getCheckListData(request, function (response) {
                                if (response.data.statusCode == 200) {
                                    $scope.testcase_data = response.data.result.result;
                                    $scope.testcase_data_total = response.data.result.total || 0;
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
                                    templateUrl: 'views/backlogs/checklist_modal.html',
                                    scope: $scope,
                                    controller: function ($scope) {

                                    },
                                }).then(function (modal) {
                                    commonService.closePopup();
                                    modal.element.modal();
                                    angular.element(document).on('shown.bs.modal', function (e) {
                                        angular.element('input:visible:enabled:first', e.target).focus();
                                    });
                                });
                            } else {
                                userStoryService.priorityStatus({type: 4}, function (response) {
                                    if (response.data.statusCode == 200) {
                                        $scope.priority_status = [];
                                        $scope.priority_status = response.data.data;
                                        $scope.checklist.type = 1;
                                        ModalService.showModal({
                                            templateUrl: 'views/backlogs/testcase_modal.html',
                                            scope: $scope,
                                            controller: function ($scope) {

                                            },
                                        }).then(function (modal) {
                                            commonService.closePopup();
                                            modal.element.modal();
                                        });
                                    }
                                });
                            }
                        }

                        /*Function to create checklist and test case on the basis of type 0-checklist 1- test case*/
                        $scope.addCheckList = function () {
                            commonService.loadingPopup(); // start processing popup

                            if ($scope.checklist.type == '0') {
                                var request = {
                                    task_id: $scope.userstory_detail._id,
                                    type: $scope.checklist.type,
                                    title: $scope.checklist.title
                                };
                            } else {
                                var request = {
                                    task_id: $scope.userstory_detail._id,
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
                                    var type = '';
                                    if ($scope.checklist.type == '0') {
                                        $scope.getCheckList('add');
                                        type = 'Check list';
                                    }
                                    if ($scope.checklist.type == '1') {
                                        $scope.getTestCaseList('add');
                                        type = 'Test cases';
                                    }
                                    angular.element('.close_modal').trigger('click');
                                    // swal({title: "Success!", text: type + ' added successfully', type: 'success', confirmButtonText: "OK"});
                                    var data = {title: 'Success', text: type + ' added successfully', type: 'success'};
                                    commonService.showMessage(data);
                                } else {
                                    commonService.closePopup();
                                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                                    commonService.showMessage(data);
                                }
                            });
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
                                    var data = {title: 'Success', text: response.data.message, type: 'success'};
                                    commonService.showMessage(data);
                                    if (type && type == '0') {
                                        $scope.getCheckList();
                                    }
                                    if (type && type == '1') {
                                        $scope.getTestCaseList();
                                    }
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
                                userStory_id: $scope.userstory_detail._id,
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

                        $scope.closeModal = function () {
                            $element.modal('hide');  //  Manually hide the modal using bootstrap.
                            close(null, 500);//  Now close as normal, but give 500ms for bootstrap to animate
                        };

                        /*
                         * Function to upload attachments to a project
                         * */
                        $scope.uploadFiles = function (files, task_id, project_id) {
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
                                        task_id: task_id,
                                        project_id: project_id,
                                        type: 2
                                    }
                                }).then(function (response) {
                                    if (response.data.statusCode == 200) {
                                        $scope.userstoryprogress = 0;
                                        $scope.getAttachments(task_id);
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

                        $scope.skip = 0;
                        $scope.limit = 10;
                        $scope.comments = {};

                        $scope.commentPost = function () {
                            var request = {task_Id: $scope.userstory_detail._id, comment_description: $scope.comments.comment_description}
                            var task_id = $scope.userstory_detail._id;
                            userStoryService.createComments(request, function (response) {
                                if (response.data.statusCode == 200) {
                                    $scope.comments.comment_description = '';
                                    $scope.submitted = false;
                                    $scope.commentform.$setUntouched();
                                    swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"});
                                    $scope.getComments(task_id);
                                } else {
                                    swal("Oops...", response.data.message, response.data.status);
                                }
                            });
                        }

                        /*****************Function to Show All Comments in the Admin Section**********************************************/

                        $scope.list = [];

                        $scope.loadMore = function () {
                            $scope.skip += $scope.limit;

                            var request = {task_Id: $scope.userstory_detail._id, skip: $scope.skip, limit: $scope.limit};
                            userStoryService.getComments(request, function (response) {
                                if (response.data.statusCode == 200) {
                                    angular.forEach(response.data.data.comment, function (response) {
                                        $scope.userstory_detail.comments.push(response);
                                    });
                                    if ($scope.userstory_detail.comments.length == response.data.data.totalComment) {
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

                        $scope.getComments = function (task_id) {
                            $scope.url = $scope.baseUrl + 'attachment/admin/';
                            var request = {task_Id: task_id, skip: $scope.skip, limit: $scope.limit};
                            userStoryService.getComments(request, function (response) {
                                if (response.data.statusCode == 200) {
                                    $scope.userstory_detail.comments = response.data.data.comment;
                                    if ($scope.userstory_detail.comments.length == response.data.data.totalComment) {
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
                        $scope.getAttachments = function (task_id) {

                            var request = {task_id: task_id, skip: $scope.skip, limit: 100};
                            userStoryService.getAttachments(request, function (response) {
                                if (response.data.statusCode == 200) {
                                    $scope.userstory_detail.attachments = response.data.data.attachment;
                                } else {
                                    swal("Oops...", response.data.message, response.data.status);
                                }
                            });
                        }

                        //Function to delete attachment of a user story
                        $scope.deleteAttachment = function (task_id, id) {
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
                                var request = {attachmentId: id}
                                userStoryService.deleteAttachment(request, function (response) {
                                    if (response.data.statusCode == 200) {
                                        $scope.getAttachments(task_id);

                                        var data = {title: 'Success', text: 'Attachment deleted successfully', type: 'success'};
                                        commonService.showMessage(data);
                                    } else {
                                        var data = {title: 'oops', text: response.data.message, type: 'error'};
                                        commonService.showMessage(data);
                                    }
                                });
                            });
                        }

                    },
                    scope: $scope
                }).then(function (modal) {
                    commonService.closePopup();
                    modal.element.modal();
                });
            }
        });
    }

    /*
     * Backlog user story quick estimate model
     * url :- /backlogs/backlog-user-stories
     */
    $scope.QuickEstimateUserStoriesModal = function () {
        if ($scope.phase != null) {
            if ($scope.idsChecklist.length > 0) {
                $scope.estimateUserStories = [];
                for (var i = 0; i < $scope.backlogUserStorydata.allUserStories.length; i++) {
                    if ($scope.backlogUserStorydata.allUserStories[i].isChecked == true) {
                        $scope.estimateUserStories.push($scope.backlogUserStorydata.allUserStories[i]);
                    }
                }

                var request = {project_id: $rootScope.globalProjectId._id, phase_id: $scope.phase._id};
                userStoryService.getProcess(request, function (response) {
                    if (response.data.statusCode == 200) {
                        $scope.phasename = response.data.results[0].phase_name;
                        for (var i = 0; i < $scope.estimateUserStories.length; i++) {
                            var processes = [];
                            for (var k = 0; k < response.data.results[0].processes.length; k++) {
                                var out = {time: '', process_name: response.data.results[0].processes[k].process_name, _id: response.data.results[0].processes[k]._id}
                                processes.push(out);
                            }
                            $scope.estimateUserStories[i]['eta'] = processes;
                        }

                        ModalService.showModal({
                            templateUrl: 'views/backlogs/user_story_quick_estimate_modal.html',
                            controller: 'backlogUserStoryChildCtrl',
                            scope: $scope
                        }).then(function (modal) {
                            modal.element.modal();
                        });
                    }
                });
            } else {
                swal("Oops...", 'Please select some user stories first', 'error');
            }
        } else {
            swal("Oops...", 'Please select a phase for estimation.', 'error');
        }
    }

    /*
     * 
     * @name : Upload csv modal window
     * @description : function to open view from where userstory csv uploaded
     */
    $scope.uploadCsv = function () {
        $scope.project_id = $rootScope.globalProjectId._id
        ModalService.showModal({
            templateUrl: 'views/backlogs/user_story_upload_modal.html',
            controller: 'backlogUserStoryChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }

    /*
     * 
     * @name : Export user story in csv 
     * @description : function to export user stories in csv file
     */
    $scope.exportUs = {};
    $scope.exportCsv = function () {
        commonService.loadingPopup();
        var phase_id = ($scope.phase != null || $scope.phase != undefined || $scope.phase == '') ? $scope.phase._id : '';
        var request = {project_id: $rootScope.globalProjectId._id, phase_id: phase_id};
        userStoryService.exportUserStory(request, function (response) {
            if (response.data.statusCode == 200) {

                $scope.exportUs = {name: response.data.data};
                swal({
                    html: true,
                    title: "Download CSV",
                    text: "<div>Click on file name to download file</div><br/><a target='_self'  download=" + $scope.exportUs.name + "    href=" + $scope.baseUrl + "attachment/admin/" + $scope.exportUs.name + ">" + $scope.exportUs.name + " </a>",
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {
                    $scope.exportUs = {};
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * @name : set complexity of a User story
     * @description : function to set required parameters for rating & give rating to user story
     */
    $scope.list = {task_complexity: 0};
    $scope.max = 5;
    $scope.isReadonly = false;

    $scope.hoveringOver = function (value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
    };

    $scope.setRating = function (activity_id, rate) {
        if (rate !== 0) {
            var request = {activity_id: activity_id, task_complexity: rate};
            commonService.updateComplexity(request, function (response) {
                if (response.data.statusCode == 200) {
                    swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                    function () {
                        $scope.getUserStories();
                    });
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        } else {
            $state.reload();
        }
    }

    /*************************************************
     Backlog user story detail popup view Ends here
     **************************************************/
    $rootScope.$on("CallManageUserStories", function (event, args) {
        if (args && args.phase && args.phase != undefined) {
            $scope.phase = args.phase;
        }
        $scope.getUserStories();
    });

    $scope.quickEditUS = function (type, userStoryId) {
        $scope.type = type;
        commonService.loadingPopup();
        var request = {userStory_id: userStoryId, type: 1};
        userStoryService.getUserStoryDetails(request, function (response) {
            commonService.closePopup();
            if (response.data.statusCode == 200) {
                $scope.userStoryData = response.data.result;
                ModalService.showModal({
                    templateUrl: 'views/backlogs/quick_edit_us.html',
                    controller: 'backlogUserStoryChildCtrl',
                    scope: $scope

                }).then(function (modal) {
                    commonService.closePopup();
                    modal.element.modal();
                });
            }
        });
    }
});


angular.module("ignitrack").controller("backlogUserStoryChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, userStoryService, Upload, API_URL, close, $element) {


    /*
     * 
     * @name : Upload csv modal window
     * @description : function to open view from where userstory csv uploaded
     */
    $scope.uploadCsv = function () {
        commonService.loadingPopup(); // start processing popup
        $scope.project_id = $rootScope.globalProjectId._id
        ModalService.showModal({
            templateUrl: 'views/backlogs/user_story_upload_modal.html',
            controller: 'backlogUserStoryChildCtrl',
            scope: $scope
        }).then(function (modal) {
            commonService.closePopup();
            modal.element.modal();
        });
    }

    $scope.postUserStory = function (step, send) {
        /* If user story add first step is completed then show next step */
        $scope.step = step;
        if (send == false) {
            $scope.submitted = false;
            $timeout(commonService.closePopup(), 200); // hide processing popup
        } else {
            var request = {
                name: $scope.us.name,
                role: $scope.us.role,
                outcome: $scope.us.outcome,
                event: $scope.us.event,
                context: $scope.us.context,
                feature: $scope.us.feature,
                project_id: $rootScope.globalProjectId._id,
                screen_image: $scope.us.screen_image
            };
            /* SEND REQUEST ON SERVER */
            $scope.requestSend = true;
            Upload.upload({
                method: 'POST',
                url: API_URL + 'userStory/addUserStrory',
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
                        $rootScope.$emit("CallManageUserStories");
                    });
                    $scope.requestSend = false;
                } else {
                    swal("Oops...", response.data.message, response.data.status);
                    $scope.requestSend = false;
                }
            });
        }
    }

    /*
     * Description :- function that send data to service for create duplication copy in phase.
     */
    $scope.createCopy = function () {
        var request = {
            project_id: $rootScope.globalProjectId._id,
            phase_id: $scope.phaseId._id,
            userstory_id: $scope.idsChecklist
        };
        commonService.loadingPopup(); // start processing popup
        userStoryService.copyUserStory(request, function (response) {
            if (response.data.statusCode == 200) {

                swal({
                    title: "Success!",
                    text: response.data.message,
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {
                    $scope.closeModal();
                    $rootScope.$emit("CallManageUserStories", {phase: $scope.phaseId});
                });
            } else {
                var data = {title: 'oops', text: 'Error occurred. Please try after some time.', type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * Description :- function that add resource for estimation.
     */
    $scope.assignResource = function (key, phase_id) {
        $scope.project_assigned_resources.push($scope.project_available_resources[key]);
        $scope.project_available_resources.splice(key, 1);
    }
    /*
     * Description :- function that delete resource for estimation.
     */
    $scope.deleteResource = function (key) {
        $scope.project_available_resources.push($scope.project_assigned_resources[key]);
        $scope.project_assigned_resources.splice(key, 1);

    }

    /* send invitation request */
    $scope.sendEstimation = function () {

        if ($scope.project_assigned_resources.length > 0) {
            $scope.sendrequest = true;
            var teamMembers = [];
            for (var i = 0; i < $scope.project_assigned_resources.length; i++) {
                teamMembers.push($scope.project_assigned_resources[i]._id);
            }
            var request = {
                team_name: $scope.team,
                project_id: $rootScope.globalProjectId._id,
                phase_id: $scope.phase._id,
                user_id: teamMembers,
                task_id: $scope.idsChecklist
            };
            userStoryService.sendEstimationRequest(request, function (response) {
                if (response.data.statusCode == 200) {
                    swal({
                        title: "Success!",
                        text: response.data.message,
                        type: 'success',
                        confirmButtonText: "Ok"
                    }, function () {
                        $scope.closeModal();
                        $rootScope.$emit("CallManageUserStories", {phase: $scope.phaseId});
                    });
                } else {
                    var data = {title: 'oops', text: 'Error occurred. Please try after some time.', type: 'error'};
                    commonService.showMessage(data);
                }
                $scope.sendrequest = false;
            });

        } else {
            swal("Oops...", 'Please add resources to send estimation request.', 'error');
        }
    }

    $scope.closeModal = function () {
        $element.modal('hide');  //  Manually hide the modal using bootstrap.
        close(null, 500);//  Now close as normal, but give 500ms for bootstrap to animate
    };

    $scope.uploadCsv = function () {
        commonService.loadingPopup(); // start processing popup

        var request = {
            project_id: $rootScope.globalProjectId._id,
            file: $scope.userStory.uploadcsv
        };

        userStoryService.uploadUserStories(request, function (response) {

            if (response.data.statusCode == 200) {
                swal({
                    title: "Success!",
                    text: response.data.message,
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {
                    $scope.closeModal();
                    $timeout(commonService.closePopup(), 200);
                    $rootScope.$emit("CallManageUserStories");
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    angular.element(document).on('hidden.bs.modal', function (e) {
        if (angular.element('.modal-backdrop').length > 0) {
            angular.element('body').addClass('modal-open');
        }
    });
    $scope.console = function () {
        angular.forEach($scope.estimateUserStories, function (item1, key1) {
            angular.forEach(item1.eta, function (item2, key2) {
                item2["time"] = document.getElementById("time_" + key1 + "_" + key2).value
            })
        })
    }

    $scope.quickEstimation = function () {
        $scope.estimations = [];
        for (var i = 0; i < $scope.estimateUserStories.length; i++) {

            var final = {task_id: $scope.estimateUserStories[i]._id, project_id: $rootScope.globalProjectId._id, phase_id: $scope.phase._id};
            $scope.estimations.push(final);

            var estimation = [];
            for (var k = 0; k < $scope.estimateUserStories[i].eta.length; k++) {
                var eta = {process_id: $scope.estimateUserStories[i].eta[k]._id, estimation: $scope.estimateUserStories[i].eta[k].time};
                estimation.push(eta);
            }
            $scope.estimations[i]['estimation'] = estimation;
        }

        userStoryService.quickEstimation({estimations: $scope.estimations}, function (response) {
            if (response.data.statusCode == 200) {
                swal({
                    title: "Success!",
                    text: response.data.message,
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {
                    $scope.closeModal();
                    $timeout(commonService.closePopup(), 200);
                    $rootScope.$emit("CallManageUserStories");
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }

    /* Resources Filter In Estimation Popup */
    $scope.searchResources = function (str, project_assigned_resources) {
        var resources = [];
        if (project_assigned_resources.length > 0) {
            for (var i = 0; i < project_assigned_resources.length; i++) {
                resources.push(project_assigned_resources[i]._id);
            }
        }

        var request = {project_id: $rootScope.globalProjectId._id, search: str, resources_ids: resources};
        commonService.projectResourcesSearch(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_available_resources = response.data.data;
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }

    $scope.quickAddUs = function (type) {
        /* edit front card details */
        if (type == 1) {
            if ($scope.userStoryData.image && $scope.userStoryData.image != undefined) {
                var request = {
                    user_story_id: $scope.userStoryData._id,
                    name: $scope.userStoryData.name,
                    screen_image: $scope.userStoryData.image,
                    type: type
                };
            } else {
                var request = {
                    user_story_id: $scope.userStoryData._id,
                    name: $scope.userStoryData.name,
                    type: type
                };
            }
            /* SEND REQUEST ON SERVER */
            $scope.requestSend = true;
            Upload.upload({
                method: 'PUT',
                url: API_URL + 'userStory/quickAddUserStory',
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
                        $rootScope.$emit("CallManageUserStories");
                    });
                    $scope.requestSend = false;
                } else {
                    swal("Oops...", response.data.message, response.data.status);
                    $scope.requestSend = false;
                }
            });
        }

        if (type == 2) {
            var request = {
                user_story_id: $scope.userStoryData._id,
                role: $scope.userStoryData.user_story_details.role,
                outcome: $scope.userStoryData.user_story_details.outcome,
                event: $scope.userStoryData.user_story_details.event,
                context: $scope.userStoryData.user_story_details.context,
                feature: $scope.userStoryData.user_story_details.feature,
                type: type
            };
            /* SEND REQUEST ON SERVER */
            $scope.requestSend = true;
            Upload.upload({
                method: 'PUT',
                url: API_URL + 'userStory/quickAddUserStory',
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
                        $rootScope.$emit("CallManageUserStories");
                    });
                    $scope.requestSend = false;
                } else {
                    swal("Oops...", response.data.message, response.data.status);
                    $scope.requestSend = false;
                }
            });
        }
    }
});
