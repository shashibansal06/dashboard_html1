/*
 * @file: activityCtrl.js
 * @description:
 * */

//userRootServices,
angular.module("ignitrack").controller("activityCtrl", function ($scope, $cookieStore, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, activityService, commonService, BASE_PATH, $element) {

    $scope.baseUrl = BASE_PATH;
    $scope.url = $scope.baseUrl + 'compressed/';
    /*
     * @name : get all assignes
     * @description: function to get all users
     */
    $scope.activity_assignees = [];
    $scope.getAssignee = function () {
        activityService.getUsers({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_assignees = response.data.data;
            }
        });
    }

    /*
     * @name : get all project assignes for activity
     * @description: function to get all users of project
     */
    $scope.activity_project_assignees = [];
    $scope.getProjectAssignee = function () {
        var project_id = ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id;
        activityService.getProjectUsers({project_id: project_id}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_project_assignees = response.data.data.resources;
            }
        });
    }

    /*
     * @name : get activity status type = 0
     * @description: function to get status for activity 
     */
    $scope.activity_status = [];
    $scope.getStatus = function () {
        var request = {type: '0'};
        activityService.getStatus(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_status = response.data.data;
            }
        });
    }

    /*
     * @name : On chnage project from create activity modal
     * @Description : function to get all phases wrt project id
     */
    $scope.changeProject = function (project) {
        var request = {project_id: project._id, skip: 0, limit: 50};
        activityService.getProjectPhases(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_phases = response.data.data.records;
            }
        });

        activityService.getProjectUsers({project_id: project._id}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_pjct_phases = response.data.data.resources;
            }
        });

    }

    /*
     * @name : Create Activity Modal
     * @Description : function to open create activity modal
     */
    $scope.addActivity = function () {
        /* get status for activity */
        $scope.getStatus();

        /* get activity assignes */
        activityService.getUsers({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_assignee = response.data.data;
            }
        });

        /* get all projects */
        activityService.getProjects({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_projects = response.data.data;
            }
        });
        $scope.activity_payload = {};
        ModalService.showModal({
            templateUrl: "views/activities/add-activity.html",
            controller: "activityChildCtrl",
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }



    $scope.closeModal = function () {
        $element.modal('hide'); //  Manually hide the modal using bootstrap.
        close(null, 500); //  Now close as normal, but give 500ms for bootstrap to animate
    };


    /*
     * @name : Open date picker
     * @description : function to open date picker
     *                functions to open datepicker
     */
    $scope.today = function () {
        $scope.activity_payload = {start_date: new Date()};
    };
    $scope.today();

    $scope.clear = function () {
        $scope.activity_payload = {start_date: null};
    };

    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        //dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: null,
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
                mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };

    $scope.setDate = function (year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
        opened: false
    };


    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);

    $scope.events = [
        {
            date: tomorrow,
            status: 'full'
        },
        {
            date: afterTomorrow,
            status: 'partially'
        }
    ];

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

    /* ---Datepicker open function ends here ---*/

    /*
     * @name : call get all activities function
     * @description : to get all activities , call from child controller
     */
    $rootScope.$on("CallAllActivities", function (event, args) {
        $scope.getAllActivities('type', 'all');
    });


    /*
     * 
     * @name : reset filter
     * @description : reset all search values
     */
    $scope.clearFilter = function (type_value) {
        $state.reload();
    }

    /*
     * @name : get all activities
     * @description : function to get all activities or todo activities on the basis of parametere
     */
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;

    $scope.activitySearch = {
        type: 'all',
        keyword: ($scope.search == null && $scope.search == undefined) ? '' : $scope.search,
        project_id: ($scope.projectheaderId == null && $scope.projectheaderId == undefined) ? '' : $scope.projectheaderId._id,
        assigned_to: ''
    }

    $scope.getAllActivities = function (type, value) {
        commonService.loadingPopup();
        $scope.getProjectAssignee();
        $scope.activitySearch[type] = value;

        // If user filter by any search cretaria the pagination parameters re-initialize
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;

        $scope.request = {
            activity: true,
            type: $scope.activitySearch.type,
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            keyword: ($scope.search == null && $scope.search == undefined) ? '' : $scope.search,
            assigned_to: ($scope.assigne_id == null && $scope.assigne_id == undefined) ? '' : $scope.assigne_id._id,
            skip: $scope.skip,
            limit: $scope.limit
        };

        activityService.getActivities($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.totalRecords = response.data.count;
                $scope.list = response.data.data;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * @name : view Activity
     * @description : function to view details of activity
     */

    $scope.viewActivity = function () {

        if (!$state.params.id) {
            $state.go('activities');
        }
        $scope.getStatus();
        $scope.getProjectAssignee();
        $scope.skip = parseInt($scope.currentPage - 1) * parseInt($scope.limit);

        var request = {activity_id: $state.params.id, skip: $scope.skip, limit: $scope.limit};

        activityService.viewActivity(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_data = response.data.data;
                $scope.totalRecords_comment = response.data.data.ttlComments;
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * @name : post comment
     * @description : function to add log efforts type = 0, log effort & assign to user type = 1 , post comment type = 2, assign to other type = 3
     */
    $scope.addComment = function () {
        if (!$state.params.id) {
            $state.go('activities');
        }
        /*
         * log effort on activity
         */
        if ($scope.effort.type == 0) {
            $scope.request = {
                title: $scope.effort.title,
                description: $scope.effort.comment,
                type: $scope.effort.type,
                logged_hours: ($scope.ctrl.timepicker == undefined && $scope.ctrl.timepicker == null) ? '' : $scope.ctrl.timepicker,
                activity_id: $state.params.id,
                assigned_to: '',
                status: ($scope.effort.status == undefined && $scope.effort.status == null) ? '' : $scope.effort.status._id,
                log_effort_date: moment($scope.effort.log_date).unix()
            };
        }

        /*
         * log effort & assign activity to other
         */
        if ($scope.effort.type == 1) {
            $scope.request = {
                title: $scope.effort.title,
                description: $scope.effort.comment,
                type: $scope.effort.type,
                logged_hours: ($scope.ctrl.timepicker == undefined && $scope.ctrl.timepicker == null) ? '' : $scope.ctrl.timepicker,
                activity_id: $state.params.id,
                assigned_to: ($scope.effort.assigne_id == undefined && $scope.effort.assigne_id == null) ? '' : $scope.effort.assigne_id._id,
                status: ($scope.effort.status == undefined && $scope.effort.status == null) ? '' : $scope.effort.status._id,
                log_effort_date: moment($scope.effort.log_date).unix()
            };
        }

        /*
         *  comment on activity
         */
        if ($scope.effort.type == 2) {
            $scope.request = {
                title: $scope.effort.title,
                description: $scope.effort.comment,
                type: $scope.effort.type,
                logged_hours: "0:00",
                activity_id: $state.params.id,
                assigned_to: '',
                status: ''
            };
        }

        /*
         * assign activity to other user 
         */
        if ($scope.effort.type == 3) {
            $scope.request = {
                title: $scope.effort.title,
                description: $scope.effort.comment,
                type: $scope.effort.type,
                logged_hours: "0:00",
                activity_id: $state.params.id,
                assigned_to: ($scope.effort.assigne_id == undefined && $scope.effort.assigne_id == null) ? '' : $scope.effort.assigne_id._id,
                status: ($scope.effort.status == undefined && $scope.effort.status == null) ? '' : $scope.effort.status._id
            };
        }

        activityService.addStatus($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                if ($scope.effort.type == 0) {
                    var msg = 'Effort logged successfully';
                } else if ($scope.effort.type == 1) {
                    var msg = 'Effort logged and activity assigned successfully';
                } else if ($scope.effort.type == 2) {
                    var msg = 'Comment posted successfully';
                } else if ($scope.effort.type == 3) {
                    var msg = 'Activity assigned successfully';
                }
                swal({title: "Success!", text: msg, type: 'success', confirmButtonText: "OK"},
                function () {
                    $scope.effort = {};
                    $state.reload();
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * @name : post comment on activity via open modal
     * @param {type - 0,1,2,3} 
     * @description : open modal window on the basis of type value
     */
    $scope.postStatus = function (type) {
        $scope.getProjectAssignee();
        $scope.getStatus();
        $scope.status_type = type;
        ModalService.showModal({
            templateUrl: "views/activities/add-status.html",
            controller: "activityChildCtrl",
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }


    //Function to set complexity for the activity
    $scope.record = {task_complexity: 0};
    $scope.max = 5;
    $scope.isReadonly = false;

    $scope.hoveringOver = function (value) {
        $scope.overStar = value;
    };

    /*
     * 
     * @name add complexity on activity
     * @param activity_id , rate (value of rating 1 - 5)
     * @description : set rating on an activity
     */
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
});

/*
 * Activity Child Controller
 */
angular.module("ignitrack").controller("activityChildCtrl", function ($scope, $q, $cookieStore, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, activityService, commonService, BASE_PATH, close, $element) {

    /*
     * @name : Create Activity
     * @description : function to create new activity in project
     */
    $scope.addActivity = function () {
        commonService.loadingPopup();
        // convert date into unix timestamp
        if ($scope.activity_payload.start_date && $scope.activity_payload.start_date != undefined) {
            var date_selected = moment($scope.activity_payload.start_date).format('YYYY-MM-DD');
            $scope.activity_payload.end_date = moment(date_selected).unix();
        }
        // override fields
        $scope.activity_payload.project_id = $scope.activity_payload.project_id._id;
        $scope.activity_payload.phase_id = ($scope.activity_payload.phase_id == null && $scope.activity_payload.phase_id == undefined) ? '' : $scope.activity_payload.phase_id._id;
        $scope.activity_payload.assigne_id = $scope.activity_payload.assigne_id._id;
        $scope.activity_payload.status = $scope.activity_payload.status._id;
        var estimated_time = (($scope.ctrl.timepicker && $scope.ctrl.timepicker != undefined) ? $scope.ctrl.timepicker : '00') + ':' + (($scope.ctrl.minutes && $scope.ctrl.minutes != undefined) ? $scope.ctrl.minutes : '00')
        // request payload
        var request = {name: $scope.activity_payload.title, description: $scope.activity_payload.description, end_date: ($scope.activity_payload.end_date && $scope.activity_payload.end_date != undefined) ? $scope.activity_payload.end_date : 0, estimated_time: estimated_time, is_billable: $scope.activity_payload.is_billable, project_id: $scope.activity_payload.project_id, phase_id: $scope.activity_payload.phase_id, assigned_to: $scope.activity_payload.assigne_id, status: $scope.activity_payload.status};

        activityService.createActivity(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_payload = {};
                $scope.closeModal();
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    $rootScope.$emit("CallAllActivities");
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * @name : post comment on activity via modal window
     * @description : function to add log efforts type = 0, log effort & assign to user type = 1 , post comment type = 2, assign to other type = 3
     */
    $scope.postStatus = function () {
        /*
         * log effort on activity
         */
        if ($scope.status_type == 0) {
            $scope.request = {
                title: $scope.post_status.title,
                description: $scope.post_status.comment,
                type: $scope.status_type,
                logged_hours: ($scope.ctrl.timepicker == undefined && $scope.ctrl.timepicker == null) ? '' : $scope.ctrl.timepicker,
                activity_id: $state.params.id,
                assigned_to: '',
                status: ($scope.post_status.status == undefined && $scope.post_status.status == null) ? '' : $scope.post_status.status._id,
                log_effort_date: moment($scope.post_status.log_date).unix()
            };
        }
        /*
         * log effort & assign to other
         */
        if ($scope.status_type == 1) {
            $scope.request = {
                title: $scope.post_status.title,
                description: $scope.post_status.comment,
                type: $scope.status_type,
                logged_hours: ($scope.ctrl.timepicker == undefined && $scope.ctrl.timepicker == null) ? '' : $scope.ctrl.timepicker,
                activity_id: $state.params.id,
                assigned_to: ($scope.post_status.assigne_id == undefined && $scope.post_status.assigne_id == null) ? '' : $scope.post_status.assigne_id._id,
                status: ($scope.post_status.status == undefined && $scope.post_status.status == null) ? '' : $scope.post_status.status._id,
                log_effort_date: moment($scope.post_status.log_date).unix()
            };
        }
        /*
         * comment on activity
         */
        if ($scope.status_type == 2) {
            $scope.request = {
                title: $scope.post_status.title,
                description: $scope.post_status.comment,
                type: $scope.status_type,
                logged_hours: "0:00",
                activity_id: $state.params.id,
                assigned_to: '',
                status: ''
            };
        }

        /*
         * assign activity to other
         */
        if ($scope.status_type == 3) {
            $scope.request = {
                title: $scope.post_status.title,
                description: $scope.post_status.comment,
                type: $scope.status_type,
                logged_hours: "0:00",
                activity_id: $state.params.id,
                assigned_to: ($scope.post_status.assigne_id == undefined && $scope.post_status.assigne_id == null) ? '' : $scope.post_status.assigne_id._id,
                status: ($scope.post_status.status == undefined && $scope.post_status.status == null) ? '' : $scope.post_status.status._id
            };
        }

        activityService.addStatus($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.effort = {};
                $scope.closeModal();
                if ($scope.status_type == 0) {
                    var msg = 'Effort logged successfully';
                } else if ($scope.status_type == 1) {
                    var msg = 'Effort logged and activity assigned successfully';
                } else if ($scope.status_type == 2) {
                    var msg = 'Comment posted successfully';
                } else if ($scope.status_type == 3) {
                    var msg = 'Activity assigned successfully';
                }
                swal({title: "Success!", text: msg, type: 'success', confirmButtonText: "OK"},
                function () {
                    $scope.viewActivity(); // Load all user data
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * function to close modal window
     */
    $scope.closeModal = function () {
        $element.modal('hide'); //  Manually hide the modal using bootstrap.
        close(null, 500); //  Now close as normal, but give 500ms for bootstrap to animate
    }


});