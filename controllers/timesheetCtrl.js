/*
 * @file: timesheetCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("timesheetCtrl", function ($scope, $q, $cookieStore, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, timesheetService, BASE_PATH, $element) {



    $scope.searchSelectAllSettings = {scrollableHeight: '50px', enableSearch: true, showSelectAll: true, keyboardControls: true};

    $scope.getProjects = [];
    $scope.getDeptProject = function () {
        $scope.start_date = moment().subtract(30, 'days').unix() * 1000;
        $scope.end_date = new Date();

        var start_date = moment($scope.start_date).format('YYYY-MM-DD');
        start_date = moment(start_date).unix();

        var end_date = moment($scope.end_date).format('YYYY-MM-DD');
        end_date = moment(end_date).unix();

        var methods = {
            getDepartments: timesheetService.getDepartment({}),
            getProjects: timesheetService.getProjects({})
        };

        $q.all(methods).then(function (methods) {
            var response = _.filter(methods, function (obj) {
                return obj.status != 200 || !obj.data || obj.data.statusCode != 200
            });

            if (response.length > 0) {
                swal("Oops...", 'Technical error. Please try again later', 'error');
            } else {
                $scope.getProjects = [];
                angular.forEach(methods.getProjects.data.data, function (value, key) {
                    $scope.getProjects.push({id: value._id,
                        label: value.title,
                    });
                });

                $scope.getDepartments = (methods.getDepartments.data.data.departments && methods.getDepartments.data.data.departments != undefined) ? methods.getDepartments.data.data.departments : [];
                // $scope.getProjects = (methods.getProjects.data.data && methods.getProjects.data.data != undefined) ? methods.getProjects.data.data : [];
                commonService.closePopup();
            }
        });
    }

    $scope.users = [];
    $scope.selectedUsers = [];

    $scope.getUsers = function (department_id) {
        var request = {
            dept_id: department_id._id
        }
        timesheetService.getUsers(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.users = [];
                angular.forEach(response.data.data, function (value, key) {
                    $scope.users.push({id: value._id,
                        label: value.first_name + ' (' + value.email + ')',
                    });
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    $scope.project_ids = [];
    $scope.getTimesheet = function () {

        var users = [];
        var projects = [];
        angular.forEach($scope.selectedUsers, function (value, key) {
            users.push(value.id);
        });

        angular.forEach($scope.project_ids, function (value, key) {
            projects.push(value.id);
        });


        var start_date = moment($scope.start_date).format('YYYY-MM-DD');
        start_date = moment(start_date).unix();

        var end_date = moment($scope.end_date).format('YYYY-MM-DD');
        end_date = moment(end_date).unix();

        if (projects != '') {
            var request = {user_id: users, project_id: projects, start_date: start_date, end_date: end_date};
        } else {
            var request = {user_id: users, start_date: start_date, end_date: end_date};
        }

        timesheetService.getTimeSheet(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.headersDays = [];
                $scope.headersDates = [{date: ''}];
                $scope.timesheetData = response.data.data;


                if (response.data.data.length > 0) {
                    $scope.headersDays = [{day: 'Member'}];
                    $scope.headersDates = [{date: 'Date(s)'}];


                    for (var i = 0; i < response.data.data[0].loggings.length; i++) {
                        $scope.headersDays.push({day: response.data.data[0].loggings[i].day});
                        $scope.headersDates.push({date: response.data.data[0].loggings[i].date});
                    }
                }

                $timeout(commonService.closePopup(), 200); // hide processing popup
            }
        });
    }



    /* Get timesheet */
    $scope.getTimesheet1 = function () {

        commonService.loadingPopup(); // start processing popup
        $scope.start_date = moment().subtract(30, 'days').unix() * 1000;
        $scope.end_date = new Date();

        var projects = '[';
        var projectsFilter = [];
        var usersFilter = [];

        timesheetService.getProjects({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.projects = response.data.data;
                if ($scope.selectedProject == undefined) {
                    $scope.selectedProject = $scope.projects;
                }

                for (var i = 0; i < $scope.selectedProject.length; i++) {
                    projectsFilter.push($scope.selectedProject[i]._id);
                    projects += '"' + $scope.selectedProject[i]._id + '"';
                    if (i < $scope.selectedProject.length - 1) {
                        projects += ',';
                    }
                }
                projects += ']';

                var methods = {
                    //  getDepartments: timesheetService.getDepartment({}),
                    users: timesheetService.getUsers({project_id: projects})
                };

                $q.all(methods).then(function (methods) {
                    var response = _.filter(methods, function (obj) {
                        return obj.status != 200 || !obj.data || obj.data.statusCode != 200
                    });

                    if (response.length > 0) {
                        swal("Oops...", 'Technical error. Please try again later', 'error');
                    } else {
                        $scope.users = methods.users.data.result;
                        $scope.departments = methods.getDepartments.data.data.departments;
                        if ($scope.selectedUsers == null || $scope.selectedUsers == undefined) {
                            $scope.selectedUsers = [];
                            $scope.selectedUsers.push({
                                _id: $rootScope.loginUserMongoId
                            });
                        }
                        for (var i = 0; i < $scope.selectedUsers.length; i++) {
                            usersFilter.push($scope.selectedUsers[i]._id);
                        }

                        var start_date = moment($scope.start_date).format('YYYY-MM-DD');
                        start_date = moment(start_date).unix();

                        var end_date = moment($scope.end_date).format('YYYY-MM-DD');
                        end_date = moment(end_date).unix();

                        timesheetService.getTimeSheet({user_id: usersFilter, project_id: projectsFilter, start_date: start_date, end_date: end_date}, function (response) {
                            if (response.data.statusCode == 200) {
                                $scope.headersDays = [{day: 'Member'}];
                                $scope.headersDates = [{date: ''}];
                                $scope.timesheetData = response.data.data;

                                if (response.data.data.length > 0) {
                                    for (var i = 0; i < response.data.data[0].loggings.length; i++) {
                                        $scope.headersDays.push({day: response.data.data[0].loggings[i].day});
                                        $scope.headersDates.push({date: response.data.data[0].loggings[i].date});
                                    }
                                }

                                $timeout(commonService.closePopup(), 200); // hide processing popup
                            }
                        });
                    }
                });



            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }

    /*
     * @name : Open date picker
     * @description : function to open date picker
     */


    $scope.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(),
        minDate: '',
        startingDay: 1
    };

    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };


    $scope.popup1 = {
        opened: false
    };

    $scope.open2 = function () {
        $scope.popup2.opened = true;
    };

    $scope.popup2 = {
        opened: false
    };





});
