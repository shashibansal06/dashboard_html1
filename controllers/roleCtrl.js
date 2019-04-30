angular.module("ignitrack").controller("roleCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService ,commonService,roleService) {

    /* BY DEFAULT PAGE NUMBER AND LIMIT FOR GET ALL RECORDS */
    $scope.skip = 0;
    $scope.limit = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.list = [];

    /*
    * Name : Get Role
    * Description : Function to get all roles
    */
    $scope.getRoles = function(){
        commonService.loadingPopup(); // start processing popup
        
        $scope.skip = ($scope.currentPage - 1) * $scope.limit;
        var request = { skip : $scope.skip , limit : $scope.limit};
        
        roleService.getRolesList(request,function(response){
            if(response.data.statusCode == 200){
                $scope.list = response.data.data;
                $timeout( commonService.closePopup(), 200); // hide processing popup
            }else{
                var data = { title:'oops' , text : 'Error occurred. Please try after some time.', type: 'error' };
                commonService.showMessage(data);
            }
         });
    }


    /*
     * Name : Create Role
     * Description : Function to create new roles by default admin can create new roles
     */
    $scope.createRole = function(){
        ModalService.showModal({
            templateUrl: 'directive_templates/modals/create_role.html',
            controller: 'roleChildCtrl',
            scope : $scope
        }).then(function(modal) {
            modal.element.modal();
            angular.element(document).on('shown.bs.modal', function(e) {
                angular.element('input:visible:enabled:first', e.target).focus();
            });
        });
    }

    /*
     * Name : Get user roles by role id
     * Description : Function to get user's roles permission array
     */
    $scope.getRolesPermissions = function(id){
        commonService.loadingPopup(); // start processing popup
        var data = { role_id : id };
        roleService.getRolesPermissionsList(data,function(response){
            if(response.data.statusCode == 200){
                $scope.role = response.data.data.roleData;
                $scope.permissions = [];
                var count = 0;
                for ( property in response.data.data.permissions ) {
                    $scope.permissions[count] = { 'name' : property , 'data' : response.data.data.permissions[property] };
                   count++;
                }
                $timeout( commonService.closePopup(), 200); // hide processing popup
                /* Open permissions popup */
                ModalService.showModal({
                    templateUrl: 'directive_templates/modals/manage_permissions.html',
                    controller: 'roleChildCtrl',
                    scope : $scope
                }).then(function(modal) {
                    modal.element.modal();
                });

            }else{
                var data = { title:'oops' , text : 'Error occurred. Please try after some time.', type: 'error' };
                commonService.showMessage(data);
            }

        });
    }

    $rootScope.$on("CallManageRoles", function (event ,args) {
        $scope.getRoles();
    });

});

angular.module("ignitrack").controller("roleChildCtrl", function ($scope, $q, $stateParams, $http, $timeout, $state, $rootScope, $window, jwtHelper, ModalService ,commonService,roleService,close,$element) {
    /*
     * Name : Create Role Modal function
     * Description : Function to create new roles by default admin can create new roles
     */
    $scope.createUserRole = function(){  
        commonService.loadingPopup(); // start processing popup
        roleService.createRoles($scope.user , function(response){
            switch(response.status) {
                case 200:
                        if(response.data.statusCode == 200){
                            $scope.closeModal();
                            $rootScope.$emit("CallManageRoles");
                        }else{    
                            var data = { title:'oops' , text : response.data.message, type: 'error' };
                            commonService.showMessage(data);
                        }
                    break;
                default:
                    var data = { title:'oops' , text : response.data.message, type: 'error' };
                    commonService.showMessage(data);
            }
        });
    }

    /*
     * Name : Update users roles permissions
     * Description : Function to create new roles by default admin can create new roles
     */
    $scope.assignPermissions = function(){
          /* Data design before send to server */
          var permissionSet = [];
          var permissions = $scope.permissions;
          for( var i=0; i<permissions.length; i++){
              var data = permissions[i].data;
              for( var k=0; k<data.length; k++){
                  if(permissions[i].data[k].permission_granted == true){
                      permissionSet.push(permissions[i].data[k]._id);
                  }
              }
          }
          /* Data design Ends here */
        commonService.loadingPopup(); // start processing popup
        $scope.request = { role_id: $scope.role._id , permission_id: permissionSet };
        /* Send data on service */
        roleService.updatePermissions($scope.request , function(response){
            if(response.data.statusCode == 200){
                $scope.closeModal();
                swal({title : "Updated!",text:'Permissions has been updated.',type:'success',confirmButtonText: "OK"} ,
                    function(){
                        $rootScope.$emit("CallManageRoles"); // Load all user data
                    });
            }else{
                var data = { title:'oops' , text : response.data.message, type: 'error' };
                commonService.showMessage(data);
            }
        });

    }

    $scope.closeModal = function() {
        $element.modal('hide');  //  Manually hide the modal using bootstrap.
        close(null, 500);//  Now close as normal, but give 500ms for bootstrap to animate
    };
});
