angular.module("ignitrack").controller("commonCtrl", function (SOCKET_URL,desktopNotification, $scope, $cookieStore, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, socket, socketEventService, toastr) {
     //Function to update comments on real time basis
    $scope.customMenuEditor = [
            ['bold', 'italic', 'underline','strikethrough', 'subscript', 'superscript'],
            ['format-block'],
            ['font'],
            ['font-size'],
            ['font-color', 'hilite-color'],
            ['remove-format'],
            ['ordered-list', 'unordered-list', 'outdent', 'indent'],
            ['left-justify', 'center-justify', 'right-justify'],
            ['code', 'quote', 'paragraph'],
            ['link', 'image']
        ];
    if (!socket.connected) {
        var socket = io.connect(SOCKET_URL, {
            'reconnect': true,
            'reconnection': true,
            /*'reconnectionDelay': 1000,
             'reconnectionDelayMax': 2000,
             'reconnectionAttempts': 6,
             forceNew: true*/
            //'timeout': 15000,
        });
    }
    socket.on('event_send', function (data) {
        console.log(data);
        if (data && data.event_name && data.event_name != undefined && (data.action == 0 || data.action == undefined)) {
            socket.emit('event_received', {request_payload: true, event_name: data.event_name});//Fire event mark that user received the noti
            toastr.success('Greetings', data.message);
        } else {
            socket.emit('event_received', {request_payload: true, event_name: data.event_name});//Fire event mark that user received the noti
            socketEventService.triggerEvent(data);
        }
        
        if(data.notification_count && data.notification_count != undefined){
            if(angular.element('#activityBar').hasClass('sideBarOpen')){
                $rootScope.$emit("CallNotifications");
            }
            $rootScope.side_undreadNotifications = data.notification_count;
        }
    });

    var user_data = $cookieStore.get('access_token');
    var user = $cookieStore.get('user_data');
    if (user_data && user_data != undefined) {
        console.log("inside")
       
        socket.emit('verifyConnectionNew', {token: user_data,email:user.email,called_from:'admin_verify'});
        //socketEventService.on_welcome();

        socket.on('reconnect', function (nr) {
            //console.log('reconnected, nr: ', nr);
            console.log("Connected again after server restart");
            socket.emit('verifyConnectionNew', {token: user_data,email:user.email,called_from:'admin_reconnet'});
        });

        socket.on('reconnect_attempt', function (attemptNumber) {
            console.log("reconnect attempt" + attemptNumber);
        });

        socket.on('reconnecting', function (attemptNumber) {
            console.log("reconnecting" + attemptNumber);
        });


        socket.on('reconnect_error', function (error) {
            console.log("reconnect_error" + error);
        });
        socket.on('reconnect_failed', function () {
            console.log("reconnect_failed");
        });

        socket.on('error', function (error) {
            console.log("error" + error);
        });

    }
    socket.on( 'disconnect', function () {
        console.log( 'disconnected to server' );
    } );


    $scope.projectheaderId = $rootScope.globalProjectId;

    /*
     * @name : projects
     * @Discription :
     */
    $scope.projects = function () {
        /* get projects list for header*/
        $scope.globalProjectList = [];
        commonService.projects(function (response) {
            if (response.data.statusCode == 200) {
                $scope.globalProjectList = response.data.data;
                /* By default first project will selected form global project dropdown */
                if ($scope.globalProjectList.length > 0 && $rootScope.globalProjectId == undefined) {
                    $cookieStore.put('globalProjectId', $scope.globalProjectList[0]);
                    $rootScope.globalProjectId = $scope.globalProjectList[0];
                    $scope.projectheaderId = $scope.globalProjectList[0];
                }
                if ($state.$current.name == 'welcome' && $rootScope.globalProjectId) {
                    $state.go('main.dashboard_parent.dashboard');
                }
            }
        });
    }

    $scope.projects();

    /*
     * @name : phase
     * @Discription : get phase of the project
     */
    $scope.getPhasesByProjectId = function () {
        /* get projects list for header*/
        $scope.phaseList = [];
        var data = {id: $rootScope.globalProjectId._id};
        commonService.getPhases(data, function (response) {
            if (response.data.statusCode == 200) {
                $scope.phaseList = response.data.data.records;
            }
        });
    }


    /*
     * @name : logout user
     * @Discription : logout user
     */
    $scope.logout = function () {
        swal({
            title: "Are you sure?",
            text: " You want to logout",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, logout me!",
            closeOnConfirm: true,
            html: false
        }, function (isConfirm) {

            if (isConfirm) {
                commonService.loadingPopup(); // start processing popup
                commonService.logout(function (response) {
                    if (response.data.statusCode == 200) {
                        $cookieStore.remove('access_token');
                        $cookieStore.remove('user_data');

                        $cookieStore.remove('current_selected_sprint');
                        $cookieStore.remove('issue_admin_current_selected_sprint');

                        var u_data = $cookieStore.get('user_credentials');
                        if (u_data != undefined && u_data != null && u_data.remember == false) {
                            $cookieStore.remove('user_credentials');
                        }
                        // $cookieStore.remove('globalProjectId');
                        socket.disconnect();
                        $state.go('/');
                        commonService.closePopup();
                    }
                });
            }
        });
    }

});

