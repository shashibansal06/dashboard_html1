/*
 * @file: meetings.js
 * @description: function to create, update, view and delete meeting events
 * @author: prabhjot kaur
 * @date: 25-04-2017
 * */

//userRootServices,
'use strict';
angular.module("ignitrack").controller("meetings", function ($scope, $state, $timeout, $rootScope, $window, calendarConfig, ModalService, moment, meetingsService, commonService, $cookieStore, BASE_PATH) {
    var action = $state.current.name;
    $scope.eventObj = {};
    $scope.eventObj.data = [];
    $scope.available_users = [];
    $scope.userData = $cookieStore.get('user_data');
    calendarConfig.allDateFormats.moment.date.hour = 'hh:mm a';
    // var input = angular.element('.inputs');
    // // $scope.$watch(input, function() {
    //    input.keydown(function (e) {
    //      if (e.which === 9) {
    //          var index = angular.element('.inputs').index(this) + 1;
    //          angular.element('.inputs').eq(index).focus();
    //      }
    // });
    // // }, true);




    $scope.event = {
        start_date_time: moment().startOf('day').toDate(),
        end_date_time: moment().endOf('day').toDate(),
    };
    $scope.attachment = [];
    $scope.fileUrl = BASE_PATH + 'attachment/admin/';
    $scope.addEventForm = false;
    $scope.heading = "Meetings";
    $scope.user = [];
    $scope.dateOptions = {
        minDate: new Date(),
        maxDate: null
    };
    $scope.obj = {};
    $scope.toDateOptions = {
        minDate: $scope.obj.start_date_time ? new Date($scope.obj.start_date_time) : new Date(),
        maxDate: null
    };

    $scope.changeMinAndMaxDates = function () {
        $scope.toDateOptions.minDate = new Date($scope.obj.start_date_time);
        $scope.obj.end_date_time = new Date($scope.obj.start_date_time);
    }
    $scope.editchangeMinAndMaxDates = function () {
        $scope.toDateOptions.minDate = new Date($scope.event.startsAt);
        $scope.event.endsAt = new Date($scope.event.startsAt);
    }
    $scope.loadUsers = function ($query) {
        return $scope.available_users.filter(function (user) {
            return user.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
        });
    };
    // console.log($rootScope.globalProjectId._id);
    // var $scope = this;

    //These variables MUST be set as a minimum for the calendar to work
    $scope.calendarView = 'month';
    $scope.viewDate = new Date();
    var ediDeleteAction = [{
            label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
            onClick: function (args) {
                $scope.addEventForm = false;
                if (args.calendarEvent.meetingCancel == false) {
                    $scope.showModal('Edited', args.calendarEvent, 'edit_meeting');
                }
                else {
                    swal("Oops...", 'This meeting has been cancelled', 'warning');
                }
                //alert.show('Edited', args.calendarEvent);
            }
        }, {
            label: '<i class=\'glyphicon glyphicon-remove\'></i>',
            onClick: function (args) {
                $scope.addEventForm = false;
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
                    meetingsService.deleteEvent(args.calendarEvent.id, function (response) {
                        if (response.data.statusCode == 200) {
                            swal({
                                title: 'Meeting deleted successfully.',
                                type: "success",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Ok",
                                closeOnConfirm: true
                            },
                            function () {
                                $state.reload();
                                commonService.closePopup();
                                $window.scrollTo(0, 0);
                            })
                            // $state.reload();
                            // commonService.closePopup(), 200); // hide processing popup
                            // swal("Deleted!", "Data has been deleted.", "success");
                        } else {

                            swal({
                                title: (response.data.statusCode == 500) ? "Technical error. Please try again later" : ((response.data.statusCode == 408) ? "Server is not responding. Please try again later" : response.data.message),
                                type: "warning",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Ok",
                                closeOnConfirm: true
                            },
                            function () {
                                commonService.closePopup();
                                $window.scrollTo(0, 0);
                            })
                        }
                    });

                });
                //$scope.showModal('Deleted', args.calendarEvent,'manage_meeting');
                //alert.show('Deleted', args.calendarEvent);
            }
        }];

    // (args.calendarEvent.invited_by && args.calendarEvent.invited_by.email)==$scope.userData.email ?
    var actions = [
        {
            label: '<i class=\'glyphicon glyphicon-eye-open\'></i>',
            onClick: function (args) {
                $scope.addEventForm = false;
                $scope.showModal('View', args.calendarEvent, 'view_meeting');
            }
        }];
    var allActions = actions.concat(ediDeleteAction);
    $scope.cellIsOpen = false;

    $scope.event.venue = {};
    $scope.showModal = function (action, event, view) {

        $scope.action = action;
        $scope.event = event;
        $scope.event.startsAt = event.start_date_time;
        $scope.event.endsAt = event.end_date_time;
        $scope.event.attachment = [];
        ModalService.showModal({
            templateUrl: 'directive_templates/modals/' + view + '.html',
            //controller: 'meetings',
            controller: function ($scope, $element, close) {
                $scope.updateEvent = function () {
                    commonService.loadingPopup();
                    $scope.updateEvtObj = {};
                    $scope.invitee = [];
                    angular.forEach($scope.event.tags, function (item) {
                        $scope.invitee.push({user_id: item.id, is_mandatory: item.required});
                    });
                    $scope.invitee = JSON.stringify($scope.invitee);
                    if ($rootScope.globalProjectId) {
                        $scope.updateEvtObj = {
                            meeting_id: event.id,
                            title: $scope.event.title,
                            description: $scope.event.description,
                            venue: $scope.event.venue,
                            attachment: $scope.attachment,
                            project_id: $rootScope.globalProjectId._id,
                            invitee: $scope.invitee,
                            colour: $scope.event.color.primary,
                            start_date_time: new Date($scope.event.startsAt).getTime(),
                            end_date_time: new Date($scope.event.endsAt).getTime()
                        };
                        meetingsService.updateEvent($scope.updateEvtObj, function (response) {
                            if (response.data.statusCode == 200) {
                                $scope.addEventForm = false;
                                $scope.addEventForm = false;
                                $scope.updateEvtObj = {};
                                $scope.updateEvtObj.invitee = [];
                                $scope.invitee = [];
                                $element.modal('hide');
                                close(null, 200);
                                swal({
                                    title: 'Meeting updated successfully.',
                                    type: "success",
                                    //showCancelButton: true,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Ok",
                                    closeOnConfirm: true
                                },
                                function () {
                                    $state.reload();
                                    commonService.closePopup(); // hide processing popup                              
                                    $window.scrollTo(0, 0);
                                })
                            } else {
                                swal({
                                    title: (response.data.statusCode == 500) ? "Technical error. Please try again later" : ((response.data.statusCode == 408) ? "Server is not responding. Please try again later" : response.data.message),
                                    type: "warning",
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Ok",
                                    closeOnConfirm: true
                                },
                                function () {
                                    commonService.closePopup();
                                    $window.scrollTo(0, 0);
                                })
                            }
                        });
                    } else {
                        swal({
                            title: 'Please select project',
                            type: "warning",
                            //showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Ok",
                            closeOnConfirm: true
                        },
                        function () {
                            commonService.closePopup();
                            $window.scrollTo(0, 0);
                        })
                    }
                }


                $scope.closeUpdateEvent = function () {
                    console.log("refresh");
                    $state.reload();
                    // $element.modal('hide');
                    // close(null, 200);
                }



                /// remove attachment ////
                $scope.removeFile = function (id, fileId, index) {
                    // console.log(fileId, +" and " + id);
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
                        var data = {
                            'meeting_id': id,
                            'attachment_id': [fileId]
                        };
                        meetingsService.deleteAttachment(data, function (response) {
                            if (response.data.statusCode == 200) {
                                $scope.event.attachments.splice(index, 1);
                                // $element.modal('hide');
                                // close(null,200);                                     
                                // // swal("Deleted!", "Data has been deleted.", "success");
                                //  swal({
                                //     title: 'Attachment deleted successfully.',
                                //     type: "success",
                                //     confirmButtonColor: "#DD6B55",
                                //     confirmButtonText: "Ok",
                                //     closeOnConfirm: true
                                // },
                                // function () {
                                //     $state.reload();
                                commonService.closePopup(); // hide processing popup
                                //     $window.scrollTo(0, 0);
                                // })
                            } else {
                                swal({
                                    title: (response.data.statusCode == 500) ? "Technical error. Please try again later" : ((response.data.statusCode == 408) ? "Server is not responding. Please try again later" : response.data.message),
                                    type: "warning",
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Ok",
                                    closeOnConfirm: true
                                },
                                function () {
                                    commonService.closePopup();
                                    $window.scrollTo(0, 0);
                                })
                            }
                        });

                    });
                }
// remove attachment ends ///



            },
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function () {
                $state.reload();
                //     // $scope.message = "You said " + result;
            });
        });
    }

    $scope.eventClicked = function (event) {
        $scope.showModal('Clicked', event, 'manage_meeting');
        //alert.show('Clicked', event);
    };

    $scope.eventEdited = function (event) {
        $scope.showModal('Edited', event, 'manage_meeting');
        //alert.show('Edited', event);
    };

    $scope.eventDeleted = function (event) {
        $scope.showModal('Deleted', event, 'manage_meeting');
        //alert.show('Deleted', event);
    };

    $scope.eventTimesChanged = function (event) {
        $scope.viewDate = event.start_date_time;
        $scope.showModal('Dropped', event, 'manage_meeting');
        //alert.show('Dropped or resized', event);
    };

    $scope.toggle = function ($event, field, event) {
        $event.preventDefault();
        $event.stopPropagation();
        event[field] = !event[field];
    };

    $scope.timespanClicked = function (date, cell) {
        if ($scope.calendarView === 'month') {
            if (($scope.cellIsOpen && moment(date).startOf('day').isSame(moment($scope.viewDate).startOf('day'))) || cell.events.length === 0 || !cell.inMonth) {
                $scope.cellIsOpen = false;
            } else {
                $scope.cellIsOpen = true;
                $scope.viewDate = date;
            }
        } else if ($scope.calendarView === 'year') {
            if (($scope.cellIsOpen && moment(date).startOf('month').isSame(moment($scope.viewDate).startOf('month'))) || cell.events.length === 0) {
                $scope.cellIsOpen = false;
            } else {
                $scope.cellIsOpen = true;
                $scope.viewDate = date;
            }
        }
    };

    $scope.getEvents = function () {

        $scope.evntObj = {};
        if ($rootScope.globalProjectId) {
            $scope.evntObj.project_id = $rootScope.globalProjectId._id;
            $scope.myEvents($scope.evntObj);
        } else {
            swal({
                title: 'Please select project',
                ype: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            },
            function () {

                $window.scrollTo(0, 0);
            })
        }
    }

