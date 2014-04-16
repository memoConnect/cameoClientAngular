'use strict';

angular.module('cmUi').directive('cmNavTabs',[
    '$routeParams',
    function (){
        return {
            scope: true,
            templateUrl: 'shared/ui/nav-tabs.html',

            controller: function($rootScope, $scope, $routeParams){
                /**
                 * search in tabs array for default
                 * @returns {string}
                 */
                function findDefault(){
                    var i18n = "";
                    angular.forEach($scope.tabs, function(tab){
                        if('default' in tab){
                            i18n = tab.i18n;
                        }
                    });
                    return i18n
                }

                $scope.setActiveTab = function(tab){
                    $scope.activeTab = tab;
                    $rootScope.activeTab = tab;
                };

                $scope.setActiveTab($routeParams.tab && $routeParams.tab != ''
                    ? $routeParams.tab.toUpperCase()
                    : findDefault().toUpperCase())
            }
        }
    }
]);