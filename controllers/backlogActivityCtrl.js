/*
 * @file: backlogActivityCtrl.js
 * @description: backlog activity controller
 * */

angular.module("ignitrack").controller("backlogActivityCtrl", function ($scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, activityService, userStoryService, BASE_PATH, $timeout) {

    $scope.baseUrl = BASE_PATH;
    $scope.url = $scope.baseUrl + 'compressed/';

    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;

    /*
     * Reset filters
     */
    $scope.clearFilter = function () {
        $state.reload();
    }
    /*-------------Activity -------------*/

    $scope.activitySearch = {
        type: 'all',
        phase_id: ($scope.phase_id == null && $scope.phase_id == undefined) ? '' : $scope.phase_id._id,
        keyword: ($scope.search == null && $scope.search == undefined) ? '' : $scope.search,
        project_id: ($scope.project_id == null && $scope.project_id == undefined) ? '' : $scope.project_id,
        assigned_to: ''
    }


    /*
     * 
     * @name : get all activities
     * @description : function to get all activities on the basis of parameters
     */
    $scope.getAllActivities = function (active, type, value) {
        commonService.loadingPopup();
        $scope.activitySearch[type] = value;
        // If user filter by any search cretaria the pagination parameters re-initialize
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;

        $scope.request = {
            activity: false,
            type: 'all',
            phase_id: ($scope.phase_id == null && $scope.phase_id == undefined) ? '' : $scope.phase_id._id,
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            keyword: $scope.activitySearch.keyword,
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
     *
     * @name assign phase
     * @description function to assign phase to those activity who do not have phase
     */
    $scope.assignPhase = function (phaseId, activity_id) {
        $scope.request = {activity_id: activity_id, phase_id: phaseId._id};
        activityService.assignPhase($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    $scope.getAllActivities('activity', 'type', 'all');
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
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
     * @name : set complexty of activity
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
    
    
    
    
    /*
     * @name : Open date picker
     * @description : function to open date picker
     *                functions to open datepicker
     */
    $scope.today = function () {
        $scope.activity_payload = { start_date: new Date()};
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
        minDate: new Date(),
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
            controller: "backlogActivityChildCtrl",
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
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
     * @name : call get all activities function
     * @description : to get all activities , call from child controller
     */
     
    $rootScope.$on("CallBackLogAllActivities", function (event, args) {
        $scope.getAllActivities('activities', 'type', 'all');
    });


   
});



/*
 * Activity Child Controller
 */
angular.module("ignitrack").controller("backlogActivityChildCtrl", function ($scope, $q, $cookieStore, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, activityService, commonService, BASE_PATH, close, $element) {

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

        // request payload
        var request = {name: $scope.activity_payload.title, description: $scope.activity_payload.description, end_date: ($scope.activity_payload.end_date && $scope.activity_payload.end_date != undefined) ? $scope.activity_payload.end_date : 0, estimated_time: ($scope.ctrl.timepicker && $scope.ctrl.timepicker != undefined) ? $scope.ctrl.timepicker : '', is_billable: $scope.activity_payload.is_billable, project_id: $scope.activity_payload.project_id, phase_id: $scope.activity_payload.phase_id, assigned_to: $scope.activity_payload.assigne_id, status: $scope.activity_payload.status};

        activityService.createActivity(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.activity_payload = {};
                $scope.closeModal();
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    $rootScope.$emit("CallBackLogAllActivities");
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
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
