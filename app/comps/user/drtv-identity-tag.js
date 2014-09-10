'use strict';

angular.module('cmUser').directive('cmIdentityTag', [
    // no dependencies
    function(){
        return {
            restrict: 'E',
            scope: {
                identity: "=cmData"
            },
            templateUrl: 'comps/user/drtv-identity-tag.html',
            controller: function ($scope) {
                //console.log('cmIdentityTag');
            }
        }
    }
]);