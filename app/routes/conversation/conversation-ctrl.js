define([
    'app',
    'ngload!pckFiles',
    'ngload!pckUser',
    'ngload!pckContacts',
    'ngload!pckConversations',
    'ngload!pckRouteConversation',
    'ngload!pckWidgets'

], function (app) {
    'use strict';

    app.register.controller('ConversationCtrl', [

        '$rootScope',
        '$scope',
        '$routeParams',
        '$location',
        'cmConversationFactory',

        function($rootScope, $scope, $routeParams, $location, cmConversationFactory){
            console.log($scope.conversation)

            $scope.conversation =   $routeParams.conversationId 
                                    ?   cmConversationFactory.create($routeParams.conversationId) 
                                    :   ($rootScope.pendingConversation || cmConversationFactory.create())


            if(!$scope.conversation.state.is('new') && $routeParams.conversationId == 'new')
                $scope.conversation = cmConversationFactory.create()

            if(!$routeParams.conversationId && $scope.conversation.id)
                $location.path($location.path() + '/' + $routeParams.conversationId)

        }
    ]);
});