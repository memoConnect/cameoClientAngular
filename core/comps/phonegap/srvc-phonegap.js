'use strict';

angular.module('cmPhonegap').service('cmPhonegap', [
    'cmLogger', 'cmHistory', 'cmModal',
    '$q', '$document', '$phonegapCameoConfig', '$navigator', '$rootScope',
    function (cmLogger, cmHistory, cmModal,
              $q, $document, $phonegapCameoConfig, $navigator, $rootScope) {

        var isReady = $q.defer();

        var self = {
            isReady: function(callback){
                if($phonegapCameoConfig == 'undefined'){
                    return false;
                }

                //cmLogger.info('cmPhonegap.isReady? '+$phonegapCameoConfig.deviceReady)

                // if config doesn't get device ready watch again
                if(!$phonegapCameoConfig.deviceReady){
                    $document[0].addEventListener('deviceready', function () {
                        $phonegapCameoConfig.deviceReady = true;
                        isReady.resolve();
                    });

                    isReady.promise.then(function(){
                        if(typeof callback == 'function')
                            callback();
                    });
                // nothing to wait phonegap is ready
                } else {
                    if(typeof callback == 'function')
                        callback();
                }

                return false;
            },
            initDeviceButtons: function(){
                if($document.length > 0 && 'addEventListener' in $document[0]) {
                    // handle history back and exit app
                    $document[0].addEventListener('backbutton', function () {
                        if (cmHistory.isEmpty()) {
                            cmModal.confirm({
                                title: 'MODAL.EXIT.HEADER',
                                text: 'MODAL.EXIT.TEXT'
                            })
                            .then(function() {
                                if('app' in $navigator && 'exitApp' in $navigator.app){
                                    $navigator.app.exitApp();
                                }
                            });
                        } else {
                            $rootScope.goBack();
                        }
                        $rootScope.$apply();
                    });
                    // handle menu
                    $document[0].addEventListener('menubutton', function (e) {
                        $rootScope.$broadcast('cmMenu:toggle');
                        $rootScope.$apply();
                    });
                }
            }
        };

        // on home close app
        self.initDeviceButtons();

        return self;
    }]
);