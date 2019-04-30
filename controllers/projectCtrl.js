/*
 * @file: projectCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("projectCtrl", function ($q, desktopNotification, $scope, $state, $rootScope, $filter, $timeout, $window, ModalService, commonService, projectService, socketEventService, toastr, Upload, BASE_PATH, $injector, $cookieStore, dashboardService) {

    $scope.skip = 0;
    $scope.limit = 10;
    $scope.project_limit = 12;
    $scope.baseUrl = BASE_PATH;
    $scope.user_data = $cookieStore.get('user_data');
    $scope.view = 'grid';

    $scope.projectView = function (view) {
        $scope.view = view;
    }

    //Function to update comments on real time basis
    $scope.$on('eventProjectComment', function (event, data) {

        if ($state.current.name == "projectView") {
            $scope.getComments();
            // $scope.getComments($state.params.id);
        }
    });

    $scope.openTabs = function (event, type) {
        angular.element(event.target).toggleClass('active');
        if (angular.element("#" + type).css('max-height') != '0px') {
            angular.element("#" + type).css('max-height', '');
        } else {
            switch (type) {
                case "basic_info":
                    $scope.getProjectsBasicInfo();
                case "budget_info" :
                    $scope.getProjectsBudgetInfo();
                    break;
                case "phase_info":
                    $scope.getProjectsPhaseInfo();
                    break;
                case "resources_info":
                    $scope.getProjectResources();
                    $scope.getProjectAssignedResources();
                    break;
                case "attachment_info":
                    $scope.getProjectsAttachments();
                    break;
                case "repo_info":
                    $scope.getRepositories();
                    break;

                default:
            }
            var height = (angular.element("#" + type)[0].scrollHeight == 0) ? 350 : angular.element("#" + type)[0].scrollHeight + 150;
            angular.element("#" + type).css('max-height', height + "px");
        }
    }


    /*
     * Function to open project modal where user can add project wvia two ways (Quick and Add with details)
     * */

    $scope.addProjectModal = function (type) {
        //get all users
        projectService.getOwners(function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_owners = response.data.data;
            }
        });
        $scope.project_form_type = type;
        ModalService.showModal({
            templateUrl: 'views/projects/add_project_modal.html',
            controller: 'projectChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();

        });
    }



    $scope.addProjectClientModal = function (type) {
        ModalService.showModal({
            templateUrl: 'views/projects/add_project_client_modal.html',
            controller: 'projectChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }

    /* FUnction to open phase  modal */
    $scope.addProjectPhaseModal = function (e) {
        e.preventDefault();
        //get all users type
        projectService.getProcesses(function (response) {
            if (response.data.statusCode == 200) {
                $scope.process_data = response.data.data;
            }
        });
        $scope.dateStartOptions = {
            format: 'yyyy-mm-dd',
            //dateDisabled: disabled,
            formatYear: 'yy',
            //maxDate: new Date(new Date().getFullYear() + 50, new Date().getMonth(), new Date().getDate()),
            minDate: '',
            // minDate: ($scope.budget_payload && $scope.budget_payload.start_date) ? $scope.budget_payload.start_date : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            maxDate: null,
            startingDay: 1
        };
        $scope.dateEndOptions = {
            format: 'yyyy-mm-dd',
            //dateDisabled: disabled,
            formatYear: 'yy',
            minDate: ($scope.budget_payload && $scope.budget_payload.start_date) ? $scope.budget_payload.start_date : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            maxDate: null,
            startingDay: 1
        };
        ModalService.showModal({
            templateUrl: 'views/projects/add_project_phase_modal.html',
            controller: 'projectChildCtrl',
            scope: $scope
        }).then(function (modal) {
            $scope.phase_payload = {}
            modal.element.modal();
        });
    }

    $scope.viewPhaseModal = function (id) {
        //commonService.loadingPopup(); // start processing popup

        var methods = {
            phase_payload: projectService.viewPhase({phase_id: id}),
            process_data: projectService.getProcesses()
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

                $scope.phase_payload = methods.phase_payload.data.data;
                $scope.process_data = methods.process_data.data.data;

                if ($scope.phase_payload.status && $scope.phase_payload.status == 1) {
                    $scope.phase_payload.status = '1';
                } else {
                    $scope.phase_payload.status = '2';
                }

                if (methods.phase_payload.data.data.processes && methods.phase_payload.data.data.processes != undefined) {
                    $scope.new_process_array = [];
                    angular.forEach(methods.phase_payload.data.data.processes, function (item) {
                        $scope.new_process_array.push(item._id);
                    });
                    $scope.phase_payload.process_id = $scope.new_process_array;
                }

                if (methods.phase_payload.data.data.start_date && methods.phase_payload.data.data.start_date != undefined) {
                    $scope.phase_payload.start_date = methods.phase_payload.data.data.start_date * 1000;
                }
                if (methods.phase_payload.data.data.end_date && methods.phase_payload.data.data.end_date != undefined) {
                    $scope.phase_payload.end_date = methods.phase_payload.data.data.end_date * 1000;
                }

                ModalService.showModal({
                    templateUrl: 'views/projects/add_project_phase_modal.html',
                    controller: 'projectChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    modal.element.modal();
                });
            }
        });

    }

    /* FUnction to open create sprint  modal */
    $scope.addSprintModal = function () {
        $scope.sprint_payload = {};
        var request = {
            project_id: ($state.params.id == null && $state.params.id == undefined) ? '' : $state.params.id,
            type: 1
        };

        projectService.getProjectsPhaseInfo(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.phases = response.data.data.records;
                $scope.request_type = 'Add';
                commonService.loadingPopup(); // start processing popup
                ModalService.showModal({
                    templateUrl: 'views/sprints/add_sprint.html',
                    controller: 'projectChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    commonService.closePopup();
                    modal.element.modal();
                    $scope.coming_sprint_number = ($scope.project_info.total_sprints && $scope.project_info.total_sprints > 0) ? $scope.project_info.total_sprints + 1 : 1;
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        })
    }





    /* FUnction to open edit sprint  modal */
    $scope.editSprintModal = function (id) {
        $scope.request_type = 'Edit';
        commonService.loadingPopup(); // start processing popup
        var sprintService = $injector.get('sprintService');
        sprintService.viewSprint({sprint_id: id, type: 1}, function (response) {
            if (response.data.statusCode == 200) {

                $scope.sprint_payload = response.data.data;
                if (response.data.data.phase_id._id && response.data.data.phase_id._id != undefined) {
                    $scope.sprint_payload.phase_id = response.data.data.phase_id._id;
                } else {
                    $scope.sprint_payload.phase_id = '';
                }

                if (response.data.data.end_date == 0) {
                    $scope.sprint_payload.end_date = '';
                }

                if (response.data.data.end_date != '') {
                    $scope.sprint_payload.end_date = response.data.data.end_date * 1000;
                }

                if (response.data.data.start_date == 0) {
                    $scope.sprint_payload.start_date = '';
                }

                if (response.data.data.start_date != '') {
                    $scope.sprint_payload.start_date = response.data.data.start_date * 1000;
                }


                $scope.coming_sprint_number = response.data.data.sprint_number

                var request = {
                    project_id: ($state.params.id == null && $state.params.id == undefined) ? '' : $state.params.id,
                    type: 1
                };
                projectService.getProjectsPhaseInfo(request, function (response) {
                    if (response.data.statusCode == 200) {
                        $scope.phases = response.data.data.records;
                        ModalService.showModal({
                            templateUrl: 'views/sprints/add_sprint.html',
                            controller: 'projectChildCtrl',
                            scope: $scope
                        }).then(function (modal) {
                            commonService.closePopup();
                            modal.element.modal();
                        });
                        commonService.closePopup();
                    } else {
                        var data = {title: 'oops', text: response.data.message, type: 'error'};
                        commonService.showMessage(data);
                    }
                })


            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });



    }

    $scope.repos = [
        {
            name: ""
        }
    ]
    $scope.cloneItem = function () {
        var itemToClone = {name: ""};
        $scope.repos.push(itemToClone);
    }

    $scope.removeItem = function (item) {
        $scope.repos.splice(item, 1);
    }

    $scope.getRepositories = function () {
        var request = {
            project_id: $state.params.id
        }
        projectService.getRepo(request, function (response) {
            if (response.data.statusCode == 200) {
                if (response.data.result.length != 0) {
                    $scope.total_repo = response.data.result.length;
                    $scope.repositories_name = response.data.result;
                } else {
                    $scope.total_repo = 0;
                }
                console.log(response.data.result.length);
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    $scope.createRepo = function () {
        commonService.loadingPopup();
        var request = {
            project_id: $state.params.id,
            repo_name: $scope.repos
        }
        projectService.createRepo(request, function (response) {
            if (response.data.statusCode == 200) {
                var data = {title: 'Success', text: response.data.message, type: 'success'};
                commonService.showMessage(data);
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    $scope.clearFilter = function () {
        $state.reload();
        /*  $scope.project_search = '';
         $scope.currentPage = 1;
         $scope.getProjects();*/
    }


    /*
     *
     * Function to get all projects
     * @returns project data
     */
    $scope.project_data = [];
    $scope.project_search = '';
    $scope.currentPage = 1;
    $scope.getProjects = function () {

        commonService.loadingPopup(); // start processing popup
        $scope.skip = ($scope.currentPage - 1) * $scope.project_limit;
        $scope.request = {skip: $scope.skip, limit: $scope.project_limit};
        if ($scope.project_search && $scope.project_search != undefined) {
            $scope.request.search = $scope.project_search
        }

        projectService.getAllProjects($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_data = response.data.result.data;
                angular.forEach($scope.project_data, function (item) {
                    var activities_totalcount = 0, activities_ratio = 0, userStroies_totalcount = 0, userStroies_ratio = 0, issue_totalcount = 0, issue_ratio = 0;

                    if (item.activies.length > 0) {
                        angular.forEach(item.activies, function (a_item) {
                            activities_totalcount += a_item.count;
                            activities_ratio = 100 / activities_totalcount;
                        });
                    } else {
                        activities_totalcount = 0;
                        activities_ratio = 0
                    }
                    if (item.userStroies.length > 0) {
                        angular.forEach(item.userStroies, function (u_item) {
                            userStroies_totalcount += u_item.count;
                            userStroies_ratio = 100 / userStroies_totalcount;
                        });
                    } else {
                        userStroies_totalcount = 0;
                        userStroies_ratio = 0;
                    }
                    if (item.issue.length > 0) {
                        angular.forEach(item.issue, function (i_item) {
                            issue_totalcount += i_item.count;
                            issue_ratio = 100 / issue_totalcount;
                        });
                    } else {
                        issue_totalcount = 0;
                        issue_ratio = 0;
                    }

                    item.activities_totalcount = activities_totalcount;
                    item.activities_ratio = activities_ratio;
                    item.userStroies_totalcount = userStroies_totalcount;
                    item.userStroies_ratio = userStroies_ratio;
                    item.issue_totalcount = issue_totalcount;
                    item.issue_ratio = issue_ratio;
                });
                // console.log($scope.project_data);
                $scope.total_records = response.data.result.total_records;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }

    //Function to get projects basic info
    $scope.getProjectsBasicInfo = function () {
        commonService.loadingPopup(); // start processing popup
        if (!$state.params.id) {
            $state.go('allprojects');
        }
        //get all users
        projectService.getOwners(function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_owners = response.data.data;
            }
        });

        var request = {projectId: $state.params.id};

        projectService.getProjectsBasicInfo(request, function (response) {
            if (response.data.statusCode == 200) {

                $scope.project_logo = (response.data.result.allproject[0].logo && response.data.result.allproject[0].logo != undefined) ? $scope.baseUrl + 'attachment/admin/' + response.data.result.allproject[0].logo.name : 'assets/img/default_project.png';

                $scope.project_basic_info = response.data.result.allproject[0];


                $scope.project_basic_info.project_manager = response.data.result.allproject[0].project_manager._id;

                commonService.closePopup();
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * Function to update project basic info
     *
     * */

    $scope.saveBasicInfo = function (type) {
        $scope.budget_date_error = false;

        //If basic info tab is selected
        if (type == "basic_info") {
            //if image posted then append logo as key
            if ($scope.project_basic_info.file) {
                var data = {
                    project_id: $state.params.id,
                    title: $scope.project_basic_info.title,
                    description: ($scope.project_basic_info.description == '' || $scope.project_basic_info.description == null || $scope.project_basic_info.description == undefined) ? '' : $scope.project_basic_info.description,
                    project_manager: $scope.project_basic_info.project_manager,
                    logo: $scope.project_basic_info.file,
                    client_name: $scope.project_basic_info.client_name

                }
            } else {
                //if image not posted then remove logo as key
                var data = {
                    project_id: $state.params.id,
                    title: $scope.project_basic_info.title,
                    description: ($scope.project_basic_info.description == '' || $scope.project_basic_info.description == null || $scope.project_basic_info.description == undefined) ? '' : $scope.project_basic_info.description,
                    project_manager: $scope.project_basic_info.project_manager
                }
            }
        } else {
            //If selected tabs is not basic info can be budget information tab

            if ($scope.budget_payload.estimated_end_date
                    && $scope.budget_payload.estimated_end_date != undefined
                    && $scope.budget_payload.start_date > $scope.budget_payload.estimated_end_date) {
                $scope.budget_date_error = true;
            } else {
                //Logic to convert date to unix format
                if ($scope.budget_payload.confirmed_date && $scope.budget_payload.confirmed_date != undefined) {
                    var confirmed_date_selected = moment($scope.budget_payload.confirmed_date).format('YYYY-MM-DD');
                    var confirmed_date = moment(confirmed_date_selected).unix();
                }

                if ($scope.budget_payload.start_date && $scope.budget_payload.start_date != undefined) {
                    var start_date_selected = moment($scope.budget_payload.start_date).format('YYYY-MM-DD');
                    var start_date = moment(start_date_selected).unix();
                }

                if ($scope.budget_payload.estimated_end_date && $scope.budget_payload.estimated_end_date != undefined) {
                    var end_date_selected = moment($scope.budget_payload.estimated_end_date).format('YYYY-MM-DD');
                    var estimated_end_date = moment(end_date_selected).unix();
                }

                var data = {
                    project_id: $state.params.id,
                    confirmed_date: confirmed_date, // * 1000,
                    start_date: start_date, // * 1000,
                    contingency_hours: $scope.budget_payload.contingency_hours,
                    estimate_hour: $scope.budget_payload.estimate_hour,
                    estimated_end_date: (estimated_end_date != undefined) ? estimated_end_date : ''
                }
            }
        }


        if ($scope.budget_date_error == false) {
            Upload.upload({
                method: 'PUT',
                url: $scope.baseUrl + 'v1/projects/update_project',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                data: data
            }).then(function (response) {
                if (response.data.statusCode == 200) {
                    swal({
                        title: "Success!",
                        text: response.data.message,
                        type: 'success',
                        confirmButtonText: "Ok"
                    }, function () {
                        if (type == "basic_info") {
                            $scope.viewProject();
                            $scope.getProjectsBasicInfo();
                            //Rferesh the basic info tab with latest data
                        } else {
                            $scope.viewProject();
                            $scope.getProjectsBudgetInfo();//Rferesh the budget info tab with latest data
                        }
                    });
                } else {
                    swal("Oops...", response.data.message, response.data.status);
                }
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        }
    }

    //Function to get projects phase info
    $scope.getProjectsBudgetInfo = function () {
        commonService.loadingPopup(); // start processing popup
        if (!$state.params.id) {
            $state.go('allprojects');
        }
        var request = {projectId: $state.params.id};
        projectService.getProjectsBudgetInfo(request, function (response) {
            if (response.data.statusCode == 200) {
                if (response.data.result.allproject[0].confirmed_date != undefined && response.data.result.allproject[0].confirmed_date) {
                    $scope.budget_payload = {
                        confirmed_date: (response.data.result.allproject[0].confirmed_date != undefined) ? response.data.result.allproject[0].confirmed_date * 1000 : '',
                        start_date: (response.data.result.allproject[0].start_date != undefined) ? response.data.result.allproject[0].start_date * 1000 : '',
                        contingency_hours: (response.data.result.allproject[0].contingency_hours != undefined) ? response.data.result.allproject[0].contingency_hours : '',
                        estimate_hour: (response.data.result.allproject[0].estimate_hour != undefined) ? response.data.result.allproject[0].estimate_hour : '',
                        estimated_end_date: (response.data.result.allproject[0].estimated_end_date != undefined) ? response.data.result.allproject[0].estimated_end_date * 1000 : ''
                    };
                } else {
                    $scope.budget_payload = {};
                }
                commonService.closePopup();
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }





    //Function to get projects phase info
    $scope.getProjectsPhaseInfo = function () {
        commonService.loadingPopup(); // start processing popup

        if (!$state.params.id) {
            $state.go('allprojects');
        }
        var request = {type: 0, project_id: $state.params.id, skip: $scope.skip, limit: $scope.limit};
        projectService.getProjectsPhaseInfo(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_phase_info = response.data.data.records;
                commonService.closePopup();
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    //Function to get projects attachment info
    $scope.getProjectsAttachments = function () {
        commonService.loadingPopup(); // start processing popup

        if (!$state.params.id) {
            $state.go('allprojects');
        }
        var request = {projectId: $state.params.id};
        projectService.getProjectsBasicInfo(request, function (response) {
            if (response.data.statusCode == 200) {
                if (response.data.result.allproject[0].attachment && response.data.result.allproject[0].attachment != undefined) {
                    $scope.files = [];
                    $scope.project_attachment_info = response.data.result.allproject[0].attachment;
                } else {
                    $scope.project_attachment_info = [];
                }
                commonService.closePopup();
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    $scope.project_available_resources = [];
    //Function to get projects specific available resources
    $scope.getProjectResources = function () {
        commonService.loadingPopup(); // start processing popup

        if (!$state.params.id) {
            $state.go('allprojects');
        }
        var request = {project_id: $state.params.id};
        projectService.getProjectResources(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_available_resources = response.data.data;
                commonService.closePopup();
            } else {
                $scope.project_available_resources = [];
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    //Function to assign resources
    $scope.assignResource = function (resource_id, type) {
        commonService.loadingPopup(); // start processing popup

        if (!$state.params.id) {
            $state.go('allprojects');
        }
        var request = {project_id: $state.params.id, resource_id: resource_id, type: type};
        projectService.assignResource(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.getProjectResources();
                $scope.getProjectAssignedResources();
                commonService.closePopup();
            } else {

                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    $scope.project_assigned_resources = [];
    //Function to get projects specific assigned resources
    $scope.getProjectAssignedResources = function () {
        commonService.loadingPopup(); // start processing popup
        if (!$state.params.id) {
            $state.go('allprojects');
        }
        var request = {project_id: $state.params.id};
        projectService.getProjectAssignedResources(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_assigned_resources = response.data.data.resources;
                commonService.closePopup();
            } else {
                $scope.project_assigned_resources = [];
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    //Function to delete resources that are assigned to a project
    $scope.deleteResource = function (resource_id, type) {
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
            $scope.assignResource(resource_id, type);
        });
    }



    ////// get details of current sprint of project ends ////
    $scope.getCurrentSprintDetails = function () {
        $scope.currentSprintData = '';
        var request = {
            project_id: $scope.project_info._id,
            skip: 0,
            limit: 3
        };
        dashboardService.getCurrentSprint(request, function (response) {
            if (response.data.statusCode == 200) {
                if (response.data.data.allSprintData.length > 0) {
                    $scope.currentSprintData = response.data.data.allSprintData[0];
                    $scope.length = response.data.data.allSprintData.length;
                } else {
                    $scope.length = response.data.data.allSprintData.length;
                    $scope.currentSprintData = '';
                }

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }




    //Function to get projects basic info
    $scope.viewProject = function () {
        // commonService.loadingPopup(); // start processing popup
        if (!$state.params.id) {
            $state.go('allprojects');
        }
        /* Get project Phases list */


        projectService.getPhaseIdsList({project_id: $state.params.id, type: 1}, function (response) {
            $scope.selectedPhase = '';
            if (response.data.statusCode == 200) {
                $scope.listofphases = response.data.data.records;
                if ($scope.listofphases.length > 0) {
                    $scope.selectedPhase = $scope.listofphases[0]['_id'];
                }


                var methods = {
                    project: projectService.getProjectsBasicInfo({projectId: $state.params.id, type: 1})
                };

                if ($scope.selectedPhase != '') {
                    methods.phaseWiseData = projectService.getProjectPhasewhiseData({projectId: $state.params.id, phase_id: $scope.selectedPhase});
                }

                $q.all(methods).then(function (methods) {
                    var response = _.filter(methods, function (obj) {
                        return obj.status != 200 || !obj.data || obj.data.statusCode != 200
                    });

                    if (response.length > 0) {
                        swal("Oops...", 'Technical error. Please try again later', 'error');
                    } else {
                        $scope.project_logo = (methods.project.data.result.allproject[0].logo && methods.project.data.result.allproject[0].logo != undefined) ? $scope.baseUrl + 'attachment/admin/' + methods.project.data.result.allproject[0].logo.name : 'assets/img/default_project.png';
                        $scope.project_info = methods.project.data.result.allproject[0];

                        var burnedHrs = $scope.project_info.project_burned_hours;
                        data = burnedHrs.split(":");
                        $scope.project_info.project_burned_hours = parseInt(data[0]);
                        /* IF PROJECT HAS NO PHASE */
                        if (methods.phaseWiseData != undefined) {
                            $scope.phaseWiseData = methods.phaseWiseData.data.result.allproject[0];
                            angular.forEach($scope.phaseWiseData.phases_of_project, function (item) {
                                item.Activity = {};
                                item.Activity.activities_totalcount = 0, item.Activity.newCount = 0, item.Activity.progressCount = 0, item.Activity.completedCount = 0;
                                item.UserStory = {};
                                item.UserStory.userStroies_totalcount = 0, item.UserStory.newCount = 0, item.UserStory.progressCount = 0, item.UserStory.completedCount = 0, item.UserStory.qaAcceptedCount = 0;
                                item.Issue = {};
                                item.Issue.issue_totalcount = 0, item.Issue.newCount = 0, item.Issue.progressCount = 0, item.Issue.completedCount = 0, item.Issue.resolvedCount = 0;
                                item.Sprint = {};
                                item.Sprint.sprints_totalcount = 0, item.Sprint.newCount = 0, item.Sprint.progressCount = 0, item.Sprint.completedCount = 0, item.Sprint.closedCount = 0;

                                if (item.status_counts.ActivityData && item.status_counts.ActivityData.length > 0) {
                                    angular.forEach(item.status_counts.ActivityData, function (a_item) {
                                        item.Activity.activities_totalcount += a_item.actvity_count;
                                        if (a_item.Activity_status == 'New') {
                                            item.Activity.newCount = a_item.actvity_count;
                                        } else if (a_item.Activity_status == 'In-progress') {
                                            item.Activity.progressCount = a_item.actvity_count;
                                        } else if (a_item.Activity_status == 'Completed') {
                                            item.Activity.completedCount = a_item.actvity_count;
                                        }
                                    });
                                }
                                if (item.status_counts.UserStoryData && item.status_counts.UserStoryData.length > 0) {
                                    angular.forEach(item.status_counts.UserStoryData, function (u_item) {
                                        item.UserStory.userStroies_totalcount += u_item.userstory_count;
                                        if (u_item.userStory_status == 'New') {
                                            item.UserStory.newCount = u_item.userstory_count;
                                        } else if (u_item.userStory_status == 'In-progress') {
                                            item.UserStory.progressCount = u_item.userstory_count;
                                        } else if (u_item.userStory_status == 'Completed') {
                                            item.UserStory.completedCount = u_item.userstory_count;
                                        } else if (u_item.userStory_status == 'Qa Accepted') {
                                            item.UserStory.qaAcceptedCount = u_item.userstory_count;
                                        }
                                    });
                                }
                                if (item.status_counts.IssueData && item.status_counts.IssueData.length > 0) {
                                    angular.forEach(item.status_counts.IssueData, function (i_item) {
                                        item.Issue.issue_totalcount += i_item.issue_count;
                                        if (i_item.issue_status == 'New') {
                                            item.Issue.newCount = i_item.issue_count;
                                        } else if (i_item.issue_status == 'In-progress') {
                                            item.Issue.progressCount = i_item.issue_count;
                                        } else if (i_item.issue_status == 'Resolved') {
                                            item.Issue.resolvedCount = i_item.issue_count;
                                        } else if (i_item.issue_status == 'Closed') {
                                            item.Issue.completedCount = i_item.issue_count;
                                        }
                                    });
                                }
                                if (item.status_counts.SprintData && item.status_counts.SprintData.length > 0) {
                                    angular.forEach(item.status_counts.SprintData, function (s_item) {
                                        item.Sprint.sprints_totalcount += s_item.sprint_count;
                                        if (s_item.sprint_status == 'New') {
                                            item.Sprint.newCount = s_item.sprint_count;
                                        } else if (s_item.sprint_status == 'In Progress') {
                                            item.Sprint.progressCount = s_item.sprint_count;
                                        } else if (s_item.sprint_status == 'Completed') {
                                            item.Sprint.completedCount = s_item.sprint_count;
                                        } else if (s_item.sprint_status == 'Closed') {
                                            item.Sprint.closedCount = s_item.sprint_count;
                                        }
                                    });
                                }
                            });
                        }
                        // $scope.getCurrentSprintDetails();
                        commonService.closePopup();
                    }
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /* On phase chnaged  */
    $scope.getPhaseData = function (id) {
        commonService.loadingPopup(); // start processing popup
        projectService.getProjectPhasewhiseData({projectId: $state.params.id, phase_id: id}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.phaseWiseData = response.data.result.allproject[0];

                angular.forEach($scope.phaseWiseData.phases_of_project, function (item) {
                    item.Activity = {};
                    item.Activity.activities_totalcount = 0, item.Activity.newCount = 0, item.Activity.progressCount = 0, item.Activity.completedCount = 0;
                    item.UserStory = {};
                    item.UserStory.userStroies_totalcount = 0, item.UserStory.newCount = 0, item.UserStory.progressCount = 0, item.UserStory.completedCount = 0, item.UserStory.qaAcceptedCount = 0;
                    item.Issue = {};
                    item.Issue.issue_totalcount = 0, item.Issue.newCount = 0, item.Issue.progressCount = 0, item.Issue.completedCount = 0, item.Issue.resolvedCount = 0;
                    item.Sprint = {};
                    item.Sprint.sprints_totalcount = 0, item.Sprint.newCount = 0, item.Sprint.progressCount = 0, item.Sprint.completedCount = 0, item.Sprint.closedCount = 0;

                    if (item.status_counts.ActivityData && item.status_counts.ActivityData.length > 0) {
                        angular.forEach(item.status_counts.ActivityData, function (a_item) {
                            item.Activity.activities_totalcount += a_item.actvity_count;
                            if (a_item.Activity_status == 'New') {
                                item.Activity.newCount = a_item.actvity_count;
                            } else if (a_item.Activity_status == 'In-progress') {
                                item.Activity.progressCount = a_item.actvity_count;
                            } else if (a_item.Activity_status == 'Completed') {
                                item.Activity.completedCount = a_item.actvity_count;
                            }
                        });
                    }
                    if (item.status_counts.UserStoryData && item.status_counts.UserStoryData.length > 0) {
                        angular.forEach(item.status_counts.UserStoryData, function (u_item) {
                            item.UserStory.userStroies_totalcount += u_item.userstory_count;
                            if (u_item.userStory_status == 'New') {
                                item.UserStory.newCount = u_item.userstory_count;
                            } else if (u_item.userStory_status == 'In-progress') {
                                item.UserStory.progressCount = u_item.userstory_count;
                            } else if (u_item.userStory_status == 'Completed') {
                                item.UserStory.completedCount = u_item.userstory_count;
                            } else if (u_item.userStory_status == 'Qa Accepted') {
                                item.UserStory.qaAcceptedCount = u_item.userstory_count;
                            }
                        });
                    }
                    if (item.status_counts.IssueData && item.status_counts.IssueData.length > 0) {
                        angular.forEach(item.status_counts.IssueData, function (i_item) {
                            item.Issue.issue_totalcount += i_item.issue_count;
                            if (i_item.issue_status == 'New') {
                                item.Issue.newCount = i_item.issue_count;
                            } else if (i_item.issue_status == 'In-progress') {
                                item.Issue.progressCount = i_item.issue_count;
                            } else if (i_item.issue_status == 'Resolved') {
                                item.Issue.resolvedCount = i_item.issue_count;
                            } else if (i_item.issue_status == 'Closed') {
                                item.Issue.completedCount = i_item.issue_count;
                            }
                        });
                    }
                    if (item.status_counts.SprintData && item.status_counts.SprintData.length > 0) {
                        angular.forEach(item.status_counts.SprintData, function (s_item) {
                            item.Sprint.sprints_totalcount += s_item.sprint_count;
                            if (s_item.sprint_status == 'New') {
                                item.Sprint.newCount = s_item.sprint_count;
                            } else if (s_item.sprint_status == 'In Progress') {
                                item.Sprint.progressCount = s_item.sprint_count;
                            } else if (s_item.sprint_status == 'Completed') {
                                item.Sprint.completedCount = s_item.sprint_count;
                            } else if (s_item.sprint_status == 'Closed') {
                                item.Sprint.closedCount = s_item.sprint_count;
                            }
                        });
                    }
                })
                $scope.selectedPhase = id;
                commonService.closePopup();
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }

        })
    }
    /***********************Function to Add Comments in the Admin Section*****************************************/
    $scope.comments = {};

    $scope.commentPost = function () {
        commonService.loadingPopup(); // start processing popup
        $scope.comments.project_id = $state.params.id;
        $scope.comments.comment_description = $scope.comments.comment_description;

        projectService.createComments($scope.comments, function (response) {
            if (response.data.statusCode == 200) {

                $scope.comments.comment_description = '';
                $scope.submitted = false;
                $scope.commentform.$setUntouched();

                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"});
                $scope.getComments();

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*****************Function to Show All Comments in the Admin Section**********************************************/

    $scope.comment_skip = 0;


    $scope.list = [];
    $scope.loadmoreButton = true;
    $scope.loadMore = function () {
        $scope.comment_skip += $scope.limit;
        var request = {projectId: $state.params.id, skip: $scope.comment_skip, limit: $scope.limit};
        projectService.getComments(request, function (response) {
            if (response.data.statusCode == 200) {
                angular.forEach(response.data.result.comment, function (response) {
                    $scope.list.push(response);
                });

                if ($scope.list.length == response.data.result.totalComment) {
                    $scope.loadmoreButton = false;
                } else {
                    $scope.loadmoreButton = true;
                }
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });

    }

    $scope.getComments = function () {
        $scope.url = $scope.baseUrl + 'attachment/admin/';
        var request = {projectId: $state.params.id, skip: $scope.comment_skip, limit: $scope.limit};
        projectService.getComments(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.list = response.data.result.comment;
                // console.log(JSON.stringify($scope.list));
                //$scope.list = $scope.list.concat(response.data.result.comment);
                if ($scope.list.length == response.data.result.totalComment) {
                    $scope.loadmoreButton = false;
                } else {
                    $scope.loadmoreButton = true;
                }

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    //**************************Date & time Function starts*************************//
    $scope.today = function () {
        $scope.phase_payload = {start_date: new Date(), end_date: ''};
    };

    $scope.today();
    $scope.clear = function () {
        $scope.phase_payload = {start_date: null, end_date: ''};
    };


    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };



    $scope.dateOptionsold = {
        format: 'yyyy-mm-dd',
        //dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(new Date().getFullYear() + 50, new Date().getMonth(), new Date().getDate()),
        minDate: null,
        startingDay: 1
    };

    $scope.dateOptions = {
        format: 'yyyy-mm-dd',
        //dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(new Date().getFullYear() + 50, new Date().getMonth(), new Date().getDate()),
        // minDate: new Date(),
        minDate: '',
        startingDay: 1
    };


    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
                mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    /*$scope.toggleMin = function () {
     $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
     $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
     };
     $scope.toggleMin();*/

    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function () {
        $scope.popup2.opened = true;
        // $scope.startDateOptions = {
        //   minDate: $scope.budget_payload.start_date,
        //   maxDate: null
        // };
    };

    $scope.open6 = function () {
        $scope.popup6.opened = true;
        // $scope.startDateOptions = {
        //     minDate: $scope.sprint_payload.start_date,
        //     maxDate: null
        // };
    };
    $scope.open3 = function () {
        $scope.popup3.opened = true;
    };

    $scope.open4 = function () {
        $scope.popup4.opened = true;
    };

    $scope.open5 = function () {
        $scope.popup5.opened = true;
    };

    $scope.setDate = function (year, month, day) {
        $scope.phase_payload = {start_date: new Date(year, month, day), end_date: new Date(year, month, day)};
    };

    $scope.formats = ['yyyy-MM-dd', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
        opened: false
    };

    $scope.popup2 = {
        opened: false
    };

    $scope.popup3 = {
        opened: false
    };

    $scope.popup4 = {
        opened: false
    };

    $scope.popup5 = {
        opened: false
    };

    $scope.popup5 = {
        opened: false
    };

    $scope.popup6 = {
        opened: false
    };

    $scope.setEndDateOptions = function () {
        $scope.dateEndOptions
                = {
                    format: 'yyyy-mm-dd',
                    //dateDisabled: disabled,
                    formatYear: 'yy',
                    minDate: ($scope.phase_payload && $scope.phase_payload.start_date ? $scope.phase_payload.start_date : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())),
                    maxDate: null,
                    startingDay: 1
                };
    }

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);

    $scope.events = [{
            date: tomorrow,
            status: 'full'
        }, {
            date: afterTomorrow,
            status: 'partially'
        }];

    function getDayClass(data) {
        var date = data.date,
                mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }
        return '';
    }



    //**************************Date & time Function ends*************************//



    /*
     * Function to fetch latest phaese information after created using modal
     * */
    $rootScope.$on("CallProjectsPhaseInfo", function (event, args) {
        $scope.getProjectsPhaseInfo();
    });



    //url : 'https://angular-file-upload-cors-srv.appspot.com/upload',

    /*
     * Function to upload attachments to a project
     * */
    $scope.uploadFiles = function (files) {
        $scope.file_max_limit = false;

        if (files && files.length) {

            if (files.length > 5) {
                $scope.file_max_limit = true;
                return false;
            }
            $scope.files = files;

            for (var i = 0; i < files.length; i++) {
                Upload.upload({
                    method: 'PUT',
                    url: $scope.baseUrl + 'v1/projects/upload_project_attachment',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    data: {
                        file: files[i],
                        project_id: $state.params.id,
                        type: 1
                    }
                }).then(function (response) {
                    if (response.data.statusCode == 200) {
                        $timeout(function () {
                            $scope.result = response.data;
                        });
                        $scope.getProjectsAttachments();
                    } else {
                        var data = {title: 'oops', text: response.data.message, type: 'error'};
                        commonService.showMessage(data);
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
        }
    };

    //Function to delete attachment of a project
    $scope.deleteProjectAttachment = function (id) {
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
            var request = {project_id: $state.params.id, attachment_id: id}
            projectService.deleteProjectAttachment(request, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.getProjectsAttachments();
                    commonService.closePopup();
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        });
    }



    //Function to get projects sprints 
    $scope.getProjectsSprintInfo = function () {
        commonService.loadingPopup(); // start processing popup

        if (!$state.params.id) {
            $state.go('allprojects');
        }
        var request = {
            project_id: $state.params.id,
            skip: $scope.skip,
            limit: $scope.limit
        };
        var sprintService = $injector.get('sprintService');
        sprintService.getProjectsSprintInfo(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_info.sprints = response.data.data.result;
                commonService.closePopup();
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    //Function to delete attachment of a project
    $scope.deletePhase = function (id) {
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
            var request = {phase_id: id, status: 3}
            projectService.updatePhase(request, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.getProjectsPhaseInfo();
                    commonService.closePopup();
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        });
    }

    /*
     * Function to fetch projects sprint information
     * */
    $rootScope.$on("CallProjectsSprintInfo", function (event, args) {
        $scope.getProjects();
    });

    /*
     * Function to fetch all projects sprint information     * */
    $rootScope.$on("CallProjectsInfo", function (event, args) {
        $scope.getProjects();
    });


});


/*
 * Project child controller used for modals
 * */
angular.module("ignitrack").controller("projectChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, projectService, $injector, close, $element) {

    //Function to create enw project
    $scope.createProject = function () {
        commonService.loadingPopup(); // start processing popup
        projectService.createProject($scope.project, function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                swal({title: "Success", text: response.data.message, type: 'success'},
                function () {
                    if ($scope.project_form_type == "quick") {
                        $state.reload();
                        //$rootScope.$emit("CallProjectsInfo"); // Load all phaese data after modal close
                    } else {
                        $state.reload();
                        $state.go('editProject', {id: response.data.data._id});
                    }
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    //Function to create new phase
    $scope.createPhase = function () {
        $scope.date_error = false;
        if ($scope.phase_payload.end_date && $scope.phase_payload.start_date > $scope.phase_payload.end_date) {
            $scope.date_error = true;
        } else {
            commonService.loadingPopup(); // start processing popup

            if ($scope.phase_payload.start_date && $scope.phase_payload.start_date != undefined) {
                var start_date_selected = moment($scope.phase_payload.start_date).format('YYYY-MM-DD');
                var start_date = moment(start_date_selected).unix();
            }

            if ($scope.phase_payload.end_date && $scope.phase_payload.end_date != undefined) {
                var end_date_selected = moment($scope.phase_payload.end_date).format('YYYY-MM-DD');
                var end_date = moment(end_date_selected).unix();
            }

            var request = {
                project_id: $state.params.id,
                process_id: $scope.phase_payload.process_id,
                phase_name: $scope.phase_payload.phase_name,
                estimate_hour: $scope.phase_payload.estimate_hour,
                start_date: (start_date && start_date != undefined) ? start_date : 0,
                end_date: (end_date && end_date != undefined && end_date != null) ? end_date : '',
                status: $scope.phase_payload.status,
                mockup_link: $scope.phase_payload.mockup_link,
                invison_link: $scope.phase_payload.invison_link
            }

            //Check if _id is coming then update otherwise inert sprint data
            if ($scope.phase_payload._id && $scope.phase_payload._id != undefined) {
                //delete request.project_id
                var request_edit = {
                    phase_id: $scope.phase_payload._id
                }
                delete request.project_id;

                _.assign(request, request_edit); // extend

                projectService.updatePhase(request, function (response) {
                    if (response.data.statusCode == 200) {
                        $scope.closeModal();

                        swal({title: "Success", text: response.data.message, type: 'success'},
                        function () {
                            $rootScope.$emit("CallProjectsPhaseInfo"); // Load all phaese data after modal close
                        });
                    } else {
                        var data = {title: 'oops', text: response.data.message, type: 'error'};
                        commonService.showMessage(data);
                    }
                });
            } else {
                projectService.createPhase(request, function (response) {
                    if (response.data.statusCode == 200) {

                        $scope.phase_payload = {};
                        $scope.submitted = false;
                        $scope.create_phase.$setUntouched();

                        $scope.closeModal();

                        swal({title: "Success", text: response.data.message, type: 'success'},
                        function () {
                            $rootScope.$emit("CallProjectsPhaseInfo"); // Load all phaese data after modal close
                        });
                    } else {
                        var data = {title: 'oops', text: response.data.message, type: 'error'};
                        commonService.showMessage(data);
                    }
                });
            }

        }
    }

    //Function to create new sprint
    $scope.createSprint = function () {


        $scope.date_error = false;
        if ($scope.sprint_payload.end_date && $scope.sprint_payload.start_date > $scope.sprint_payload.end_date) {
            $scope.date_error = true;
        } else {
            commonService.loadingPopup(); // start processing popup

            if ($scope.sprint_payload.start_date && $scope.sprint_payload.start_date != undefined) {
                var start_date_selected = moment($scope.sprint_payload.start_date).format('YYYY-MM-DD');
                var start_date = moment(start_date_selected).unix();
            }

            if ($scope.sprint_payload.end_date && $scope.sprint_payload.end_date != undefined) {
                var end_date_selected = moment($scope.sprint_payload.end_date).format('YYYY-MM-DD');
                var end_date = moment(end_date_selected).unix();
            }

            var request = {
                project_id: $state.params.id,
                phase_id: ($scope.sprint_payload.phase_id != undefined && $scope.sprint_payload.phase_id != null) ? $scope.sprint_payload.phase_id : '',
                sprint_name: $scope.sprint_payload.sprint_name,
                description: ($scope.sprint_payload.description != undefined && $scope.sprint_payload.description != null) ? $scope.sprint_payload.description : '',
                start_date: (start_date && start_date != undefined) ? start_date : 0,
                end_date: (end_date && end_date != undefined) ? end_date : 0,
                planned_time: $scope.sprint_payload.planned_hours + ':00',
                burned_time: ($scope.sprint_payload.burned_hours != undefined && $scope.sprint_payload.burned_hours != null && $scope.sprint_payload.burned_hours != '') ? $scope.sprint_payload.burned_hours + ':00' : '',
                total_user_stories: ($scope.sprint_payload.total_user_stories != undefined) ? $scope.sprint_payload.total_user_stories : '',
                userstory_burned_hours: ($scope.sprint_payload.userstory_burned_hours != undefined) ? $scope.sprint_payload.userstory_burned_hours : '',
                userstory_planned_hours: ($scope.sprint_payload.userstory_planned_hours != undefined) ? $scope.sprint_payload.userstory_planned_hours : '',
                activity_burned_hours: ($scope.sprint_payload.activity_burned_hours != undefined) ? $scope.sprint_payload.activity_burned_hours : '',
                activity_planned_hours: ($scope.sprint_payload.activity_planned_hours != undefined) ? $scope.sprint_payload.activity_planned_hours : '',
                issue_burned_hours: ($scope.sprint_payload.issue_burned_hours != undefined) ? $scope.sprint_payload.issue_burned_hours : '',
                issue_planned_hours: ($scope.sprint_payload.issue_planned_hours != undefined) ? $scope.sprint_payload.issue_planned_hours : '',
                type: 1
            }

            var sprintService = $injector.get('sprintService');

            //Check if _id is coming then update otherwise inert sprint data
            if ($scope.sprint_payload._id && $scope.sprint_payload._id != undefined) {
                var request_edit = {
                    sprint_id: $scope.sprint_payload._id
                }
                delete request.project_id;
                _.assign(request, request_edit); // extend
                sprintService.updateSprint(request, function (response) {
                    if (response.data.statusCode == 200) {
                        $scope.closeModal();

                        swal({title: "Success", text: response.data.message, type: 'success'},
                        function () {
                            // $rootScope.$emit("CallProjectsSprintInfo"); // Load all phaese data after modal close
                            $state.reload();
                        });
                    } else {
                        var data = {title: 'oops', text: response.data.message, type: 'error'};
                        commonService.showMessage(data);
                    }
                });
            } else {
                //Insert the new sprint 
                sprintService.createSprint(request, function (response) {
                    if (response.data.statusCode == 200) {

                        $scope.sprint_payload = {};
                        $scope.submitted = false;
                        $scope.create_sprint.$setUntouched();

                        $scope.closeModal();

                        swal({title: "Success", text: response.data.message, type: 'success'},
                        function () {
                            $state.reload();
                            // $rootScope.$emit("CallProjectsSprintInfo"); // Load all phaese data after modal close
                        });
                    } else {
                        var data = {title: 'oops', text: response.data.message, type: 'error'};
                        commonService.showMessage(data);
                    }
                });
            }
        }
    }

    $scope.closeModal = function () {
        $element.modal('hide'); //  Manually hide the modal using bootstrap.
        close(null, 500); //  Now close as normal, but give 500ms for bootstrap to animate
    }
});

angular.module("ignitrack").filter('capitalize', function () {
    return function (input, scope) {
        if (input != undefined) {
            if (input != null)
                input = input.toLowerCase();
            return input.substring(0, 1).toUpperCase() + input.substring(1);
        }
    }
});
