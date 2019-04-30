/**
 * file : sprintCtrl.js 
 * description : controller for sprint page
 * author: prabhjot_kaur
 * created date 22 May 2017
 */
angular.module('ignitrack').controller("sprintCtrl", function ($scope, $filter, $q, $state, $rootScope, $stateParams, $window, ModalService, sprintService, commonService, projectService, BASE_PATH, releaseService, dashboardService, activityService) {


    //Function to update comments on real time basis
    $scope.$on('eventSprint', function (event, data) {
        if ($state.current.name == "issues") {
            $scope.getSprints();
        }
    });

    $scope.baseUrl = BASE_PATH;
    $scope.addSprint = false;
    $scope.sprintObj = {};
    $scope.sprintObj.phase_id = '';
    $scope.release_plans = [];
    $scope.skip = 0;
    $scope.limit = 500;
    $scope.skip_sprints = 0;
    $scope.limit_sprints = 10;
    $scope.currentPageSprint = 1;
    $scope.skip_userstory = 0;
    $scope.limit_userstory = 500;
    $scope.currentPageUserStory = 1;
    $scope.maxSize = 5;
    $scope.showResourceModal = false;


    $scope.dateOptions = {
        //minDate: ($scope.projectStartDate && ($scope.projectStartDate > new Date())) ? new Date($scope.projectStartDates) : new Date(),
        minDate: '',
        maxDate: null,
        startingDay: 1,
        dateDisabled: function disabled(data) {
            var date = data.date,
                    mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }
    };


    // $scope.setEndDate = function (){
    //     $scope.dateEndOptions.minDate = new Date($scope.sprintObj.start_date);
    //     // $scope.sprintObj.end_date = new Date($scope.sprintObj.start_date);
    // }
    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function () {
        $scope.popup2.opened = true;
    };

    $scope.popup1 = {
        opened: false
    };

    $scope.popup2 = {
        opened: false
    };


    ///// total productivity hours of resources all added /////
    $scope.getTotal = function () {
        var plannedTime = '', burnnedHours = '', totalplannedtime_hours = 0, totalplannedtime_minutes = 0, totalburnedtime_hours = 0, totalburnedtime_minutes = 0;
        var output_hours = 0, output_minutes = 0;
        for (var i = 0; i < $scope.sprints.length; i++) {
            var sprint = $scope.sprints[i];
            // var time = sprint.planned_time.split(':');

            // plannedTime = sprint.planned_time ? (sprint.planned_time.split(':')) : 0;
            // if (!plannedTime[1] || plannedTime[1] == 'NaN') {
            //     plannedTime[1] = '00';
            // }
            // totalplannedtime_hours += parseInt(plannedTime[0]);
            // totalplannedtime_minutes += parseInt(plannedTime[1]);
            // if (totalplannedtime_minutes >= 60) { // Divide minutes by 60 and add result to hours
            //     totalplannedtime_hours += Math.floor(parseInt(totalplannedtime_minutes) / 60);
            //     totalplannedtime_minutes = parseInt(totalplannedtime_minutes) % 60;
            // }
            // totalplannedtime_minutes = totalplannedtime_minutes != 0 ? totalplannedtime_minutes : '00';
            // $scope.totalPlannedHours = totalplannedtime_hours + ':' + totalplannedtime_minutes;

            // if (sprint.burnedHour != 0) {
            //    var burnnedHours = sprint.burnedHour ? (sprint.burnedHour.split(':')) : 0;
            //     if (!burnnedHours[1] || burnnedHours[1] == 'NaN' || burnnedHours[1] == 'undefined') {
            //         burnnedHours[1] = '00';
            //     }
            //     totalburnedtime_hours += parseInt(burnnedHours[0]);
            //     totalburnedtime_minutes += parseInt(burnnedHours[1]);
            //     if (totalburnedtime_minutes >= 60) { // Divide minutes by 60 and add result to hours
            //         totalburnedtime_hours += Math.floor(parseInt(totalburnedtime_minutes) / 60);
            //         totalburnedtime_minutes = parseInt(totalburnedtime_minutes) % 60;
            //     }

            //     totalburnedtime_minutes = (totalburnedtime_minutes < 10 && totalburnedtime_minutes.toString().length == 1) ? '0' + totalburnedtime_minutes : totalburnedtime_minutes;

            //     // totalburnedtime_minutes = totalburnedtime_minutes != 0 ? totalburnedtime_minutes : '00';
            //     $scope.totalBurnedHours = totalburnedtime_hours + ':' + totalburnedtime_minutes;
            // }


            output_hours = totalplannedtime_hours - totalburnedtime_hours;
            if (totalplannedtime_minutes < totalburnedtime_minutes) {
                output_hours = output_hours - 1;
                totalplannedtime_minutes = totalplannedtime_minutes + 60;
            }
            output_minutes = totalplannedtime_minutes - totalburnedtime_minutes;
            output_minutes = output_minutes != 0 ? output_minutes : '00';

            // $scope.totalSprintHours += sprint.sprintHour ? parseInt(sprint.sprintHour) : 0;
            // $scope.totalPlannedHours += sprint.planned_hours ? parseInt(sprint.planned_hours) : 0;
            // $scope.totalContiHours += sprint.contigency_hours ? parseInt(sprint.contigency_hours) : 0;
            // $scope.totalBurnedHours += sprint.burnedHour ? parseInt(sprint.burnedHour):0;           
        }
        $scope.totalOutput = output_hours + ':' + output_minutes;
    }
    ///// total productivity hours of resources all added ends /////



    ///// get list of sprint status /////
    $scope.getSprintStatus = function () {
        $scope.sprintStatus = [];
        var request = {type: 6};
        activityService.getStatus(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.sprintStatus = response.data.data;
            } else {
                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }
    ///// get list of sprint status ends /////




    $scope.getProjectsPhaseInfo = function () {
        var request = {project_id: $rootScope.globalProjectId._id, skip: $scope.skip, limit: $scope.limit};
        projectService.getProjectsPhaseInfo(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_phase_info = response.data.data.records;
                commonService.closePopup();
            } else {
                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    ///// check phase has user stories /////
    $scope.checkProjectUserStories = function () {
        if ($scope.sprintObj.phase_id) {
            var request = {phase_id: $scope.sprintObj.phase_id._id, project_id: $rootScope.globalProjectId._id};
            sprintService.checkProjectUserStories(request, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.nophaseuserstory = true;
                    // commonService.closePopup();
                    $scope.getSprints();
                } else {
                    $scope.nophaseuserstory = false;
                    swal({
                        title: 'Oops',
                        text: response.data.message,
                        type: "error",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                    },
                            function () {
                                $scope.getSprints();
                            });
                    // var data = {title: 'Oops', text: response.data.message, type: 'error'};
                    // commonService.showMessage(data);
                }
            });
        } else {
            $scope.getSprints();
        }
    }
    ///// check phase has user stories ends /////


    ///// get list of project's release plan /////
    $scope.getProjectsReleasePlan = function () {
        var request = {project_id: $rootScope.globalProjectId._id, skip: $scope.skip, limit: $scope.limit, search: ''};
        releaseService.getPlans(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.release_plans = response.data.data.result;
                commonService.closePopup();
            } else {
                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }
    ///// get list of project's release plan ends /////


    ///// change sprint status /////
    $scope.changeSprintStatus = function (id, status) {
        commonService.loadingPopup();
        var request = {sprint_id: id, sprint_status: status._id};
        sprintService.changeSprintStatus(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.getSprints();
                commonService.closePopup();
            } else {
                // var data = {title: 'Oops', text: response.data.message, type: 'error'};
            swal({
                title: 'Oops',
                text: response.data.message,
                type: "error",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true,
            },
            function () {
                $state.reload();
            });
                // commonService.showMessage(data);
            }
        });
    }
    ///// change sprint status ends /////



    $scope.editSprintModal = function (type) {
        ModalService.showModal({
            templateUrl: 'views/sprints/edit_sprint.html',
            controller: 'sprintCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }

    //   $scope.calcBusinessDays= function(startOn, new_end_date) { // input given as Date objects
    //   var iWeeks, iDateDiff, iAdjust = 0;
    //           if (new_end_date < startOn) return -1; // error code if dates transposed
    //           var iWeekday1 = startOn.getDay(); // day of week
    //           var iWeekday2 = new_end_date.getDay();
    //           iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1; // change Sunday from 0 to 7
    //           iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;
    //           if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1; // adjustment if both days on weekend
    //           iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1; // only count weekdays
    //           iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;

    //           // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
    //           iWeeks = Math.floor((new_end_date.getTime() - startOn.getTime()) / 604800000)

    //           if (iWeekday1 <= iWeekday2) {
    //             iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1)
    //           } else {
    //             iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2)
    //           }

    //           iDateDiff -= iAdjust // take into account both days on weekend
    //           $scope.differnece = iDateDiff ;// add 1 because dates are inclusive
    //           console.log($scope.differnece);
    // }



    ///// calculate end date for sprint ///
    $scope.calculateEndDate = function (type, prodHours) {
        var totalhours = 0, totalminutes = 0, days = 0, totalsec = 0, totalprodSec = 0;
        if ($scope.sprint_payload.planned_time) {
            var sprintdays = 0;
            var plannedTime = $scope.sprint_payload.planned_time.split(':');
            if (!plannedTime[1] || plannedTime[1] == 'NaN') {
                plannedTime[1] = 0;
            }
            totalhours = parseInt(plannedTime[0]);
            totalminutes = parseInt(plannedTime[1]);
            // totalsec = (totalhours * 3600) + (totalminutes * 60) ;
            if (totalminutes <= 60) { // Divide minutes by 60 and add result to hours
                totalhours += Math.floor(parseInt(totalminutes) / 60);
                totalminutes = parseInt(totalminutes) % 60;
                totalhours = (totalminutes < 60 && totalminutes > 0 )? totalhours + 1 : totalhours;
            }       
             // console.log($scope.totalProductivityHours, prodHours);              
            if (type == 'add') {               
                $scope.totalProductivityHours += prodHours;//parseInt(itemHours);
                // totalprodSec =  $scope.totalProductivityHours * 3600;
                // days = totalhours % $scope.totalProductivityHours;
                sprintdays = ($scope.totalProductivityHours != 0) ? totalhours / $scope.totalProductivityHours : 0;
            } else if (type == 'remove') {
                $scope.totalProductivityHours -= prodHours; // parseInt(itemHours);
                // totalprodSec =  $scope.totalProductivityHours * 3600;
                // days = totalhours % $scope.totalProductivityHours;
                sprintdays = ($scope.totalProductivityHours != 0) ? totalhours / $scope.totalProductivityHours : 0;
            }

            sprintdays = sprintdays.toString();
            var remainder = sprintdays.split(".");
            if(remainder[1] && remainder[1]>0){
                sprintdays = parseInt(remainder[0]) + 1;
            }
            // if(days>0 && days < 5 ){
            //     sprintdays = sprintdays + 1;
            // }
            // console.log(sprintdays);
            var mydate = moment(new Date($scope.sprint_payload.start_date * 1000));//$filter('convert_dateformat')($scope.sprint_payload.start_date);   
            // sprintdays = sprintdays-1;  //// -1 cause this one day is the start day.             
            // var startOn = new Date(mydate); // moment(mydate).format('YYYY-MM-DD');
            // var endOn = startOn.add(sprintdays, 'days'); 
            // // console.log(startOn,endOn)
            // $scope.calcBusinessDays(startOn,endOn);
            // var startFormatedDate = startOn.format("YYYY-MM-DD");
            if (sprintdays > 0) {
                var startDate = new Date(mydate); //startOn;        

                var count = 0;
                var workdays = 0
                while (workdays < sprintdays) {
                    var dayOfWeek = startDate.getDay();
                    if (dayOfWeek == 6) {
                        count++;
                    } else if (dayOfWeek == 0) {
                        count++;
                    } else {
                        workdays++;
                    }
                    startDate.setDate(startDate.getDate() + 1);
                    // console.log(moment(startDate).unix());
                }

                // var actual_sprintdays = sprintdays + count -1; //totalSundays + totalSaturdays ;
                // console.log(actual_sprintdays,'actual_sprintdays');
                // var start_date =  moment(new Date($scope.sprint_payload.start_date * 1000));
                // // console.log(start_date,$scope.sprint_payload.start_date * 1000);
                // $scope.sprint_payload.end_date = start_date.add(actual_sprintdays, 'days'); 
                // console.log(startDate,"startDate");         
                // if(totalsec<=totalprodSec){
                    startDate.setDate(startDate.getDate() - 1);
                // }
                // console.log(moment(startDate).unix(),"startDate"); 
                $scope.sprint_payload.end_date = startDate;
                $scope.sprint_payload.end_date.setHours(23, 59, 59);
                var date_selected = moment($scope.sprint_payload.end_date).format('YYYY-MM-DD HH:mm');
                $scope.sprint_payload.end_date = moment(date_selected).unix();
                $scope.sprint_payload.end_date = $scope.sprint_payload.end_date * 1000;
                // console.log($scope.sprint_payload.end_date);  
                // $scope.endDate = $scope.sprint_payload.end_date ;
               
                $scope.dateEndOptions = {
                   // minDate: $scope.sprint_payload.end_date ? $scope.sprint_payload.end_date : new Date(), // ($scope.sprint_payload.start_date && ($scope.sprint_payload.start_date * 1000 > new Date())) ? new Date($scope.sprint_payload.start_date * 1000) : new Date(),
                    minDate: '',
                    maxDate: null,
                    startingDay: 1,
                    dateDisabled: function disabled(data) {
                        var date = data.date,
                                mode = data.mode;
                        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                    }
                };                
                // $scope.sprint_payload.end_date = $scope.sprint_payload.end_date * 1000;               
            } else
            {
                delete $scope.sprint_payload.end_date;
            }
        } else {
            swal({"title": "Planned hours are not available", "type": "warning"});
        }
    }
    ///// calculate end date for sprint ends ///




    ///// resouce modal for sprint ///
    $scope.resourcesModal = function (event,index, resource) {
        var context = this;
              
        // $scope.productivity_hours =0;
        $scope.productivity_hours = context.resource.productivity_hours;
        
        if(context.showResourceModal==false){
            ModalService.showModal({
                templateUrl: 'views/sprints/final_resources.html',                
                backdrop: 'static',
                keyboard: false,
                controller: function ($scope, $element, close) {
                   
                    // angular.element('#modalID').modal({
                    //     backdrop: 'static',
                    //     keyboard: false
                    // });
                    context.showResourceModal = true;
                    ///// select resouces for sprint ///
                    $scope.selectResource = function () {
                        commonService.loadingPopup(); // start processing popup
                        // resource.delete = true;
                        $scope.resource_id.push({'resource_id': resource._id, 'productivity_hours': $scope.productivity_hours});
                        $scope.arrayResourceId.push({'user_id': resource._id});
                        // var profilePic = $scope.baseUrl + 'attachment/admin/'+resource.profile_pic;                   
                        $scope.sprint_available_resources.unshift({'index': index, 'productivity_hours': $scope.productivity_hours, 'delete': true, 'resource_id': {'_id': resource._id, 'first_name': resource.first_name, 'last_name': resource.last_name, 'email': resource.email, 'profile_pic': resource.profile_pic, 'role_id': resource.role_id, 'dept_id': resource.dept_id}});
                        // $scope.addedResourceIds.push({'index': index, 'productivity_hours': $scope.productivity_hours, 'delete': true, 'resource_id': {'_id': resource._id, 'first_name': resource.first_name, 'last_name': resource.last_name, 'email': resource.email, 'profile_pic': resource.profile_pic, 'role_id': resource.role_id, 'dept_id': resource.dept_id}});
                        $scope.addedResourceIds.push(resource);
                        // $scope.sprint_available_resources.unshift({'_id':resource._id,'first_name':resource.first_name,'last_name':resource.last_name ? resource.last_name:'','email':resource.email,'role_id':resource.role_id,'delete':resource.delete});

                        // $scope.project_available_resources.splice(index, 1);
                        angular.forEach($scope.project_available_resources, function(r_item){                        
                            if(resource._id==r_item._id){
                                var indx = $scope.project_available_resources.indexOf(r_item);
                                $scope.project_available_resources.splice(indx, 1);
                            }             
                        });
                        this.calculateEndDate('add', $scope.productivity_hours);
                        context.showResourceModal =false;
                        commonService.closePopup();
                        $element.modal('hide');
                        close(null, 100);
                        angular.element('.modal-backdrop').remove();
                    }
                    ///// select resouces for sprint ends ///   


                    $scope.closeResourceModal = function(){
                        context.showResourceModal =false;
                    }         
                },
                scope: $scope
            }).then(function (modal) {
                modal.element.modal();               
            });
        }
    }
    ///// resouce modal for sprint ends ///



    ///// remove resouces for sprint ///
    $scope.deleteResource = function (index, resource) {
        // console.log(resource);
        // console.log($scope.resource_id);
        commonService.loadingPopup(); // start processing popup
        delete resource.delete;

        angular.forEach($scope.resource_id, function(r_item){                        
            if(resource.resource_id._id==r_item.resource_id._id){
                var indx = $scope.resource_id.indexOf(r_item);
                $scope.resource_id.splice(indx, 1);
            }             
        });

        
        angular.forEach($scope.addedResourceIds, function(r_item){                        
            if(resource.resource_id._id==r_item._id){
                var indx = $scope.resource_id.indexOf(r_item);
                $scope.resource_id.splice(indx, 1);
            }             
        });

        // console.log($scope.sprint_available_resources);
        // angular.forEach($scope.sprint_available_resources, function(r_item){                        
        //     if(resource.resource_id._id==r_item.resource_id._id){
        //         var indx = $scope.resource_id.indexOf(r_item);
        //         $scope.resource_id.splice(indx, 1);
        //     }             
        // });






        // $scope.resource_id.splice(index, 1);
        // $scope.arrayResourceId.splice(index, 1);
        // $scope.addedResourceIds.splice(index, 1);
        $scope.sprint_available_resources.splice(index, 1);
        $scope.calculateEndDate('remove', resource.productivity_hours);
        $scope.project_available_resources.unshift({'index': index, '_id': resource.resource_id._id, 'productivity_hours': resource.productivity_hours, 'first_name': resource.resource_id.first_name, 'last_name': resource.resource_id.last_name, 'email': resource.resource_id.email, 'profile_pic': resource.resource_id.profile_pic, 'role_id': resource.resource_id.role_id, 'dept_id': resource.resource_id.dept_id});
        // $scope.project_available_resources.unshift(resource);

        // $scope.sprint_available_resources_count = $scope.sprint_available_resources_count - 1;
        commonService.closePopup();
    }
    ///// remove resouces for sprint ends ///


    //// *** // add resources to sprint from sprint list  page ////
    $scope.addResource_sprint = function (sprintId, plannhours, phaseId) {
        console.log(phaseId)
        if (phaseId) {
            if (plannhours) {
                $state.go("sprintResources", {sid: sprintId, pid: phaseId, prjId: $rootScope.globalProjectId._id});
            } else {
                swal({"title": "Planned hours are not available for this sprint.", "type": "warning"});
            }
        } else {
            swal({"title": "Please select phase to add resources", "type": "warning"});
        }
    }
    //// *** // add resources to sprint from sprint list  page ends ////





    //// pop up for add basic info for sprint ///
    $scope.basicinfoModal = function () {
        var context = this;
        $scope.prjStartDate = context.projectStartDate;
        if ($scope.prjStartDate) {
            if ($scope.sprintObj.phase_id) {
                if ($scope.nophaseuserstory == true) {
                    var phaseId = $scope.sprintObj.phase_id;
                    $scope.addSprint = false;
                    $scope.sprintObj = {};
                    $scope.sprintObj.phase_id = phaseId;
                    $scope.sprintObj.type = 2;
                    $scope.submitted = false;
                    // $scope.addSprintForm.$setUntouched(); 
                    ModalService.showModal({
                        templateUrl: 'views/sprints/basic_info.html',
                        controller: function ($scope, $element, close) {

                            // this.project_release_plan = $scope.project_release_plan;
                            //// Add sprint //////
                            $scope.addsprint = function () {
                                var releasePlan = $scope.sprintObj.release_plan_id;
                                // $scope.start_date = new Date($scope.sprintObj.start_date).getTime();
                                var date_selected = moment($scope.start_date).format('YYYY-MM-DD HH:mm');
                                $scope.sprintObj.start_date = moment(date_selected).unix();
                                // console.log($scope.sprintObj.start_date );
                                // $scope.sprintObj.end_date = new Date($scope.sprintObj.end_date).getTime();
                                $scope.sprintObj.phase_id = $scope.sprintObj.phase_id._id;
                                $scope.sprintObj.release_plan_id = $scope.sprintObj.release_plan_id._id;
                                $scope.sprintObj.project_id = $rootScope.globalProjectId._id;
                                commonService.loadingPopup(); // start processing popup
                                sprintService.create_sprint($scope.sprintObj, function (response) {
                                    if (response.data.statusCode == 200) {
                                        $scope.newSprintId = response.data.data._id;
                                        // $scope.sprintObj = {}; 
                                        $scope.sprintObj.phase_id = phaseId;
                                        $scope.submitted = false;
                                        $scope.addSprintForm.$setUntouched();
                                        swal({
                                            title: response.data.message,
                                            type: "success",
                                            confirmButtonColor: "#DD6B55",
                                            confirmButtonText: "Ok",
                                            closeOnConfirm: true,
                                        },
                                                function () {
                                                    // commonService.closePopup();
                                                    $element.modal('hide');
                                                    close(null, 200);
                                                    angular.element('.modal-backdrop').remove();
                                                    $state.go("createSprint", {sid: $scope.newSprintId, pid: phaseId._id});
                                                });
                                    } else {
                                        $scope.sprintObj.release_plan_id = releasePlan;
                                        swal({
                                            title: (response.data.statusCode == 500) ? "Technical error. Please try again later" : ((response.data.statusCode == 408) ? "Server is not responding. Please try again later" : response.data.message),
                                            type: "warning",
                                            confirmButtonColor: "#DD6B55",
                                            confirmButtonText: "Ok",
                                            closeOnConfirm: true
                                        },
                                        function () {
                                            $scope.sprintObj.phase_id = phaseId;
                                            // $scope.addSprintForm.$setUntouched();                                          
                                            // commonService.closePopup();
                                            // $element.modal('hide');
                                            // close(null,200);
                                            // $window.scrollTo(0, 0);
                                            // $("html, body").animate({ scrollTop: $(document).height() }, 1000);
                                        })
                                    }
                                });
                            }
                            //// Add sprint ends  //////
                        },
                        scope: $scope
                    }).then(function (modal) {
                        modal.element.modal();
                    });
                } else {
                    swal({"title": "No user story available for this phase.", "type": "warning"});
                }
            } else {
                // $scope.addSprint=true;
                swal({"title": "Please select phase to add sprint.", "type": "warning"});
            }
        } else {
            swal({"title": "Please fill project start date to create sprint.", "type": "warning"});
        }
    }
    //// pop up for add basic info for sprint ends ///




    ///get all sprints of the project ////
    $scope.getSprints = function () {
		$scope.sprints = [];
        commonService.loadingPopup();
        $scope.totalPlannedHours = 0;
        $scope.totalContiHours = 0;
        $scope.totalBurnedHours = 0;
        $scope.skip_sprints = ($scope.currentPageSprint - 1) * $scope.limit_sprints;
        var request = {};
        if ($scope.sprintObj.phase_id) {
            var request = {project_id: $rootScope.globalProjectId._id, phase_id: $scope.sprintObj.phase_id._id, skip: $scope.skip_sprints, limit: $scope.limit_sprints};
        } else {
            var request = {project_id: $rootScope.globalProjectId._id, skip: $scope.skip_sprints, limit: $scope.limit_sprints};
        }
        dashboardService.getProjectSprints(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.sprints = response.data.data.allSprintData;
                $scope.totalBurnedHours = (response.data.data.sprintTotalBurnedHour) ? response.data.data.sprintTotalBurnedHour : '00.00';
                $scope.totalPlannedHours = response.data.data.TotalPlannedHours;

                angular.forEach($scope.sprints, function (item) {
                    //     var time = item.planned_time.split(':');                    
                    //     // var minutes_length = time[1].toString().length;
                    //     // if(minutes_length==1){
                    //     //     time[1] = '0'+time[1];
                    //     // }
                    //     if (time[0] < 10 && time[0].toString().length == 1) {
                    //         time[0] = '0' + time[0];
                    //     }
                    //     if (time[1] < 10 && time[1].toString().length == 1) {
                    //         time[1] = '0' + time[1];
                    //     }
                    //     item.planned_time = time[0] + ':' + time[1];
                    //     if(item.burnedHour && item.burnedHour !=0){
                    //         var b_time = item.burnedHour.split(':');
                    //         if (b_time[0] < 10 && b_time[0].toString().length == 1) {
                    //             b_time[0] = '0' + b_time[0];
                    //         }
                    //         if(!b_time[1] && b_time[1]==NaN){b_time[1] = 0;}
                    //         if (b_time[1] < 10 && b_time[1].toString().length == 1) {
                    //             b_time[1] = '0' + b_time[1];
                    //         }
                    //         item.burnedHour = ((b_time[0])?b_time[0]:item.burnedHour) + ':' + (b_time[1]?b_time[1]:00);
                    //     }
                    $scope.totalContiHours += item.contigency_hours ? parseInt(item.contigency_hours) : 0;
                });
                $scope.totalSprints = response.data.data.totalSprint;
                $scope.activities = response.data.data.Activity;
                if ($scope.totalBurnedHours) {
                    var sprintTotalBurnedHour = $scope.totalBurnedHours.split(':');
                }
                var totalPlannedHours = $scope.totalPlannedHours.split(':');
                var start = moment.utc(totalPlannedHours[0] + ':' + totalPlannedHours[1], "HH:mm");
                var end = moment.utc(sprintTotalBurnedHour[0] + ':' + sprintTotalBurnedHour[1], "HH:mm");

                var totalhoursSeconds = parseInt(totalPlannedHours[0]) * 60 * 60;
                var totalminutesSeconds = parseInt(totalPlannedHours[1]) * 60;
                var sprintTotalhoursSeconds = parseInt(sprintTotalBurnedHour[0]) * 60 * 60;
                var sprintTotalminutesSeconds = parseInt(sprintTotalBurnedHour[1]) * 60;
                var totalSeconds = totalhoursSeconds + totalminutesSeconds;
                var sprintTotalSeconds = sprintTotalhoursSeconds + sprintTotalminutesSeconds;
                var pendingSeconds = totalSeconds - sprintTotalSeconds;
                var pendingHours = Math.floor(pendingSeconds / 3600);
                var pendingMinutes = Math.floor((pendingSeconds - (pendingHours * 3600)) / 60);
                // console.log(pendingHours + ':' + pendingMinutes);


                var output = [];
                output[0] = parseInt(totalPlannedHours[0]) - parseInt(sprintTotalBurnedHour[0]);
                if (parseInt(sprintTotalBurnedHour[1]) > parseInt(totalPlannedHours[1])) {
                    output[0] = output[0] - 1;
                    totalPlannedHours[1] = parseInt(totalPlannedHours[1]) + 60;
                }
                output[1] = totalPlannedHours[1] - parseInt(sprintTotalBurnedHour[1]);
                output[0] = (output[0] == 0) ? "0"+output[0] : output[0];
                output[1] = (output[1] == 0) ? "0"+output[1] : output[1];
                output[0] = output[0].toString();
                output[1] = output[1].toString();

                
                if (output[0].toString().length == 1 && output[0] < 10) {
                    output[0] = "0" + output[0];
                }
                if (output[1].toString().length == 1 && output[1] < 10) {
                    output[1] = "0" + output[1];
                }
                $scope.totalOutput = output[0] + ':' + output[1];
                // console.log($scope.totalOutput)
                // $scope.getTotal();                
                commonService.closePopup();
            } else {
                // var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }
    /// get all sprints of the project ends //

    ///// get detail of sprint ///
    $scope.getSprintDetails = function () {
        var totalhours = 0;
        var totalminutes = 0;
        var sprintplantime = 0;
        $scope.skip_userstory = ($scope.currentPageUserStory - 1) * $scope.limit_userstory;
        sprintService.viewSprint({sprint_id: $stateParams.sid, phase_id: $stateParams.pid, type: 2, skip: $scope.skip_userstory, limit: $scope.limit_userstory}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.sprint_payload = response.data.data.sprint_details[0];
                $scope.sprint_payload.end_date = $scope.sprint_payload.end_date * 1000;
                $scope.sprint_userstories = response.data.data.user_story_details;
                $scope.sprint_userstories_count = $scope.sprint_userstories.length;
                angular.forEach($scope.sprint_userstories, function (item) {
                    var index = $scope.sprint_userstories.indexOf(item);
                    angular.forEach(item.estimations, function (e_item) {
                        var time = [];
                        time = e_item.approved_hours.split(':');
                        totalhours += parseInt(time[0]);
                        if (!time[1] || time[1] == 'NaN') {
                            time[1] = '00';
                        }
                        totalminutes += parseInt(time[1]);
                    });
                    if (totalminutes >= 60) { // Divide minutes by 60 and add result to hours
                        totalhours += Math.floor(totalminutes / 60);
                        totalminutes = totalminutes % 60;
                    }
                    if (totalhours < 10) {
                        totalhours = '0' + totalhours;
                    }
                    // var totmin_len = totalminutes.toString().length;
                    if (totalminutes < 10) {
                        totalminutes = '0' + totalminutes;
                    }
                    // else if(totmin_len==0){totalminutes = '00';}
                    totalminutes = totalminutes == 0 ? '00' : totalminutes;
                    var x = new Date(0, 0, 0, totalhours, totalminutes, 0);
                    var y = x.getHours();
                    var z = x.getMinutes();
                    $scope.sprint_userstories[index].totalhours = totalhours + ':' + totalminutes;
                    totalhours = 0;
                    totalminutes = 0;
                });
                $scope.totalRecords = response.data.data.total_userStories;
            } else {
                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }
    ///// get detail of sprint ends ///



    /// get priority ///
    $scope.getPriority = function () {
        $scope.priorities = [];
        var request = {type: 5};
        sprintService.getPriority(request, function (response) {
            if (response.data.statusCode == 200) {
                var data = response.data.result;
                angular.forEach(data, function (item) {
                    $scope.priorities.push({_id: item._id, name: item.name, type: item.type, musthave: true});
                });
                // $scope.priorities = response.data.result;
            } else {
                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }
    /// get priority ends ////



    /// get sprint available status ///
    $scope.getSprintAvailableStatus = function () {
        var request = {type: 6};
        sprintService.getSprintAvailableStatus(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.sprint_avail_status = response.data.data;
            } else {
                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }
    /// get sprint available status ends ////



    ///// check all user stoies ////
    $scope.checkAll = function (evt) {
        if ($scope.masterChecklist == true || evt.target.checked) {
            $scope.planned_time = "00:00";
            var ckeckList = [];
            var time = [];
            var plannedTime = [];
            var totalhours = 0, totalminutes = 0;
            for (var i = 0; i < $scope.sprint_userstories.length; i++) {
                $scope.sprint_userstories[i].isChecked = true;
                ckeckList.push($scope.sprint_userstories[i]);
                if ($scope.sprint_userstories[i].priority._id == "5922cc347b0522932e24275c") {
                    time = $scope.sprint_userstories[i].totalhours.split(':');
                    plannedTime = $scope.planned_time.split(':'); //parseInt($scope.planned_time)
                    if (!time[1] || time[1] == 'NaN') {
                        time[1] = '00';
                    }
                    totalhours = parseInt(plannedTime[0]) + parseInt(time[0]);
                    totalminutes = parseInt(plannedTime[1]) + parseInt(time[1]);
                    if (totalminutes >= 60) { // Divide minutes by 60 and add result to hours
                        totalhours += Math.floor(parseInt(totalminutes) / 60);
                        totalminutes = parseInt(totalminutes) % 60;
                    }
                    if (totalhours < 10) {
                        totalhours = '0' + totalhours;
                    }
                    // var totmin_len = totalminutes.toString().length;
                    if (totalminutes < 10) {
                        totalminutes = '0' + totalminutes;
                    }
                    totalminutes = totalminutes != 0 ? totalminutes : '00';
                    $scope.planned_time = totalhours + ':' + totalminutes;
                }
            }
            $scope.idsChecklist = angular.copy(ckeckList);
        } else if ($scope.masterChecklist == false || !evt.target.checked) {
            for (i = 0; i < $scope.sprint_userstories.length; i++) {
                $scope.sprint_userstories[i].isChecked = false;
            }
            $scope.planned_time = '00:00';
            $scope.idsChecklist = [];
        }
    }
    ///// check all user stories ends ////


    //// check uncheck user stories ///
    $scope.checkUnCheck = function (value, key, totalhours) {

        $scope.idsChecklist = [];
        var totalhours = 0, totalminutes = 0;
        var time = [];
        var plannedTime = [];
        // $scope.planned_time = '00.00';
        time = $scope.sprint_userstories[key].totalhours.split(':');
        plannedTime = $scope.planned_time.split(':'); //parseInt($scope.planned_time)
        if (!time[1] || time[1] == 'NaN') {
            time[1] = '00';
        }
        var x_time = new Date(0, 0, 0, parseInt(time[0]), parseInt(time[1]), 0);
        //var hours_time = x_time.getHours();
        //var minutes_time = x_time.getMinutes();

        var hours_time = time[0];
        var minutes_time = time[1];

        var x_plannedTime = new Date(0, 0, 0, parseInt(plannedTime[0]), parseInt(plannedTime[1]), 0);
//        var hours_plannedTime = x_plannedTime.getHours();
//        var minutes_plannedTime = x_plannedTime.getMinutes();

        var hours_plannedTime = plannedTime[0];
        var minutes_plannedTime = plannedTime[1];


        if (value == true) {
            if ($scope.sprint_userstories[key].priority._id == "5922cc347b0522932e24275c") {
                // time = totalhours.split(':');
                // plannedTime = $scope.planned_time.split(':'); //parseInt($scope.planned_time)
                // if(!time[1]||time[1]=='NaN'){time[1]='00';}

                // var x_time =  new Date(0,0,0,parseInt(time[0]),parseInt(time[1]),0); 
                // var hours_time = x_time.getHours();
                // var minutes_time = x_time.getMinutes();
                // var x_plannedTime = new Date(0,0,0,parseInt(plannedTime[0]),parseInt(plannedTime[1]),0);
                // var hours_plannedTime = x_plannedTime.getHours();
                // var minutes_plannedTime = x_plannedTime.getMinutes();

                totalhours = parseInt(hours_time) + parseInt(hours_plannedTime); //parseInt(plannedTime[0]) + parseInt(time[0]);
                totalminutes = parseInt(minutes_time) + parseInt(minutes_plannedTime); // parseInt(plannedTime[1]) + parseInt(time[1]);             
                if (totalminutes >= 60) { // Divide minutes by 60 and add result to hours
                    totalhours += Math.floor(parseInt(totalminutes) / 60);
                    totalminutes = parseInt(totalminutes) % 60;
                }
                if (totalhours < 10) {
                    totalhours = '0' + totalhours;
                }
                // var totmin_len = totalminutes.toString().length;
                if (totalminutes < 10) {
                    totalminutes = '0' + totalminutes;
                }
                totalminutes = totalminutes != 0 ? totalminutes : '00';
                $scope.planned_time = totalhours + ':' + totalminutes;
            }
        } else {
            // time = totalhours.split(':');
            // plannedTime = $scope.planned_time.split(':'); //parseInt($scope.planned_time)
            // if(!time[1]||time[1]=='NaN'){time[1]='00';}

            //  var x_time =  new Date(0,0,0,parseInt(time[0]),parseInt(time[1]),0); 
            // var hours_time = x_time.getHours();
            // var minutes_time = x_time.getMinutes();
            // var x_plannedTime = new Date(0,0,0,parseInt(plannedTime[0]),parseInt(plannedTime[1]),0);
            // var hours_plannedTime = x_plannedTime.getHours();
            // var minutes_plannedTime = x_plannedTime.getMinutes();
            if ($scope.sprint_userstories[key].priority._id == "5922cc347b0522932e24275c") {

                if (parseInt(plannedTime[1]) < parseInt(time[1])) {
                    plannedTime[0] = plannedTime[0] - 1;// totalhours = totalhours - 1;
                    plannedTime[1] = parseInt(plannedTime[1]) + 60;
                }
                totalhours = parseInt(plannedTime[0]) - parseInt(time[0]); //parseInt(hours_time) -  parseInt(hours_plannedTime);
                totalminutes = parseInt(plannedTime[1]) - parseInt(time[1]);  // parseInt(minutes_time) - parseInt(minutes_plannedTime);        

                // totalhours = parseInt(plannedTime[0]) - parseInt(time[0]);
                // if(parseInt(plannedTime[1]) < parseInt(time[1])){
                //     totalhours = totalhours -1;
                //     plannedTime[1] = parseInt(plannedTime[1]) + 60;
                // }
                // totalminutes = parseInt(plannedTime[1]) - parseInt(time[1]);              
                if (totalminutes >= 60) { // Divide minutes by 60 and add result to hours
                    totalhours += Math.floor(parseInt(totalminutes) / 60);
                    totalminutes = parseInt(totalminutes) % 60;
                }
                if (totalhours < 10) {
                    totalhours = '0' + totalhours;
                }
                // var totmin_len = totalminutes.toString().length;
                if (totalminutes < 10) {
                    totalminutes = '0' + totalminutes;
                }
                totalminutes = totalminutes != 0 ? totalminutes : '00';
                $scope.planned_time = totalhours + ':' + totalminutes;
            }
        }
        for (var i = 0; i < $scope.sprint_userstories.length; i++) {
            if ($scope.sprint_userstories[i].isChecked == true) {
                $scope.idsChecklist.push($scope.sprint_userstories[i]);
            }
        }
        if ($scope.idsChecklist.length == 0 || $scope.idsChecklist.length < $scope.sprint_userstories_count) {
            $scope.uncheckMasterCheck = false;
        } else if ($scope.idsChecklist.length == $scope.sprint_userstories_count) {
            $scope.uncheckMasterCheck = true;
        }
    }
    ///// check uncheck user stories ends ////

    $scope.$watch('checkUnCheck', function () {
        // alert('changed');
        if ($scope.idsChecklist) {
            if ($scope.idsChecklist.length == 0 || $scope.idsChecklist.length < $scope.sprint_userstories_count) {
                $scope.uncheckMasterCheck = false;
            } else if ($scope.idsChecklist.length == $scope.sprint_userstories_count) {
                $scope.uncheckMasterCheck = true;
            }
        }
    });



    //// check uncheck user stories ///
    $scope.checkPriority = function (index) {
        var totalhours = 0, totalminutes = 0;
        var time = $scope.sprint_userstories[index].totalhours.split(':');
        var plannedTime = $scope.planned_time.split(':'); //parseInt($scope.planned_time)
        if (!time[1] || time[1] == 'NaN') {
            time[1] = '00';
        }
        var x_time = new Date(0, 0, 0, parseInt(time[0]), parseInt(time[1]), 0);
        var hours_time = x_time.getHours();
        var minutes_time = x_time.getMinutes();
        var x_plannedTime = new Date(0, 0, 0, parseInt(plannedTime[0]), parseInt(plannedTime[1]), 0);
        var hours_plannedTime = x_plannedTime.getHours();
        var minutes_plannedTime = x_plannedTime.getMinutes();
        if ($scope.idsChecklist.length > 0) {
            angular.forEach($scope.sprint_userstories, function (item) {
                // var indx = $scope.sprint_userstories.indexOf(item);
                if (item._id == $scope.idsChecklist[index]._id) {
                    $scope.idsChecklist[index].priority = item.priority;
                }
            });
            if ($scope.sprint_userstories[index].isChecked == true && ($scope.priorities[index].musthave == true || $scope.idsChecklist[index].priority._id == "5922cc347b0522932e24275c")) {

                if ($scope.idsChecklist[index].priority._id == "5922cc347b0522932e24275c") {
                    $scope.priorities[index].musthave = true;
                    totalhours = parseInt(plannedTime[0]) + parseInt(time[0]); // parseInt(hours_time) +  parseInt(hours_plannedTime);
                    totalminutes = parseInt(plannedTime[1]) + parseInt(time[1]); //parseInt(minutes_time) + parseInt(minutes_plannedTime);            
                    if (totalminutes >= 60) { // Divide minutes by 60 and add result to hours
                        totalhours += Math.floor(parseInt(totalminutes) / 60);
                        totalminutes = parseInt(totalminutes) % 60;
                    }
                    if (totalhours < 10) {
                        totalhours = '0' + totalhours;
                    }
                    // var totmin_len = totalminutes.toString().length;
                    if (totalminutes < 10) {
                        totalminutes = '0' + totalminutes;
                    }
                    totalminutes = totalminutes != 0 ? totalminutes : '00';
                    $scope.planned_time = totalhours + ':' + totalminutes;
                    // $scope.planned_time = parseInt($scope.planned_time) + parseInt(item.totalhours);
                } else {
                    $scope.priorities[index].musthave = false;

                    if (parseInt(plannedTime[1]) < parseInt(time[1])) {
                        plannedTime[0] = plannedTime[0] - 1;// totalhours = totalhours - 1;
                        plannedTime[1] = parseInt(plannedTime[1]) + 60;
                    }
                    totalhours = parseInt(plannedTime[0]) - parseInt(time[0]); //parseInt(hours_time) -  parseInt(hours_plannedTime);
                    totalminutes = parseInt(plannedTime[1]) - parseInt(time[1]);
                    if (totalhours < 10) {
                        totalhours = '0' + totalhours;
                    }
                    // var totmin_len = totalminutes.toString().length;
                    if (totalminutes < 10) {
                        totalminutes = '0' + totalminutes;
                    }
                    totalminutes = totalminutes != 0 ? totalminutes : '00';
                    $scope.planned_time = totalhours + ':' + totalminutes;
                }
            }
        }
    }
    ///// check uncheck user stories ends ////



    //// add user stories to sprint ////
    $scope.addUserstroy = function () {
        var checkMusthave = [];
        $scope.user_stories = [];
        if ($scope.idsChecklist.length > 0) {
            angular.forEach($scope.idsChecklist, function (item) {
                if (item._id && item.priority) {
                    $scope.user_stories.push({user_story_id: item._id, status: item.priority._id});
                    // if(checkMusthave!=true || checkMusthave!=false){
                    //     console.log(checkMusthave);
                    //     checkMusthave = item.priority._id=='5922cc347b0522932e24275c' ? true : false;
                    //     console.log(checkMusthave);
                    // }
                } else {
                    swal({"title": "Please select priority for selected user story/stories.", "type": "warning"});
                }
            });
            checkMusthave = $filter('filter')($scope.user_stories, {status: '5922cc347b0522932e24275c'});
            // console.log(checkMusthave.length);
            if (checkMusthave.length > 0) {
                if ($scope.user_stories.length > 0) {
                    swal({
                        title: "Are you sure to add selected user story/stories?",
                        text: "Once added, user story/stories will be frozen!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, Add user story/stories!",
                        closeOnConfirm: false,
                        html: false
                    }, function () {
                        commonService.loadingPopup(); // start processing popup 
                        // console.log($scope.planned_time);
                        $scope.userStoryObj = {
                            "sprint_id": $stateParams.sid,
                            "planned_time": $scope.planned_time,
                            "user_stories": $scope.user_stories
                        };
                        sprintService.addUserstroy($scope.userStoryObj, function (response) {
                            $scope.user_stories = [];
                            $scope.planned_time = '';
                            if (response.data.statusCode == 200) {
                                swal({
                                    title: 'User story/stories added successfully.',
                                    type: "success",
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Ok",
                                    closeOnConfirm: true
                                },
                                function () {
                                    $state.reload();
                                    commonService.closePopup();
                                    $state.go("sprintResources", {sid: $stateParams.sid, pid: $stateParams.pid, prjId: $rootScope.globalProjectId._id});
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
                }
            } else {
                swal({"title": "Atleast one user story's priority should be 'Must Have'.", "type": "warning"});
            }
        } else {
            swal({"title": "Please select user story/stories.", "type": "warning"});
        }
    }
    //// add user stories to sprint ends ////




    ///// assign resourse to project //
    //Function to assign resources
    $scope.UserAdded = function () {
        commonService.loadingPopup(); // start processing popup 
        var date_selected = moment($scope.sprint_payload.end_date).format('YYYY-MM-DD HH:mm');
        $scope.end_date = moment(date_selected).unix();
        // console.log($scope.end_date);
        var request = {
            "sprint_id": $state.params.sid,
            "type": 1,
            "end_date": $scope.end_date,
            "sprint_resources": $scope.resource_id
        };
        sprintService.assignResourceToSprint(request, function (response) {
            if (response.data.statusCode == 200) {
                // $scope.getPageDetails($scope.methodsSprintResources);               
                swal({
                    title: 'Resource(s) assigned successfully.',
                    type: "success",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },
                function () {
                    $state.go('sprints');
                    $window.scrollTo(0, 0);
                })
                // commonService.closePopup();
            } else {

                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /// assign resourse to project ends //


    ///// get sprintResources page details ///
    $scope.getPageDetails = function (methods) {
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
                $scope.sprint_payload = methods.fetchSprint.data.data.sprint_details[0];
                // console.log($scope.sprint_payload.end_date);
                if ($scope.sprint_payload.end_date) {
                    $scope.sprint_payload.end_date = $scope.sprint_payload.end_date * 1000;
                    // console.log($scope.sprint_payload.end_date);
                }
                $scope.sprint_userstories = methods.fetchSprint.data.data.user_story_details;
                $scope.totalRecords = methods.fetchSprint.data.data.total_userStories;
                $scope.sprint_available_resources = methods.fetchSprint.data.data.sprint_details[0].sprint_resources;
                angular.forEach($scope.sprint_available_resources, function (item) {
                    // if(item!=null){
                    // $scope.sprint_available_resources.push(item);
                    $scope.resource_id.push({'resource_id': item.resource_id._id, 'productivity_hours': item.productivity_hours})
                    // $scope.arrayResourceId.push({'user_id':item._id});
                    $scope.totalProductivityHours += item.productivity_hours ? parseInt(item.productivity_hours) : 0;
                    // }                        
                });
                $scope.dateEndOptions = {
                    minDate: ($scope.sprint_payload.start_date && ($scope.sprint_payload.start_date * 1000 > new Date())) ? new Date($scope.sprint_payload.start_date * 1000) : new Date(),
                    maxDate: null,
                    startingDay: 1,
                    dateDisabled: function disabled(data) {
                        var date = data.date,
                        mode = data.mode;
                        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                    }
                };
            }
            // $scope.getProjectAssignedResources();
        });
    }
    ///// get sprintResources page details ends ///



    ///// get resources of the project ///
    $scope.getProjectAssignedResources = function () {

        $scope.project_resources = [];
        // console.log($scope.search_user, '$scope.search_user');
        var request = {project_id: $stateParams.prjId, sprint_id: $stateParams.sid, search: $scope.search_user, skip: 0, limit: 1000};
        // var request = {project_id: $rootScope.globalProjectId._id,sprint_id:$stateParams.sid,search:$scope.search_user,skip:0,limit:1000};
        sprintService.sprintAvailableResources(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.project_resources = response.data.data.records;
                if ($scope.addedResourceIds.length > 0) {
                    $scope.project_available_resources = [];
                    angular.forEach($scope.project_resources, function (item) {
                        // angular.forEach($scope.addedResourceIds, function (r_item) {
                        var indx = $filter('filter')($scope.addedResourceIds, {'_id': item._id});
                        // console.log(item._id, r_item._id, ' and ' , indx) ;                                                        
                        if (indx.length == 0) {
                            $scope.project_available_resources.push(item);
                        }
                        // });
                    });
                } else {
                    $scope.project_available_resources = $scope.project_resources;
                }
                // commonService.closePopup();
            } else {
                $scope.project_available_resources = [];
                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
        // }
    }
    ///// get resources of the project ends ///

    //////// get project details ///// 
    $scope.getprojectDetails = function () {
        $scope.projectDetails = [];
        var request = {projectId: $rootScope.globalProjectId._id, type: 1};
        projectService.getProjectsBasicInfo(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.projectDetails = response.data.result.allproject[0];
                $scope.projectStartDate = $scope.projectDetails.start_date;
                commonService.closePopup();
            } else {
                var data = {title: 'Oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    //// get project details ends /////

    //// get sprint detail to view ////
    $scope.getsprintdet = function (){
        $scope.skip_userstory = ($scope.currentPageUserStory - 1) * $scope.limit_userstory;
            sprintService.viewSprintDetail({sprint_id: $stateParams.sid, skip: $scope.skip_userstory, limit: $scope.limit_userstory}, function (response) {
                if (response.data.statusCode == 200)
                {   
					$scope.sprint_payload = response.data.data.sprint_details[0];
                    $scope.sprint_partial_builds = response.data.data.partial_builds || [];
                    $scope.sprint_userstories = response.data.data.sprint_details[0].user_stories;
                    $scope.sprint_userstories_count = $scope.sprint_userstories.length;
                    $scope.totalRecords = response.data.data.total_user_stories;
                 }
                else {
                    var data = {title: 'Oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
        });
    }
    //// get sprint detail to view end ///


    if ($state.$current.name == 'sprints') {
		if($state.params.phaseId != null ){
			$scope.sprintObj = { phase_id : { _id : $state.params.phaseId }  };
		}
		
		$scope.nophaseuserstory = false;
        $scope.getprojectDetails();
        $scope.getProjectsReleasePlan();
        $scope.getProjectsPhaseInfo();
        $scope.getSprints();
        $scope.getSprintStatus();
    }

    if ($state.$current.name == 'createSprint') {
        commonService.loadingPopup(); // start processing popup  
        $scope.prjctId = $stateParams.pid;
        $scope.userStoryObj = {};
        $scope.user_stories = [];
        $scope.sprintId = $stateParams.sid;
        $scope.masterChecklist = false;
        $scope.uncheckMasterCheck = false;
        $scope.idsChecklist = [];
        $scope.planned_time = '00:00';
        $scope.getPriority();
        $scope.getSprintDetails();

        commonService.closePopup();
    }

    if ($state.$current.name == 'ViewSprint') {
        commonService.loadingPopup(); 
        $scope.getsprintdet ();
        commonService.closePopup();
    }

    if ($state.$current.name == 'sprintResources') {
        commonService.loadingPopup(); // start processing popup    
        $scope.userStoryObj = {};
        $scope.user_stories = [];
        $scope.sprintId = $stateParams.sid;
        $scope.resource_id = [];
        $scope.totalProductivityHours = 0;
        $scope.sprint_available_resources = [];
        $scope.arrayResourceId = [];
        $scope.addedResourceIds = [];
        $scope.search_user = '';
        $scope.sprint_payload = [];
        $scope.skip_userstory = ($scope.currentPageUserStory - 1) * $scope.limit_userstory;
        $scope.methodsSprintResources = {
            fetchSprint: sprintService.viewSprint({sprint_id: $stateParams.sid, phase_id: $stateParams.pid, type: 2, skip: $scope.skip_userstory, limit: $scope.limit_userstory}), //function to fetch all brands
            // fetchSprintResources: sprintService.sprintAvailableResources({sprint_id: $stateParams.sid,project_id:$rootScope.globalProjectId._id,search:'',skip:$scope.skip_userstory,limit:$scope.limit_userstory}),
            // fetchProjectResources :sprintService.getProjectResources({project_id: $rootScope.globalProjectId._id,search:$scope.search_user},$scope.arrayResourceId)
        };
        $scope.getProjectAssignedResources();
        $scope.getPageDetails($scope.methodsSprintResources);

        // $scope.getSprintAvailableStatus();
        // $scope.getProjectResources();
        commonService.closePopup();
    }
});