////// get all meetins ///


    $scope.myEvents = function (data) {
        commonService.loadingPopup();
        meetingsService.getEvents(data, function (response) {

            if (response.data.statusCode == 200) {
                $scope.addEventForm = false;
                angular.forEach(response.data.data, function (item) {
                    $scope.meetingCancel = false;
                    $scope.cancelReason = [];
                    var meetingActions = [];
                    var inviteeList = [];
                    if (item.status == 0) {
                        $scope.meetingCancel = true;
                    }
                    if (item.invited_by.email == $scope.userData.email) {
                        meetingActions = allActions;
                    }
                    else {
                        meetingActions = actions;
                    }
                    angular.forEach(item.invitee, function (pitem) {
                        if (pitem.is_mandatory == 1 && pitem.is_confirmed == 0) {
                            $scope.cancelReason.push({
                                'cancelBy': pitem.user_id.first_name,
                                'cancelCause': pitem.reason
                            });
                        }
                        // console.log($scope.cancelReason);
                        if (pitem.user_id != null) {
                            inviteeList.push({
                                'id': pitem.user_id._id,
                                'name': pitem.user_id.first_name,
                                'email': pitem.user_id.first_name + " (" + pitem.user_id.email + ")",
                                'required': pitem.is_mandatory,
                                'is_confirmed': (pitem.is_confirmed == 1 || pitem.is_confirmed == 0) ? pitem.is_confirmed : '',
                                'reason': pitem.reason ? pitem.reason : '',
                            });
                        }
                    });
                    // console.log(inviteeList);
                    $scope.events.push({
                        id: item._id,
                        tags: inviteeList,
                        title: item.title,
                        description: item.description,
                        venue: item.venue,
                        attachments: (item.attachment && item.attachment.length) > 0 ? item.attachment : [],
                        startsAt: item.start_date_time, //  moment(new Date(item.start_date_time)).format("DD MMM YYYY hh:mm a"), //item.start_date_time,//moment().(item.start_date_time).format("DD MMM YYYY"),
                        endsAt: item.end_date_time, // moment(new Date(item.end_date_time)).format("DD MMM YYYY hh:mm a"), // item.end_date_time,
                        start_date_time: item.start_date_time,
                        end_date_time: item.end_date_time,
                        color: item.colour ? {'primary': item.colour, 'secondary': item.colour} : {'primary': '#9be1f7', 'secondary': '#9be1f7'},
                        draggable: false,
                        resizable: false,
                        actions: meetingActions,
                        meetingCancel: $scope.meetingCancel,
                        cancelReason: $scope.cancelReason,
                        cssClass: 'cal-custom-class ',
                        invited_by: item.invited_by
                    });

                });
                $timeout(commonService.closePopup(), 1000); // hide processing popup
            } else {

                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);

            }
        });
    }
