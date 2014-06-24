'use strict';

angular.module('cmUi').directive('cmScrollTo',[
    '$timeout',
    '$rootScope',
    '$document',
    function ($timeout, $rootScope, $document){
        return {
            restrict: 'A',
            link: function($scope, $element, $attrs){

                function initTimeout(target){
                    var anchor = angular.element($document[0].querySelector(target)),
                        bodyAndHtml = angular.element($document[0].querySelectorAll('body,html'));

                    $timeout(function(){
                        var bottom = anchor[0].offsetTop + 5000;
                        angular.forEach(bodyAndHtml,function(tag){
                            tag.scrollTop = bottom;
                        });
                    },250);
                }

                if($attrs.ngRepeat && $scope.$last && $attrs.cmScrollTo != ''){
                    initTimeout($attrs.cmScrollTo);
                    // this because of cm-blob-image
                    $rootScope.$on('scroll:to',function(event,target){
                        initTimeout(target);
                    })
                } else if(!$attrs.ngRepeat){
                    initTimeout($attrs.cmScrollTo);
                }
            }
        }
    }
]);