'use strict';

angular.module('cmUi').directive('cmBack',[
    '$rootScope',
    '$window',
    '$location',
    function ($rootScope, $window, $location){
        return {
            restrict: 'AE',
            scope: true,
            template: '<div class="back-wrap">'+
                        '<i class="fa cm-left" ng-show="isVisible"></i>'+
                        '<span ng-if="pageTitle">{{pageTitle}}</span>'+
                      '</div>',
            controller: function($scope, $element, $attrs){
                // vars
                $scope.isVisible = $rootScope.urlHistory.length > 1 ? true : false;
                $scope.pageTitle = '';
                $scope.fakeBack = '';
                // check page-title attribute in directive
                if('pageTitle' in $attrs){
                    $scope.pageTitle = $scope.$eval($attrs.pageTitle);
                }
                // check default back-to attribute
                if('backTo' in $attrs){
                    $scope.backTo = $attrs.backTo;
                    $scope.isVisible = true;
                }

                function goBack(){
                    // if history has more then one index
                    if($rootScope.urlHistory.length > 0 && ('plainBack' in $attrs) == false){
                        $window.history.back();
                        // if is set an default path in route
                    } else if($scope.backTo != ''){
                        $location.path($scope.backTo);
                        $scope.$apply();
                    }
                }

                // bind click event
                $element.on('click', goBack);
            }
        }
    }
]);