////// get all meetins ends ///


////// add meeting event  ///
    $scope.addEvent = function () {
        $scope.eventObj.start_date_time = new Date($scope.obj.start_date_time).getTime();
        // var start_date_selected = moment($scope.obj.start_date_time).format('YYYY-MM-DD');
        //         $scope.eventObj.start_date_time = moment(start_date_selected).unix();
        $scope.eventObj.end_date_time = new Date($scope.obj.end_date_time).getTime();
        console.log($scope.obj.end_date_time)
        // var end_date_selected = moment($scope.obj.end_date_time).format('YYYY-MM-DD');
        //        $scope.eventObj.end_date_time = moment(end_date_selected).unix();
        // console.log( $scope.eventObj.start_date_time, $scope.eventObj.end_date_time)
        $scope.eventObj.invitee = [];
        angular.forEach($scope.user, function (item) {
            $scope.eventObj.invitee.push({'user_id': item.id, 'is_mandatory': item.required});
        });
        // console.log($scope.eventObj.invitee);
        $scope.eventObj.invitee = JSON.stringify($scope.eventObj.invitee);
        if ($rootScope.globalProjectId) {
            $scope.eventObj.project_id = $rootScope.globalProjectId._id;
            commonService.loadingPopup(); // start processing popup
            meetingsService.createEvent($scope.eventObj, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.addEventForm = false;
                    $scope.eventObj = {};
                    $scope.obj.start_date_time = '';
                    $scope.obj.end_date_time = '';
                    $scope.event.tags = [];
                    $scope.eventObj.invitee = [];
                    swal({
                        title: 'Meeting scheduled successfully',
                        type: "success",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                    },
                            function () {
                                $state.reload();
                                commonService.closePopup();
                                $window.scrollTo(0, 0);
                            });
                } else {
                    swal({
                        title: (response.data.statusCode == 500) ? "Technical error. Please try again later" : ((response.data.statusCode == 408) ? "Server is not responding. Please try again later" : response.data.message),
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true
                    },
                    function () {
                        commonService.closePopup();
                        angular.element("html, body").animate({scrollTop: angular.element(document).height()}, 1000);
                    })
                }
            });
        } else {
            swal({
                title: 'Please select project',
                type: "warning",
                //showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            },
            function () {
                $window.scrollTo(0, 0);
            })
        }

    };
