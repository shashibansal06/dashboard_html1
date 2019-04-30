/* Admin routing file
 * @file: routing.js
 * @description:
 * @author: Mukesh
 * @date: 08-03-2017
 * */

app.config(['$locationProvider', '$httpProvider', function ($locationProvider, $httpProvider) {
        $locationProvider.hashPrefix('');
        $httpProvider.interceptors.push('httpInjector');
    }]);
app.config(function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.when("/", "/login");
    $urlRouterProvider.when("", "/login");
    $urlRouterProvider.otherwise("404");
    $stateProvider
            .state('/', {
                url: "/login",
                templateUrl: "views/users/login.html",
                controller: "loginCtrl",
                authenticate: false,
                data: {
                    pageTitle: 'Ignitrack : Admin Login'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    store: function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load([{
                                name: "login",
                                files: [
                                    "controllers/loginCtrl.js",
                                    "services/userService.js",
                                    "assets/css/custom/login.css",
                                ]
                            }
                        ]);
                    }
                }
            })
            .state('main', {
                abstract: true,
                templateUrl: 'views/main.html',
                controller: "commonCtrl",
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    store: function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load([
                            {
                                files: [
                                    "services/socketService.js",
                                    "services/socketEventService.js",
                                    "controllers/commonCtrl.js",
                                    "controllers/headerCtrl.js",
                                    "services/userService.js",
                                    "directives/notificationDirective.js",
                                    "directives/commonDirective.js",
                                    "assets/css/custom/side_notification.css",
                                    "assets/css/custom/custom_style.css",
                                    "assets/css/custom/navigation.css",
                                ]
                            },
                            {
                                name: 'ngFileUpload',
                                files: [
                                    'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
                                    'node_modules/ng-file-upload/dist/ng-file-upload.min.js'
                                ]
                            },
                            {
                                name: 'checklist-model',
                                files: [
                                    'assets/js/checklist-model.js'
                                ]
                            },
                            {
                                name: 'ngMask',
                                files: [
                                    'node_modules/ng-mask/dist/ngMask.js'
                                ]
                            }
                        ]);
                    }
                }
            })
            .state('welcome', {
                url: "/welcome",
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/no_project_header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/users/dashboard.html',
                        controller: 'userCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Dashboard'
                },
                authenticate: true,
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "dashboard",
                                    files: [
                                        "directives/commonDirective.js",
                                        "controllers/userCtrl.js",
                                        "services/roleService.js",
                                        "directives/accordian_toggle.js",
                                        "assets/css/custom/projects.css",
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.timesheet', {
                url: "/timesheet",
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/users/timesheet.html',
                        controller: 'timesheetCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Timesheet'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([
                                {
                                    name: "timesheet",
                                    files: [
                                        "controllers/timesheetCtrl.js",
                                        "services/timesheetService.js",
                                    ]
                                }

                            ]);
                        }]
                }
            })
            .state('main.dashboard_parent', {
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl',
                    },
                    'content': {
                        templateUrl: 'views/dashboard/dashboard.html',
                        controller: 'dashboardCtrl',
                    },
                },
                data: {
                    pageTitle: 'Ignitrack : Dashboard'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([
                                {
                                    name: "dashboard",
                                    files: [
                                        "directives/accordian_toggle.js",
                                        "directives/filter.js",
                                        "directives/search.js",
                                        'services/dashboardService.js',
                                        'services/taskService.js',
                                        "assets/css/custom/dashboard_sidebar_widget.css",
                                        "assets/css/custom/dashbaord_comment.css",
                                        "controllers/dashboardCtrl.js"
                                    ]
                                }

                            ]);
                        }]
                }
            })
            .state('main.dashboard_parent.dashboard', {
                url: "/dashboard",
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'comparitive_issue': {
                        templateUrl: 'views/dashboard/issue_report.html',
                        controller: 'dashboardCtrl',
                    },
                    'user_report': {
                        templateUrl: 'views/dashboard/user_report.html',
                        controller: 'dashboardCtrl',
                    },
                    'build_releases': {
                        templateUrl: 'views/dashboard/build_releases.html',
                    },
                    'open_issue': {
                        templateUrl: 'views/dashboard/open_issue.html',
                        controller: 'dashboardCtrl',
                    },
                    'issues': {
                        templateUrl: 'views/dashboard/issues.html',
                        controller: 'dashboardCtrl',
                    },
                    'userStory': {
                        templateUrl: 'views/dashboard/user_story.html',
                        controller: 'dashboardCtrl',
                    },
                    'sprint_report': {
                        templateUrl: 'views/dashboard/sprint_chart.html',
                        controller: 'dashboardCtrl',
                    },
                    'task_report': {
                        templateUrl: 'views/dashboard/task_report.html',
                        controller: 'dashboardCtrl',
                    },
                    'comments': {
                        templateUrl: 'views/dashboard/comments.html',
                        controller: 'dashboardCtrl',
                    },
                    'tasks': {
                        templateUrl: 'views/dashboard/tasks.html',
                        controller: 'dashboardCtrl',
                    },
                    'activities': {
                        templateUrl: 'views/dashboard/activity.html',
                        controller: 'dashboardCtrl',
                    },
                    'notifications': {
                        templateUrl: 'views/dashboard/notifications.html',
                        controller: 'dashboardCtrl',
                    },
                    'currentSprint': {
                        templateUrl: 'views/dashboard/current_sprint.html',
                        controller: 'dashboardCtrl',
                    },
                    'projectSprint': {
                        templateUrl: 'views/dashboard/project_sprint.html',
                        controller: 'dashboardCtrl',
                    },
                    'sprints': {
                        templateUrl: 'views/dashboard/sprints.html',
                        controller: 'dashboardCtrl',
                    },
                    'commits': {
                        templateUrl: 'views/dashboard/user_commits.html',
                        controller: 'dashboardCtrl',
                    },
                },
                data: {
                    pageTitle: 'Ignitrack : Dashboard'
                },
                resolve: {
                    // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "directives/accordian_toggle.js",
                                        'services/dashboardService.js',
                                        "assets/css/custom/dashboard_sidebar_widget.css",
                                        "assets/css/custom/dashbaord_comment.css",
                                        "controllers/dashboardCtrl.js"
                                    ]
                                }]);
                        }]
                }
            })

            .state('users', {
                url: "/users",
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/users/manage_users.html',
                        controller: 'userCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Users'
                },
                show_project_menu_tab: true,
                authenticate: true,
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([
                                {
                                    name: "users",
                                    files: [
                                        "services/roleService.js",
                                        "controllers/userCtrl.js"
                                    ]
                                }

                            ]);
                        }]
                }
            })
            .state('roles', {
                url: "/roles",
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/users/manage_roles.html',
                        controller: 'roleCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Roles & Permissions'
                },
                show_project_menu_tab: true,
                authenticate: true,
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load({
                                name: "roles",
                                files: [
                                    "services/roleService.js",
                                    "controllers/roleCtrl.js"
                                ]
                            });
                        }]
                }
            })
            .state('changePassword', {
                url: "/changePassword",
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/users/change_password.html',
                        controller: 'userCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Change Password'
                },
                templateUrl: "views/users/change_password.html",
                authenticate: true,
                show_project_menu_tab: false,
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    store: function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load([{
                                files: [
                                    "controllers/userCtrl.js",
                                    "services/roleService.js",
                                    "directives/passwordMatch.js",
                                ]
                            }
                        ]);
                    }
                }
            })
            .state('editProfile', {
                url: "/editProfile",
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/users/edit_profile.html',
                        controller: 'userCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Edit Profile'
                },
                authenticate: true,
                show_project_menu_tab: false,
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    store: function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load([{
                                files: [
                                    "controllers/userCtrl.js",
                                    "services/roleService.js",
                                    "assets/css/custom/custom_style.css",
                                ]
                            }
                        ]);
                    }
                }
            })
            .state('allprojects', {
                url: "/projects",
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/projects/manage_projects.html',
                        controller: 'projectCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Projects'
                },
                authenticate: true,
                show_project_menu_tab: true,
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "projects",
                                    files: [
                                        "services/projectService.js",
                                        "controllers/projectCtrl.js",
                                        'services/dashboardService.js',
                                        "assets/css/custom/projects.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('projectView', {
                url: "/view/{id}",
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/projects/project-view.html',
                        controller: 'projectCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : View Project'
                },
                authenticate: true,
                show_project_menu_tab: true,
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {

                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "view",
                                    files: [
                                        "services/sprintService.js",
                                        "services/projectService.js",
                                        "directives/commonDirective.js",
                                        "controllers/projectCtrl.js",
                                        "assets/css/custom/projects.css",
                                        'services/dashboardService.js',
                                        "assets/css/custom/project_comments.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('editProject', {
                url: "/editProject/:id",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/projects/project-add.html',
                        controller: 'projectCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Edit Project'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([
                                {
                                    files: [
                                        "services/projectService.js",
                                        "controllers/projectCtrl.js",
                                        'services/dashboardService.js',
                                        "assets/css/custom/projects.css"
                                    ]
                                }
                            ]);
                        }]
                }
            })
            .state('meetings', {
                url: "/meetings",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/meetings/index.html',
                        controller: 'meetings'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Meetings'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    store: function ($ocLazyLoad) {

                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load([
                            {
                                files: [
                                    "controllers/meetings.js", //controller function of the view
                                    "services/meetingsService.js",
                                    "assets/css/custom/side_notification.css"
                                ]
                            }, {
                                name: 'mwl.calendar',
                                files: [
                                    'node_modules/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.min.css',
                                    'node_modules/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.min.js'
                                ]
                            }, {
                                name: 'colorpicker.module',
                                files: [
                                    'node_modules/angular-bootstrap-colorpicker/css/colorpicker.min.css',
                                    'node_modules/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js'
                                ]
                            }, {
                                name: 'ngTagsInput',
                                files: [
                                    'node_modules/ng-tags-input/build/ng-tags-input.css',
                                    'assets/js/ng-tags-input-app.js'
                                ]
                            }

                        ]);
                    }
                }
            })
            .state('meetingInvite', {
                url: "/meetingInvite/:pid/:mid",
                authenticate: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html'
                    },
                    'content': {
                        templateUrl: 'views/meetings/meetingInvite.html',
                        controller: 'meetingInviteCtlr'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Meeting Invite'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    store: function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load([
                            {
                                files: [
                                    "controllers/meetingInviteCtlr.js", //controller function of the view
                                    "services/meetingsService.js",
                                    'node_modules/angular-bootstrap-calendar/node_modules/interactjs/interact.js',
                                    "assets/css/custom/side_notification.css"
                                ]
                            }, {
                                name: 'mwl.calendar',
                                files: [
                                    'node_modules/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.min.css',
                                    'node_modules/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.min.js'
                                ]
                            }, {
                                name: 'colorpicker.module',
                                files: [
                                    'node_modules/angular-bootstrap-colorpicker/css/colorpicker.min.css',
                                    'node_modules/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js'
                                ]
                            }, {
                                name: 'ngTagsInput',
                                files: [
                                    'node_modules/ng-tags-input/build/ng-tags-input.css',
                                    'assets/js/ng-tags-input-app.js'
                                ]
                            }

                        ]);
                    }
                }
            })
            .state('activities', {
                url: "/activities",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/activities/manage_activities.html',
                        controller: 'activityCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Activities'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "activities",
                                    files: [
                                        "controllers/activityCtrl.js",
                                        "services/activityService.js",
                                        "directives/commonDirective.js",
                                        "assets/css/custom/custom_style.css",
                                        "assets/css/custom/activities.css"

                                    ]
                                }]);
                        }]
                }
            })
            .state('activityView', {
                url: "/activity/view/{id}",
                authenticate: true,
                show_project_menu_tab: false,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/activities/view-activity.html',
                        controller: 'activityCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : View Activity'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "activities",
                                    files: [
                                        "controllers/activityCtrl.js",
                                        "services/activityService.js",
                                        "directives/commonDirective.js",
                                        "assets/css/custom/custom_style.css",
                                        "assets/css/custom/activities.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('sprints', {
                url: "/sprints/:phaseId",
                params: {
                    phaseId: {squash: true, value: null},
                },
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/sprints/manage_sprint.html',
                        controller: 'sprintCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Sprints'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "sprints",
                                    files: [
                                        "controllers/sprintCtrl.js",
                                        "services/sprintService.js",
                                        "services/projectService.js",
                                        'services/dashboardService.js',
                                        "services/releaseService.js",
                                        "services/activityService.js",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('ViewSprint', {
                url: "/view_sprint/:sid/:pid",
                authenticate: true,
                show_project_menu_tab: false,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/sprints/view_sprint.html',
                        controller: 'sprintCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Sprints'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "ViewSprint",
                                    files: [
                                        "controllers/sprintCtrl.js",
                                        "services/sprintService.js",
                                        "services/projectService.js",
                                        'services/dashboardService.js',
                                        "services/releaseService.js",
                                        "services/activityService.js",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('createSprint', {
                url: "/create_sprint/:sid/:pid",
                authenticate: true,
                show_project_menu_tab: false,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/sprints/add_sprint_table.html',
                        controller: 'sprintCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Sprints'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "sprints",
                                    files: [
                                        "controllers/sprintCtrl.js",
                                        "services/sprintService.js",
                                        "services/projectService.js",
                                        'services/dashboardService.js',
                                        "services/releaseService.js",
                                        "services/activityService.js",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('sprintResources', {
                url: "/sprintResources/:sid/:pid/:prjId",
                authenticate: true,
                show_project_menu_tab: false,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/sprints/add_resources.html',
                        controller: 'sprintCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Sprints'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "sprints",
                                    files: [
                                        "controllers/sprintCtrl.js",
                                        "services/sprintService.js",
                                        "services/projectService.js",
                                        'services/dashboardService.js',
                                        "services/releaseService.js",
                                        "services/activityService.js",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('progress', {
                url: "/progress",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/progress/progress.html',
                        controller: 'progressCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Progress Report'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "progress",
                                    files: [
                                        "controllers/progressCtrl.js",
                                        "assets/css/custom/custom_style.css",
                                        "assets/css/custom/progress.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('signup', {
                url: '/signup/:token',
                templateUrl: "views/users/signup.html",
                controller: "userCtrl",
                authenticate: false,
                show_project_menu_tab: false,
                data: {
                    pageTitle: 'Ignitrack : SignUp'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "users",
                                    files: [
                                        "controllers/userCtrl.js",
                                        "services/roleService.js",
                                        "services/socketService.js",
                                        "services/socketEventService.js",
                                        "services/userService.js",
                                        "directives/passwordMatch.js",
                                        "assets/css/custom/custom_style.css",
                                    ]
                                }, {
                                    name: 'ngFileUpload',
                                    files: [
                                        'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
                                        'node_modules/ng-file-upload/dist/ng-file-upload.min.js'
                                    ]

                                }]);
                        }]
                }
            })
            .state('reset_password', {
                url: "/reset_password/:token",
                templateUrl: "views/users/reset_password.html",
                controller: "userCtrl",
                authenticate: false,
                show_project_menu_tab: false,
                data: {
                    pageTitle: 'Ignitrack : Reset Password'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "services/socketService.js",
                                        "services/socketEventService.js",
                                        "controllers/userCtrl.js",
                                        "services/userService.js",
                                        "services/roleService.js",
                                        "assets/css/custom/custom_style.css",
                                        "directives/passwordMatch.js",
                                    ]
                                }, {
                                    name: 'ngFileUpload',
                                    files: [
                                        'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
                                        'node_modules/ng-file-upload/dist/ng-file-upload.min.js'
                                    ]

                                }]);
                        }]
                }
            })
            .state('404', {
                url: "/404",
                templateUrl: "views/404.html",
                controller: "404Ctrl",
                data: {
                    pageTitle: 'Ignitrack : Page Not Found'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    store: function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load({
                            // serie: true,
                            name: "404",
                            files: [
                                "controllers/404Ctrl.js", //controller function of the view
                            ]
                        });
                    }
                }
            })
            .state('main.userstory', {
                url: "/user-story",
                abstract: true,
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/user-story/user-story.html',
                        controller: 'userStoryParentCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : User story'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "userstories",
                                    files: [
                                        "controllers/userStoryParentCtrl.js"
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.userstory.section', {
                url: "/:type/:id/:pid",
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'section': {
                        templateUrl: function (stateParams) {
                            return 'views/user-story/user-story-' + stateParams.type + '.html'
                        },
                        controller: 'userstoryCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : User story'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "controllers/userstoryCtrl.js",
                                        "services/userStoryService.js",
                                        "services/taskService.js",
                                        "assets/css/custom/activities.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.backlogs', {
                url: "/backlogs",
                abstract: true,
                authenticate: true,
                //parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/backlogs/backlog.html',
                        controller: 'backlogCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Backlogs'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "activities",
                                    files: [
                                        "controllers/backlogCtrl.js",
                                        "services/userStoryService.js",
                                        "directives/card_flip.js",
                                        "services/activityService.js",
                                        "assets/css/custom/custom_style.css",
                                        "assets/css/custom/backlog.css",
                                        "assets/css/custom/activities.css"

                                    ]
                                }]);
                        }]
                }
            })
            .state('main.backlogs.backlogs_activity', {
                url: "/backlog-activity",
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'backlogView': {
                        templateUrl: 'views/backlogs/backlog-activities.html',
                        controller: 'backlogActivityCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Backlog Activities'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "activities",
                                    files: [
                                        "controllers/backlogActivityCtrl.js"

                                    ]
                                }]);
                        }]
                }
            })
            .state('main.backlogs.backlogs_user_stories', {
                url: "/backlog-user-stories",
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'backlogView': {
                        templateUrl: 'views/backlogs/backlog-user-stories.html',
                        controller: 'backlogUserStoryCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Backlog User Stories'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "activities",
                                    files: [
                                        "controllers/backlogUserStoryCtrl.js"

                                    ]
                                }]);
                        }]
                }
            })
            .state('main.backlogs.backlogs_assests', {
                url: "/backlog-assests",
                show_project_menu_tab: true,
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'backlogView': {
                        templateUrl: 'views/backlogs/backlog-assests.html',
                        controller: 'backlogAssetsCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Backlog Assets'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "assets",
                                    files: [
                                        "controllers/backlogAssetsCtrl.js",
                                        "services/assetsService.js"
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.backlogs.backlogs_issues', {
                url: "/backlog-issues",
                show_project_menu_tab: true,
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'backlogView': {
                        templateUrl: 'views/backlogs/backlog-issues.html',
                        controller: 'backlogIssueCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Backlog Issues'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "activities",
                                    files: [
                                        "controllers/backlogIssueCtrl.js",
                                        "services/issuesService.js"

                                    ]
                                }]);
                        }]
                }
            })
            .state('estimations', {
                url: "/estimations",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/backlogs/estimations.html',
                        controller: 'estimationCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Estimations'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "activities",
                                    files: [
                                        "controllers/estimationCtrl.js",
                                        "services/estimationService.js",
                                        "assets/css/custom/custom_style.css",
                                        "assets/css/custom/backlog.css",
                                        "assets/css/custom/activities.css"

                                    ]
                                }]);
                        }]
                }
            })
            .state('estimationView', {
                url: "/estimation/view/{id}",
                authenticate: true,
                show_project_menu_tab: false,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/backlogs/estimation-detail.html',
                        controller: 'estimationCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Estimation View'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "activities",
                                    files: [
                                        "controllers/estimationCtrl.js",
                                        "services/estimationService.js",
                                        "assets/css/custom/custom_style.css",
                                        "assets/css/custom/backlog.css"
                                    ]
                                }]);
                        }]
                }
            })

            .state('main.releases', {
                authenticate: true,
                abstract: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/releases/releases.html'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Releases'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "controllers/releaseCtrl.js",
                                        "assets/css/custom/custom_style.css",
                                        "services/releaseService.js",
                                        "services/sprintService.js",
                                        "services/userStoryService.js",
                                    ]
                                }]);
                        }]
                }
            })
            .state('tasks', {
                url: "/task-board",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/tasks/manage_tasks.html',
                        controller: 'taskCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Task Board'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "services/userStoryService.js",
                                        "directives/taskDragDropDirective.js",
                                        "controllers/taskCtrl.js",
                                        "services/taskService.js",
                                        "services/issuesService.js",
                                        "assets/css/custom/task.css"
                                    ]
                                }
                            ]);
                        }]
                }
            })
            .state('main.releases.manageRealeses', {
                url: "/releases",
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'section': {
                        templateUrl: 'views/releases/manageReleases.html',
                        controller: 'releaseCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Releases'
                }
            })
            .state('main.releases.managePlans', {
                url: "/plans",
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'section': {
                        templateUrl: 'views/releases/manage_plans.html',
                        controller: 'releaseCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Plans'
                }
            })
            .state('main.releases.newRelease', {
                url: "/release-new",
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'section': {
                        templateUrl: 'views/releases/release-new.html',
                        controller: 'releaseCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Start New Release'
                }
            })
            .state('main.releases.release_accept', {
                url: "/approve/:id",
                authenticate: true,
                show_project_menu_tab: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'section': {
                        templateUrl: 'views/releases/release_acceptance.html',
                        controller: 'releaseCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Release Build Status'
                }
            })
            .state('main.releases.buildDetail', {
                url: "/build-detail/:id",
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'section': {
                        templateUrl: 'views/releases/build_detail.html',
                        controller: 'releaseCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Build detail'
                }
            })
            .state('issues', {
                url: "/issue-board",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/issues/manage_issues.html',
                        controller: 'issueBoardCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Issue Board'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "controllers/issueBoardCtrl.js",
                                        "services/issuesService.js",
                                        "services/userStoryService.js",
                                        "services/issueBoardService.js",
                                        "directives/taskDragDropDirective.js",
                                        "services/taskService.js",
                                        "assets/css/custom/task.css"
                                    ]
                                }
                            ]);
                        }]
                }
            })
            .state('main.issues', {
                abstract: true,
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/issues/issue-view.html',
                        controller: 'issueBoardParentCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Issues'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "controllers/issueBoardParentCtrl.js"
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.issues.section', {
                url: "/:type/:id/:pid",
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'section': {
                        templateUrl: function (stateParams) {
                            return 'views/issues/issue-view-' + stateParams.type + '.html'
                        },
                        controller: 'issueBoardCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Issue'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "controllers/issueBoardCtrl.js",
                                        "services/issuesService.js",
                                        "services/userStoryService.js",
                                        "services/issueBoardService.js",
                                        "directives/taskDragDropDirective.js",
                                        "services/taskService.js",
                                        "assets/css/custom/task.css",
                                        "assets/css/custom/activities.css",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }, {
                                    name: 'ngFileUpload',
                                    files: [
                                        'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
                                        'node_modules/ng-file-upload/dist/ng-file-upload.min.js'
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.task', {
                url: "/task",
                abstract: true,
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/tasks/task-view.html',
                        controller: 'taskParentCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Tasks'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "controllers/taskParentCtrl.js"
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.task.section', {
                url: "/:type/:id/:pid",
                authenticate: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'section': {
                        templateUrl: function (stateParams) {
                            return 'views/tasks/task-view-' + stateParams.type + '.html'
                        },
                        controller: 'taskCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Tasks'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    files: [
                                        "services/userStoryService.js",
                                        "services/issuesService.js",
                                        "controllers/taskCtrl.js",
                                        "services/taskService.js",
                                        "assets/css/custom/activities.css",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.review', {
                url: "/repos/review",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/repos/review.html',
                        controller: 'repoCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Repos'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "ViewSprint",
                                    files: [
                                        "controllers/repoCtrl.js",
                                        "services/repoService.js",
                                        "services/projectService.js",
                                        'services/dashboardService.js',
                                        "services/releaseService.js",
                                        "services/activityService.js",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.unreview', {
                url: "/repos/unreview",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/repos/unreview.html',
                        controller: 'repoCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : Repos'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "ViewSprint",
                                    files: [
                                        "controllers/repoCtrl.js",
                                        "services/repoService.js",
                                        "services/projectService.js",
                                        'services/dashboardService.js',
                                        "services/releaseService.js",
                                        "services/activityService.js",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }]);
                        }]
                }
            })
            .state('main.uncommit', {
                url: "/repos/userCommit",
                authenticate: true,
                show_project_menu_tab: true,
                parent: "main",
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'headerCtrl'
                    },
                    'content': {
                        templateUrl: 'views/repos/user_commit.html',
                        controller: 'repoCtrl'
                    }
                },
                data: {
                    pageTitle: 'Ignitrack : User'
                },
                resolve: {// Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([{
                                    name: "ViewSprint",
                                    files: [
                                        "controllers/repoCtrl.js",
                                        "services/repoService.js",
                                        "services/projectService.js",
                                        'services/dashboardService.js',
                                        "services/releaseService.js",
                                        "services/activityService.js",
                                        "assets/css/custom/custom_style.css"
                                    ]
                                }]);
                        }]
                }
            })
});




