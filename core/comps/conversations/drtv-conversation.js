'use strict';

/**
 * @ngdoc directive
 * @name cmWidgets.directive:cmWidgetConversation
 * @description
 * Display Conversation and provides functionality.
 *
 * @restrict AE
 */

angular.module('cmConversations')
.directive('cmConversation', [

    'cmConversationFactory', 'cmUserModel', 'cmCrypt', 'cmLogger', 'cmNotify',
    'cmModal', 'cmEnv', 'cmSettings', 'cmKeyStorageService', 'cmTransferScopeData',
    '$location', '$rootScope', '$document', '$routeParams', '$q',

    function (cmConversationFactory, cmUserModel, cmCrypt, cmLogger, cmNotify,
              cmModal, cmEnv, cmSettings, cmKeyStorageService, cmTransferScopeData,
              $location, $rootScope, $document, $routeParams, $q) {
        return {
            restrict: 'AE',
            templateUrl: 'comps/conversations/drtv-conversation.html',
            scope: true,

            controller: function ($scope, $element, $attrs) {
                
                var self                 = this,
                    conversation_subject = $scope.$eval($attrs.cmSubject),
                    conversation_offset  = $attrs.offset,
                    conversation_limit   = $attrs.limit,
                    filesForMessage      = [],
                    showedAsymmetricKeyError = false,
                    storageService = new cmKeyStorageService('conversation-recipient-view');

                $scope.goto = $rootScope.goto;
                $scope.openFastRegister = $rootScope.openFastRegister;
                $scope.showLogin = $rootScope.showLogin;

                $scope.isSending        = false;
                $scope.isSendingAbort   = false;

                $scope.recipientName = '';
                function showRecipientName(identity){
                    $scope.recipientName = identity.getDisplayName();
                }

                // show name of incoming identity
                $scope.showName = function(identity){
                    if(identity && !('isAppOwner' in identity) && $scope.recipientName != identity.getDisplayName()){
                        showRecipientName(identity);

                        identity.on('update:finished', function(){
                            showRecipientName(identity);
                        });
                    }
                };

                /**
                 * handle Recipient View
                 */
                $scope.showGrid = cmSettings.get('defaultShowRecipientAvatar'); // degault grid off, wenn recipient.legnth > 2
                if(!$scope.conversation.state.is('new')){
                    $scope.showGrid = storageService.get($scope.conversation.id)
                }
                $scope.toggleRecipientView = function(){
                    if($scope.showGrid){
                        $scope.showGrid = false;
                        if(!$scope.conversation.state.is('new')){
                            storageService.set($scope.conversation.id, false)
                        }
                    } else {
                        $scope.showGrid = true;
                        if(!$scope.conversation.state.is('new')){
                            storageService.set($scope.conversation.id, true)
                        }
                    }
                };

                $scope.loadPreviousMessages = function(){
                    $scope.conversation.update();
                };

                function checkConversationSetup(){
                    if($scope.isSending)
                        return $q.reject('message upload already in progress.')

                    $scope.isSending        = true;
                    $scope.isSendingAbort   = false;

                    if(!$scope.conversation.checkConsistency()){
                        $scope.conversation.trigger('save:aborted');
                        $scope.isSendingAbort = true;
                        return $q.reject('conversation unreliable.')
                    }

                    //Is the conversation newly created and has not been saved to the backend yet?                  
                    
                    return  $scope.conversation.state.is('new')
                                //The conversations has not been saved to the Backend, do it now:
                            ?   $scope.conversation.save()
                                //When that is done try again to send the message:
                                .then( function(conversation_data){ 
                                    $scope.conversation.importData(conversation_data)
                                    cmConversationFactory.register($scope.conversation);
                                    return $q.when()
                                })
                            :   $q.when()
                }

                function prepareFiles(passphrase){
                    /**
                     * check if files exists
                     * after success sendMessage
                     */
                    
                    var deferred = $q.defer()
                   
                    $rootScope.$broadcast('cmFilesCheckFiles', {
                        passphrase: passphrase,
                        conversationId: $scope.conversation.id,
                        success: function(files) {
                            if (files.length > 0) 
                                filesForMessage = files;
                            deferred.resolve()
                        },
                        error: function(maxFileSize, header) {
                            $scope.isSending = false;
                            $scope.isSendingAbort = true;
                            cmNotify.warn('CONVERSATION.WARN.FILESIZE_REACHED', {
                                ttl: 0,
                                i18n: {
                                    maxFileSize: maxFileSize,
                                    fileSize: header['X-File-Size'],
                                    fileName: header['X-File-Name']
                                }
                            });
                            deferred.reject('file too large.')
                        }
                    });   

                    return deferred.promise
                }


                /**
                 * start sending process
                 * with preparing files for upload
                 * after preparation send message
                 */
                $scope.send = function(){

                    if(
                            (!$scope.newMessageText || $scope.newMessageText.length == 0)
                        &&  $scope.files.length  == 0
                    ){
                        cmNotify.warn('CONVERSATION.WARN.MESSAGE_EMPTY', {ttl:5000});
                        return $q.reject('message invalid.')
                    }      

                    var new_message =   $scope.conversation.messages
                                        .create({conversation:$scope.conversation})
                                        .setText($scope.newMessageText)

                    new_message.state.set('sending')
                    new_message.created = new Date().getTime()
                    new_message.id      = '#new_message'

                    return  checkConversationSetup()
                            .then(function(){
                                return  $scope.conversation.getPassphrase()
                                        .catch(function(){
                                                return  $scope.conversation.isEncrypted()
                                                        ?   $q.reject('access denied')
                                                        :   $q.when(null)       //Todo: null for 'not encrypted' old convention
                                        })
                                        .then(function(passphrase){
                                            return  $q.when()
                                                    .then(function(){
                                                        return prepareFiles(passphrase)
                                                    })
                                                    .then(function(){
                                                        return  $scope.conversation.isEncrypted()

                                                                ?   new_message
                                                                    .addFiles(filesForMessage)
                                                                    .encrypt(passphrase)
                                                                    .save()

                                                                :   new_message
                                                                    .addFiles(filesForMessage)
                                                                    .setPublicData(['text','fileIds'])
                                                                    .save()  
                                                    })

                                        })
                            })
                            .then(
                                function(){
                                    // tidy up:
                                    clearTransferScopeData();
                                    $scope.newMessageText = '';
                                    filesForMessage = [];
                                    
                                    //Todo: This is not the right place to count messages:
                                    $scope.conversation.numberOfMessages ++

                                    console.log('ID;',$scope.conversation.id)
                                    $rootScope.gotoConversation($scope.conversation.id)
                                },
                                function(){
                                    $scope.conversation.messages.deregister(new_message)
                                }
                            )
                            .finally(function(){
                                new_message.state.unset('sending')
                                $scope.isSending = false;
                            })                                    

                  
                };


                $rootScope.$$listeners.sendOnReturn = [];
                $rootScope.$on('sendOnReturn',$scope.send);

                $scope.showAsymmetricKeyError = function(){
//                    cmLogger.debug('cmConversationDRTV.showAsymmetricKeyError')

                    if(!$scope.conversation.state.is('new')
                        && $scope.conversation.getKeyTransmission() == 'asymmetric'
                        && $scope.conversation.userHasPrivateKey() == false
                    ){
                        cmNotify.warn('CONVERSATION.WARN.ASYMMETRIC_DECRYPT_ERROR',{ttl:0});
                        return true
                    }
                    return false
                };

                $scope.showGoToSettingsModal = function(){
                    if(
                            !$scope.conversation.state.is('new')
                        &&  $scope.conversation.passwordRequired()
                        &&  !$scope.conversation.password
                    ){
                        // switcher for purl and conversation
                        var settingsLinker = {type:'',typeId:''};
                        if('purlId' in $routeParams){
                            settingsLinker.type = 'purl';
                            settingsLinker.typeId = $routeParams.purlId;
                        } else {
                            settingsLinker.type = 'conversation';
                            settingsLinker.typeId = $routeParams.conversationId;
                        }
                        cmNotify.warn('CONVERSATION.WARN.PASSWORD_NEEDED',{ttl:0,i18n:settingsLinker});
                        return true
                    }

                    return false
                };
                

                this.addPendingRecipients = function(){
                    if($scope.conversation.state.is('new')){
                        $rootScope.pendingRecipients = $rootScope.pendingRecipients || [];
                        $rootScope.pendingRecipients.forEach(function(pendingRecipient){
                            $scope.conversation.addRecipient(pendingRecipient);
                        });
                        $rootScope.pendingRecipients = []
                    }
                };

                function init(conversation){
                    $scope.conversation = conversation;
                    $rootScope.pendingConversation = $scope.conversation;

                    // reload details of conversation
                    $scope.conversation.update(undefined, true);

                    self.addPendingRecipients();
                    // $scope.showAsymmetricKeyError();

                    // first focus on message
                    if($scope.conversation.state.is('new') && cmEnv.isNotMobile){
                        $document[0].querySelector('cm-conversation .answer textarea').focus();
                    }

                    $scope.show_contacts  = false;

    //                $scope.showGoToSettingsModal(); 18.07.2014 BS can be removed because on updated:finished event do this check

                    /** Event callbacks **/
                    function callback_update_finished(){
                        $scope.showAsymmetricKeyError();
                        $scope.showGoToSettingsModal();
                    }

                    function callback_password_missing(){
                        // switcher for purl and conversation, @Todo: vereinheitlichen
                        var settingsLinker = {type:'',typeId:''};
                        if('purlId' in $routeParams){
                            settingsLinker.type = 'purl';
                            settingsLinker.typeId = $routeParams.purlId;
                        } else {
                            settingsLinker.type = 'conversation';
                            settingsLinker.typeId = $routeParams.conversationId;
                        }
                        cmNotify.warn('CONVERSATION.WARN.NO_PASSWORD', {ttl:0, i18n: settingsLinker});
                    }

                    function callback_recipients_missing(){
                        // switcher for purl and conversation, @Todo: vereinheitlichen
                        // var settingsLinker = {type:'',typeId:''};
                        // if('purlId' in $routeParams){
                        //     settingsLinker.type = 'purl';
                        //     settingsLinker.typeId = $routeParams.purlId;
                        // } else {
                        //     settingsLinker.type = 'conversation';
                        //     settingsLinker.typeId = $routeParams.conversationId;
                        // }
                        // cmNotify.warn('CONVERSATION.WARN.RECIPIENTS_MISSING',
                        //     {
                        //         ttl:0, 
                        //         i18n: settingsLinker,
                        //         template: '<small>{{\'CONVERSATION.WARN.RECIPIENTS_MISSING_OKAY\'|cmTranslate}}</small>'+
                        //                   '<i ng-click="conversation.solitary = !conversation.solitary" ng-class="{\'cm-checkbox\':!conversation.solitary, \'cm-checkbox-right\':conversation.solitary}" class="fa cm-ci-color ml15" data-qa="checkbox-dont-ask-me-again"></i>',
                        //         templateScope: $scope
                        //     }
                        // );
                        
                        cmModal.confirm({
                            title:  'CONVERSATION.WARN.RECIPIENTS_MISSING',
                            text:   'CONVERSATION.CONFIRM.RECIPIENTS_MISSING',
                        })
                        .then(function(){
                            $scope.conversation.solitary = true
                            $scope.send()
                        })
                    
                    }

                    function callback_save_aborted(){
                        $scope.isSending = false;
                    }

                    $scope.conversation
                    .one('update:finished',      callback_update_finished)
                    .on('password:missing',      callback_password_missing)
                    .on('recipients:missing',    callback_recipients_missing)
                    .on('save:aborted',          callback_save_aborted)

                    var stop_listening_to_logout =  $rootScope.$on('logout', function(){
                            $rootScope.pendingRecipients = [];
                            $rootScope.pendingConversation = null;
                        });

                    var stop_listening_to_idenity_switch =  $rootScope.$on('identity:switched', function(){
                            $rootScope.pendingRecipients = [];
                            $rootScope.pendingConversation = null;
                        });

                    $scope.$on('$destroy', function(){
                        $scope.conversation.off('update:finished',       callback_update_finished);
                        $scope.conversation.off('password:missing',      callback_password_missing);
                        $scope.conversation.off('recipients:missing',    callback_recipients_missing);
                        $scope.conversation.off('save:aborted',          callback_save_aborted);

                        stop_listening_to_logout();
                        stop_listening_to_idenity_switch();
                    });
                }

                // transfer data between routeChanges
                var clearTransferScopeData = cmTransferScopeData.create($scope,{
                    id:'conversation-'+($scope.conversation.id||'new'),
                    scopeVar:'newMessageText',
                    onSet: function(){
                        this.noneScopeData = $scope.files;
                    },
                    onGet: function(formData, noneScopeData){
                        if(noneScopeData != null)
                            $scope.files = noneScopeData;
                    }
                });

                init($scope.conversation);
            }
        }
    }
]);