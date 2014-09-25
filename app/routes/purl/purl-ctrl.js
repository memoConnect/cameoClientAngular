'use strict';

angular.module('cmRoutes').controller('PurlCtrl',[

    '$scope',
    '$rootScope',
    '$routeParams',
    'cmModal',
    'cmPurlModel',
    'cmConversationFactory',

    function($scope, $rootScope, $routeParams, cmModal, cmPurlModel, cmConversationFactory){

        $rootScope.pendingPurl      = null;
        $scope.showSignIn           = false;
        $scope.purlId               = $routeParams.purlId || '';
        $scope.headerGuest          = true;

        if($routeParams.purlId){
            cmPurlModel.getPurl($routeParams.purlId).then(
                function(data){
                    // identity check internal || external user
                    cmPurlModel.handleIdentity(data.identity);

                    if(data.identity.userType == 'external'){
                        $rootScope.pendingPurl = $routeParams.purlId;
                    } else {
                        $scope.headerGuest = false;
                    }

                    if(typeof data.token !== 'undefined'){
                        cmPurlModel.handleToken(data.token)
                    }

                    var conversation_id = cmPurlModel.handleConversation(data.conversation);

                    $scope.conversation = cmConversationFactory.create(conversation_id)
                },

                function(response){
                    if(typeof response !== 'undefined' && 'status' in response){
                        if(response.status == 401){
                            $rootScope.$broadcast('logout', {goToLogin: false, where: 'purl-ctrl getPurl reject'})
                            $scope.showLogin();
                        } else if(response.status == 404){
                            $scope.goto('/404');
                        }
                    } else {
                        $scope.goto('/404');
                    }
                }
            );
        }

        /**
         * modal for fast registration
         */
        $scope.openFastRegister = function(){
            cmModal.create({
                    id: 'fast-registration',
                    'class': 'webreader',
                    type: 'alert',
                    //nose: 'bottom-left',
                    'cm-close-btn': false,
                    'cm-footer-label': 'MODAL.WEBREADER.LATER',
                    'cm-footer-icon': 'cm-close'
                },'' +
                    '<div class="attention">' +
                    '<i class="fa cm-attention cm-lg-icon"></i> {{\'MODAL.WEBREADER.NOTICE\'|cmTranslate}}' +
                    '</div>'+
                    '<a href="#/registration" class="redirect" data-qa="btn-register-modal">' +
                    '<i class="fa cm-key cm-lg-icon"></i> {{\'MODAL.WEBREADER.REGISTRATION\'|cmTranslate}}' +
                    '</a>'
            );
            cmModal.open('fast-registration')
        };

        $scope.showLogin = function () {

            $scope.showSignIn = true;

            cmModal.create({
                id: 'login',
                'class': 'with-title no-padding',
                'cm-close-btn': false,
                'cm-close-on-backdrop': false
            },'<div cm-login></div>');
            cmModal.open('login');

            $rootScope.$on('cmLogin:success', function(){
                location.reload();
            });
        };
    }
]);