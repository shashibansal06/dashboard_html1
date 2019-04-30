/*
 * @file: userCtrl.js
 * @description:This file is used to control all function related to users
 * */

angular.module("ignitrack").controller("userCtrl", function ($scope, $cookieStore, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, userService, commonService, roleService, socket, Upload, BASE_PATH, toastr, IMAGE_URL) {
    $scope.heading = "Users";
    var action = $state.current.name;

    $scope.baseUrl = BASE_PATH;
    $scope.image_url = IMAGE_URL;
    /*
     * @name : Delete User
     * @Discription : Delete user function by id
     */
    $scope.deleteUser = function (id) {
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
            $scope.deleteUserRecord(id, 3);
        });
    }

    /*
     * @name : Deactive/Actiavte User
     * @Description : Deactive/Actiavte user by user id , status
     */
    $scope.changeStatus = function (id, status) {
        commonService.loadingPopup(); // start processing popup
        $scope.deleteUserRecord(id, status);
    }

    /* Remove user form database */
    $scope.deleteUserRecord = function (id, status) {
        commonService.loadingPopup(); // start processing popup
        $scope.request = {user_id: id, user_status: status};
        userService.deleteUser($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    $scope.getAllUsers('all'); // Load all user data
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }
    /*  Delete user ends here */

    /*
     * @name : Get User's departments listing
     * @Discription : get all user's listing in admin section
     */
    $scope.departments = [];
    $scope.getDepartments = function () {
        userService.getDepartments({skip: 0, limit: 20}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.departments = response.data.data.departments;
            }
        });
    }

    $scope.processes = [];
    $scope.getProcess = function () {
        userService.getProcess({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.processes = response.data.data;
            }
        });
    }


    /*
     * @name : Get supervisors listing
     * @Discription : get all supervisors user's listing in admin section
     */
    $scope.supervisor = [];
    $scope.getSupervisors = function () {
        userService.getSupervisors({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.supervisors = response.data.data;
            }
        });
    }


    /*
     * @name : fetch Admin Profile
     * @Discription : function that fetch Admin information
     */
    $scope.fetchProfile = function () {
        $scope.getDepartments();
        commonService.loadingPopup();
        userService.getProfile({}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.user = response.data.data;
                $scope.url = $scope.baseUrl + 'attachment/admin/' + $scope.user.profile_pic;
                $timeout(commonService.closePopup(), 200); // hide processing popup

            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    /*
     * @name : Update admin Profile 
     * @Discription : function that Update Admin information
     */

    $scope.Adminprofile = function () {
        commonService.loadingPopup();
        $scope.user.dept_id = $scope.user.dept_id._id;

        var request = {'email': $scope.user.email, 'git_user_name': ($scope.user.git_user_name == null) ? '' : $scope.user.git_user_name, "gender": ($scope.user.gender == null) ? '' : $scope.user.gender, 'phone_number': ($scope.user.phone_number == null) ? '' : $scope.user.phone_number, 'first_name': $scope.user.first_name, 'last_name': ($scope.user.last_name == null) ? '' : $scope.user.last_name, "dept_id": $scope.user.dept_id, };
        userService.updateProfile(request, function (response) {
            if (response.data.statusCode == 200) {
                // $scope.user = response.data.data;
                swal({title: "Success!", text: response.data.message, type: 'success', confirmButtonText: "OK"},
                function () {
                    $scope.fetchProfile(); // Load all user data                
                });
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }

    $scope.clearFilter = function () {
        $state.reload();
        /*
         $scope.role_id = {_id: ''};
         $scope.department_id = {_id: ''};
         $scope.search = '';
         $scope.key_to_sort = 'created_at';
         $scope.is_ascending = true;
         
         $scope.user_sort_by = {
         first_name: {
         isCurrentSort: $scope.key_to_sort == 'first_name' ? true : false,
         order: $scope.is_ascending == true ? 'asc' : 'desc'
         },
         last_name: {
         isCurrentSort: $scope.key_to_sort == 'last_name' ? true : false,
         order: $scope.is_ascending == true ? 'asc' : 'desc'
         },
         dept_id: {
         isCurrentSort: $scope.key_to_sort == 'dept_id' ? true : false,
         order: $scope.is_ascending == true ? 'asc' : 'desc'
         },
         email: {
         isCurrentSort: $scope.key_to_sort == 'email' ? true : false,
         order: $scope.is_ascending == true ? 'asc' : 'desc'
         },
         role_id: {
         isCurrentSort: $scope.key_to_sort == 'role_id' ? true : false,
         order: $scope.is_ascending == true ? 'asc' : 'desc'
         },
         created_at: {
         isCurrentSort: $scope.key_to_sort == 'created_at' ? true : false,
         order: $scope.is_ascending == true ? 'asc' : 'desc'
         }
         };
         $scope.getAllUsers('sort');*/
    }


    $scope.uploadpic = function (file) {
        // commonService.loadingPopup();
        if ($scope.user.profile_pic) {
            var data = {
                type: 1,
                file: $scope.user.profile_pic
            }
            Upload.upload({
                method: 'PUT',
                url: $scope.baseUrl + 'v1/user/upload_file',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                data: data
            }).then(function (response) {
                //******* call loader true ***********//
                if (response.data.statusCode == 200) {
                    // commonService.closePopup();
                    // $scope.user = response.data.data;
                    $state.reload();
                    // $timeout(commonService.closePopup(), 200); // hide processing popup

                } else {
                    swal("Oops...", response.data.message, response.data.status);
                }
            });
        }

    }

    /*
     * @name : Get User's roles listing
     * @Discription : get all user's listing in admin section
     */
    $scope.roles = [];

    $scope.getRoles = function () {
        roleService.getRolesList({skip: 0, limit: 20}, function (response) {
            if (response.data.statusCode == 200) {
                $scope.roles = response.data.data.records;
            }
        });
    }


    /*
     * @name : Get User's listing
     * @Discription : get all user's listing in admin section
     */
    /* Paginations parameters for user's listing admin */
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    /* Filters parameters for user's listing admin */
    $scope.role_id = {_id: ''};
    $scope.department_id = {_id: ''};
    $scope.search = '';
    $scope.key_to_sort = 'created_at';
    $scope.is_ascending = true;
    /* Sorting parameters for user's listing admin */
    $scope.user_sort_by = {
        first_name: {
            isCurrentSort: $scope.key_to_sort == 'first_name' ? true : false,
            order: $scope.is_ascending == true ? 'asc' : 'desc'
        },
        last_name: {
            isCurrentSort: $scope.key_to_sort == 'last_name' ? true : false,
            order: $scope.is_ascending == true ? 'asc' : 'desc'
        },
        dept_id: {
            isCurrentSort: $scope.key_to_sort == 'dept_id' ? true : false,
            order: $scope.is_ascending == true ? 'asc' : 'desc'
        },
        email: {
            isCurrentSort: $scope.key_to_sort == 'email' ? true : false,
            order: $scope.is_ascending == true ? 'asc' : 'desc'
        },
        role_id: {
            isCurrentSort: $scope.key_to_sort == 'role_id' ? true : false,
            order: $scope.is_ascending == true ? 'asc' : 'desc'
        },
        created_at: {
            isCurrentSort: $scope.key_to_sort == 'created_at' ? true : false,
            order: $scope.is_ascending == true ? 'asc' : 'desc'
        }
    };

    $scope.getAllUsers = function (type) {
        commonService.loadingPopup(); // start processing popup
        $scope.getRoles(); // Get all roles
        $scope.getDepartments(); // Get all departments
        $scope.getSupervisors();
        $scope.getProcess();
        if (type == 'search' || type == 'role' || type == 'department' || type == 'sort') {
            // If user filter by any search cretaria the pagination parameters re-initialize
            $scope.skip = 0;
            $scope.limit = 10;
            $scope.currentPage = 1;
        }
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;

        $scope.request = {
            search: $scope.search,
            role_id: $scope.role_id == null ? '' : $scope.role_id._id,
            department_id: $scope.department_id == null ? '' : $scope.department_id._id,
            key_to_sort: $scope.key_to_sort,
            is_ascending: $scope.is_ascending,
            skip: $scope.skip,
            limit: $scope.limit
        };
        userService.getUsers($scope.request, function (response) {
            $timeout(commonService.closePopup(), 200); // hide processing popup
            if (response.data.statusCode == 200) {
                $scope.list = response.data.data;

            } else {
                var data = {title: 'oops', text: 'Error occurred. Please try after some time.', type: 'error'};
                commonService.showMessage(data);
            }
        });
    }
    /*
     * @name : User listing sort
     * @Description : function that create a user and send invitation for next profile compilations
     */
    $scope.userSort = function (key, type) {

        $scope.key_to_sort = key;
        $scope.is_ascending = type == 'asc' ? true : false;

        $scope.user_sort_by = {
            first_name: {
                isCurrentSort: key == 'first_name' ? true : false,
                order: $scope.is_ascending == true && key == 'first_name' ? 'asc' : 'desc'
            },
            last_name: {
                isCurrentSort: key == 'last_name' ? true : false,
                order: $scope.is_ascending == true && key == 'last_name' ? 'asc' : 'desc'
            },
            last_name: {
                isCurrentSort: key == 'last_name' ? true : false,
                order: $scope.is_ascending == true && key == 'last_name' ? 'asc' : 'desc'
            },
            dept_id: {
                isCurrentSort: key == 'dept_id' ? true : false,
                order: $scope.is_ascending == true && key == 'dept_id' ? 'asc' : 'desc'
            },
            email: {
                isCurrentSort: key == 'email' ? true : false,
                order: $scope.is_ascending == true && key == 'email' ? 'asc' : 'desc'
            },
            role_id: {
                isCurrentSort: key == 'role_id' ? true : false,
                order: $scope.is_ascending == true && key == 'role_id' ? 'asc' : 'desc'
            },
            created_at: {
                isCurrentSort: key == 'created_at' ? true : false,
                order: $scope.is_ascending == true && key == 'created_at' ? 'asc' : 'desc'
            }
        };
        $scope.getAllUsers('sort');

    }

    /*
     * @name : Invite a user
     * @Description : function that create a user and send invitation for next profile compilations
     */
    $scope.inviteUser = function () {
        $scope.user = [];
        ModalService.showModal({
            templateUrl: 'directive_templates/modals/invite_user.html',
            controller: 'userChildCtrl',
            scope: $scope
        }).then(function (modal) {
            modal.element.modal();
            /*angular.element(document).on('shown.bs.modal', function (e) {
             angular.element('input:visible:enabled:first', e.target).focus();
             });*/
        });
    }

    /*
     * @name : View a user
     * @Discription : function that create a user and send invitation for next profile compilations
     */
    $scope.viewUser = function (id) {
        commonService.loadingPopup(); // start processing popup
        var data = {user_id: id};
        userService.viewUser(data, function (response) {
            if (response.data.statusCode == 200) {
                $scope.user_info = response.data.data;

                $timeout(commonService.closePopup(), 200); // hide processing popup
                ModalService.showModal({
                    templateUrl: 'directive_templates/modals/view_user.html',
                    controller: 'userChildCtrl',
                    scope: $scope
                }).then(function (modal) {
                    modal.element.modal();
                });
            } else {
                var data = {title: 'oops', text: 'Error occurred. Please try after some time.', type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    $scope.editUser = function (id) {
        commonService.loadingPopup(); // start processing popup
        var data = {user_id: id};
        userService.viewUser(data, function (response) {
            $scope.user = response.data.data;
            $scope.user.date_of_birth = $scope.user.date_of_birth * 1000;
            $scope.user.date_of_joining = $scope.user.date_of_joining * 1000;

            $timeout(commonService.closePopup(), 200); // hide processing popup
            ModalService.showModal({
                templateUrl: 'directive_templates/modals/edit_user.html',
                controller: 'userChildCtrl',
                scope: $scope
            }).then(function (modal) {
                modal.element.modal();
            });
        });
    }

    /*
     * Name : check token expiry
     * Description : Function to get all roles
     */
    $scope.checkUserToken = function (request_from) {
        commonService.loadingPopup(); // start processing popup
        $scope.request = {check_expiry: request_from, token: $state.params.token};

        userService.checkTokenExpiry($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                $timeout(commonService.closePopup(), 2000); // hide processing popup
            } else {
                swal({
                    title: "oops!",
                    text: response.data.message,
                    type: 'error',
                    confirmButtonText: "OK"
                }, function () {
                    $state.go('/');
                });
            }
        });
    }

    /*
     *  Name : Signup
     *  Description : Function to signup user & login
     */
    $scope.signup = function () {
        commonService.loadingPopup(); // start processing popup
        $scope.request = {password: $scope.user.password, register_token: $state.params.token};
        userService.signup($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                /*  socket.emit('verifyConnectionNew', {token: response.headers('x-logintoken')}, function (data) {
                 //console.log(data);
                 }); */
                var data = {title: 'Success', text: response.data.message, type: 'success'};
                commonService.showMessage(data);
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }


    $rootScope.$on("CallManageUsers", function (event, args) {
        $scope.getAllUsers('all');
    });


    /*
     *  Name : resetPassword
     *  Description : Function to show reset password page
     */
    $scope.resetPassword = function () {
        commonService.loadingPopup(); // start processing popup
        $scope.request = {new_password: $scope.user.password, reset_password_token: $state.params.token};

        userService.resetPassword($scope.request, function (response) {
            if (response.data.statusCode == 200) {
                var data = {title: 'Success', text: response.data.message, type: 'success'};
                commonService.showMessage(data);
                $timeout($state.go('/'), 3000); // hide processing popup
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }



    $scope.closeModal = function () {
        angular.element('.modal-backdrop,.modal').remove();
    }


    /*
     *  Name : updatePassword
     *  Description : Function to supdate logged in user password
     */
    $scope.updatePassword = function () {
        var request = {old_password: $scope.user.old_password, new_password: $scope.user.new_password};
        userService.updatePassword(request, function (response) {
            if (response.data.statusCode == 200) {
                var data = {title: 'Success', text: response.data.message, type: 'success'};
                $scope.user = '';
                $scope.submitted = false;
                $scope.forgot.$setUntouched();
                commonService.showMessage(data);
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }

        });
    }



    /*
     * @name : Open date picker
     * @description : function to open date picker
     *                functions to open datepicker
     */


    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        //dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: '',
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

    $scope.open2 = function () {
        $scope.popup2.opened = true;
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

    $scope.popup2 = {
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


});
angular.module("ignitrack").controller("userChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, userService, close, $element, Upload) {

    /*
     * Name : Invite A User Modal function
     * Description : Function to create new user and send invitation
     */
    $scope.inviteUser = function () {
        console.log($scope.user.process_id._id);
        commonService.loadingPopup(); // start processing popup
        var data = {first_name: $scope.user.first_name, last_name: ($scope.user.last_name != undefined && $scope.user.last_name != null) ? $scope.user.last_name : '', email: $scope.user.email, supervisor_id: $scope.user.supervisor_id._id, department_id: $scope.user.department_id._id, process: $scope.user.process_id._id, role_id: $scope.user.role_id._id, productivity_hours: $scope.user.productivity_hours};
        userService.createUser(data, function (response) {
            switch (response.status) {
                case 200:
                    if (response.data.statusCode == 200) {
                        $scope.closeModal();
                        $rootScope.$emit("CallManageUsers");
                    } else {
                        var data = {title: 'oops', text: response.data.message, type: 'error'};
                        commonService.showMessage(data);
                    }
                    break;
                default:
                    var data = {title: 'oops', text: response.data.message, type: 'error'};
                    commonService.showMessage(data);
            }
        });
    }

    /*
     *  Name : updatePassword
     *  Description : Function to supdate logged in user password
     */
    $scope.updatePassword = function () {
        var request = {old_password: $scope.user.old_password, new_password: $scope.user.new_password};
        userService.updatePassword(request, function (response) {
            if (response.data.statusCode == 200) {
                var data = {title: 'Success', text: response.data.message, type: 'success'};
                $scope.user = '';
                $scope.submitted = false;
                $scope.forgot.$setUntouched();
                commonService.showMessage(data);
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        });
    }

    /*
     * Name : Update A User Modal function
     * Description : Function to update a user
     */
    $scope.updateUser = function () {
        commonService.loadingPopup(); // start processing popup
        //console.log($scope.user.date_of_joining); return false;
        var data = {
            user_id: $scope.user._id,
            first_name: $scope.user.first_name,
            last_name: ($scope.user.last_name == undefined || $scope.user.last_name == null) ? '' : $scope.user.last_name,
            email: $scope.user.email,
            git_user_name: ($scope.user.git_user_name == undefined || $scope.user.git_user_name == null) ? '' : $scope.user.git_user_name,
            productivity_hours: $scope.user.productivity_hours,
            supervisor_id: $scope.user.supervisor_id._id,
            dept_id: $scope.user.dept_id._id,
            process: $scope.user.process._id,
            role_id: $scope.user.role_id._id
        };

        if ($scope.user.hr_rating != undefined && $scope.user.hr_rating != '') {
            data.hr_rating = $scope.user.hr_rating;
        }

        if ($scope.user.date_of_joining != undefined && $scope.user.date_of_joining != '') {
            var date_of_joining = moment($scope.user.date_of_joining).format('YYYY-MM-DD');
            $scope.user.date_of_joining = moment(date_of_joining).unix();
            data.date_of_joining = $scope.user.date_of_joining;
        }

        if ($scope.user.date_of_birth != undefined && $scope.user.date_of_birth != '') {
            var date_of_birth = moment($scope.user.date_of_birth).format('YYYY-MM-DD');
            $scope.user.date_of_birth = moment(date_of_birth).unix();
            data.date_of_birth = $scope.user.date_of_birth;
        }


        userService.updateUser(data, function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                swal({title: "Updated!", text: 'User has been updated.', type: 'success', confirmButtonText: "OK"},
                function () {
                    $rootScope.$emit("CallManageUsers"); // Load all user data
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

