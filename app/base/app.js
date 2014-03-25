define([
    'angularAMD',
    'angular-route',
    'angular-cookies',
    // cameo files
    'cmLocalStorage',
    'cmApi',
    'cmAuth',
    'cmUserModel',
    'cmIdentity',

    'cmLanguage',
    'cmLogger',
    'cmNotify',

    'pckUi',
    'base/config'
], function (angularAMD) {
    'use strict';

    var app = angular.module('cameoClient', [
        'ngRoute',
        'ngCookies',
        'ui.bootstrap',
        // insert cameo provider
        'cmApi',
        'cmUi',
        'cmLanguage',
        'cmNotify',
        'cmLogger',
        'cmLocalStorage',
        'cmAuth',
        'cmUserModel',
        'cmIdentity'
    ]);

    //cameo_config = cameo_config

    /**
     * Check for local Env restApi URL
     */
    if(typeof env !== 'undefined'){
        if(env.restApi != undefined && env.restApi != ""){
            cameo_config.restApi = env.restApi;
        }
    }

    // cameo configuration for our providers
    app.config([
        'cmLanguageProvider',
        'cmLoggerProvider',
        'cmApiProvider',
        function (cmLanguageProvider, cmLoggerProvider, cmApiProvider){
            cmLoggerProvider
                .debugEnabled(true)

            cmApiProvider
                .restApiUrl( cameo_config.restApi );

            cmLanguageProvider
                .cacheLangFiles(cameo_config.cache_lang_files)
                .supportedLanguages( cameo_config.supported_languages)
                .pathToLanguages( cameo_config.path_to_languages)
                .preferredLanguage('en_US')   //for now
                .useLocalStorage()
        }
    ]);
    // app route config
    app.config([
        '$routeProvider',
        '$locationProvider',
        //'$compileProvider',

        function ($routeProvider, $locationProvider) {
            /**
             * this option makes location use without #-tag
             * @param settings
             */
            // $locationProvider.html5Mode(true);

            /**
             * create routes
             * @param settings
             *
             * full control:
                'login': {
                    route:['/login'], // multiple possible
                    hasCtrl: true,
                    isOtherwise: true
                }
             * creates route '/login'
             * and template 'routes/login/login.html'
             * and controller 'routes/login/login-ctrl.html'
             *
             * short control:
                'terms': {}
             * creates route '/terms'
             * and template 'routes/terms/terms.html'
             *
             */
            function createRoutes(settings){
                angular.forEach(settings,function(_settings_, routeKey){
                    var routes = [],
                        routeParams = {};
                    // create params for route
                    if(angular.isDefined(_settings_['templateUrl'])){
                        routeParams.templateUrl = _settings_['templateUrl'];
                    } else {
                        routeParams.templateUrl = 'routes/'+routeKey+'/'+routeKey+'.html';
                    }
                    // check if route has/need controller
                    if(angular.isDefined(_settings_['hasCtrl']) && _settings_.hasCtrl === true)
                        routeParams.controllerUrl = 'routes/'+routeKey+'/'+routeKey+'-ctrl';

                    // create route as defined or take simple route
                    if(angular.isDefined(_settings_['routes']))
                        routes = _settings_.routes;
                    else
                        routes.push('/'+routeKey);

                    // add route to provider
                    angular.forEach(routes,function(route){
                        $routeProvider.
                            when(route, angularAMD.route(routeParams));
                    });
                    // check otherwise
                    if(angular.isDefined(_settings_['isOtherwise'])){
                        $routeProvider.otherwise({
                            redirectTo: '/'+routeKey
                        });
                    }
                });
            }

            // start creation of routes
            createRoutes(cameo_config.routes);
        }
    ]);

    // app run handling
    app.run(['$rootScope', '$location', '$window', 'cmUserModel',
        function ($rootScope, $location, $window, cmUserModel) {
            // hide app spinner
            angular.element($window.document.getElementsByClassName('app-spinner')[0]).css('display','none');

            // passing wrong route calls
            $rootScope.$on("$routeChangeStart", function(){
                // expections
                var path_regex = /^(\/login|\/registration|\/terms|\/disclaimer|\/404|\/purl\/[a-zA-Z0-9]{1,})$/;
                var path = $location.$$path;
                // exists none token then otherwise to login
                if (cmUserModel.getToken() === false){
//                    cmNotify.warn($cookies.token+' run without token '+path+' '+(!path_regex.test(path)?'to login':'stay'))
                    if (!path_regex.test(path)) {
                        $location.path("/login");
                    }
                } else if ($location.$$path == "/login") {
                    $location.path("/talks");
                }
            });

            // url hashing for backbutton
            $rootScope.urlHistory = [];

            window.onpopstate = function(){
                $rootScope.urlHistory.pop();
            };

            $rootScope.$on('$routeChangeSuccess', function(schmu, _currentRoute_, _prevRoute_){
                if(!_currentRoute_.$$route || !_currentRoute_.$$route.originalPath) return null;

                var currentRoute = _currentRoute_.$$route.originalPath,
                    prevRoute = _prevRoute_ ? _prevRoute_.$$route.originalPath: '';

                if(currentRoute.indexOf("/login") != -1 || currentRoute == prevRoute)
                    $rootScope.urlHistory = [];
                else if(currentRoute !== $rootScope.urlHistory[$rootScope.urlHistory.length - 1]) {
                    $rootScope.urlHistory.push(currentRoute);
                }
            });
            
            window._route = {}

            //Make it easy for e2e-tests to monitor route changes:
            $rootScope.$on('$routeChangeStart', function(){
                window._route.path   = $location.$$path
                window._route.status = 'loading'
            })

            $rootScope.$on('$routeChangeSuccess', function(){
                window._route.status = 'success'
            })

            $rootScope.$on('$routeChangeError', function(){
                window._route.status = 'error'
            })
        }
    ]);
    // bootstrap app and all things after here use app.register.{ng-type}
    angularAMD.bootstrap(app);

    return app;
});