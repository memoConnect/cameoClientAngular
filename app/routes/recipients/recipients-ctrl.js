define([
    'app'
], function (app) {
    'use strict';

    app.register.controller('RecipientsCtrl', [
        '$scope',
        '$rootScope',
        '$location',
        function ($scope, $rootScope, $location) {
            
            var conversation = $rootScope.pendingConversation

            if(!conversation){
                $location.path('conversation')
                return null
            } 

            $scope.selected = {}

            $scope.disabled_remove = !!conversation.id

            conversation.recipients.forEach(function(recipient){
                $scope.selected[recipient.id] = true
            })

            $scope.addRecipient = function(recipient){
                $scope.selected[recipient.id] = true
                conversation.addRecipient(recipient)
            }

            $scope.removeRecipient = function(recipient){
                if($scope.disabled_remove) return null
                delete $scope.selected[recipient.id]
                conversation.removeRecipient(recipient)
            }

            $scope.toggleRecipient = function(recipient){
                $scope.selected[recipient.id]
                ?   $scope.removeRecipient(recipient)
                :   $scope.addRecipient(recipient)
            }
        }
    ])
})
