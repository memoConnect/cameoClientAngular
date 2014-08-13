'use strict';

angular.module('cmCore')
.directive('cmNotifySignal', [
    'cmNotify',
    function (cmNotify) {
        return {
            restrict: 'E',
            template: '<i class="fa with-response" ng-class="{\'cm-menu-weight-bell cm-orange\': ring, \'cm-menu-weight\': !ring}"></i>',
            scope: true,
            controller: function ($scope) {
                $scope.ring = false;

                function init(){
                    if(cmNotify.bellCounter > 0){
                        $scope.ring = true;
                    }
                }

                cmNotify.on('bell:ring', function(){
                    $scope.ring = true;
                });

                cmNotify.on('bell:unring', function(){
                    cmNotify.bellCounter = 0;
                    $scope.ring = false;
                });

                init();
            }
        }
    }
]);