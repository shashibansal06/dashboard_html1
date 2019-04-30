/*
 * @file: taskCtrl.js
 * @description:
 * */
angular.module("ignitrack").controller("taskCtrl", function ($q, $timeout, $scope, $state, $rootScope, $window, jwtHelper, ModalService, taskService, commonService, BASE_PATH, Upload, userStoryService, issuesService, $stateParams, $cookieStore) {
    $scope.url_regex = RegExp('^((https?|ftp)://)?([a-z]+[.])?[a-z0-9-]+([.][a-z]{1,4}){1,2}(/.*[?].*)?$', 'i');
    $scope.heading = "Tasks";
    var action = $state.current.name;
    $scope.baseUrl = BASE_PATH;
    $scope.url = $scope.baseUrl + 'compressed/';

    $scope.task_id = $state.params.id;
    $scope.pid = $state.params.pid;

    $scope.skip = 0;
    $scope.limit = 10;
    $scope.comments = {};
    $scope.list = [];

    $scope.skipTask = 0;
    $scope.limitTask = 10;
    $scope.currentPageTaskHistory = 1;
    $scope.currentPageTaskEffort = 1;
    $scope.maxSize = 5;

    //Function to update comments on real time basis
    $scope.$on('eventTaskBoard', function (event, data) {
        if ($state.current.name == "tasks") {
            $scope.loadTaskBoard('socket');
        }
    });


    $scope.clearFilter = function () {
        $state.reload();
    }

    $scope.getAttachments = function () {
        commonService.loadingPopup(); // start processing popup

        var request = {task_id: $scope.task_id, skip: 0, limit: 100};
        userStoryService.getAttachments(request, function (response) {
            $timeout(commonService.closePopup(), 200); // hide processing popup 
            if (response.data.statusCode == 200) {
                $scope.attachments = response.data.data.attachment;
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
            var request = {attachmentId: id, task_id: task_id, is_userStory: false};
            userStoryService.deleteAttachment(request, function (response) {

                if (response.data.statusCode == 200) {
                    swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"}, function () {
                        $scope.getAttachments(task_id);
                    });

                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        });
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
                    type: 3
                }
            }).then(function (response) {
                if (response.data.statusCode == 200) {
                    $scope.taskprogress = 0;
                    $scope.getAttachments(task_id);
                } else {
                    $scope.taskprogress = 0;
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            },
                    function (response) {
                        if (response.status > 0) {
                            $scope.taskprogress = 0;
                            var data = {title: 'oops', text: response.data, type: 'error'};
                            commonService.showMessage(data);
                            //$scope.errorMsg = response.status + ': ' + response.data;
                        }
                    },
                    function (evt) {
                        $scope.taskprogress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    });
        }
    }

    /***********************Function to Add Comments in the Admin Section*****************************************/
    $scope.commentPost = function () {
        commonService.loadingPopup(); // start processing popup

        var request = {task_Id: $scope.task_id, comment_description: $scope.comments.comment_description, type: 3}
        var task_id = $scope.task_id;
        userStoryService.createComments(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.comments.comment_description = '';
                $scope.submitted = false;
                $scope.commentform.$setUntouched();
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"}, function () {
                    $scope.getComments(task_id);
                });
            } else {
                swal({title: "Oops!", text: response.data.message, type: 'error', confirmButtonText: "OK"});
            }
        });
    }

    $scope.loadMore = function () {
        commonService.loadingPopup(); // start processing popup
        // console.log($scope.userstory_detail.comments);
        $scope.skip += $scope.limit;

        var request = {task_Id: $scope.task_id, skip: $scope.skip, limit: $scope.limit};
        userStoryService.getComments(request, function (response) {
            $timeout(commonService.closePopup(), 200); // hide processing popup 
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

    $scope.getComments = function (task_id) {
        commonService.loadingPopup(); // start processing popup
        $scope.url = $scope.baseUrl + 'attachment/admin/';
        var request = {task_Id: $scope.task_id, skip: $scope.skip, limit: $scope.limit};
        userStoryService.getComments(request, function (response) {
            $timeout(commonService.closePopup(), 200); // hide processing popup 

            if (response.data.statusCode == 200) {
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
    /*****************Function to Show All Comments in the Admin Section**********************************************/

    /*
     * 
     * FUnction to view all effort logs
     */
    $scope.viewEffort = function () {
        $scope.task_details = {}
        $scope.skipTask = ($scope.currentPageTaskEffort - 1) * $scope.limitTask;
        commonService.loadingPopup();
        taskService.getTaskDetails({task_id: $scope.task_id}, function (response) {
            if (response.data.statusCode == 200)
            {
                commonService.closePopup();

                $scope.task_details = {projectId: response.data.result[0].project_id._id, phaseId: response.data.result[0].phase_id._id, taskId: $scope.task_id, userStoryId: response.data.result[0].parent_id, sprintId: response.data.result[0].sprint_id._id};

                taskService.viewEffort({task_id: $scope.task_id, skip: $scope.skipTask, limit: $scope.limitTask}, function (responses) {
                    if (responses.data.statusCode == 200)
                    {
                        $scope.total_efforts = responses.data.data.total_records
                        $scope.logs = responses.data.data;
                    }
                })
            } else {
                commonService.closePopup();
                swal("Oops...", response.data.message, response.data.status);
            }
        })
    }




    /*
     * 
     * FUnction to view all task history
     */
    $scope.viewHistory = function () {
        $scope.task_history = [];
        commonService.loadingPopup();

        $scope.skipTask = ($scope.currentPageTaskHistory - 1) * $scope.limitTask;
        console.log($scope.limitTask)
        var request = {task_id: $stateParams.id, project_id: $stateParams.pid, skip: $scope.skipTask, limit: $scope.limitTask};
        taskService.getTaskHistory(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.task_history = response.data.result.data;
                console.log($scope.task_history.length);
                $scope.totalHistoryCount = response.data.result.totalRecords;
            } else {
                commonService.closePopup();
                swal("Oops...", response.data.message, response.data.status);
            }
        })
    }


    /*
     * 
     * FUnction to update effort logs
     */
    $scope.updateEffort = function () {
        commonService.loadingPopup(); // start processing popup
        taskService.updateEffort({_id: $scope.task_id}, function (response) {
            $timeout(commonService.closePopup(), 200); // hide processing popup 
            if (response.data.statusCode == 200)
            {

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /* DRAG DROP FUNCTIONS */
    $scope.handleDragStart = function (e) {
        e.dataTransfer.setData('taskid', this.getAttribute('dragable-tkId'));
        e.dataTransfer.setData('dragIndex', this.getAttribute('drag-pick-index'));
        e.dataTransfer.setData('dragStatus', this.getAttribute('drag-status'));
    };

    $scope.handleDragEnd = function (e) {
        this.style.opacity = '1.0';
    };

    $scope.handleDrop = function (e) {
        e.preventDefault();
        e.stopPropagation();

        var taskid = e.dataTransfer.getData('taskid');
        var dragStatus = e.dataTransfer.getData('dragStatus');
        var status = this.getAttribute('drop-status');

        var dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
        var dropIndex = parseInt(this.getAttribute('drag-drop-index'));

        if (status == dragStatus) {
            return false;
        }
        else if (dragIndex != dropIndex) {
            swal("Oops...", "The task can not be moved in to another user story.", 'error');
        } else {
            $scope.statusUpdate(taskid, status);
        }
    };

    $scope.handleDragOver = function (e) {
        e.preventDefault(); // Necessary. Allows us to drop.
        e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
        return false;
    };
    /* DRAG DROP FUNCTIONS ENDS HERE */

    /* 
     * @ name : Load Task Board
     * @ Description : function that get all dashboard data  
     */
    $scope.loadTaskBoard = function (socket_called) {
        /* Get sprint dropdown */
        if (socket_called == undefined) {
            commonService.loadingPopup(); // start processing popup
        }
        $scope.search_keyword = '';
        $scope.warningTip = false;
        var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};
        var methods = {
            sprintList: taskService.getSprints(request),
            taskStatusList: taskService.getTaskStatusList({type: 1, is_user_defined_status: true}),
            userStoryStatusList: taskService.getUserStoryStatusList({type: 1, is_user_defined_status: false}),
        };
        var set = 0;
        $q.all(methods).then(function (methods) {
            var response = _.filter(methods, function (obj) {
                if (obj.data.statusCode && obj.data.statusCode == 101) {
                    swal("Oops...", obj.data.message, 'error');
                    set = 1;
                }
                else if (obj.data.type && obj.data.type != undefined) {
                    swal("Oops...", obj.data.message, 'error');
                    set = 1;
                } else {
                    return obj.status != 200 || !obj.data || obj.data.statusCode != 200
                }
            });
            if (set == 1) {
                return false;
            }
            if (response.length > 0) {
                swal("Oops...", 'Technical error. Please try again later', 'error');
            } else {
                /* */
                if (methods.sprintList.data.data.length > 0) {
                    $scope.sprint_data = methods.sprintList.data.data;
                    $scope.statusList = methods.taskStatusList.data.data;
                    $scope.usStatusList = methods.userStoryStatusList.data.data;
                    if (methods.sprintList.data.data.length > 0) {

                        var stored_data = $cookieStore.get('current_selected_sprint') || undefined;
                        if (stored_data && stored_data != undefined) {
                            var data_val = JSON.parse(stored_data);
                            if (request.project_id == data_val.project_id) {
                                //if page refreshes for the same project then no change in the selected sprint id
                                $scope.sprint_id = {_id: data_val.sprit_id, sprint_name: data_val.sprint_name};
                            } else {
                                //Change project from drop down header then select first sprint by default
                                var obj = {
                                    project_id: request.project_id,
                                    sprit_id: methods.sprintList.data.data[0]._id,
                                    sprint_name: methods.sprintList.data.data[0].sprint_name
                                }
                                $cookieStore.put('current_selected_sprint', JSON.stringify(obj));
                                $scope.sprint_id = {_id: methods.sprintList.data.data[0]._id, sprint_name: methods.sprintList.data.data[0].sprint_name};
                            }

                        }
                        //if no selected sprint then make first sprint as defaulr sprint
                        if (stored_data == undefined && methods.sprintList.data.data[0] && methods.sprintList.data.data[0]._id != undefined) {
                            var obj = {
                                project_id: request.project_id,
                                sprit_id: methods.sprintList.data.data[0]._id,
                                sprint_name: methods.sprintList.data.data[0].sprint_name
                            }
                            $cookieStore.put('current_selected_sprint', JSON.stringify(obj));
                            $scope.sprint_id = {_id: methods.sprintList.data.data[0]._id, sprint_name: methods.sprintList.data.data[0].sprint_name};
                        }

                        $scope.getAllTasks();
                        if (socket_called == undefined) {
                            commonService.closePopup();
                        }
                    }
                } else {
                    $scope.warningTip = true;
                    /* IF THEIR IS NO ANY CURRENT SPRINT IN THIS PROJECT */
                    if (socket_called == undefined) {
                        commonService.closePopup();
                    } else {
                        //swal({title: "No Records!", text: 'Their is no any sprint plan in this project', type: 'error', confirmButtonText: "OK"});
                    }
                    //swal({title: "No Records!", text: 'Their is no any sprint plan in this project', type: 'error', confirmButtonText: "OK"});
                }

            }
        });
    }


    $scope.getAllTasks = function () {
        if ($scope.sprint_id == undefined) {
            swal("Oops...", 'Please select a sprint', 'error');
        } else {
            var stored_data = $cookieStore.get('current_selected_sprint') || undefined;
            if (stored_data && stored_data != undefined) {
                var data_val = JSON.parse(stored_data);
                var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};
                if (request.project_id == data_val.project_id) {
                    //if project is is ame but sprint changed from dropdown then update sprint id with new sprint selected
                    if ($scope.sprint_id._id != data_val.sprit_id) {
                        $scope.sprint_id = {_id: $scope.sprint_id._id};
                        var obj = {
                            project_id: request.project_id,
                            sprit_id: $scope.sprint_id._id,
                            sprint_name: ''
                        }
                        $cookieStore.put('current_selected_sprint', JSON.stringify(obj));
                    }
                }
            }

            var request = {sprint_id: $scope.sprint_id._id, search_keyword: $scope.search_keyword};
            var methods = {
                taskList: taskService.getAllTasks(request),
            };
            var set = 0;
            $q.all(methods).then(function (methods) {
                var response = _.filter(methods, function (obj) {
                    if (obj.data.statusCode && obj.data.statusCode == 101) {
                        swal("Oops...", obj.data.message, 'error');
                        set = 1;
                    }
                    else if (obj.data.type && obj.data.type != undefined) {
                        swal("Oops...", obj.data.message, 'error');
                        set = 1;
                    } else {
                        return obj.status != 200 || !obj.data || obj.data.statusCode != 200
                    }
                });
                if (set == 1) {
                    return false;
                }
                if (response.length > 0) {
                    swal("Oops...", 'Technical error. Please try again later', 'error');
                } else {
                    $scope.taskList = methods.taskList.data.result;
                    $scope.contigency_hours = methods.taskList.data.contigency_hours != undefined ? methods.taskList.data.contigency_hours : 0;
                }
            });
        }

    }



    /* ******   ENDS GET DASHBOARD ENDS HERE ********* */
    /* POST A TASK ON A USER STORY */
    $scope.postTask = function (pid, spid, sprint_id, phase_id) {
        $scope.task = {user_story_id: spid, project_id: pid, sprint_id: sprint_id, phase_id: phase_id};
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: null,
            startingDay: 1
        };

        $scope.popup = {
            opened: false
        };

        var request = {project_id: pid, phase_id: phase_id};
        taskService.getProcess(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.processes = response.data.results[0].processes;
                ModalService.showModal({
                    templateUrl: 'views/tasks/add-task-modal.html',
                    scope: $scope,
                    controller: "taskChildCtrl",
                }).then(function (modal) {
                    modal.element.modal();
                });
                $timeout(commonService.closePopup(), 200); // hide processing popup 
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /* Tasks status change */
    $scope.statusUpdate = function (taskid, status) {
        if (status != undefined) {
            var request = {task_id: taskid, status: status};
            /* Update task status */
            taskService.changeStatus(request, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.getAllTasks();
                } else {
                    swal({title: 'oops', text: response.data.message, type: 'error'}, function () {
                        $scope.getAllTasks();
                    });
                }
            });
        }
    }

    /* Log errort on a task */
    $scope.logEffort = function (pid, phaseid, id, usid, spid) {
        commonService.loadingPopup(); // start processing popup
        $scope.effort = {task_id: id, project_id: pid, phase_id: phaseid, us_id: usid, sp_id: spid};
        $scope.loc = 'task-board';
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: null,
            startingDay: 1
        };

        $scope.popup = {
            opened: false
        };

        var request = {project_id: pid, phase_id: phaseid};
        taskService.getProcess(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.processes = response.data.results[0].processes;
                ModalService.showModal({
                    templateUrl: 'views/tasks/log-effort-task-modal.html',
                    scope: $scope,
                    controller: "taskChildCtrl",
                }).then(function (modal) {
                    modal.element.modal();
                });
                $timeout(commonService.closePopup(), 200); // hide processing popup 
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /* Get task details tab */
    $scope.getDetails = function () {
        var request = {task_id: $scope.task_id, type: 3};
        taskService.getTask(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.task = response.data.result;
                $timeout(commonService.closePopup(), 200); // hide processing popup 
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /* update task details */
    $scope.updateTask = function () {
        var request = {
            task_id: $scope.task._id,
            name: $scope.task.name,
            description: ($scope.task.description == null && $scope.task.description == undefined) ? '' : $scope.task.description
        };
        commonService.loadingPopup(); // start processing popup		
        taskService.updateTask(request, function (response) {
            if (response.data.statusCode == 200) {
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"});
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }



    $scope.issueQuickAddModal = function (user_story_id) {
        var project_id = ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id;
        var methods_input = {
            process_data: issuesService.getUserStoryProcess({user_story_id: user_story_id}),
            issues_assignee: issuesService.getUsers({project_id: project_id}),
            platform_data: issuesService.getPlatformIssue({})
        };

        var set = 0;
        $q.all(methods_input).then(function (methods) {
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
                $scope.Url = $scope.baseUrl + 'attachment/admin/';
                $scope.issues_assignee = methods.issues_assignee.data.data.resources;
                $scope.Severity = methods.platform_data.data.result.Severity;
                $scope.process_data = methods.process_data.data.result[0].phase_id.processes;


                $scope.user_story_id = user_story_id;

                ModalService.showModal({
                    templateUrl: 'views/issues/add_issues.html',
                    controller: 'taskChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    modal.element.modal();
                });
            }
        });

    }



    $scope.addIssueWithDetailModal = function (userstoryid) {
        var project_id = ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id;
        var methods_input = {
            issues_assignee: issuesService.getUsers({project_id: project_id}),
            platform_data: issuesService.getPlatformIssue({}),
            process_data: issuesService.getUserStoryProcess({user_story_id: userstoryid}),
            userstory_data: issuesService.getUserStories({project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id})
        };

        var set = 0;
        $q.all(methods_input).then(function (methods) {
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
                $scope.Url = $scope.baseUrl + 'attachment/admin/';
                $scope.issues_assignee = methods.issues_assignee.data.data.resources;

                $scope.Platform = methods.platform_data.data.result.Platform;
                $scope.OperatingSystem = methods.platform_data.data.result.OperatingSystem;
                $scope.Browser = methods.platform_data.data.result.Browser;
                $scope.status = methods.platform_data.data.result.status;
                //$scope.issues.status = $scope.status[2];
                $scope.Severity = methods.platform_data.data.result.Severity;
                $scope.issues_data = {user_story_id: {_id: userstoryid}};
                $scope.issues_userStory = methods.userstory_data.data.data;
                $scope.process_data = methods.process_data.data.result[0].phase_id.processes;

                ModalService.showModal({
                    templateUrl: 'views/issues/add_issues_details.html',
                    controller: 'taskChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    modal.element.modal();
                });
            }
        });

    }

    /* Task detail page efforts log add */
    $scope.effortsAdd = function (pid, phaseid, id, usid, spid) {
        commonService.loadingPopup(); // start processing popup
        $scope.effort = {task_id: id, project_id: pid, phase_id: phaseid, us_id: usid, sp_id: spid};
        $scope.loc = 'efforts';
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: null,
            startingDay: 1
        };

        $scope.popup = {
            opened: false
        };

        var request = {project_id: pid, phase_id: phaseid};
        taskService.getProcess(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.processes = response.data.results[0].processes;
                ModalService.showModal({
                    templateUrl: 'views/tasks/log-effort-task-modal.html',
                    scope: $scope,
                    controller: "taskChildCtrl",
                }).then(function (modal) {
                    modal.element.modal();
                });
                $timeout(commonService.closePopup(), 200); // hide processing popup 
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /* Task detail page efforts log update */
    $scope.effortsEdit = function (pid, phaseid, id, usid, spid, logtime, processId, date, logid) {
        commonService.loadingPopup(); // start processing popup
        $scope.effort = {id: logid, timepicker: logtime, process: processId, task_id: id, project_id: pid, phase_id: phaseid, us_id: usid, sp_id: spid, date: date * 1000};
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: null,
            startingDay: 1
        };

        $scope.popup = {
            opened: false
        };



        var request = {project_id: pid, phase_id: phaseid};
        taskService.getProcess(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.processes = response.data.results[0].processes;
                ModalService.showModal({
                    templateUrl: 'views/tasks/edit-effort-task-modal.html',
                    scope: $scope,
                    controller: "taskChildCtrl",
                }).then(function (modal) {
                    modal.element.modal();
                });
                $timeout(commonService.closePopup(), 200); // hide processing popup 
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /* Update user story status change */
    $scope.usStatusChange = function (status, id) {
        if (status != null) {
            commonService.loadingPopup(); // start processing popup
            var request = {user_story_id: id, status: status._id};
            taskService.updateUserStoryStatus(request, function (response) {
                if (response.data.statusCode == 200) {
                    $timeout(commonService.closePopup(), 200); // hide processing popup 
                    $state.reload();
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        }

    }

    /* delete*/
    $scope.deleteLog = function (id) {
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
            commonService.loadingPopup(); // start processing popup
            var request = {effort_logged_id: id};
            taskService.effortDelete(request, function (response) {
                if (response.data.statusCode == 200) {
                    $timeout(commonService.closePopup(), 200); // hide processing popup 
                    $state.reload();
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        });

    }

    $rootScope.$on("CallManageTasks", function (event, args) {
        $scope.loadTaskBoard();
    });

    $rootScope.$on("CallManageLogs", function (event, args) {
        $scope.viewEffort();
    });


    /*
     * 
     * @function : to view tasks attachment preview
     * @returns {undefined}
     */
    $scope.attachmentModal = function (asset) {
        $scope.url = $scope.baseUrl + 'attachment/admin/';
        $scope.data = asset;

        ModalService.showModal({
            templateUrl: 'views/tasks/attachment_view.html',
            controller: 'taskChildCtrl',
            scope: $scope

        }).then(function (modal) {
            modal.element.modal();
        });
    }

});



angular.module("ignitrack").controller("taskChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, taskService, API_URL, close, $element, issuesService, Upload) {
    /*
     * Name : create task 
     * Description : Create new task popup function
     * */
    $scope.addTask = function () {
        var request = {
            name: $scope.task.title,
            description: $scope.task.description,
            project_id: $scope.task.project_id,
            user_story_id: $scope.task.user_story_id,
            sprint_id: $scope.task.sprint_id,
            effort_estimate: $scope.task.timepicker,
            process_id: $scope.task.process._id,
            // log_effort_date: moment($scope.task.date).unix()
        };

        commonService.loadingPopup(); // start processing popup	
        taskService.createTask(request, function (response) {
            if (response.data.statusCode == 200) {
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    $rootScope.$emit("CallManageTasks"); // Load task board
                    $scope.closeModal();
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }

        });

    }

    /* Add log */
    $scope.logEfforts = function (type) {
        commonService.loadingPopup(); // start processing popup	
        var request = {
            task_id: $scope.effort.task_id,
            project_id: $scope.effort.project_id,
            userStoryId: $scope.effort.us_id,
            efforts: $scope.effort.timepicker,
            sprint_id: $scope.effort.sp_id,
            //  process_id: $scope.effort.process._id,
            phase_id: $scope.effort.phase_id,
            type: 1,
            log_effort_date: moment($scope.effort.date).unix()
        };

        taskService.logTime(request, function (response) {
            if (response.data.statusCode == 200) {
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"}, function () {
                    $scope.closeModal();
                    if (type == 'efforts') {
                        $state.reload();
                    }
                    $rootScope.$emit("CallManageTasks");
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }

        });

    }
    /* Edit efforts */
    $scope.editEfforts = function () {
        commonService.loadingPopup(); // start processing popup	
        var request = {
            _id: $scope.effort.id,
            log_effort_date: moment($scope.effort.date).unix(),
            process_id: $scope.effort.process._id,
            efforts: $scope.effort.timepicker
        };
        taskService.updatelogTime(request, function (response) {
            if (response.data.statusCode == 200) {
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"}, function () {
                    $scope.closeModal();
                    $rootScope.$emit("CallManageLogs"); // Load task board
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }

        });
    }

    $scope.open = function () {
        $scope.popup.opened = true;
    };

    $scope.closeModal = function () {
        $element.modal('hide'); //  Manually hide the modal using bootstrap.
        close(null, 500); //  Now close as normal, but give 500ms for bootstrap to animate
    }


    $scope.issues = [];

    $scope.addIssues = function () {
        commonService.loadingPopup();
        var request = {
            name: $scope.issues.title,
            description: $scope.issues.summary,
            assigned_to: $scope.issues.assigne_id._id,
            severity: $scope.issues.severity._id,
            user_story_id: $scope.user_story_id,
            sprint_id: $scope.sprint_id._id,
            process_id: $scope.issues.process_id._id,
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
        };

        issuesService.addissue(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    //$rootScope.$emit("CallManageTasks");
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    $scope.addIssuesWithdetail = function () {
        commonService.loadingPopup();
        var request = {
            sprint_id: $scope.sprint_id._id,
            name: $scope.issues_data.title,
            description: $scope.issues_data.summary,
            assigned_to: ($scope.issues_data.assigne_id == null && $scope.issues_data.assigne_id == undefined) ? '' : $scope.issues_data.assigne_id._id,
            severity: ($scope.issues_data.severity == null && $scope.issues_data.severity == undefined) ? '' : $scope.issues_data.severity._id,
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            platformId: ($scope.issues_data.Platform == null && $scope.issues_data.Platform == undefined) ? '' : $scope.issues_data.Platform._id,
            operatingSystemId: ($scope.issues_data.OperatingSystem == null && $scope.issues_data.OperatingSystem == undefined) ? '' : $scope.issues_data.OperatingSystem._id,
            browserId: ($scope.issues_data.Browser == null && $scope.issues_data.Browser == undefined) ? '' : $scope.issues_data.Browser._id,
            attachments: $scope.issues_data.attachments,
            stepsToReproduce: $scope.issues_data.text,
            expectedResult: $scope.issues_data.result,
            actualResult: $scope.issues_data.Act_result,
            process_id: $scope.issues_data.process_id._id,
            // status: ($scope.issues.status == null && $scope.issues.status == undefined) ? '' : $scope.issues.status._id,
            user_story_id: ($scope.issues_data.user_story_id == null && $scope.issues_data.user_story_id == undefined) ? '' : $scope.issues_data.user_story_id._id,
            url: $scope.issues_data.url,
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
});
