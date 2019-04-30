/*
 * @file: taskCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("issueBoardCtrl", function ($q, $timeout, $scope, $state, $rootScope, $window, jwtHelper, ModalService, BASE_PATH, issueBoardService, commonService, taskService, issuesService, Upload, API_URL, userStoryService, $stateParams, $cookieStore) {

    //$scope.url_regex = RegExp('^((https?|ftp)://)?([a-z]+[.])?[a-z0-9-]+([.][a-z]{1,4}){1,2}(/.*[?].*)?$', 'i');
    $scope.heading = "Issues";
    var action = $state.current.name;
    $scope.baseUrl = BASE_PATH;
    $scope.url = $scope.baseUrl + 'compressed/';

    $scope.task_id = $state.params.id;
    $scope.pid = $state.params.pid;

    $scope.attachment_project_id = $scope.pid;



    $scope.skip = 0;
    $scope.limit = 10;
    $scope.comments = {};
    $scope.list = [];

    $scope.skipIssue = 0;
    $scope.limitIssue = 10;
    $scope.currentPageIssueHistory = 1;
    $scope.maxSize = 10;

    $scope.skipEffort = 0;
    $scope.limitEffort = 10;
    $scope.currentPageEffort = 1;
    $scope.maxSize = 10;


    /*
     * 
     * FUnction to view all issue history
     */
    $scope.viewHistory = function () {
        $scope.issue_history = [];
        commonService.loadingPopup();
        $scope.skipIssue = ($scope.currentPageIssueHistory - 1) * $scope.limitIssue;
        var request = {task_id: $stateParams.id, project_id: $stateParams.pid, skip: $scope.skipIssue, limit: $scope.limitIssue};
        issuesService.getIssueHistory(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.issue_history = response.data.result.data;
                $scope.totalHistoryCount = response.data.result.totalRecords;
            } else {
                commonService.closePopup();
                swal("Oops...", response.data.message, response.data.status);
            }
        })
    }

    $scope.clearFilter = function () {
        $state.reload();
    }

    //Function to update comments on real time basis
    $scope.$on('eventIssueBoard', function (event, data) {
        if ($state.current.name == "issues") {
            $scope.getIssueByTabId($scope.boardId, 'socket');
        }
    });


    $scope.id = $state.params.id;
    $scope.pid = $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id

    /* load issue board dependicies */
    $scope.getDropdowns = function () {

        var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};
        var methods = {
            sprintList: taskService.getSprints(request),
            issueBoards: issueBoardService.get_all_dashboards({}),
            bugsStatusList: taskService.getTaskStatusList({type: 2, is_user_defined_status: true}),
            resources: issueBoardService.getResources({
                project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id
            }),
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
                $scope.sprint_data = methods.sprintList.data.data;
                // $scope.sprint_data.push({_id: 'unmapped', sprint_name: 'unmapped'});

                if (methods.sprintList.data.data.length > 0) {
                    /*var stored_data = $cookieStore.get('issue_admin_current_selected_sprint') || undefined;
                     
                     if (stored_data && stored_data != undefined) {
                     var data_val = JSON.parse(stored_data);
                     $scope.sprint_id = {_id: data_val.sprit_id};
                     }
                     
                     if (stored_data == undefined && methods.sprintList.data.data[0] && methods.sprintList.data.data[0]._id != undefined)
                     {
                     var obj = {
                     project_id: request.project_id,
                     sprit_id: methods.sprintList.data.data[0]._id
                     }
                     $cookieStore.put('issue_admin_current_selected_sprint', JSON.stringify(obj));
                     $scope.sprint_id = {_id: methods.sprintList.data.data[0]._id};
                     }*/

                    var stored_data = $cookieStore.get('issue_admin_current_selected_sprint') || undefined;
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
                            $cookieStore.put('issue_admin_current_selected_sprint', JSON.stringify(obj));
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
                        $cookieStore.put('issue_admin_current_selected_sprint', JSON.stringify(obj));
                        $scope.sprint_id = {_id: methods.sprintList.data.data[0]._id, sprint_name: methods.sprintList.data.data[0].sprint_name};
                    }
                }

                $scope.issueBoardsList = methods.issueBoards.data.data;
                $scope.resource = methods.resources.data.data.resources;
                $scope.statusList = methods.bugsStatusList.data.data;
                $scope.boardId = $scope.issueBoardsList.length > 0 ? $scope.issueBoardsList[0] : '';




                $scope.getIssueByTabId($scope.boardId, '');
            }
        });

    }

    $scope.getIssueByTabId = function (boardId, socket_called) {
        if (boardId != null) {
            if (socket_called == undefined) {
                commonService.loadingPopup(); // start processing popup
            }
            var methods = {};
            var stored_data = $cookieStore.get('issue_admin_current_selected_sprint') || undefined;
            if (stored_data && stored_data != undefined) {
                var data_val = JSON.parse(stored_data);
                var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};
                if (request.project_id == data_val.project_id) {
                    //if project is is ame but sprint changed from dropdown then update sprint id with new sprint selected
                    if ($scope.sprint_id && $scope.sprint_id._id != data_val.sprit_id) {
                        $scope.sprint_id = {_id: $scope.sprint_id._id};
                        var obj = {
                            project_id: request.project_id,
                            sprit_id: $scope.sprint_id._id,
                            sprint_name: ''
                        }
                        $cookieStore.put('issue_admin_current_selected_sprint', JSON.stringify(obj));
                    }
                }
            }

            if ($scope.sprint_id == undefined || $scope.sprint_id == null) {
                for (var i = 0; i < boardId.status.length; i++) {
                    methods[boardId.status[i].id.name] = issueBoardService.getIssuesByStatus({
                        project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id,
                        status_id: boardId.status[i].id._id,
                        sprint_id: $scope.sprint_id != undefined ? $scope.sprint_id._id : '',
                        search: $scope.str == undefined ? '' : $scope.str,
                    });
                }
            }
            else if ($scope.sprint_id._id && $scope.sprint_id._id == 'unmapped') {
                for (var i = 0; i < boardId.status.length; i++) {
                    methods[boardId.status[i].id.name] = issueBoardService.getIssuesByStatus({
                        project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id,
                        status_id: boardId.status[i].id._id,
                        search: $scope.str == undefined ? '' : $scope.str,
                        isUnmapped: true,
                    });
                }
            } else {
                for (var i = 0; i < boardId.status.length; i++) {
                    methods[boardId.status[i].id.name] = issueBoardService.getIssuesByStatus({
                        project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id,
                        status_id: boardId.status[i].id._id,
                        sprint_id: $scope.sprint_id != undefined ? $scope.sprint_id._id : '',
                        search: $scope.str == undefined ? '' : $scope.str,
                    });
                }
            }


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
                    $scope.issueBoardData = [];
                    for (var i = 0; i < boardId.status.length; i++) {
                        var data = {id: boardId.status[i].id._id, name: boardId.status[i].id.name, records: methods[boardId.status[i].id.name].data.data.data, total: methods[boardId.status[i].id.name].data.data.total_records};
                        $scope.issueBoardData[boardId.status[i].position] = data;
                    }
                }
                if (socket_called == undefined) {
                    commonService.closePopup(); // hide processing popup 
                }

            });

        }
    }

    /* BUG ASSIGN TO OTHER IN ISSUE DASHBOARD */
    $scope.changeAssignee = function (assignee, issueId) {
        if (assignee != null) {
            commonService.loadingPopup();
            var request = {assigned_to: assignee._id, issue_id: issueId};
            issueBoardService.changeAssignee(request, function (response) {
                if (response.data.statusCode == 200) {
                    swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"});
                } else {
                    swal("Oops...", response.data.message, response.data.status);
                }
            });

        }
    }

    $scope.changeBugStatus = function (status, issueId) {
        if (status != null) {
            commonService.loadingPopup();
            var request = {status_id: status._id, issue_id: issueId};
            issueBoardService.changeBugStatus(request, function (response) {
                if (response.data.statusCode == 200) {
                    swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"}, function () {
                        $scope.getIssueByTabId($scope.boardId);
                    });
                } else {
                    swal("Oops...", response.data.message, response.data.status);
                }
            });
        }
    }


    /* DRAG DROP FUNCTIONS */
    $scope.handleDragStart = function (e) {
        e.dataTransfer.setData('issue-id', this.getAttribute('dragable-issue-id'));
        e.dataTransfer.setData('issue-outer-index', this.getAttribute('dragable-outer-index'));
        e.dataTransfer.setData('issue-inner-index', this.getAttribute('dragable-bug-index'));
    };

    $scope.handleDragEnd = function (e) {
        this.style.opacity = '1.0';
    };

    $scope.handleDrop = function (e) {
        e.preventDefault();
        e.stopPropagation();

        var issueId = e.dataTransfer.getData('issue-id');
        var bugOuterIndex = e.dataTransfer.getData('issue-outer-index');
        var bugInnerIndex = e.dataTransfer.getData('issue-inner-index');
        var status = this.getAttribute('drop-status');
        var dropIndex = this.getAttribute('drop-index');
        /* status update function */
        $scope.onDragDropIssueStatusChange(issueId, bugOuterIndex, bugInnerIndex, status, dropIndex);
    };

    $scope.handleDragOver = function (e) {
        e.preventDefault(); // Necessary. Allows us to drop.
        e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
        return false;
    };
    /* DRAG DROP FUNCTIONS ENDS HERE */

    $scope.onDragDropIssueStatusChange = function (issueId, bugOuterIndex, bugInnerIndex, status, dropIndex) {
        if (bugOuterIndex == dropIndex) {
            return false;
        }

        commonService.loadingPopup();
        var request = {status_id: status, issue_id: issueId};
        issueBoardService.changeBugStatus(request, function (response) {
            if (response.data.statusCode == 200) {
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"}, function () {
                    /* Update dashboard After successfully status change */
                    $scope.getIssueByTabId($scope.boardId);
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }


    /* Get issue description */

    /* Add issue */
    $scope.addIssue = function () {
        ModalService.showModal({
            templateUrl: 'views/tasks/add-task-modal.html',
            scope: $scope,
            controller: "issueBoardChildCtrl",
        }).then(function (modal) {
            modal.element.modal();
        });
    }

    /* Add issue with detail */
    $scope.addIssueDetail = function () {
        ModalService.showModal({
            templateUrl: 'views/tasks/add-task-modal.html',
            scope: $scope,
            controller: "issueBoardChildCtrl",
        }).then(function (modal) {
            modal.element.modal();
        });
    }



    $scope.getIssueDetail = function () {

        var task_id = $state.params.id;
        var project_id = $state.params.pid;

        var methods_input = {
            issues_data: issuesService.getParticularIssue({issue_Id: task_id, type: '2'}),
            issues_assignee: issuesService.getUsers({project_id: project_id}),
            platform_data: issuesService.getPlatformIssue({}),
            process_data: issuesService.getUserStoryProcess({task_id: task_id}),
            //userstory_data: issuesService.getUserStories({project_id: project_id})
        };

        var set = 0;
        $q.all(methods_input).then(function (methods) {
            var response = _.filter(methods, function (obj) {
                if (obj.data.type && obj.data.type != undefined) {
                    swal("Oops...", obj.data.message, 'error');
                    set = 1;
                } else {
                    //console.log('vhvbhjbhj')
                    return obj.status != 200 || !obj.data || obj.data.statusCode != 200
                }
            });

            if (set == 1) {
                return false;
            }
            else if (response.length > 0) {
                swal("Oops...", 'Technical error. Please try again later', 'error');
            } else {

                $scope.issues_data = {
                    issue_id: methods.issues_data.data.result.allissue[0]._id,
                    sprint_id: methods.issues_data.data.result.allissue[0].sprint_id,
                    title: methods.issues_data.data.result.allissue[0].name,
                    text: methods.issues_data.data.result.allissue[0].issue_details.stepsToReproduce,
                    result: methods.issues_data.data.result.allissue[0].issue_details.expectedResult,
                    Act_result: methods.issues_data.data.result.allissue[0].issue_details.actualResult,
                    summary: methods.issues_data.data.result.allissue[0].description,
                    url: (methods.issues_data.data.result.allissue[0].url != undefined) ? methods.issues_data.data.result.allissue[0].url : '',
                    Platform: methods.issues_data.data.result.allissue[0].issue_details.platformId,
                    OperatingSystem: methods.issues_data.data.result.allissue[0].issue_details.operatingSystemId,
                    Browser: methods.issues_data.data.result.allissue[0].issue_details.browserId,
                    severity: methods.issues_data.data.result.allissue[0].severity,
                    assigne_id: methods.issues_data.data.result.allissue[0].assigned_to,
                    process_id: methods.issues_data.data.result.allissue[0].process_id[0],
                    status: methods.issues_data.data.result.allissue[0].status,
                    //user_story_id : methods.issues_data.data.result.allissue[0].user_story_id
                }

                $scope.Url = $scope.baseUrl + 'attachment/admin/';
                $scope.issues_assignee = methods.issues_assignee.data.data.resources;

                $scope.Platform = methods.platform_data.data.result.Platform;
                $scope.OperatingSystem = methods.platform_data.data.result.OperatingSystem;
                $scope.Browser = methods.platform_data.data.result.Browser;
                $scope.status = methods.platform_data.data.result.status;
                $scope.Severity = methods.platform_data.data.result.Severity;
                //$scope.issues_userStory = methods.userstory_data.data.data;
                $scope.process_data = methods.process_data.data.result[0].phase_id.processes;

            }
        });
    }


    $scope.addIssuesWithdetail = function () {
        commonService.loadingPopup();
        var request = {
            issue_id: $scope.issues_data.issue_id,
            sprint_id: $scope.issues_data.sprint_id._id,
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
            user_story_id: ($scope.issues_data.user_story_id == null && $scope.issues_data.user_story_id == undefined) ? '' : $scope.issues_data.user_story_id._id,
            url: ($scope.issues_data.url != undefined) ? $scope.issues_data.url : '',
            status: ($scope.issues_data.status && $scope.issues_data.status != undefined) ? $scope.issues_data.status._id : ''
        };

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
                swal({
                    title: "Success!",
                    text: response.data.message,
                    type: 'success',
                    confirmButtonText: "Ok"
                }, function () {

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
            closeOnConfirm: true,
            html: false
        }, function () {
            var request = {attachmentId: id, task_id: task_id, is_userStory: false};
            userStoryService.deleteAttachment(request, function (response) {
                if (response.data.statusCode == 200) {
                    var data = {title: 'Success', text: 'Attachment deleted successfully', type: 'success'};
                    commonService.showMessage(data);
                    $scope.getAttachments();
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
                    type: 2
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

        var request = {task_Id: $scope.task_id, comment_description: $scope.comments.comment_description, type: 2}
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
                swal("Oops...", response.data.message, response.data.status);
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

    $scope.viewEffort = function () {
        $scope.task_details = {}
        commonService.loadingPopup();


        taskService.getTaskDetails({task_id: $scope.task_id}, function (response) {
            if (response.data.statusCode == 200)
            {
                commonService.closePopup();
                $scope.task_details = {projectId: response.data.result[0].project_id._id, phaseId: response.data.result[0].phase_id._id, taskId: $scope.task_id, userStoryId: response.data.result[0].parent_id, sprintId: response.data.result[0].sprint_id._id};
                $scope.skipEffort = ($scope.currentPageEffort - 1) * $scope.limitEffort;
                taskService.viewEffort({task_id: $scope.task_id, skip: $scope.skipEffort, limit: $scope.limitEffort}, function (responses) {
                    if (responses.data.statusCode == 200)
                    {
                        $scope.logs = responses.data.data;
                        $scope.total_effort_records = responses.data.data.total_records;
                    }
                })
            } else {
                commonService.closePopup();
                swal("Oops...", response.data.message, response.data.status);
            }
        })
    }


    /* Task detail page efforts log add */
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
                    templateUrl: 'views/issues/log-effort-task-modal.html',
                    scope: $scope,
                    controller: "issueBoardChildCtrl",
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
                    templateUrl: 'views/issues/edit-effort-task-modal.html',
                    scope: $scope,
                    controller: "issueBoardChildCtrl",
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


    $rootScope.$on("CallManageLogs", function (event, args) {
        $scope.viewEffort();
    });

    $rootScope.$on("CallAllIssues", function (event, args) {
        $scope.getDropdowns();
    });


    //Function to set complexity for the activity
    $scope.bug = {task_complexity: 0};
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
                        $state.reload();
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
    /*****************Function to Show All Comments in the Admin Section**********************************************/

    $scope.addIssueWithDetailModal = function () {

        var project_id = ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id;
        var methods_input = {
            issues_assignee: issuesService.getUsers({project_id: project_id}),
            platform_data: issuesService.getPlatformIssue({}),
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
                $scope.Severity = methods.platform_data.data.result.Severity;


                ModalService.showModal({
                    templateUrl: 'views/issues/add_issues_details_modal.html',
                    controller: 'issueBoardChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    modal.element.modal();
                });
            }
        });

    }

    /*
     * 
     * @function : to view issues attachment preview
     * @returns {undefined}
     */
    $scope.attachmentModal = function (asset) {
        $scope.url = $scope.baseUrl + 'attachment/admin/';
        $scope.data = asset;

        ModalService.showModal({
            templateUrl: 'views/issues/attachment_view.html',
            controller: 'issueBoardChildCtrl',
            scope: $scope

        }).then(function (modal) {
            modal.element.modal();
        });
    }

});


angular.module("ignitrack").controller("issueBoardChildCtrl", function ($scope, Upload, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, taskService, issueBoardService, API_URL, close, $element) {

    $scope.closeModal = function () {
        $element.modal('hide'); //  Manually hide the modal using bootstrap.
        close(null, 500); //  Now close as normal, but give 500ms for bootstrap to animate
    }


    /* Add log */
    $scope.logEfforts = function (type) {
        commonService.loadingPopup(); // start processing popup	
        var request = {
            task_id: $scope.effort.task_id,
            project_id: $scope.effort.project_id,
            userStoryId: $scope.effort.us_id,
            efforts: ($scope.effort.timepicker == "00:00") ? "12:00" : $scope.effort.timepicker,
            sprint_id: $scope.effort.sp_id,
            process_id: $scope.effort.process._id,
            phase_id: $scope.effort.phase_id,
            type: 2,
            log_effort_date: moment($scope.effort.date).unix()
        };

        taskService.logTime(request, function (response) {
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

    $scope.addIssuesWithdetail = function () {
        commonService.loadingPopup();
        var request = {
            sprint_id: ($scope.sprint_id != undefined && $scope.sprint_id != 'unmapped' && $scope.sprint_id != null) ? $scope.sprint_id._id : '',
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
            //process_id: $scope.issues_data.process_id._id,
            // status: ($scope.issues.status == null && $scope.issues.status == undefined) ? '' : $scope.issues.status._id,
            //user_story_id: ($scope.issues_data.user_story_id == null && $scope.issues_data.user_story_id == undefined) ? '' : $scope.issues_data.user_story_id._id,
            url: $scope.issues_data.url,
        };

        Upload.upload({
            method: 'POST',
            url: API_URL + 'Issue/addUnMappedIssue',
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
                    $state.reload();
                    //$rootScope.$emit("CallAllIssues");
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
