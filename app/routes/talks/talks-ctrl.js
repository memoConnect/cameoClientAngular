define([
    'app',
    'util-base64',    
    'ngload!pckUser',
    'ngload!pckConversations'
], function (app) {
    'use strict';
    

    console.log('Ctrl')  
  
    app.register.controller('ConversationsCtrl',[

        '$scope',
        '$rootScope',
        'cmConversationsModel',
        
        function($scope, $rootScope, cmConversationsModel) {
            $scope.conversations = cmConversationsModel;

            $rootScope.tabs = [
                {i18n:'BACK',icon:'fa-chevron-left',href:'#/start'},
                {i18n:'ADD',icon:'fa-plus',href:'#/conversation','default':true}
            ];
        }
    ]);

});