/*
 * @name : Date & time convertor functions
 * @description : filter to convert date & time in whole site as per requirement
 */
angular.module("ignitrack").filter('convert_date', function () {
    return function (input) {
        return moment.unix(input).format("YYYY-MM-DD HH:mm") //parse integer
    }
});

angular.module("ignitrack").filter('convert_date_ago', function () {
    return function (input) {
        return moment.unix(input).toNow(true) + ' ago';
    }
});
angular.module("ignitrack").filter('convert_dateformat', function () {
    return function (input) {
        return moment.unix(input).format("YYYY-MM-DD") //parse integer
    }
});
angular.module("ignitrack").filter('dateformat', function () {
    return function (input) {
        return moment(new Date(input)).format("YYYY-MM-DD")
    }
});

angular.module("ignitrack").filter('dateformat24Hours', function () {
    return function (input) {
        return moment(new Date(input)).format("YYYY-MM-DD HH:mm")
    }
});

angular.module("ignitrack").filter('timeWihoutContingency', function () {
    return function (input, contigency_hours) {
        var secounds = moment.duration(input).asSeconds();
        var withoutContingency = secounds - secounds * contigency_hours / 100;
        return moment.duration(withoutContingency, "seconds").asHours();
    }
});

angular.module("ignitrack").filter('iso_date_format', function () {
    return function (input) {
        return moment(input).format("YYYY-MM-DD");
    }
});

/*
 * @name : dricetive to calculate sprint total output
 * @description : function to calculate sprint total output as shown on sprint
 */
ignitrack.directive('getSprintOutput', function ($compile) {
    var linkFunction = function (scope, elem, attrs) {
        var burnedHours = attrs.burnedHours;
        var sprintHours = attrs.sprintHours;

        var burned_seconds = moment.duration(burnedHours).asSeconds();
        var sprint_seconds = moment.duration(sprintHours).asSeconds();

        if (sprint_seconds > burned_seconds) {
            var total_time = sprint_seconds - burned_seconds;
        } else {
            var total_time = burned_seconds - sprint_seconds;
        }
        var hrs = Math.floor(total_time / 3600);
        var mins = Math.floor(total_time % 3600 / 60);
        var hrs_length = hrs.toString().length;
        var mins_length = mins.toString().length;

        var date = '';
        var final_hrs = '';
        var final_mins = '';
        if (hrs_length > 1) {
            final_hrs = hrs;
        } else {
            final_hrs = '0' + hrs;
        }

        if (mins_length > 1) {
            final_mins = mins;
        } else {
            final_mins = mins + '0';
        }
        date = final_hrs + ':' + final_mins;

        if (sprint_seconds > burned_seconds) {
            scope.final_sprint_hours = date;
        } else {
            scope.final_sprint_hours = '- ' + date;
        }
    };
    return {
        template: '<div>{{final_sprint_hours}}</div>',
        restrict: 'E',
        link: linkFunction
    }
});
