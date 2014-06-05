'use strict';

angular.module('cmConversations').service('cmConversationFactory', [
    'cmConversationsAdapter',
    'cmFactory',
    'cmStateManagement',
    'cmConversationModel',
    '$rootScope',
    function(cmConversationsAdapter, cmFactory, cmStateManagement, cmConversationModel, $rootScope) {
        var self = cmFactory(cmConversationModel);

        var _quantity = 0,
            _limit = 10,
            _offset = 0;

        self.state = new cmStateManagement(['loading']);

        self.getList = function(limit, offset){
            self.state.set('loading');

            if(typeof limit === 'undefined'){
                limit = _limit;
            }

            if(typeof offset === 'undefined'){
                offset = _offset;
            }

            cmConversationsAdapter.getConversations(limit, offset).then(
                function (data) {
                    _quantity = data.numberOfConversations;

                    data.conversations.forEach(function (conversation_data) {
                        self.create(conversation_data);
                    })
                }
            ).finally(
                function(){
                    console.log('hier')
                    self.state.unset('loading');
                }
            )
        };

        /**
         * EventHandling
         */
        $rootScope.$on('logout', function(){ self.reset() })

        return self;
    }
]);