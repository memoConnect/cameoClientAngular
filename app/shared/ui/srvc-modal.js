angular.module('cmUi').service('cmModal',[

    '$rootScope',
    'cmObject',
    'cmLogger',
    '$compile',
    '$document',

    function($rootScope, cmObject, cmLogger, $compile, $document){

        var modal_instances = {},
            modalService = {}

        cmObject.addEventHandlingTo(modalService)

        modalService.visible = false;

        modalService.register = function(id, scope){

            if(!id){
                cmLogger.error('cmModal: unable to register modal without an id.')
                return null
            }

            var old_scope = modal_instances[id]

            if(old_scope != scope){
                modal_instances[id] = scope
                this.trigger('register', id)
            }

            return this
            
        }

        modalService.open = function(id, data){
            if(modal_instances[id]){
                modal_instances[id]
                .setData(data)
                .open() 
            } else {
                this.on('register', function(registered_id){
                    if(registered_id == id) 
                        modal_instances[id]
                        .setData(data)
                        .open() 
                })
            }
            return this
        }

        modalService.close = function(id){
            modal_instances[id].close()
            return this
        }

        modalService.closeAll = function(){
            angular.forEach(modal_instances, function(modal_instance, key){
                modal_instance.close()
            })
            return this
        }

        modalService.create = function(config, template){
            console.log(angular.element(document.querySelector('#'+config.id)).length)
            if(angular.element(document.querySelector('#'+config.id)).length > 0){
                return false;
            }

            var attrs = '',
                scope = $rootScope.$new()

            //Todo: könnte man schöner machen:
            angular.forEach(config, function(value, key){
                attrs += key+'="'+value+'"'
            })

            $compile('<cm-modal '+attrs+' >'+(template||'')+'</cm-modal>')(scope)

            return this;
        }



        $rootScope.openModal    = modalService.open
        $rootScope.closeModal   = modalService.close
        $rootScope.isModalVisible = modalService.visible
//        $rootScope.$watch('isModalVisible' ,function(newValue){
//            console.log('watch modal '+newValue)
//            $rootScope.isModalVisible = newValue;
//        });

        //close all modals on route change:
        $rootScope.$on('$routeChangeStart', function(){
            modalService.closeAll();
        })

        $document.bind('keydown', function (evt) {
            if (evt.which === 27) {
                modalService.closeAll();
            }
        });

        return modalService
    }
])
