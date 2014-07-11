'use strict';

angular.module('cmUi').directive('cmView', [
    '$route',
    'cmUserModel',
    function ($route, cmUserModel){
        return {
            restrict: 'A',
            controller: function($scope){
                if(cmUserModel.isGuest() !== false && $route.current.$$route.guests !== true){

                    console.log(cmUserModel.isGuest(), cmUserModel.data.userType, $route.current.$$route.guests)

                    //cmUserModel.doLogout(true,'drtv-view only for guests');

                    return false;
                }
                $scope.css = $route.current.$$route.css;
            }
        }
    }
]);