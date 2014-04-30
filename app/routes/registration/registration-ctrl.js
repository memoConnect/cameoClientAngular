define([
    'app',
    'ngload!cmAuth',
    'ngload!cmUserModel',
    'ngload!cmNotify',
    'ngload!cmLogger',
    'ngload!pckValidate'
], function (app) {
    'use strict';

    app.register.controller('RegistrationCtrl', [
    '$scope',
    '$rootScope',
    '$location',
    '$q',
    'cmAuth',
    'cmUserModel',
    '$timeout',
    function ($scope, $rootScope, $location, $q, cmAuth, cmUserModel, $timeout) {
        var reservationSecrets = {};

        $scope.showError = {
            LoginNameExists: false,
            LoginNameEmpty: false,
            LoginNameInvalid: false
        };

        /**
         * getLoginNameError for GUI
         * @returns {boolean}
         */
        $scope.getLoginNameError = function(){
            if($scope.showError.LoginNameExists || $scope.showError.LoginNameEmpty || $scope.showError.LoginNameInvalid){
                return true;
            }
            return false;
        }

        $scope.formData = {loginName: '', password: '', email: '', phoneNumber: '', name: ''};
        $scope.userNameAlternatives = [];
        $scope.showUserNameAlternatives = false;

        /**
         * Toogle Function for AGB Check
         */
        $scope.acceptTerms = function(){
            if(!$scope.formData.agb){
                $scope.formData.agb = true;
            } else {
                $scope.formData.agb = false;
            }
        };

        /**
         *
         * @returns {boolean|*|FormController.$dirty|ngModel.NgModelController.$dirty|ngModel.NgModelController#$setPristine.$dirty|ngModel.NgModelController#$setViewValue.$dirty}
         */
        $scope.invalidLoginName = function(){
            return $scope.registrationForm.loginName.$dirty
                && $scope.registrationForm.loginName.$invalid
                && $scope.registrationForm.loginName.$error.minlength;
        };

        // timeout for verfication
        var verifyTO;

        /**
        * checks if LoginName exists, because Login Name have to be unique
        */
        $scope.verifyLoginName = function(){

            // clear exists timeout
            if(verifyTO)
                $timeout.cancel(verifyTO);

            verifyTO = $timeout(function(){
                $scope.showError.LoginNameExists = false;
                $scope.showError.LoginNameInvalid = false;
                $scope.showError.LoginNameEmpty = false;
                $scope.showUserNameAlternatives = false;

                if(typeof $scope.registrationForm.loginName.$viewValue !== 'undefined'){
                    var lastloginName = $scope.registrationForm.loginName.$viewValue.toString();

                    // if input is'nt empty && is valid && reservation secret is'nt exists
                    if(lastloginName != ''
                        && $scope.invalidLoginName() == false
                        && reservationSecrets[lastloginName] == undefined) {
                        // check loginName
                        cmAuth.checkAccountName(lastloginName)
                            .then(
                            // valid case
                            function(data){
                                console.log('hier')
                                $scope.registrationForm.loginName.$valid = true;
                                // save reservation secret
                                reservationSecrets[lastloginName] = data.reservationSecret;
                            },
                            // invalid or exists
                            function(response){
                                console.log('da')
                                // invalid case
                                if(typeof response.data == "object" && response.data.error == 'invalid login name') {
//                                    console.log('case 2')
                                    $scope.showError.LoginNameInvalid = true;
                                } else if(typeof response.data == "object" && typeof response.data.alternative !== 'undefined'){
                                    console.log('case 3')
                                    $scope.showError.LoginNameExists = true;
                                    /**
                                     * @TODO
                                     * show alternatives
                                     */
                                    $scope.userNameAlternatives = data;
                                    $scope.showUserNameAlternatives = true;
                                }

                                $scope.registrationForm.loginName.$valid = false;
                            }
                        );

                    } else {
                        if(lastloginName.length == 0){
                            $scope.registrationForm.loginName.$pristine = true;
                            $scope.registrationForm.loginName.$dirty = false;
                        } else {
                            $scope.registrationForm.loginName.$dirty = true;
                        }
                    }
                }
            },500);
        };


        /**
         * validate Registration Form
         * @returns {*}
         */
        $scope.validateForm = function(){
            var deferred = $q.defer();

            var data = {
                loginName: null,
                password: null,
                email: null,
                phoneNumber: null,
                displayName: null,
                reservationSecret: null
            };

            // check loginName
            if ($scope.registrationForm.loginName.$valid == false) {
                if($scope.registrationForm.loginName.$viewValue == undefined
                   || $scope.registrationForm.loginName.$viewValue.toString() == ''){
                    $scope.showError.LoginNameEmpty = true;
                } else if($scope.registrationForm.loginName.$error.minlength !== false){
                    $scope.showError.LoginNameInvalid = true;
                }
            } else {
                data.loginName = $scope.registrationForm.loginName.$viewValue;
            }

            // check password
            if ($scope.formData.password == '' || $scope.formData.password == 'none') {
                $rootScope.$broadcast('cm-empty-password');
            } else {
                data.password = $scope.formData.password;
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
            if ($scope.registrationForm.displayName.$viewValue != '') {
                data.displayName = $scope.registrationForm.displayName.$viewValue;
            }

            // check agb
            if ($scope.registrationForm.agb.$valid == false) {
                $scope.registrationForm.phone.dirty = true;
                $scope.registrationForm.agb.$invalid = true;
            }

            if (!data.loginName in reservationSecrets) {
                $scope.registrationForm.loginName.focus();
                $scope.checkLoginName();
            } else if(reservationSecrets.length == 0) {
                $scope.checkLoginName();
            } else {
                data.reservationSecret = reservationSecrets[data.loginName];
            }

            if($scope.registrationForm.$valid !== false){
                deferred.resolve(data);
            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        /**
         * Form Validation and Apicall to create user
         */
        $scope.createUser = function () {

            $scope.validateForm().then(
                function(data){
                    cmAuth.createUser(data).then(
                        function (userData) {
                            cmUserModel.doLogin($scope.formData.loginName, $scope.formData.password).then(
                                function(){
                                    cmUserModel.setIdentity(userData.identities[0]);
                                    cmUserModel.comesFromRegistration = true;
                                    $location.path("/talks");
                                }
                            )
                            return true;
                        },
                        function(response){
                            console.log(response);
                        }
                    );
                }
            );

            return false;
        };
    }]);
});