'use strict';

/**
 * @ngdoc object
 * @name cmConversationFactory
 * @description
 * Handles Conversation Instances<br />
 * create new instances and check if instances still exists
 *
 * @requires cmConversationsAdapter
 * @requires cmFactory
 * @requires cmStateManagement
 * @requires cmConversationModel
 * @requires $rootScope
 *
 */
angular.module('cmConversations').service('cmConversationFactory', [

    '$rootScope',
    'cmUserModel',
    'cmConversationsAdapter',
    'cmFactory',
    'cmStateManagement',
    'cmConversationModel',
    'cmLogger',
    'cmCallbackQueue',

    function($rootScope, cmUserModel, cmConversationsAdapter, cmFactory, cmStateManagement, cmConversationModel, cmLogger, cmCallbackQueue) {
        var self = cmFactory(cmConversationModel);

        var _quantity   = 0,
            _limit      = 10,
            _offset     = 0;

        self.state = new cmStateManagement(['loading']);

        self.getList = function(limit, offset){
//            cmLogger.debug('cmConversationFactory.getList');

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

                    return cmCallbackQueue.push(
                        data.conversations.map(function (conversation_data) {
                            return  function(){
                                        self.create(conversation_data);
                                    }
                        })
                    )
                }
            ).finally(
                function(){
                    self.state.unset('loading');
                }
            )
        };

        self.getLimit = function(){
            return _limit;
        };

        /**
         * @ngdoc method
         * @methodOf cmConversationFactory
         *
         * @name getQuantity
         * @description
         * Returns Number of all Conversations
         * Quantity is first set in getList()
         *
         * @returns {Number} quantity Number of all Conversations
         */
        self.getQuantity = function(){
            return _quantity;
        };

        /**
         * EventHandling
         */
        $rootScope.$on('logout', function(){ self.reset() });

        $rootScope.$on('identity:switched', function(){
            cmUserModel.one('update:finished', function(){
                self.reset();
                self.getList();
            })
        });

        cmConversationsAdapter.on('message:new', function(event,data){
            self
                .create(data.conversationId)
                .trigger('message:new', data.message)
        });

        cmConversationsAdapter.on('conversation:new', function(event,data){
            self.create(data)
        });

        /**
         * @TODO CallbackQueue? Fingerprint check! Performance!
         */
        cmConversationsAdapter.on('passphrases:updated', function(event, data){
            //cmLogger.debug('cmConversationFactory.on:passphrase:updated');

            if(typeof data == 'object') {
                if ('keyId' in data && typeof data.keyId == 'string' && data.keyId.length > 0) {
                    var localKeys = cmUserModel.loadLocalKeys();
                    var checkKeyId = false;

                    localKeys.forEach(function (key) {
                        if (key.id == data.keyId) {
                            checkKeyId = true;
                        }
                    });

                    if (checkKeyId) {
                        self.forEach(function (conversation) {
                            conversation.load();
                        });
                    }
                }
            }
            //cmCallbackQueue.push(
            //    // iterate over conversations and decrypt
            //);
        });

        return self;
    }
]);