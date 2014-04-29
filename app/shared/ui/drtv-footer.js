'use strict';

angular.module('cmUi').directive('cmFooter',[
    '$location',
    'cmTranslate',
    function ($location, cmTranslate){
        return {
            restrict: 'AE',
            priority: '0',

            link : function(scope, element){
                //if element has no children add default elements:
                if(element.children().length == 0 ) {
                    scope.btns.forEach(function(btn){
                        var el = angular.element('<a cm-weight="1">'+cmTranslate(btn.i18n)+'</a>');
                        el.toggleClass('active', btn.isActive ? true : false);
                        if(btn.href != '')
                            el.attr('href', '#'+btn.href);
                        else
                            el.addClass('deactivated');
                        element.append(el);
                    });
                }
            },
            controller: function($scope){
                $scope.btns = [
                    {i18n:'DRTV.FOOTER.TALKS',    href:'/talks'},
                    {i18n:'DRTV.FOOTER.CONTACTS', href:'/contacts'},
                    {i18n:'DRTV.FOOTER.MEDIA',    href:''}
                ];

                angular.forEach($scope.btns,function(btn){
                    btn.isActive = btn.href != '' && $location.$$path.search(btn.href) != -1;
                });
            }
        }
    }
]);