define([
    'app',
    'ngload!cmAuth',
    'ngload!cmNotify',
    'ngload!cmLogger',
    'ngload!pckValidate'
], function (app) {
    'use strict';

    app.register.controller('RegistrationCtrl', [
    '$scope',
    '$rootScope',
    '$location',
    'cmAuth',
    'cmNotify',
    'cmLogger',
    function ($scope, $rootScope, $location, cmAuth, cmNotify, cmLogger) {
        var reservation_secrets = {};

        $scope.showLoginNameCheckError = false;
        $scope.showLoginNameEmptyError = false;

        $scope.formData = {loginName: '', password: '', email: '', phoneNumber: '', name: '',cameoId: ''};
        $scope.userNameAlternatives = [];
        $scope.showUserNameAlternatives = false;

        $scope.acceptTerms = function(){
            if(!$scope.formData.agb){
                $scope.formData.agb = true;
            } else {
                $scope.formData.agb = false;
            }
        }

        /**
         * checks if LoginName exists, because Login Name have to be unique
         * check ob pw sich geändert hat ;)!!!!
         * @TODO check with keyup timeout
         */
        $scope.checkLoginName = function () {
            var last_checked = $scope.registrationForm.loginName.$viewValue.toString();

            if (last_checked != '' && last_checked.length > 5) {

                cmAuth.checkAccountName($scope.registrationForm.loginName.$viewValue)
                .then(
                    function(reservationSecret){
                        $scope.registrationForm.loginName.$valid = true;
                        $scope.showLoginNameCheckError = false;
                        $scope.showLoginNameEmptyError = false;

                        reservation_secrets[last_checked] = reservationSecret;
                    },
                    function(){
//                        cmNotify.info("Error, check Username again!", {ttl: 5000});
                        $scope.registrationForm.loginName.$valid = false;
                        $scope.showLoginNameCheckError = true;
                        $scope.showLoginNameEmptyError = false;
                    }
                );


                /*
                    success(function (r) {
                        if (angular.isDefined(r) && angular.isDefined(r.res) && r.res == 'OK') {
                            if (angular.isDefined(r.data) && angular.isDefined(r.data.reservationSecret)) {
                                reservationSecret = r.data.reservationSecret;
                                $scope.registrationForm.cameoName.$valid = true;
                        } else {
                            cmNotify.info("Error, check Username again!", {ttl: 5000});
                            $scope.registrationForm.cameoName.$invalid = true;
                        }
                    } else {
                        cmNotify.info("Error, check Username again!", {ttl: 5000});
                        $scope.registrationForm.cameoName.$invalid = true;
                    }
                }).error(function (r) {
                    cmNotify.info("Username exists, please choose an other one, thx!", {ttl: 5000});
                    if (angular.isDefined(r) && angular.isDefined(r.data)) {
                        if (angular.isDefined(r.data.alternative)) {
                            /**
                             * @TODO
                             * show alternatives
                             */

                            /*
                        }
                    }
                });
                */
            } else {
                if(last_checked.length == 0){
                    $scope.registrationForm.loginName.$pristine = true;
                    $scope.registrationForm.loginName.$dirty = false;
                    $scope.showLoginNameCheckError = false;
                    $scope.showLoginNameEmptyError = false;
                } else {
                    $scope.registrationForm.loginName.$dirty = true;
                }
            }
        };

        /**
         * Form Validation and Apicall to create user
         */
        $scope.createUser = function () {
            var data = {
                loginName: null,
                password: null,
                cameoId: null,
                email: null,
                phoneNumber: null,
                name: null,
                reservationSecret: null
            };

            // check cameoName == loginName
            if ($scope.registrationForm.loginName.$valid == false) {
                $scope.showLoginNameEmptyError = true;
            } else {
                data.loginName = $scope.registrationForm.loginName.$viewValue;
            }

            // check password
            if ($scope.formData.password == '' || $scope.formData.password == 'none') {
                $rootScope.$broadcast('cm-empty-password');
            } else {
                data.password = $scope.formData.password;
            }

            // check cameoId
            if($scope.registrationForm.cameoId.$viewValue != ''){
                data.cameoId = $scope.registrationForm.cameoId.$viewValue;
            }


            // check email
            if ($scope.registrationForm.email.$valid == false) {
            } else {
                if ($scope.registrationForm.email.$viewValue != '') {
                    data.email = $scope.registrationForm.email.$viewValue;
                }
            }

            // check phone
            if ($scope.registrationForm.phone.$valid == false) {
            } else {
                if ($scope.registrationForm.phone.$viewValue != '') {
                    data.phoneNumber = $scope.registrationForm.phone.$viewValue;
                }
            }

            // check name
            if ($scope.registrationForm.name.$viewValue != '') {
                data.name = $scope.registrationForm.name.$viewValue;
            }

            // check agb
            if ($scope.registrationForm.agb.$valid == false) {
                $scope.registrationForm.phone.dirty = true;
                $scope.registrationForm.agb.$invalid = true;
            }

            if (!data.loginName in reservation_secrets) {
                $scope.registrationForm.loginName.focus();
                $scope.checkLoginName();
            } else {
                data.reservationSecret = reservation_secrets[data.loginName];
            }

//            console.log(data)
//            return false;

            // everything is fine an let's create the user
            if($scope.registrationForm.$valid !== false){
                cmAuth.createUser(data).then(
                    function () {
                        $location.path("/login");
                        return true;
                    }
                );
            }
            return false;
        };
    }]);
});