/*
 * @file: index.js
 * @description :
 * @author: Mukesh
 * @date: 06-03-2017
 * */


// declaring the main app variable

var app = angular.module("app", ["ngMask", "froala", "moment-picker", "ui.router", "oc.lazyLoad", 'ui.bootstrap', 'angularModalService', "app.constants", "ngCookies", "angular-jwt", 'ngAnimate', 'ngMessages', 'toastr', 'ngFileUpload', 'ngDesktopNotification', 'highcharts-ng', 'ngScrollbars', 'wysiwyg.module', 'ngSanitize','ngCacheBuster','angularjs-dropdown-multiselect']).value('froalaConfig', {
    toolbarInline: false,
    height: 200,
    placeholderText: 'Your Content Here!',
    pastePlain: true,
    toolbarButtons: ["bold", "italic", "underline", "|", "align", "formatOL", "formatUL", "strikeThrough", "fontSize", "quote", "insertHR", "insertImage", "insertVideo", "insertLink", "undo", "html"]
});

app.config(['$ocLazyLoadProvider', '$qProvider', 'momentPickerProvider', 'toastrConfig','httpRequestInterceptorCacheBusterProvider', function ($ocLazyLoadProvider, $qProvider, momentPickerProvider, toastrConfig,httpRequestInterceptorCacheBusterProvider) {
        $ocLazyLoadProvider.config({
            debug: false,
            events: false,
            cache: false
        });

        momentPickerProvider.options({
            minutesFormat: 'HH:mm'
        });

        angular.extend(toastrConfig, {
            positionClass: 'toast-top-right'
        });
        $qProvider.errorOnUnhandledRejections(false);
        
         httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*views.*/,/.*assets.*/,/.*directive_templates.*/],true);
    }]);

app.run(function ($window, toastr, $rootScope, $stateParams, $location, $state, $cookieStore, $templateCache) {

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (typeof (current) !== 'undefined') {
            $templateCache.remove(current.templateUrl);
        }
    });

    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function () {
            $rootScope.online = false;
            $rootScope.showInternet = true;
            toastr.error('You are offline', 'Disconnected', {
                closeButton: true, positionClass: 'toast-bottom-left'
            });

        });
    }, false);

    $window.addEventListener("online", function () {
        $rootScope.$apply(function () {

            toastr.success('You are connected to app', 'Welcome', {
                closeButton: true, positionClass: 'toast-bottom-left'
            });
            $rootScope.online = true;
            $rootScope.showInternet = false;
            $state.reload();

        });
    }, false);


    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {


        $rootScope.globalTitle = toState.data.pageTitle;
        $rootScope.show_project_menu_tab = toState.show_project_menu_tab;

        var globalProjectId = $cookieStore.get('globalProjectId');
        if (globalProjectId != undefined || globalProjectId != '') {
            $rootScope.globalProjectId = $cookieStore.get('globalProjectId');
        }

        var token = $cookieStore.get('access_token');
        //Redirect to dashboard if already loggedin
        if (!toState.authenticate && token) {
            $state.transitionTo("main.dashboard_parent.dashboard");
            event.preventDefault();
        }
        //If Not loggedin then redirect to login
        if (toState.authenticate && !token) {
            $state.transitionTo("/");
            event.preventDefault();
        }
    });
});

