'use strict';

angular.module('cmUi').directive('input', [
    '$rootScope',
    '$timeout',
    function ($rootScope, $timeout) {
        return {
            restrict: 'EA',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model #https://docs.angularjs.org/api/ng/type/ngModel.NgModelController

                var initValue = '',
                    timeout;

                function apply(){
                    scope.$apply(function(){
                        setValue();
                    });
                }

                /**
                 * @todo Idee
                 * umbau pristine broadcast
                 * ein Formular kann mehrere Elemente beinhalten und muss dementsprechend auch den Status pro Element handlen
                 * aus der Summer der Pristine Statie der Elemente, ergibt sich, ob das Formular geändert wurde oder nicht
                 */
                function broadcastPristine(bool){
                    if(bool){
                        $rootScope.$broadcast('pristine:true');
                    } else {
                        $rootScope.$broadcast('pristine:false');
                    }

                }

                function getValue(){
                    return element.val() || '';
                }

                function setValue(){
                    ngModel.$setViewValue(getValue());
                    ngModel.$commitViewValue();
                    $rootScope.$broadcast('multi-input:changed', ngModel);
                }

                function handleChange(){
                    if(initValue != getValue()){
                        broadcastPristine();
                    } else if(initValue == getValue()){
                        broadcastPristine(true);
                    }

                    if(timeout){
                        $timeout.cancel(timeout);
                    }

                    if('cmAdaptiveChange' in attrs){
                        timeout = $timeout(function(){
                            apply();
                        },attrs.cmAdaptiveChange || 1000);
                    } else {
                        timeout = $timeout(function (){
                            apply();
                        }, 100)
                    }
                }

                function init(){
                    initValue = getValue();
                }

                init();

                element
                    .unbind('input')
                    .unbind('keydown')
                    .on('focus', handleChange)
                    //.on('keydown', handleChange)
                    .on('keyup', handleChange)
                    .on('blur', handleChange);


                scope.$on('$destroy', function(){
                    element
                        .off('focus', handleChange)
                        .off('keyup', handleChange)
                        .off('blur', handleChange);
                })
            }
        }
    }
]);