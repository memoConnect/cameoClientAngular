'use strict';

angular.module('cmWidgets').directive('cmWidgetRegistration', [
    'cmAuth', 'cmUserModel', 'cmUtil', 'cmLogger', 'cmTransferScopeData', 'cmNotify', 'cmSystemCheck',
    '$rootScope', '$location', '$q',
    function (cmAuth, cmUserModel, cmUtil, cmLogger, cmTransferScopeData, cmNotify, cmSystemCheck,
              $rootScope, $location, $q) {
        return {
            restrict: 'AE',
            scope: true,
            templateUrl: 'widgets/registration/wdgt-registration.html',

            controller: function ($scope) {

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
                $scope.acceptTerms = function () {
                    $scope.formData.agb = !$scope.formData.agb ? true : false;
                };

                /**
                 * validate Registration Form
                 * @returns {*}
                 */
                $scope.validateForm = function () {
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
                        if ($scope.registrationForm.cameoId.$viewValue == undefined
                            || $scope.registrationForm.cameoId.$viewValue.toString() == ''
                        ) {
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
                    if (data.loginName != null && cmUtil.objLen($scope.reservationSecrets) > 0) {
                        if (!(data.loginName in $scope.reservationSecrets)) {
                            cmNotify.warn('REGISTRATION.WARN.RESERVATIONSECRET_MISSING');
                        } else {
                            data.reservationSecret = $scope.reservationSecrets[data.loginName];
                            reservationCheck = true;
                        }
                    }

                    if ($scope.registrationForm.$valid !== false && reservationCheck == true) {
                        deferred.resolve(data);
                    } else {
                        deferred.reject();
                    }

                    return deferred.promise;
                };

                /**
                 * Form Validation and Apicall to create user
                 */
                $scope.spinner = function (action) {
                    if (action == 'isIdle') {
                        return $scope.showSpinner;
                    }

                    $scope.showSpinner = action == 'stop' ? false : true;
                };

                $scope.createUser = function () {
                    if ($scope.spinner('isIdle'))
                        return false;

                    $scope.spinner('start');

                    function sendCreateUserRequest(data) {
                        cmAuth.createUser(data).then(
                            function (accountData) {

                                cmUserModel.doLogin($scope.formData.cameoId, $scope.formData.password, accountData).then(
                                    function () {
                                        if ($scope.handleGuest !== false) {
                                            //$location.path('/purl/'+$rootScope.pendingPurl);
                                            $rootScope.goto('/start/welcome');
                                        } else {
                                            cmUserModel.comesFromRegistration = true;
                                            $rootScope.goto("/start/welcome");
                                        }
                                    },
                                    function () {
                                        $scope.spinner('stop');
                                    }
                                );
                                return true;
                            },
                            function (response) {
                                $scope.spinner('stop');

                                if (typeof response == 'object' && 'data' in response && typeof response.data == 'object') {
                                    if ('error' in response.data && response.data.error == 'invalid reservation secret') {
                                        $rootScope.$broadcast('registration:checkAccountName');
                                    }
                                } else {
                                    cmNotify.warn('REGISTER.WARN.REGISTRATION_FAILED');
                                }
                            }
                        );
                    }


                    $scope.validateForm().then(
                        function (data) {
                            clearTransferScopeData();

                            sendCreateUserRequest(data);
                        },
                        function () {
                            $scope.spinner('stop');
                        }
                    );
                };

                $rootScope.$on('registration:createUser', function () {
                    $scope.createUser();
                });

                /**
                 * Guest Handling
                 */
                if (cmUserModel.isGuest() !== false) {
                    $scope.handleGuest = true;
                }

                // transfer data between routeChanges
                var clearTransferScopeData = cmTransferScopeData.create($scope, {
                    id: 'registration',
                    ignoreVar: 'password',
                    scopeVar: 'formData',
                    onSet: function () {
                        this.noneScopeData = $scope.reservationSecrets;
                    },
                    onGet: function (formData, noneScopeData) {
                        if (noneScopeData != null)
                            $scope.reservationSecrets = noneScopeData
                    }
                });
            }
        }
    }
]);