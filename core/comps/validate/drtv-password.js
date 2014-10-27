'use strict';

angular.module('cmValidate').directive('cmPassword', [
    'cmCrypt',
    function (cmCrypt) {
        return  {
            restrict: 'E',
            require: 'ngModel',
            templateUrl: 'comps/validate/drtv-password.html',
            scope: {
                password: '=ngModel',
                tabindex: '@cmTabindex',
                withStars: '@cmWithStars'
            },
            controller: function($scope){

                $scope.withStars = $scope.withStars || true;

                $scope.nextTabIndex = parseInt($scope.tabindex) + 1;

                $scope.showConfirmPWStatus = false;
                $scope.passwordType = 'password';
                $scope.showPassword = false;
                $scope.showPasswordLengthError = false;
                $scope.showPasswordEmptyError = false;

                $scope.$on('cm-password:empty', function(){
                    $scope.showPasswordEmptyError = true;
                });

                $scope.$on('cm-password:reset', function(){
                    $scope.pw = '';
                    $scope.pwConfirm = '';
                    $scope.checkPWStrength();
                });

                $scope.checkPasswordLength = function(pw){
                    if(pw.length > 0 && pw.length < 6){
                        $scope.showPasswordLengthError = true;
                    } else {
                        $scope.showPasswordLengthError = false;
                    }
                };

                $scope.togglePassword = function(){
                    if($scope.showPassword){
                        $scope.showPassword = false;
                        $scope.passwordType = 'password';
                    } else {
                        $scope.showPassword = true;
                        $scope.passwordType = 'text';
                    }
                };

                $scope.checkPWStrength = function(){
                    var pw = $scope.pw;

                    $scope.showPasswordEmptyError = false;

                    if(pw != undefined && pw != ''){
                        $scope.checkPasswordLength(pw);

                        $scope.showStrengthMeter= true;
                        var bits = passchk_fast.passEntropy(pw);

                        if(bits < 28){
                            $scope.bgColor = 'very-weak';
                        } else if(bits < 36){
                            $scope.bgColor = 'week';
                        } else if(bits < 60){
                            $scope.bgColor = 'reasonable-normal';
                        } else if(bits < 128){
                            $scope.bgColor = 'strong';
                        } else {
                            $scope.bgColor = 'very-strong';
                        }

                        $scope.percent = (1+(bits>10 ? 100*Math.pow((Math.log(bits-10)/Math.log(bits-3)), 10) : 0))+'%';
                        //100*Math.max(0,(1-Math.pow(1.4,((bits-10)*-0.08))))
                        //100*bits / Math.max(128, bits)
                    } else {
                        $scope.percent = '0%';
                        $scope.bgColor = 'very-weak';
                    }
                };

                /**
                 * validates both password inputs
                 */
                $scope.confirmPW = function(){
                    if(!$scope.pw || !$scope.pwConfirm)
                        return false;

                    if($scope.pw == $scope.pwConfirm){
                        $scope.showConfirmPWStatus = true;
                        $scope.showPasswordEmptyError = false;
                        setPassword(cmCrypt.hash($scope.pw));
                    } else {
                        $scope.showConfirmPWStatus = false;
                        setPassword('none');
                    }
                };

                /**
                 * Wrapper Function to inject Password in extern Controller
                 * if password (empty || none) it is wrong, else it is right
                 */
                function setPassword(pw){
                    if(angular.isDefined(pw)){
                        $scope.password = pw;
                    }
                }
            }
        }
    }
]);