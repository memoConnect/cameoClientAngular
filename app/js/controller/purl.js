define([
    'app',
    'mUser',
    'cmApi',
    'cmLogger',
    'util'
], function(app){
    'use strict';

    app.register.controller('PurlCtrl',[
        '$scope',
        '$routeParams',
        '$location',
        'ModelUser',
        'cmApi',
        'cmLogger',
        'Util',
        function($scope, $routeParams, $location, ModelUser, cmApi, cmLogger, Util){
            $scope.data = null;

            if(Util.checkKeyExists($routeParams,'idPurl') && Util.validateString($routeParams.idPurl)){
                cmApi.get({url:'/purl/'+$routeParams.idPurl}).then(
                    function(data){
                        $scope.data = data;
                    },
                    function(){
                        cmLogger.error('cant get PURL Message');
                        $location.path('/404');
                    }
                );
            }
        }
    ]);
});