////// add meeting event ends ///

    $scope.cancel = function () {
        $scope.eventObj = {};
        $scope.user = [];
        $scope.eventObj.invitee = [];
        $scope.addEventForm = false;

    }

////// get user list ///
    $scope.getUsers = function () {
        if ($rootScope.globalProjectId) {
            var project_id = $rootScope.globalProjectId._id;

            meetingsService.getUsers(project_id, function (response) {
                if (response.data.statusCode == 200) {
                    angular.forEach(response.data.data.resources, function (item) {
                        if (item.status != 3) {
                            $scope.available_users.push({'id': item._id, 'name': item.first_name, 'required': 1, 'email': item.first_name + " (" + item.email + ")"});
                        }
                    });

                } else {
                    // commonService.closePopup();
                    swal({
                        title: (response.data.statusCode == 500) ? "Technical error. Please try again later" : ((response.data.statusCode == 408) ? "Server is not responding. Please try again later" : response.data.message),
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true
                    },
                    function () {
                        $window.scrollTo(0, 0);
                    })
                }
            });
        } else {
            swal({
                title: 'Please select project',
                type: "warning",
                //showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            },
            function () {
                $window.scrollTo(0, 0);
            })
        }
    };
////// get user list ends///


/// open add event form //
    $scope.openAddEventForm = function () {
        $scope.addEventForm = true;
        angular.element("html, body").animate({scrollTop: angular.element(document).height()}, 1000);
    }
//// open add event form ends //

    $scope.getUsers();
});
