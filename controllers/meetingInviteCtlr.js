/*
 * @file: meetingInviteCtlr.js
 * @description: function to create, update, view and delete meeting events
  * @author: prabhjot kaur
   * @date: 25-04-2017
 * */

//userRootServices,
'use strict';
angular.module("ignitrack").controller("meetingInviteCtlr", function ($scope, $state, $timeout, $rootScope, $window, calendarConfig, ModalService, moment,meetingsService,commonService,$cookieStore,$stateParams,$uibModal,BASE_PATH) {
    // $scope.event = {};
    $scope.evnt = {};
    $scope.meetingCancel = false; 
    $scope.evntObj = {};
    $scope.loggedIn = $cookieStore.get('user_credentials');
    $scope.userData = $cookieStore.get('user_data');
    $scope.fileUrl = BASE_PATH + 'attachment/admin/';
    $scope.responseGiven= false; 
    $scope.loadUsers = function ($query) {
        return $scope.available_users.filter(function (user) {
            return user.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
        });
    };

//// get meeting details //
    $scope.getEvent = function(){
        $scope.eventObj= {};
        $scope.cancelReason = [];  
        commonService.loadingPopup(); // start processing popup
        $scope.evnt.project_id = $stateParams.pid;
        $scope.evnt.meeting_id = $stateParams.mid;
            meetingsService.getEvents($scope.evnt,function (response) {                
                if (response.data.statusCode == 200) {
                    $scope.addEventForm = false;
                    $scope.eventObj = response.data.data[0];
                     // console.log( $scope.eventObj);
                    angular.forEach($scope.eventObj.invitee, function (pitem) {
                        if( pitem.user_id.email==$scope.userData.email && (pitem.is_confirmed ==0 || pitem.is_confirmed ==1 )){ // || pitem.is_confirmed !=''|| pitem.is_confirmed !=undefined
                            $scope.responseGiven= true;                           
                        // }else{
                        //     $scope.responseGiven= false;   
                        }
                         if( pitem.is_mandatory==1 && pitem.is_confirmed ==0){
                            $scope.meetingCancel = true; 
                                $scope.cancelReason.push({
                                    'cancelBy' :  pitem.user_id.first_name,
                                    'cancelCause': pitem.reason
                            });
                        }   
                     });
                    $timeout(commonService.closePopup(), 200); // hide processing popup
                }else {                    
                    swal({
                        title: (response.data.statusCode == 500) ? "Technical error. Please try again later" : ((response.data.statusCode == 408) ? "Server is not responding. Please try again later": response.data.message),
                        type: "warning",
                        //showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true
                    },
                    function() {  
                        commonService.closePopup();                     
                        $window.scrollTo(0,0);
                    })
                }
            });
    }
//// get meeting details ends //


//// show modal for getting meeting denied reason //
        $scope.showRejectModal = function (data) {       
            var context = this;
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'directive_templates/modals/rejectInvitation.html',
                controller: function($scope){
                     $scope.givereason = function () {  
                        data.reason = $scope.rejectReason;
                        // console.log(data);
                        context.inviteReply(data);
                        modalInstance.dismiss('cancel');
                    }
                    $scope.close = function () {
                       modalInstance.dismiss('cancel');
                    }
                },
                link : function ($scope) {
                    commonService.closePopup();                 
                },
                size: 'lg',
                appendTo: null
            });
        }
    //// show modal for getting meeting denied reason ends//

        $scope.inviteResponse = function (acceptance){
            var res = {
                "meeting_id": $stateParams.mid, //id
                // "user_id": "string",
                "is_confirmed": acceptance
            }
            if(acceptance==0){
                $scope.showRejectModal(res);
            }
            else{
                $scope.inviteReply(res);
            }
        }


    //// accept or deny for meeting //
        $scope.inviteReply = function(data){
            commonService.loadingPopup(); // start processing popup           
                meetingsService.eventResponse(data,function (response) {                
                    if (response.data.statusCode == 200) {
                        $state.reload();
                         // $timeout(commonService.closePopup(), 200); // hide processing popup
                         swal({
                        title: 'You response has been sent.',
                        type: "info",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true
                    },
                    function() {                         
                        if($scope.loggedIn.isLoggedIn==true){
                            commonService.closePopup() ;  
                            $state.go('meetings');
                        }else{
                            commonService.closePopup();  
                            $state.go('/');
                        }
                    })                             
                    }else {                        
                        swal({
                            title: (response.data.statusCode == 500 || response.data.statusCode == 408) ? "Technical error. Please try again later": response.data.message,
                            type: "warning",
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Ok",
                            closeOnConfirm: true
                        },
                        function() {   
                            commonService.closePopup();                    
                            $window.scrollTo(0,0);
                        })
                    }
                });
        }
//// accept or deny for meeting ends//
   
    $scope.getEvent();
});