'use strict';

angular.module('cmUi').directive('cmSearchInput',[
    '$document',
    '$rootScope',
    function($document, $rootScope){
        return {
            restrict: 'E',
            scope: {
                search: '=ngModel',
                cmOptions: '=cmOptions'
            },
            template: '<input data-qa="inp-list-search" id="inp-list-search" type="text" value="" ng-model="search" placeholder="{{placeholder}}">' +
                      '<i data-qa="btn-list-search-clear" class="fa" ng-click="clear()" ng-class="{\'cm-search\':showDefaultIcon && counterKeydown == 0,\'cm-checkbox-wrong\':counterKeydown > 0}"></i>',
            link: function(scope, element, attrs){

                scope.placeholder = attrs.placeholder || '';
                // wrapper events
                element
                .on('focus', function(){
                    scope.counterKeydown = 0;
                })
                .on('keydown', function(){
                    scope.counterKeydown++;
                })
                .on('keyup', function(){
                    if(scope.search == ''){
                        scope.counterKeydown = 0;
                        scope.$apply();
                    }
                    // on search jump to anchor
                    if(scope.options.scrollTo){
                        console.log('keyUp broadcast scroll:to')
                        $rootScope.$broadcast('scroll:to');
                    }
                });

                if(scope.options.hideElements){
                    var input = angular.element(element[0].querySelector('input')),
                        elementsToHide = angular.element($document[0].querySelectorAll(scope.options.hideElements));

                    input
                    .on('focus', function(){
                        elementsToHide.addClass('ng-hide');
                    })
                    .on('blur', function(){
                        elementsToHide.removeClass('ng-hide');
                    })
                }
            },
            controller: function($scope, $element, $attrs){
                // options for drtv
                $scope.options = angular.extend({}, {
                    withoutSearchIcon:false,
                    hideElements:undefined,
                    scrollTo:undefined
                }, $scope.cmOptions || {});

                $scope.counterKeydown = 0;

                $scope.showDefaultIcon = true;

                if($scope.options.withoutSearchIcon){
                    $scope.showDefaultIcon = false
                }

                $scope.clear = function(){
                    $scope.search = '';
                    $scope.counterKeydown = 0;
                }
            }
        }
    }
]);