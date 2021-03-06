'use strict';

angular.module('cmWidgets').directive('cmWidgetHelpList', [
    'cmUserModel', 'cmConfig', 'cmUtil', 'cmNotify',
    '$window', '$location',
    function(cmUserModel, cmConfig, cmUtil, cmNotify,
             $window, $location){
        return {
            restrict: 'E',
            templateUrl: 'widgets/help/wdgt-help-list.html',
            controller: function ($scope) {
                $scope.overview = cmConfig.routeHelp;
                $scope.overviewKeys = Object.keys($scope.overview);

                cmNotify.unringBimmel('markHelp');

                $scope.handleLink = function($event, pageUrl, isDisabled, route){
                    if('externLink' in route){
                        $window.open(route.externLink);
                        return false;
                    }

                    if('link' in route){
                        // file:///android_asset/www/index.html#/login
                        if(cmUtil.startsWith($location.$$absUrl, 'file:///')) {
                            $window.location = route.link;
                        // http://localhost:8000/app/#/settings
                        } else if($location.$$absUrl.indexOf('/#/') != -1) {
                            var arr_location = $location.$$absUrl.split('/#/');
                            location.href = arr_location[0] + '/' + route.link;
                        }

                        return false;
                    }

                    if(typeof pageUrl !== 'undefined' && isDisabled == undefined){
                        $event.stopPropagation();
                        $event.preventDefault();
                        $scope.goTo(pageUrl);
                    }
                };

                $scope.checkActive = function(page){
                    if($location.$$url.indexOf('identity') != -1 && page.indexOf('identity') != -1){
                        if(page.indexOf('key') != -1 && $location.$$url.indexOf('key') != -1){
                            return true;
                        } else if(page.indexOf('key') == -1 && $location.$$url.indexOf('key') == -1){
                            return true;
                        }

                    } else if($location.$$url.indexOf(page) != -1){
                        return true;
                    }

                    return false;
                };

            }
        }
    }
]);