define([
    'app',
    'ngload!pckValidate',
    'ngload!pckUi',
], function (app) {
    'use strict';

app.register.controller('RegistrationCtrl', [
    'cmAuth', 'cmUserModel', 'cmUtil', 'cmLogger', 'cmTransferScopeData', 'cmNotify', 'cmSystemCheck',
    '$scope', '$rootScope', '$location', '$q',
    function (cmAuth, cmUserModel, cmUtil, cmLogger, cmTransferScopeData, cmNotify, cmSystemCheck,
              $scope, $rootScope, $location, $q) {

        cmSystemCheck.run(true);

        $scope.formData = {
            cameoId: '',
            password: '',
            email: '',
            phone: '',
            displayName: ''
        };

        $scope.handleGuest = false;
        $scope.showSpinner = false;

        /**
         * Toogle Function for AGB Check
         */
        $scope.acceptTerms = function(){
            $scope.formData.agb = !$scope.formData.agb ? true : false;
        };

        /**
         * validate Registration Form
         * @returns {*}
         */
        $scope.validateForm = function(){
            var deferred = $q.defer(),
                reservationCheck = false;

            var data = {
                loginName: null,
                password: null,
                email: null,
                phone: null,
                displayName: null,
                reservationSecret: null
            };

            // check loginName aka cameoId
            if ($scope.registrationForm.cameoId.$valid == false) {
                if($scope.registrationForm.cameoId.$viewValue == undefined
                || $scope.registrationForm.cameoId.$viewValue.toString() == ''
                ){
                    $rootScope.$broadcast('cm-login-name:invalid');
                }
            } else {
                data.loginName = $scope.registrationForm.cameoId.$viewValue;
            }

            // check password
            if ($scope.formData.password == ''
            || $scope.formData.password == 'none'
            || $scope.formData.password == undefined) {
                $rootScope.$broadcast('cm-password:empty');
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
                    // 'phoneNumber' is for BE call
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

            // check reservation secret - index for correct login name
            if(data.loginName != null && cmUtil.objLen($scope.reservationSecrets) > 0){
                if (!(data.loginName in $scope.reservationSecrets)) {
                    cmNotify.warn('REGISTRATION.WARN.RESERVATIONSECRET_MISSING');
                } else {
                    data.reservationSecret = $scope.reservationSecrets[data.loginName];
                    reservationCheck = true;
                }
            }

            if($scope.registrationForm.$valid !== false && reservationCheck == true){
                deferred.resolve(data);
            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        /**
         * Form Validation and Apicall to create user
         */
        $scope.spinner = function(action){
            if(action == 'isIdle'){
                return $scope.showSpinner;
            }

            $scope.showSpinner = action == 'stop' ? false : true;
        };

        $scope.createUser = function(){
            if($scope.spinner('isIdle'))
                return false;

            $scope.spinner('start');

            $scope.validateForm().then(
                function(data){
                    clearTransferScopeData();

                    cmAuth.createUser(data).then(
                        function(accountData){
                            
                            cmUserModel.doLogin($scope.formData.cameoId, $scope.formData.password, accountData).then(
                                function(){
                                    $scope.spinner('stop');
                                    if($scope.handleGuest !== false){
                                        //$location.path('/purl/'+$rootScope.pendingPurl);
                                        $rootScope.goto('/start/welcome');
                                    } else {
                                        cmUserModel.comesFromRegistration = true;
                                        $rootScope.goto("/start/welcome");
                                    }
                                },
                                function(){
                                    $scope.spinner('stop');
                                }
                            );
                            return true;
                        },
                        function(response){
                            console.log('response',response)
                            cmNotify.warn('REGISTER.WARN.REGISTRATION_FAILED');
                            $scope.spinner('stop');
                        }
                    );
                },
                function(){
                    $scope.spinner('stop');
                }
            );
        };

        /**
         * Guest Handling
         */
        if(cmUserModel.isGuest() !== false){
            $scope.handleGuest = true;
        }

        // transfer data between routeChanges
        var clearTransferScopeData = cmTransferScopeData.create($scope,{
            id:'registration',
            ignoreVar:'password',
            scopeVar:'formData',
            onSet: function(){
                this.privateData = $scope.reservationSecrets;
            },
            onGet: function(formData, privateData){
                if(privateData != null)
                    $scope.reservationSecrets = privateData
            }
        });
    }]);
});