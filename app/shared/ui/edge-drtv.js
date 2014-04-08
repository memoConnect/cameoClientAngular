function cmEdge(){
    return{
        restrict: 'AE',
        transclude: true,

        link: function(scope, element, attrs, controller, transclude){
            var background = angular.element('<i class="fa cm-add-edge background"></i>'),
                foreground = angular.element('<div class="foreground"></div>')

            transclude(scope, function(clone){                
                foreground.append(angular.element(clone))
            })
                             
            element
            .append(background)
            .append(foreground)
        }
    }
}