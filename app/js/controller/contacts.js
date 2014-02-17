define([
    'app'
], function(app){
   'use strict';

    var mockResults = ['derMicha','dasEmpu','dutscher','reimerei','rhotp'];

    app.register.controller('ContactsCtrl',[
        '$scope',
        '$location',
        'cmContacts',
        'cmNotify',
        'cmLogger',
        function($scope, $location, cmContacts, cmNotify, cmLogger){
            $scope.navigation = [
                {id:'BACK',icon:'fa-chevron-left',href:'#/start'},
                {id:'ADD',icon:'fa-plus'},
                {id:'CONTACTS',icon:'fa-group'},
                {id:'REQUESTS',icon:'fa-link'}
            ];
            $scope.activeTab = 'ADD';
            $scope.setActiveTab = function(tab){
                $scope.activeTab = tab;
            };
        }]);

    app.register.directive('cmSearchCameoId',
        function(cmContacts, cmLogger){
            return {
                restrict: 'A',
                scope: {},
                templateUrl: 'tpl/modules/contacts/cm-search-cameo-id.html',
                controller: function($scope, $element, $attrs){
                    $scope.results = [];

                    $scope.search = function(){
                        if($scope.searchCameoId.string.$invalid){
                            $scope.results = [];
                            return false;
                        }

                        cmLogger.debug($scope.string);

                        cmContacts.searchCameoId($scope.string).
                        then(
                            function(data){
                                $scope.results = data;
                            },
                            function(){

                            }
                        );
                        return true;
                    };

                    $scope.sendFriendshipRequest = function(cameoId){
                        cmLogger.debug('sendFriendshipRequest to '+cameoId);
                        // TODO: cmApi/cmContacts stuff
                    };
                }
            }
        });

    app.register.directive('cmContactsList',
        function(cmContacts, cmLogger){
            return {
                restrict: 'A',
                scope: {},
                templateUrl: 'tpl/modules/contacts/cm-contacts-list.html',
                controller: function($scope, $element, $attrs){
                    $scope.contacts = null;

                    /**
                     * Get Contact List
                     */
                    $scope.getContacts = function(){
                        cmContacts.getAll(10,0).then(
                            function(data){
                                $scope.contacts = data;
                            },
                            function(){
                                $scope.contacts = null;
                            }
                        );
                    };

                    $scope.editContact = function(){
                        cmLogger.debug('editContact '+cameoId);
                        // TODO: cmApi stuff
                    };

                    $scope.deleteContact = function(cameoId){
                        cmLogger.debug('deleteContact '+cameoId);
                        // TODO: cmApi stuff
                    };
                }
            }
        });

    app.register.directive('cmContactRequestList',
        function(cmContacts, cmLogger){
            return {
                restrict: 'A',
                scope: {},
                templateUrl: 'tpl/modules/contacts/cm-request-list.html',
                controller: function($scope, $element, $attrs){
                    $scope.results = mockResults;

                    $scope.acceptRequest = function(cameoId){
                        cmLogger.debug('acceptRequest' + cameoId);
                        // TODO: cmApi/cmContacts stuff
                    };

                    $scope.rejectRequest = function(cameoId){
                        cmLogger.debug('rejectRequest' + cameoId);
                        // TODO: cmApi/cmContacts stuff
                    }
                }
            }
        });
});