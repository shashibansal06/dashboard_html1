/*
 * @file: backlogAssetsCtrl.js
 * @description:
 * */

angular.module("ignitrack").controller("backlogAssetsCtrl", function ($scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, activityService, userStoryService, BASE_PATH, $timeout, assetsService) {
    /*
     * set basic parametrs 
     */
    $scope.baseUrl = BASE_PATH;
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;

    /*
     * 
     * @name : open attachment modal window
     * @description : show attachment
     */
    $scope.attachmentModal = function (asset) {
        $scope.url = $scope.baseUrl + 'attachment/admin/';
        $scope.data = asset;

        ModalService.showModal({
            templateUrl: 'views/backlogs/attachment_view.html',
            controller: 'backlogAssetsChildCtrl',
            scope: $scope

        }).then(function (modal) {
            modal.element.modal();
        });
    }

    /*
     * Reset filters
     */
    $scope.clearFilter = function () {
        $state.reload();
    }

    /*
     * set basic requirements for get all attachments
     */
    $scope.assets = {};
    $scope.search = '';
    $scope.key_to_sort = 'created_at';
    $scope.is_ascending = true;

    /*
     * set sorting parameters
     */
    $scope.attachment_sort_by = {
        name: {
            isCurrentSort: $scope.key_to_sort == 'name' ? true : false,
            order: $scope.is_ascending == true ? 'asc' : 'desc'
        },
    };

    /*
     * @name: get all attachments of a project
     * @description : function to get all attachments on project
     */
    $scope.getAttachments = function (type) {
        $scope.url = $scope.baseUrl + 'attachment/admin/';

        if (type == 'sort' || type == 'search')
        {
            $scope.skip = 0;
            $scope.limit = 10;
            $scope.currentPage = 1;
        }

        $scope.skip = ($scope.currentPage - 1) * $scope.limit;
        var request =
                {
                    project_id: ($rootScope.globalProjectId == null && $rootScope.globalProjectId == undefined) ? '' : $rootScope.globalProjectId._id,
                    skip: $scope.skip,
                    limit: $scope.limit,
                    search: $scope.search,
                    key_to_sort: $scope.key_to_sort,
                    is_ascending: $scope.is_ascending,
                }


        assetsService.getAttachments(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.total_records = response.data.data.total_records
                $scope.assets = response.data.data.records;
                $timeout(commonService.closePopup(), 200); // hide processing popup
            } else {
                swal("Oops...", response.data.message, response.data.status);
            }
        });
    }


    /*
     * @name : sort attachments
     */
    $scope.attachmentSort = function (key, type) {

        $scope.key_to_sort = key;
        $scope.is_ascending = type == 'asc' ? true : false;

        $scope.attachment_sort_by = {
            name: {
                isCurrentSort: key == 'name' ? true : false,
                order: $scope.is_ascending == true && key == 'name' ? 'asc' : 'desc'
            },
        };

        $scope.getAttachments('sort');
    }

});


/*
 * Backlog Assets Child Controller
 */

angular.module("ignitrack").controller("backlogAssetsChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService, commonService, userStoryService, Upload, API_URL, close, $element, assetsService) {

    /*
     * Close modal function 
     */
    $scope.closeModal = function () {
        $element.modal('hide');  //  Manually hide the modal using bootstrap.
        close(null, 500);//  Now close as normal, but give 500ms for bootstrap to animate
    };

});



