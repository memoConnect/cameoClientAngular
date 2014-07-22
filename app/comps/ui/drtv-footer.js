'use strict';

/**
 * @ngdoc directive
 * @name cmUi.directive:cmFooter
 * @description
 * Footer navigation
 *
 * @restrict E
 * @requires $location
 * @requires cmTranslate
 *
 * @example
 <example module="cmUi">
     <file name="style.css">
         cm-footer {
          display: block;
          position: relative;
          bottom: 0;
          z-index: 9;
          background-color: #000000;
          padding: 0;
          font-size: 1.4rem;
          height: 4rem;
        }
         cm-footer button,
         cm-footer a {
          display: inline-block;
          height: 100%;
          text-align: center;
          border-radius: 0;
          background: transparent;
          border: none;
          padding: 0;
          color: #ffffff;
          overflow: hidden;
          text-decoration: none;
          line-height: 4rem;
        }
         cm-footer button.active,
         cm-footer a.active,
         cm-footer button:hover,
         cm-footer a:hover {
          color: #02bed2;
          box-shadow: 0 0.3em 0 #02bed2 inset;
          text-decoration: none;
        }
         cm-footer button.full-width,
         cm-footer a.full-width {
          display: block;
          width: 100%;
          color: #02bed2;
        }
         cm-footer button.deactivated,
         cm-footer a.deactivated {
          color: #444444;
          box-shadow: none;
        }
     </file>
     <file name="index.html">
         <link type="text/css" rel="stylesheet" href="../app/css/font-awesome.css"></link>
         default:
         <cm-footer cm-rubber-space></cm-footer>

         one button:
         <cm-footer>
            <button class="full-width">handle button <i class="fa cm-checkbox-right"></i></button>
         </cm-footer>
     </file>
 </example>
 */

angular.module('cmUi')
.directive('cmFooter',[
    'cmConfig',
    '$location',
    function (cmConfig, $location){
        return {
            restrict: 'E',
            transclude: true,
            scope: true,
            template: '<div ng-transclude></div>' +
                      '<div cm-rubber-space="withRepeat">'+
                          '<a ' +
                            'ng-repeat="btn in Object.keys(btns)" ' +
                            'href="#/{{btn}}" ' +
                            'class="btn-footer" ' +
                            'cm-weight="1" ' +
                            'cm-rubber-space-repeat ' +
                            'ng-class="{active:btns[btn].isActive}">' +
                            '<i ng-if="btns[btn].icon" class="fa {{btns[btn].icon}} cm-lg-icon"></i>' +
                            '{{btns[btn].i18n|cmTranslate}}' +
                          '</a>'+
                      '</div>',
            link: function(scope, element, attrs){
                scope.btns = {};
                scope.Object = Object;

                // set menu btns from config
                if(element[0].querySelector('[ng-transclude]').innerHTML == '') {
                    scope.btns = cmConfig.footer || {};
                    // set active & width
                    var btns = Object.keys(scope.btns);
                    angular.forEach(btns, function (btnHref) {
                        var btn = scope.btns[btnHref];
                        btn.isActive = btnHref != '' && $location.$$path.search(btnHref) != -1;
                    });
                }

                if('cmAlwaysOnTop' in attrs){
                    element.css('z-index',10);
                } else {
                    element.css('z-index',9);
                }
            }
        }
    }
]);