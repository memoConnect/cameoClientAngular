'use strict';

angular.module('cmUser').directive('cmNewAuthenticationRequest',[
    'cmAuth',
    'cmUserModel',
    'cmUtil',
    'cmCrypt',
    'cmLogger',
    '$timeout',
    '$document',
    '$rootScope',
    function (cmAuth, cmUserModel, cmUtil, cmCrypt, cmLogger, $timeout, $document, $rootScope){
        return {
            restrict: 'E',
            templateUrl: 'comps/user/drtv-new-authentication-request.html',
            controller: function($scope){
                function setErrorsToDefault(){
                    $scope.error = {
                        "emptyInput": false,
                        "wrongSecret": false
                    };
                }

                setErrorsToDefault();
                $scope.spinner = false;

                $scope.transactSecret = '';
                $scope.step = 1;

                $scope.acceptRequest = function(){
                    $scope.step = 2;

                    $timeout(function(){
                        var input = $document[0].querySelector('#inp-transactSecret');
                        input.focus();
                    }, 50);
                };

                $scope.verifyCode = function(){
                    setErrorsToDefault();
                    $scope.showSpinner();

                    if(cmUtil.validateString($scope.transactSecret)){
                        var localKeys = cmUserModel.loadLocalKeys();
                        var toKey = {};

                        localKeys.forEach(function(key){
                            if(key.id == $scope.data.toKeyId){
                                toKey = key;
                            }
                        });

                        if(!cmCrypt.isTransactionSecretValid({
                            userInput: $scope.transactSecret,
                            toKey: toKey,
                            encryptedTransactionSecret: $scope.data.encryptedTransactionSecret
                        })){
                            $scope.error.wrongSecret = true;
                            $scope.hideSpinner();
                        } else {
                            cmUserModel.signKey($scope.data.toKeyId, $scope.data.fromKeyId);
                        }
                    } else {
                        $scope.error.emptyInput = true;
                        $scope.hideSpinner();
                    }
                };

                $scope.showSpinner = function(){
                    $scope.spinner = true;
                };

                $scope.hideSpinner = function(){
                    $scope.spinner = false;
                };


                function finishRequest(){
                    cmLogger.debug('cmNewAuthenticationRequest.finishRequest');

                    cmAuth.deleteAuthenticationRequest($scope.data.id).then(
                        function(){
//                            $scope.step = 3;
                            $rootScope.closeModal('new-authentication-request');

                        },
                        function(){
                            //error
                            console.log('puff');
                        }
                    )
                }

                cmUserModel.on('signature:saved', finishRequest);

                $scope.$on('$destroy', function(){
                    cmUserModel.off('signature:saved', finishRequest);
                });
            }
        }
    }
]);