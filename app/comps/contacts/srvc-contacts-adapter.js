'use strict';

angular.module('cmContacts').service('cmContactsAdapter',[
    'cmApi',
    'cmLogger',
    'cmUtil',
    function (cmApi, cmLogger, cmUtil){
        return {
            /**
             * Search for cameoId Users
             * @param string
             * @returns {*|HttpPromise}
             */
            searchCameoIdentity: function(string, excludeContacts){
                return cmApi.post({
                    path:'/identity/search',
                    data: {
                        search: string,
                        fields: ['cameoId','displayName'],
                        excludeContacts: excludeContacts || true
                    }
                });
            },
            /**
             * Get Contact List
             * @param limit
             * @param offset
             * @returns {*|Array|Object|Mixed|promise|!webdriver.promise.Promise}
             */
            getAll: function(limit, offset){
                return cmApi.get({
                    path:'/contacts' + cmUtil.handleLimitOffset(limit,offset)
                });
            },
            /**
             * Get one Contact in Detail
             * @param id
             * @returns {*|Array|Object|Mixed|promise|!webdriver.promise.Promise}
             */
            getOne: function(id){
                return cmApi.get({
                    path:'/contact/'+id
                })
            },
            /**
             * Get User Groups
             * @returns {*|Array|Object|Mixed|promise|!webdriver.promise.Promise}
             */
            getGroups: function(){
                return cmApi.get({
                    path:'/contact-groups'
                })
            },
            /**
             * Get User from one User Group
             * @param group
             * @param limit
             * @param offset
             * @returns {*|Array|Object|Mixed|promise|!webdriver.promise.Promise}
             */
            getAllFromGroup: function(group,limit,offset){
                return cmApi.get({
                    path:'/contact-group/' + group + cmUtil.handleLimitOffset(limit,offset)
                })
            },
            getFriendRequests: function(){
                return cmApi.get({
                    path:'/friendRequests'
                })
            },
            sendFriendRequest: function(id, message){
                return cmApi.post({
                    path:'/friendRequest',
                    data: {identityId: id, message: message || null}
                })
            },
            answerFriendRequest: function(id, type){
                return cmApi.post({
                    path:'/friendRequest/answer',
                    data: {identityId:id, answerType:type}
                })
            },
            addContact: function(data){
                return cmApi.post({
                    path:'/contact',
                    data: {identity:data.identity||{}, groups:data.groups||[]}
                })
            },
            editContact: function(id, data){
                return cmApi.put({
                    path:'/contact/'+id,
                    data: data||{}
                })
            },
            deleteContact: function(id){
                return cmApi.delete({
                    path:'/contact/'+id
                })
            }
        }
    }
]);