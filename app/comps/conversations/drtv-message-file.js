'use strict';

angular.module('cmConversations').directive('cmMessageFile', [
    'cmFileFactory',
    'cmLogger',
    '$timeout',
    'cmJob',
    'cmFileTypes',
    function (cmFileFactory, cmLogger, $timeout, cmJob, cmFileTypes) {
        return {
            restrict: 'E',
            require: '^cmMessage',
            templateUrl: 'comps/conversations/drtv-message-file.html',
            controller: function ($scope) {
                $scope.progress = 0;

                $scope.cmFileTypes = cmFileTypes;

                $scope.isImage = function(mime){
                    return mime == undefined ? false : mime.search('^image/') != -1;
                };

                // exists fileModel
                if(typeof $scope.file == 'object'){

                    if($scope.file.state == 'exists'){
                        /**
                         example?
                         cmFileDownload.add($scope.file)
                         */
                        // todo: download
                        $scope.file
                            .setPassphrase($scope.conversation.passphrase)
                            .importFile()
                            .then(function() {
                                $scope.file
                                    .decryptName()
                                    .downloadChunks()
                                    .then(function(){
                                        $scope.file.decryptChunks()
                                    })
                            })
                    }

                    $scope.file.on('upload:chunk', function(progress){
                        $scope.progress += progress;
                    });

                    $scope.file.on('download:chunk', function(progress){
                        $scope.progress += progress;
                    });
                }
            }
        }
    }
])