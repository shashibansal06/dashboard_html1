angular.module("ignitrack").controller("repoCtrl", function ($q, $stateParams, $scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, BASE_PATH, API_URL, $timeout, Upload, repoService) {

    $scope.baseUrl = BASE_PATH;
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;

    /*
     * function to reset all filters
     */
    $scope.clearFilter = function () {
        $state.reload();
    }

    /*
     * function to get all reviewed commits of a project
     * with pagination
     */
    $scope.review = function () {
        commonService.loadingPopup();
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;
        var project_id = ($scope.projectheaderId == null && $scope.projectheaderId == undefined) ? '' : $scope.projectheaderId._id;
        var repo_id = ($scope.repo_id && $scope.repo_id != undefined) ? $scope.repo_id : '';
        var commmitted_by = ($scope.assigne_id && $scope.assigne_id != undefined) ? $scope.assigne_id.email : '';
        var methods = {
            projectUsers: repoService.getProjectUsers({project_id: project_id}),
           // getRepos: repoService.getRepoName({project_id: project_id}),
           // getReviewCommit: repoService.getCommits({project_id: project_id, type: 1, repo_name: repo_id, skip: $scope.skip, limit: $scope.limit, commmitted_by: commmitted_by})
        };

        $q.all(methods).then(function (methods) {
            var response = _.filter(methods, function (obj) {
                return obj.status != 200 || !obj.data || obj.data.statusCode != 200
            });

            if (response.length > 0) {
                swal("Oops...", 'Technical error. Please try again later', 'error');
            } else {
               // $scope.review_total_record = (methods.getReviewCommit.data.result.total_records && methods.getReviewCommit.data.result.total_records != undefined) ? methods.getReviewCommit.data.result.total_records : 0;
              //  $scope.getRepos = (methods.getRepos.data.result && methods.getRepos.data.result != undefined) ? methods.getRepos.data.result : [];
               $scope.project_assignees = (methods.projectUsers.data.data.resources && methods.projectUsers.data.data.resources != undefined) ? methods.projectUsers.data.data.resources : [];
               
               if($scope.project_assignees.length > 0 ){
				$scope.assigne_id = $scope.project_assignees[0];  
				  $scope.searchRecord();
			   }
              
              //  $scope.review_repos = (methods.getReviewCommit.data.result.data && methods.getReviewCommit.data.result.data != undefined) ? methods.getReviewCommit.data.result.data : [];
              
              commonService.closePopup();
                
            }
        });
    }
    
    /* Apply filter */
    $scope.searchRecord = function(){
		
		resuest = { git_user_name : $scope.assigne_id.git_user_name };
		if( $scope.start_date != undefined){
			 resuest.start_date = moment($scope.start_date).format('YYYY-MM-DD');
			}
			
		if( $scope.end_date != undefined){
			  resuest.end_date = moment($scope.end_date).format('YYYY-MM-DD');
			}
		if($rootScope.globalProjectId._id != undefined){
			   resuest.project_id = $rootScope.globalProjectId._id;
			}			
		commonService.loadingPopup();
		repoService.userCommits( resuest ,function(response){
			 if (response.data.statusCode == 200) {
				 $scope.commitsData = response.data.data;
                 $timeout(commonService.closePopup(), 200); // hide processing popup

            } else {
                swal("Oops...", 'Error occurred. Please try after some time.', 'error');
            }
			
			});
		
		
    }

    /*
     * function to get all unreview commits of a project
     * with pagination
     */
    $scope.unreview = function () {
        commonService.loadingPopup();
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;
        var project_id = ($scope.projectheaderId == null && $scope.projectheaderId == undefined) ? '' : $scope.projectheaderId._id;
        var repo_id = ($scope.repo_id && $scope.repo_id != undefined) ? $scope.repo_id : '';
        var commmitted_by = ($scope.assigne_id && $scope.assigne_id != undefined) ? $scope.assigne_id.email : '';
        var methods = {
            projectUsers: repoService.getProjectUsers({project_id: project_id}),
            getRepos: repoService.getRepoName({project_id: project_id}),
            getUnReviewCommit: repoService.getCommits({project_id: project_id, type: 2, repo_name: repo_id, skip: $scope.skip, limit: $scope.limit, commmitted_by: commmitted_by})
        };

        $q.all(methods).then(function (methods) {
            var response = _.filter(methods, function (obj) {
                return obj.status != 200 || !obj.data || obj.data.statusCode != 200
            });

            if (response.length > 0) {
                swal("Oops...", 'Technical error. Please try again later', 'error');
            } else {
                $scope.unreview_total_record = (methods.getUnReviewCommit.data.result.total_records && methods.getUnReviewCommit.data.result.total_records != undefined) ? methods.getUnReviewCommit.data.result.total_records : 0;
                $scope.getRepos = (methods.getRepos.data.result && methods.getRepos.data.result != undefined) ? methods.getRepos.data.result : [];
                $scope.project_assignees = (methods.projectUsers.data.data.resources && methods.projectUsers.data.data.resources != undefined) ? methods.projectUsers.data.data.resources : [];
                $scope.unreview_repos = (methods.getUnReviewCommit.data.result.data && methods.getUnReviewCommit.data.result.data != undefined) ? methods.getUnReviewCommit.data.result.data : [];
                commonService.closePopup();
            }
        });
    }


    /*
     * function to open modal window to enter code review details
     */
    $scope.reviewCode = function (commit_id) {
        $scope.commit_id = commit_id;
        ModalService.showModal({
            templateUrl: 'views/repos/commit_remark.html',
            controller: 'repoChildCtrl',
            scope: $scope
        }).then(function (modal) {
            commonService.closePopup();
            modal.element.modal();
        });
    }

    /*
     * @name : Open date picker
     * @description : function to open date picker
     */

   $scope.dateOptionsOne = {
        formatYear: 'yy',
        maxDate: new Date(),
        minDate: '',
        startingDay: 1
    };
    
    $scope.dateOptionsTwo = {
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

    $scope.changeOne = function(){
		  $scope.dateOptionsTwo.minDate = $scope.start_date;
		}
		
});

angular.module("ignitrack").controller("repoChildCtrl", function ($q, $stateParams, $scope, $interpolate, $state, $rootScope, $window, ModalService, commonService, BASE_PATH, API_URL, $timeout, Upload, repoService, $element) {

    /*
     * function to submit code review detials in table against commit id
     * params : commit_id, lines_count,status & comments
     */
    $scope.reviewCode = function () {
        commonService.loadingPopup();
        var request = {
            commit_id: $scope.commit_id,
            total_number_of_lines: ($scope.review_Code.lines && $scope.review_Code.lines != undefined) ? $scope.review_Code.lines : '',
            comment: ($scope.review_Code.comments && $scope.review_Code.comments != undefined) ? $scope.review_Code.comments : '',
            status: ($scope.review_Code.status && $scope.review_Code.status != undefined) ? $scope.review_Code.status : ''
        }
        repoService.codeReview(request, function (response) {
            if (response.data.statusCode == 200) {
                $scope.closeModal();
                swal({title: "Success", text: response.data.message, type: 'success'},
                function () {
                    $state.reload();
                });
            } else {
                var data = {title: 'oops', text: response.data.message, type: 'error'};
                commonService.showMessage(data);
            }
        })
    }

    $scope.closeModal = function () {
        $element.modal('hide'); //  Manually hide the modal using bootstrap.
        close(null, 500); //  Now close as normal, but give 500ms for bootstrap to animate
    }
});
