/*
 * @file: dashboardCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("dashboardCtrl", function ($scope, $cookieStore, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, userService, commonService, socket, Upload, BASE_PATH, toastr, dashboardService, taskService) {

    $scope.heading = "Dashboard";
    var action = $state.current.name;
    $scope.baseUrl = BASE_PATH;
    $scope.project_id = ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id;
    $scope.url = $scope.baseUrl + 'attachment/admin/';
    /*
     * @name : get projects comments on dashbaord
     */
    $scope.getDashboardComments = function () {
        commonService.loadingPopup(); // start processing popup
        var request = {'projectId': ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id, 'skip': 0, 'limit': 3};
        dashboardService.getCommets(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.list = response.data.result.comment;
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /* 
     * @name post comment on project from dashbaord
     */
    $scope.dashboardCommentPost = function () {
        commonService.loadingPopup(); // start processing popup
        $scope.comments.project_id = ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id;
        $scope.comments.comment_description = $scope.comments.comment_description;
        dashboardService.createComments($scope.comments, function (response) {
            if (response.data.statusCode == 200) {
                $scope.comments.comment_description = '';
                $scope.submitted = false;
                $scope.commentform.$setUntouched();
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"});
                $scope.getDashboardComments();
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /* 
     * @name get latest 3 activities of project
     */
    $scope.getDashbaordActivities = function () {
        commonService.loadingPopup();
        $scope.request = {
            activity: true,
            type: 'all',
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            keyword: '',
            assigned_to: '',
            skip: 0,
            limit: 3
        };
        dashboardService.getActivities($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.totalRecords = response.data.count;
                $scope.dasboard_activities = response.data.data;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * @name get latest 3 task of project
     */
    $scope.getDashbaordTasks = function () {
        commonService.loadingPopup();
        $scope.request = {
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            skip: 0,
            limit: 3
        };
        dashboardService.getTasks($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.dasboard_tasks = response.data.data.task;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * @name get current sprint data
     */
    $scope.getDashboardCurrentSprint = function () {
        commonService.loadingPopup();
        $scope.request = {
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            skip: 0,
            limit: 3
        };
        dashboardService.getCurrentSprint($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                if (response.data.data.allSprintData.length > 0) {
                    $scope.length = response.data.data.allSprintData.length;
                    $scope.dasboard_current_sprint = response.data.data.allSprintData[0];
                } else {
                    $scope.length = response.data.data.allSprintData.length;
                }
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * @name get all sprints of project
     */
    $scope.getDashboardSprints = function () {
        commonService.loadingPopup();
        $scope.request = {
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            skip: 0,
            limit: 3
        };
        dashboardService.getSprints($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.dasboard_sprints = response.data.data.result;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * @name get all sprints & Activity count
     */
    $scope.getDashboardSprintActivity = function () {
        commonService.loadingPopup();
        $scope.request = {
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            skip: 0,
            limit: 10
        };
        dashboardService.getProjectSprints($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.dasboard_project_sprints_basic = response.data.data;
                $scope.dasboard_project_sprints = response.data.data.allSprintData;
                $scope.dasboard_project_activities = response.data.data.Activity[0];
                var totalPlannedHours = $scope.dasboard_project_sprints_basic.TotalPlannedHours.split(':');
                var sprintTotalBurnedHour = $scope.dasboard_project_sprints_basic.sprintTotalBurnedHour.split(':');
                var output = [];
                output[0] = parseInt(totalPlannedHours[0]) - parseInt(sprintTotalBurnedHour[0]);
                if (parseInt(sprintTotalBurnedHour[1]) > parseInt(totalPlannedHours[1])) {
                    output[0] = output[0] - 1;
                    totalPlannedHours[1] = parseInt(totalPlannedHours[1]) + 60;
                }
                output[1] = totalPlannedHours[1] - parseInt(sprintTotalBurnedHour[1]);
                output[0] = (output[0] == 0) ? "00" : output[0];
                output[1] = (output[1] == 0) ? "00" : output[1];
                if (output[0].toString().length == 1 && output[0] < 10) {
                    output[0] = "0" + output[0];
                }
                if (output[1].toString().length == 1 && output[1] < 10) {
                    output[1] = "0" + output[1];
                }
                $scope.totalOutput = output[0] + ':' + output[1];
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * @name get notifications
     */
    $scope.getDashboardNotifications = function () {
        commonService.loadingPopup();
        $scope.request = {
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            skip: 0,
            limit: 3,
            isMyDasboard: 2
        };
        dashboardService.getNotifications($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.dasboard_notifications = response.data.data.Notification;
                $timeout(commonService.closePopup(), 200); // hide processing popup
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
     * 
     * @name : get all sprint
     * @description : function to get all sprints of project on the basis on project id
     */
    $scope.getSprintsList = function () {
        var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};
        taskService.getSprints(request, function (response) {
            if (response.data.statusCode == 200) {
                if (response.data.data[0] && response.data.data[0]._id != undefined) {
                    $scope.builds_sprint_id = {_id: response.data.data[0]._id};
                    $scope.issue_sprint_id = {_id: response.data.data[0]._id};
                }
                $scope.sprint_data = response.data.data;

            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        })
    }

    /*
     * @name : get Project US Graph
     * @dscription : function to show US pie chart on basis of US count in each status. Here we only show Sprint US counts
     * 
     */
    $scope.getDashboardUserStory = function () {
        commonService.loadingPopup(); // start processing popup
        var request = {'project_id': ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id, sprint_id: ($scope.sprint_id_user == null && $scope.sprint_id_user == undefined) ? '' : $scope.sprint_id_user._id};
        dashboardService.getUserStory(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.pieDatas = [];
                var status_count = 0;

                angular.forEach(response.data.data, function (item) {
                    status_count = status_count + item.count;
                });
                angular.forEach(response.data.data, function (item) {
                    var new_count = (item.count / status_count) * 100;
                    $scope.pieDatas.push([
                        item.name, new_count
                    ]);
                });

                if (status_count == 0) {
                    $scope.pieDatas = [];
                }
                var chart;

                chart = Highcharts.chart('container1', {
                    chart: {
                        type: 'pie',
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false
                    },
                    title: {
                        text: 'User Story Reporting'
                    },
                    credits: {
                        enabled: false
                    },
                    colors: ['#f0ad4e', '#5bc0de', '#d9534f', '#5cb85c'],
                    //fontFamily: 'Times New Roman',
                    tooltip: {
                        borderWidth: 5,
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            depth: 35,
                            size: 290,
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {fontFamily: 'Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif', fontSize: '12px'}
                            }
                        }
                    },
                    series: [{
                            type: 'pie',
                            name: 'US Status',
                            colorByPoint: true,
                            data: $scope.pieDatas,
                            showInLegend: true
                        }
                    ]
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * @name : get Project Issue Graph
     * @dscription : function to show Issues pie chart on basis of Issues count in each status. Here we only show Sprint issues counts
     * 
     */
    $scope.getDashboardIssues = function () {
        commonService.loadingPopup(); // start processing popup
        var request = {'project_id': ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id, sprint_id: ($scope.sprint_id == null && $scope.sprint_id == undefined) ? '' : $scope.sprint_id._id};
        dashboardService.getIssues(request, function (response) {
            if (response.data.statusCode == 200) {
                commonService.closePopup();
                $scope.issueDatas = [];
                var issue_status_count = 0;
                angular.forEach(response.data.data, function (item) {
                    issue_status_count = issue_status_count + item.count;
                });
                angular.forEach(response.data.data, function (item) {
                    var new_count = (item.count / issue_status_count) * 100;
                    $scope.issueDatas.push([
                        item.name, new_count
                    ]);
                });
                if (issue_status_count == 0) {
                    $scope.issueDatas = [];
                }
                var chart;
                chart = Highcharts.chart('container', {
                    chart: {
                        type: 'pie',
                    },
                    title: {
                        text: 'Issues Reporting'
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        borderWidth: 5,
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            depth: 35,
                            size: 280,
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {fontFamily: 'Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif', fontSize: '12px'}
                            }
                        }
                    },
                    series: [{
                            type: 'pie',
                            name: 'Issues',
                            data: $scope.issueDatas,
                            showInLegend: true
                        }]
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * @name : get Project sprints information
     * @dscription : function to show sprint bar chart on basis of sprint total, burned & output hours
     * 
     */
    $scope.getDashboardSprintsChart = function () {
        commonService.loadingPopup(); // start processing popup       
        var request = {'project_id': ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id, sprint_id: ''};
        dashboardService.getSprintReport(request, function (response) {
            if (response.data.statusCode == 200) {
                var chart;
                var chartConfig = {
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: 'Sprint Report'
                    },
                    credits: {
                        enabled: false
                    },
                    colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
                    xAxis: {
                        title: {
                            text: 'All Sprints'
                        },
                        categories: response.data.data[0].sprint_names,
                        labels: {
                            style: {
                                color: 'black',
                                fontSize: '15px'
                            }
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Total planned sprint hours'
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'bold',
                                fontFamily: 'Times New Roman',
                                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                            }
                        }
                    },
                    legend: {
                        align: 'right',
                        x: -70,
                        verticalAlign: 'top',
                        y: 20,
                        floating: true,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                        borderColor: '#CCC',
                        borderWidth: 1,
                        shadow: false
                    },
                    tooltip: {
                        borderWidth: 5,
                        fontSize: 15,
                        formatter: function () {
                            return '<b>' + this.x + '</b><br/>' +
                                    this.series.name + ': ' + '<b>' + this.y + '</b>' + '<br/>';
                        }
                    },
                    plotOptions: {
                        series: {
                            pointWidth: 40,
                            pointPadding: 0,
                            groupPadding: 0
                        },
                        column: {
                            dataLabels: {
                                enabled: true,
                                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
                                style: {
                                    fontSize: '12px'
                                }
                            }
                        }
                    },
                    series: response.data.data[1].totalHours,
                    noData: {
                        // Custom positioning/aligning options
                        position: {
                            //align: 'right',
                            //verticalAlign: 'bottom'
                        },
                        // Custom svg attributes
                        attr: {
                            //'stroke-width': 1,
                            //stroke: '#cccccc'
                        },
                        // Custom css
                        style: {
                            //fontWeight: 'bold',     
                            //fontSize: '15px',
                            //color: '#202030'        
                        }
                    }
                };
                $scope.chartConfig = chartConfig;
                chart = angular.element('#containers').highcharts(chartConfig);

            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * @name : get Project task information
     * @dscription : function to show all user on project and their task count on the basis of statues
     * 
     */
    $scope.getDashboardTaskReport = function () {
        var request = {'project_id': ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id, sprint_id: ''};
        dashboardService.getTaskReport(request, function (response) {
            if (response.data.statusCode == 200) {
                var chartConfigs = {
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: 'User Task Report'
                    },
                    credits: {
                        enabled: false
                    },
                    colors: ['#d9534f', '#f0ad4e', '#5cb85c'],
                    xAxis: {
                        title: {
                            text: 'Users'
                        },
                        categories: response.data.data.users
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Number of Tasks'
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'bold',
                                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                            }
                        }
                    },
                    legend: {
                        align: 'right',
                        x: -70,
                        verticalAlign: 'top',
                        y: 20,
                        floating: true,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                        borderColor: '#CCC',
                        borderWidth: 1,
                        shadow: false
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.x + '</b><br/>' +
                                    'Total: ' + this.point.stackTotal;
                        }
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true,
                                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                                style: {
                                    textShadow: '0 0 3px black, 0 0 3px black'
                                }
                            }
                        }
                    },
                    series: response.data.data.tasks_count
                };
                $scope.chartConfigs = chartConfigs;
                $('#container_task').highcharts(chartConfigs);
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * Get All Dashboard open issues Statistics
     */
    $scope.getDashboardOpenIssue = function () {
        commonService.loadingPopup();
        $scope.request = {
            project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
            sprint_id: ($scope.sprint_id_open == null && $scope.sprint_id_open == undefined) ? '' : $scope.sprint_id_open._id
        };
        dashboardService.getOpenIssues($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.open_issues_parent = response.data.data.parents;
                $scope.open_issues_child = response.data.data.childs;
                $scope.open_issues_unmapped = response.data.data.Un_mappedIssues;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    $scope.getDashboardBuildsChart = function (builds_sprint_id) {
        // $scope.getSprintsList();
        var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};
        taskService.getSprints(request, function (response) {
            if (response.data.statusCode == 200) {
                if (response.data.data[0] && response.data.data[0]._id != undefined) {

                    if (builds_sprint_id != undefined) {
                        var request1 = {sprint_id: builds_sprint_id._id}
                    } else {
                        var request1 = {sprint_id: response.data.data[0]._id}
                    }

                    if (request1 != '') {
                        $scope.nobuild_data = 0;
                        dashboardService.getBuildsReport(request1, function (response) {
                            if (response.data.statusCode == 200) {
                                var chart;
                                var chartConfig = {
                                    chart: {
                                        type: 'column'
                                    },
                                    title: {
                                        text: 'Builds and releases report'
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    colors: ['#5cb85c', '#d9534f'],
                                    xAxis: {
                                        title: {
                                            text: 'All partial sprints'
                                        },
                                        categories: response.data.data[0].build_name,
                                        labels: {
                                            style: {
                                                color: 'black',
                                                fontSize: '15px'
                                            }
                                        }
                                    },
                                    yAxis: {
                                        //min: 0,
                                        title: {
                                            text: 'Partial sprints'
                                        },
                                        stackLabels: {
                                            enabled: true,
                                            style: {
                                                fontWeight: 'bold',
                                                fontFamily: 'Times New Roman',
                                                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                                            }
                                        }
                                    },
                                    legend: {
                                        align: 'right',
                                        x: -70,
                                        verticalAlign: 'top',
                                        y: 20,
                                        floating: true,
                                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                                        borderColor: '#CCC',
                                        borderWidth: 1,
                                        shadow: false
                                    },
                                    tooltip: {
                                        borderWidth: 5,
                                        fontSize: 15,
                                        formatter: function () {
                                            return '<b>' + this.x + '</b><br/>' +
                                                    this.series.name + ': ' + '<b>' + this.y + '</b>' + '<br/>';
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            pointWidth: 40,
                                            pointPadding: 0,
                                            groupPadding: 0
                                        },
                                        column: {
                                            dataLabels: {
                                                enabled: true,
                                                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
                                                style: {
                                                    fontSize: '12px'
                                                            // textShadow: '0 0 1px black, 0 0 1px black'
                                                }
                                            }
                                        }
                                    },
                                    series: response.data.data[1].userStoryStatus,
                                    noData: {
                                        // Custom positioning/aligning options
                                        position: {
                                            //align: 'right',
                                            //verticalAlign: 'bottom'
                                        },
                                        // Custom svg attributes
                                        attr: {
                                            //'stroke-width': 1,
                                            //stroke: '#cccccc'
                                        },
                                        // Custom css
                                        style: {
                                            //fontWeight: 'bold',     
                                            //fontSize: '15px',
                                            //color: '#202030'        
                                        }
                                    }
                                };
                                $scope.chartConfig = chartConfig;
                                chart = angular.element('#build_containers').highcharts(chartConfig);

                            }
                        });
                    } else {
                        $scope.nobuild_data = 1;
                    }
                }
            }
        })


    }


    /*
     * function to fetch issues comparitive graph 
     */
    $scope.getDashboardComparitiveIssues = function () {
        // $scope.getSprintsList();
        var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};

        dashboardService.getComparitiveIssues(request, function (response) {
            if (response.data.statusCode == 200) {
                var chart;
                var chartConfig = {
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: 'Issue Comparison'
                    },
                    credits: {
                        enabled: false
                    },
                    colors: ['#5cb85c', '#d9534f'],
                    xAxis: {
                        type: 'category',
                        title: {
                            text: 'Sprints'
                        },
                        labels: {
                            rotation: 0,
                            style: {
                                fontSize: '15px',
                                fontFamily: 'Verdana, sans-serif'
                            }
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Bugs Count'
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    tooltip: {
                        borderWidth: 5,
                        fontSize: 15,
                        pointFormat: 'Bugs in sprint: <b>{point.y}</b>'
                    },
                    plotOptions: {
                        series: {
                            pointWidth: 40,
                            pointPadding: 0,
                            groupPadding: 0
                        }
                    },
                    series: [{
                            name: 'Bugs Count',
                            data: response.data.data,
                            dataLabels: {
                                enabled: true,
                                rotation: -90,
                                color: '#FFFFFF',
                                align: 'right',
                                format: '{point.y}', // one decimal
                                y: 10, // 10 pixels down from the top
                                style: {
                                    fontSize: '15px',
                                    fontFamily: 'Verdana, sans-serif'
                                }
                            }
                        }]
                };
                $scope.chartConfig = chartConfig;
                chart = angular.element('#comparitive_issues').highcharts(chartConfig);

            }
        });


    }


    $scope.getDashboardUserReportChart = function (issue_sprint_id) {
        // $scope.getSprintsList();
        var request = {project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id};
        taskService.getSprints(request, function (response) {
            if (response.data.statusCode == 200) {
                if (response.data.data[0] && response.data.data[0]._id != undefined) {

                    if (issue_sprint_id != undefined) {
                        var request1 = {sprint_id: issue_sprint_id._id, project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id}
                    } else {
                        var request1 = {sprint_id: response.data.data[0]._id, project_id: $rootScope.globalProjectId == null || $rootScope.globalProjectId == '' ? '' : $rootScope.globalProjectId._id}
                    }

                    if (request1 != '') {
                        dashboardService.getUserReport(request1, function (response) {
                            if (response.data.statusCode == 200) {
                                var chart;
                                var chartConfig = {
                                    chart: {
                                        type: 'column'
                                    },
                                    title: {
                                        text: 'User Task Report'
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    colors: ['#5cb85c', '#f0ad4e'],
                                    xAxis: {
                                        title: {
                                            text: 'All users of sprint'
                                        },
                                        categories: response.data.result.users,
                                        labels: {
                                            style: {
                                                color: 'black',
                                                fontSize: '15px'
                                            }
                                        }
                                    },
                                    yAxis: {
                                        title: {
                                            text: 'Total Estimated Vs Burned Hours'
                                        },
                                        stackLabels: {
                                            enabled: true,
                                            style: {
                                                fontWeight: 'bold',
                                                fontFamily: 'Times New Roman',
                                                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                                            }
                                        }
                                    },
                                    legend: {
                                        align: 'right',
                                        x: -70,
                                        verticalAlign: 'top',
                                        y: 20,
                                        floating: true,
                                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                                        borderColor: '#CCC',
                                        borderWidth: 1,
                                        shadow: false
                                    },
                                    tooltip: {
                                        borderWidth: 5,
                                        fontSize: 15,
                                        formatter: function () {
                                            return '<b>' + this.x + '</b><br/>' +
                                                    this.series.name + ': ' + '<b>' + this.y + '</b>' + '<br/>';
                                        }
                                    },
                                    plotOptions: {
                                        series: {
                                            pointWidth: 40,
                                            pointPadding: 0,
                                            groupPadding: 0
                                        },
                                        column: {
                                            dataLabels: {
                                                enabled: true,
                                                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
                                                style: {
                                                    fontSize: '12px'
                                                }
                                            }
                                        }
                                    },
                                    series: response.data.result.data,
                                    noData: {
                                        // Custom positioning/aligning options
                                        position: {
                                            //align: 'right',
                                            //verticalAlign: 'bottom'
                                        },
                                        // Custom svg attributes
                                        attr: {
                                            //'stroke-width': 1,
                                            //stroke: '#cccccc'
                                        },
                                        // Custom css
                                        style: {
                                            //fontWeight: 'bold',     
                                            //fontSize: '15px',
                                            //color: '#202030'        
                                        }
                                    }
                                };
                                $scope.chartConfig = chartConfig;
                                chart = angular.element('#users_report').highcharts(chartConfig);

                            }
                        });
                    } 
                }
            }
        })


    }


   $scope.commitSkip = 0;
   $scope.commitLimit = 10;
   $scope.commitCurrentPage = 1; 
   $scope.commitMaxSize = 5; 
   
   $scope.getDashboardCommits = function(){
	       $scope.commitSkip = ($scope.commitCurrentPage - 1) * $scope.commitLimit;
	       request = { project_id : $rootScope.globalProjectId._id, skip: $scope.commitSkip , limit: $scope.commitLimit };
	       taskService.getCommitsList(request, function (response) {
			  if(response.data.statusCode == 200){
				  $scope.commitTotal = response.data.data.total_records;
				  $scope.list = response.data.data.data; 
			  }
		   });
	   
	   }


});

