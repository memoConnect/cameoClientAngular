'use strict';

angular.module('cmRouteSettings').directive('cmIdentitySettings', [
    'cmUserModel',
    '$location',
    '$q',
    function(cmUserModel, $location, $q){
        return {
            restrict: 'E',
            templateUrl: 'routes/settings/comps/drtv-identity-settings.html',
            controller: function ($scope) {
                $scope.pendingCheck = $q.when(true);

                $scope.identity = angular.extend({},cmUserModel.data.identity);

                //////////////////////
                // TODO: mock workarround json in array
                $scope.identity.phoneNumbers = [
                    $scope.identity.phoneNumber || {value:''}
                ];
                $scope.identity.emails = [
                    $scope.identity.email || {value:''}
                ];
                //////////////////////
//                console.log($scope.identity)

                $scope.goToKeys = function(){
                    $location.path('/settings/identity/keys');
                };

                $scope.validateForm = function(){
                    var deferred = $q.defer();

                    if($scope.cmForm.$valid !== false){
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }

                    return deferred.promise;
                }

                $scope.saveIdentity = function(){
                    var objectChange = {};

                    $scope.validateForm().then(
                        function(){
                            function checkDisplayName() {
                                if ($scope.identity.displayName != cmUserModel.data.identity.displayName) {
                                    objectChange.displayName = $scope.identity.displayName;
                                }
                            }

                            function checkEmail() {
                                if ($scope.identity.emails.length > 0 && $scope.identity.emails[0].value != undefined && $scope.identity.emails[0].value != '' && $scope.identity.emails[0].value != cmUserModel.data.identity.email) {
                                    objectChange.email = $scope.identity.emails[0].value;
                                }
                            }

                            function checkPhoneNumber() {
                                if ($scope.identity.phoneNumbers.length > 0 && $scope.identity.phoneNumbers[0].value != undefined && $scope.identity.phoneNumbers[0].value != '' && $scope.identity.phoneNumbers[0].value != cmUserModel.data.identity.phoneNumber) {
                                    objectChange.phoneNumber = $scope.identity.phoneNumbers[0].value;
                                }
                            }

                            checkDisplayName();
                            checkEmail();
                            checkPhoneNumber();

                            cmUserModel.data.identity.update(objectChange);
                        }
                    )
                };

                $scope.validDisplayName = function(){
                    if($scope.identity.displayName == undefined || $scope.identity.displayName.length == 0){
                        $scope.cmForm.displayName.$pristine = true;
                        $scope.cmForm.displayName.$dirty = false;
                    }
                }
            }
        }
    }
]);