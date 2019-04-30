angular.module("ignitrack").controller("releaseCtrl", function ($q, $scope, $interpolate, $state, $rootScope, $window, toastr, releaseService, sprintService, userStoryService, ModalService, commonService) {
    $scope.heading = "Releases";
    var action = $state.current.name;


    $scope.project_data = [];
    $scope.plan_detail = [];
    $scope.project_search = '';
     $scope.ckeckList = [];
    $scope.currentPageBuild = 1;
    $scope.skip_build = 0;
    $scope.limit_build = 10;

    $scope.maxSize = 5;


    $scope.currentPagePlan = 1;
    $scope.skip_plan = 0;
    $scope.limit_plan = 10;



    $scope.project_id = $scope.projectheaderId._id;
    $scope.search = '';

    $scope.selected_userstory_error = true;


    $scope.rejection = {};


    $scope.resetFilters = function () {
        $state.reload();
    };


    /*
     * 
     * Function to confirm the plan is going to be deleted
     * 
     */
    $scope.deleteReleasePlan = function (id) {
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
            $scope.deletePlan(id);
        });
    }

    /*
     * 
     * Function to delete release plan
     * 
     */
    $scope.deletePlan = function (id) {
        commonService.loadingPopup(); // start processing popup
        var request = {plan_id: id};
        releaseService.deletePlan(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.release_data = true;
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "Ok"},
                function () {
                    $scope.getPlans();
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * 
     * Function to get all plans
     * 
     */
    $scope.getPlans = function () {
        commonService.loadingPopup(); // start processing popup

        $scope.skip_plan = ($scope.currentPagePlan - 1) * $scope.limit_plan;


        var request = {
            project_id: $scope.project_id,
            skip: $scope.skip_plan,
            limit: $scope.limit_plan,
            search: ($scope.search != undefined) ? $scope.search : ''
        };

        releaseService.getPlans(request, function (response) {
            commonService.closePopup();

            if (response.data.statusCode == 200) {
                $scope.release_data = true;
                $scope.plan_detail = response.data.data.result;
                $scope.total_records = response.data.data.total_records;
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }


    /*
     * 
     * Function to
     * 
     */
    $scope.editPlanModal = function (plan_id) {
        commonService.loadingPopup(); // start processing popup
        releaseService.viewPlan({plan_id: plan_id}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.plan_data = response.data.data;
                ModalService.showModal({
                    templateUrl: 'views/releases/create_plan_modal.html',
                    controller: 'releaseChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    commonService.closePopup();
                    modal.element.modal();
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }

        });
    }

    $scope.createPlanModal = function () {

        //commonService.loadingPopup(); // start processing popup
        ModalService.showModal({
            templateUrl: 'views/releases/create_plan_modal.html',
            controller: 'releaseChildCtrl',
            scope: $scope
        }).then(function (modal) {
            $scope.plan_data = {};
            //commonService.closePopup();
            modal.element.modal();
        });
    }


    $scope.rejectBuildModal = function (id) {
        $scope.rejection = {build_id: id};

        ModalService.showModal({
            templateUrl: 'views/releases/reject_build_modal.html',
            controller: 'releaseChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }
    $scope.addReleasePlanModal = function () {
        ModalService.showModal({
            templateUrl: 'views/releases/reject_build_modal.html',
            controller: 'releaseChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
        });
    }


    /*
     * 
     * Function to create a new build 
     * 
     */
    $scope.releaseBuild = function () {
        commonService.loadingPopup(); // start processing popup
        sprintService.getSprintsName({project_id: $scope.project_id}, function (response) {
            commonService.closePopup();
            if (response.data.statusCode == 200) {
                $scope.release_data = true;
                $scope.sprint_data = response.data.data;
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * 
     * Function to get all builds 
     * 
     */
    $scope.getAllBuilds = function () {
        commonService.loadingPopup(); // start processing popup
        $scope.skip_build = ($scope.currentPageBuild - 1) * $scope.limit_build;

        if ($scope.sprint_id && $scope.sprint_id != undefined) {
            var request = {project_id: $scope.project_id, sprint_id: $scope.sprint_id, skip: $scope.skip_build, limit: $scope.limit_build};
        } else {
            sprintService.getSprintsName({project_id: $scope.project_id}, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.sprint_data = response.data.data;
                }
            });
            var request = {project_id: $scope.project_id, skip: $scope.skip_build, limit: $scope.limit_build};
        }



        releaseService.getAllBuilds(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.release_data = true;
                $scope.build_detail = response.data.data.result;
                $scope.build_total = response.data.data.total_records || 0;
                commonService.closePopup();
            } else if (response.data.type == 'NOT_AUTHORIZED') {
                $scope.release_data = false;
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * 
     * Function to get all us according to the sprints
     * 
     */

    $scope.getUserStoriesOfSprint = function () {
        if ($scope.payload.sprint_id != undefined) {
            var request = {
                sprint_id: $scope.payload.sprint_id,
                skip: 0,
                limit: 100000,
            };
            var methods = {
                user_stories: sprintService.getUserStoriesOfSprint(request),
                user_story_status: releaseService.getEnvironmentData({type: 6}),
            };
            var set = 0;
            /* Fetch data*/
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
                    $scope.release_data = false;
                    return false;
                }
                else if (response.length > 0) {
                    swal("Oops...", 'Technical error. Please try again later', 'error');
                } else {
                    $scope.release_data = true;
                    $scope.user_stories = methods.user_stories.data.data.result;

                    $scope.partial_build_count = methods.user_stories.data.data.partial_build_count || 1;



                    $scope.user_story_total = methods.user_stories.data.data.total_records || 0;
                    $scope.user_story_status = methods.user_story_status.data.result;

                    commonService.closePopup();
                }
            });
        } else {
            $scope.user_story_total = 0;
            $scope.user_stories = [];
            $scope.releaseBuild();
        }

    }


    /* Check all user stories */
    $scope.checkListAll = function (event) {
        $scope.userstoryUnselected = true;
        $scope.ckeckList = [];
        if ($scope.main_checklist == true) {
            for (var i = 0; i < $scope.user_stories.length; i++) {
                $scope.user_stories[i].user_story_id.selected = 1;
                $scope.selected_userstory_error = false;
            }
            $scope.ckeckList = angular.copy($scope.user_stories);
        } else {
            for (var i = 0; i < $scope.user_stories.length; i++) {
                $scope.user_stories[i].user_story_id.selected = 0;
                $scope.selected_userstory_error = true;
            }
            $scope.ckeckList = [];
        }

    }

    /*
     * 
     * Function to check user story select
     * 
     */
    $scope.checkSelected = function(event,userStory){
        var index = $scope.ckeckList.indexOf(userStory);
            $scope.userstoryUnselected = true;
            if (event.target.checked ) {
                $scope.ckeckList.push(userStory);
            }else{
               $scope.ckeckList.splice(index._id,1); 
            }
    }


    /*
     * 
     * Function to save new build
     * 
     */
    $scope.createBuild = function () {
        $scope.build_submitted = true;
        // console.log($scope.new_form_data)
        if ($scope.user_stories.length == 0) {
            $scope.selected_userstory_error = true;
        }
        for (var i = 0; i < $scope.user_stories.length; i++) {
            if ($scope.user_stories[i].user_story_id.selected == 0) {
                $scope.selected_userstory_error = true;
            }
        }
        if (!$scope.selected_userstory_error) {
            commonService.loadingPopup(); // start processing popup
            $scope.new_form_data = [];

            angular.forEach($scope.user_stories, function (item) {
                if (item.user_story_id.selected == 1) {
                    $scope.new_form_data.push({
                        user_story_id: item.user_story_id._id,
                        user_story_priority: item.status._id,
                        user_story_status: item.development_status
                    });
                }
            });


            var request = {
                project_id: $scope.project_id,
                sprint_id: $scope.payload.sprint_id,
                release_notes: $scope.payload.release_notes,
                user_stories: $scope.new_form_data
            }

            releaseService.createBuild(request, function (response) {

                if (response.data.statusCode == 200) {
                    $scope.release_data = true;
                    var data = {title: 'Success', text: response.data.message, type: 'success'};
                    commonService.showMessage(data);

                    $scope.user_stories = {};
                    $scope.payload = {};
                    $scope.user_story_total = 0;
                    $scope.partial_build_count = 0;
                    $scope.build_submitted = false;
                    $scope.build_form.$setUntouched();

                } else {
                    var data = {title: 'Oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        }

    }


    /*
     * 
     * Function to show error for create build api
     * 
     */
    $scope.clearError = function () {
        $scope.selected_userstory_error = false;
    }



    /*
     * 
     * Function to confirm the plan is going to be deleted
     * 
     */
    $scope.receiveBuildConfirmation = function (id) {
        swal({
            title: "Are you sure?",
            text: "You you sure you want to acknowledge this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, acknowledge it!",
            closeOnConfirm: false,
            html: false
        }, function () {
            $scope.receiveBuild(id);
        });
    }

    /*
     * 
     * Function to delete release plan
     * 
     */
    $scope.receiveBuild = function (id) {
        commonService.loadingPopup(); // start processing popup
        var request = {build_status: 1, build_id: id};
        releaseService.buildStatus(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.release_data = true;
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "Ok"},
                function () {
                    $scope.getAllBuilds();
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * 
     * Function to delete release plan
     * 
     */
    $scope.buildDetail = function () {
        commonService.loadingPopup(); // start processing popup
        releaseService.viewBuild({build_id: $state.params.id}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.release_data = true;
                commonService.closePopup();
                $scope.build_detail = response.data.data;
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    /*
     * 
     * Function to view build detail 
     * 
     */
    $scope.approveBuildDetail = function () {
        commonService.loadingPopup(); // start processing popup
        releaseService.viewBuild({build_id: $state.params.id}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.release_data = true;
                commonService.closePopup();
                $scope.build_detail = response.data.data;
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * 
     * Function to give build acceptance
     * 
     */
    $scope.acceptBuild = function () {
        $scope.form_data = [];

        angular.forEach($scope.build_detail.user_stories_for_partial_builds, function (item) {
            $scope.form_data.push({
                user_story_id: item.user_story_id._id,
                user_story_status: item.user_story_status._id,
                accepted_rejected_status: item.user_story_id.accepted_rejected_status,
                user_story_priority: item.user_story_priority._id
            });
        });

        var request_edit = {
            release_notes: $scope.build_detail.user_stories_for_partial_builds.rejection_notes,
            build_status: 2,
            build_id: $state.params.id,
            user_stories: $scope.form_data
        }

        releaseService.buildStatus(request_edit, function (response) {
            if (response.data.statusCode == 200) {
                $scope.release_data = true;
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "Ok"},
                function () {
                    $state.go('main.releases.manageRealeses');
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }

    /*
     * Function to fetch all projects plans* */
    $rootScope.$on("CallPlansInfo", function (event, args) {
        $scope.getPlans();
    });

    /*
     * Function to fetch all projects plans* */
    $rootScope.$on("CallAllBuilds", function (event, args) {
        $scope.getAllBuilds();
    });

})



angular.module("ignitrack").controller("releaseChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, releaseService, $injector, close, $element) {


    //function to create new plan 
    $scope.addPlan = function () {

        if ($scope.plan_data._id && $scope.plan_data._id != undefined) {
            var request = {
                plan_id: $scope.plan_data._id,
                title: $scope.plan_data.title,
                frequency: $scope.plan_data.frequency
            }
            releaseService.updatePlan(request, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.closeModal();
                    swal({title: "Success", text: response.data.message, type: 'success'},
                    function () {
                        $rootScope.$emit("CallPlansInfo"); // Load all phaese data after modal close
                    });
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        } else {
            var request = {
                title: $scope.plan_data.title,
                frequency: $scope.plan_data.frequency,
                project_id: $scope.project_id
            }
            releaseService.createPlan(request, function (response) {
                if (response.data.statusCode == 200) {
                    $scope.closeModal();
                    swal({title: "Success", text: response.data.message, type: 'success'},
                    function () {
                        $rootScope.$emit("CallPlansInfo"); // Load all phaese data after modal close
                    });
                } else {
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
                }
            });
        }

    }


    $scope.rejectBuild = function () {
        var request = {
            build_id: $scope.rejection.build_id,
            build_status: 3,
            release_notes: $scope.rejection.rejection_notes
        }

        releaseService.buildStatus(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                swal({title: "Success", text: response.data.message, type: 'success'},
                function () {
                    $rootScope.$emit("CallAllBuilds"); // Load all phaese data after modal close
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });

    }


    $scope.closeModal = function () {
        $element.modal('hide'); //  Manually hide the modal using bootstrap.
        close(null, 500); //  Now close as normal, but give 500ms for bootstrap to animate
    }
});
