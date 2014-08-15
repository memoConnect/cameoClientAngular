'use strict';

angular.module('cmUi').directive('cmLoader',[
    function (){
        return {
            restrict:   'AE',
            template:   function(element, attrs){
                            return  {
                                        'spinner'   :   '<div class="spinner-wrapper" ng-show="loading"><div class="spinner"></div></div>',
                                        'balls'     :   '<div class="followingBallsWrapper">'+
                                                            '<div class="G_1 followingBallsG"></div>'+
                                                            '<div class="G_2 followingBallsG"></div>'+
                                                            '<div class="G_3 followingBallsG"></div>'+
                                                            '<div class="G_4 followingBallsG"></div>'+
                                                        '</div>'
                                    }[attrs.type || 'spinner']
                        },

            controller: function($scope, $element, $attrs){
                $scope.loading = false;

                var type = $attrs.type || 'spinner'

                $element.addClass(type)

                var opts = {};
                if($attrs.cmLength)
                    opts.length = $attrs.cmLength;
                if($attrs.cmRadius)
                    opts.radius = $attrs.cmRadius;
                if($attrs.cmColor)
                    opts.color = $attrs.cmColor;
                if($attrs.cmWidth)
                    opts.width = $attrs.cmWidth;

                if(type =='spinner'){
                    var spinner = new Spinner(opts);
                    var loadingContainer = angular.element($element[0].querySelector('.spinner'))[0];
                }

                $scope.animate = function(start){
                    if(start == undefined) start = true

                    if(type == 'spinner'){
                        if(start){
                            console.dir(spinner)
                            spinner = spinner.spin()
                            loadingContainer.appendChild(spinner.el);
                        }else{
                            spinner.stop();
                            loadingContainer.innerHTML = '';
                        }
                    }

                    if(type == 'balls'){
                    }
                }

                $scope.$watch($attrs.ngShow, function(bool){
                    if(bool != false){
                        console.log('ngshow!')
                        $scope.animate(true)
                        $scope.loading = true
                    } else {
                        $scope.animate(false)
                        $scope.loading = false
                    }
                });

                /**
                 * @ngdoc event
                 * @name start
                 * @eventOf cmUi.directive:cmSpinner
                 * @description
                 * $scope.$on('cmSpinner:start',...)
                 */
                $scope.$on('cmLoader:start', function(){
                    $scope.animate(true)
                    $scope.loading = true
                });

                /**
                 * @ngdoc event
                 * @name stop
                 * @eventOf cmUi.directive:cmSpinner
                 * @description
                 * $scope.$on('cmSpinner:stop',...)
                 */
                $scope.$on('cmLoader:stop', function(){
                    $scope.animate(false)
                    $scope.loading = false
                });
            }
        }
    }
]);