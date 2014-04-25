'use strict';

angular.module('cmContacts').directive('cmFriendRequestList',[
    'cmContactsModel',
    'cmNotify',
    '$rootScope',
    function (cmContactsModel, cmNotify, $rootScope){
        return {
            restrict: 'AE',
            scope: true,
            controller: function($scope){
                $scope.requests = cmContactsModel.requests;
                $scope.isLoading = false;

                cmContactsModel.on('friendRequests:loaded', function(){
                    $scope.requests = cmContactsModel.requests;
                });

                cmContactsModel.on('friendRequests:updated', function(){
                    $scope.requests = cmContactsModel.requests;
                });

                /**
                 * reset
                 */
                $rootScope.$on('$routeChangeSuccess', function(){
                    angular.forEach(cmContactsModel.requests, function(value){
                        value.isOpen = false;
                        value.showBar = false;
                    });
                });

                $scope.toggleBrief = function(request){
                    if((request.isOpen == undefined || request.isOpen == false ) && request.message != ''){
                        request.state = 'new';
                        request.isOpen = true;
                    } else {
                        request.isOpen = false;
                    }
                };

                $scope.toggleBar = function(request){
                    if(request.showBar !== 'undefined'){
                        if(request.showBar){
                            request.showBar = false;
                        } else {
                            request.showBar = true;
                        }
                    } else {
                        request.showBar = true;
                    }
                }

                /**
                 * fired by repeat and accept that
                 * @param id
                 */
                $scope.acceptRequest = function(item){
                    if(typeof item == 'object'){
                        item.accept().then(
                            function(){
                                cmContactsModel.removeFriendRequest(item);

                                cmNotify.success('CONTACTS.INFO.REQUEST.ACCEPT',{ttl:2000});

                                $rootScope.$broadcast('cmNotify:update');

                                cmContactsModel.trigger('friendRequests:updated');
                            },

                            function(){
                                /**
                                 * @todo accept fails
                                 */
                            }
                        )
                    }
                };

                /**
                 * fired by repeat delete request
                 * @param id
                 */
                $scope.rejectRequest = function(item){
                    if(typeof item == 'object'){
                        item.reject().then(
                            function(){
                                cmContactsModel.removeFriendRequest(item);

                                cmNotify.success('CONTACTS.INFO.REQUEST.REJECT',{ttl:2000});

                                $rootScope.$broadcast('cmNotify:update');

                                cmContactsModel.trigger('friendRequests:updated');
                            },

                            function(){
                                /**
                                 * @todo reject fails
                                 */
                            }
                        )
                    }
                };

                $scope.ignoreRequest = function(item){
                    if(typeof item == 'object'){
                        item.ignore().then(
                            function(){
                                cmContactsModel.removeFriendRequest(item);

                                cmNotify.success('CONTACTS.INFO.REQUEST.IGNORE',{ttl:2000});

                                $rootScope.$broadcast('cmNotify:update');

                                cmContactsModel.trigger('friendRequests:updated');
                            },

                            function(){
                                /**
                                 * @todo ignrore fails
                                 */
                            }
                        )
                    }
                }
            }
        }
    }
]);