'use strict';

<<<<<<< HEAD:app/shared/cmApi.js
//This Module handels api calls

var cmApi = angular.module('cmApi', ['cmLogger', 'cmObject']);

//TODO config cameo

//Service to handle all api calls

cmApi.provider('cmApi',[
    function($injector){
        var rest_api    = "",
            call_stack_disabled = true,
            call_stack_path = "",
            commit_size = 10,
            commit_interval = 2000,
            events_disabled = true,
            events_path = "",
            events_interval = 5000

        this.restApiUrl = function(url){
            rest_api = url;
            return this
        }
=======
angular.module('cmCore').provider('cmApi',[
function($injector){
    var rest_api    = "",
        stack_path   = ""
>>>>>>> refs/heads/dev:app/shared/core/prov-api.js

        this.useCallStack = function (on){
            call_stack_disabled = !on
            return this
        }

        this.callStackPath = function(path){
            call_stack_path = path
            return this
        }

        this.commitSize = function(size){
            commit_size = size
            return this
        }

        this.commitInterval = function(interval){
            commit_interval = interval 
            return this
        }

        this.useEvents = function (on){
            events_disabled = !on
            return this
        }

        this.eventsPath = function(path){
            events_path = path
            return this
        }

        this.eventsInterval = function(interval){
            events_interval = interval 
            return this
        }


        this.$get = [

            'cmLogger',
            'cmObject',
            '$http',
            '$httpBackend',
            '$injector',
            '$q',
            '$interval',
            '$cacheFactory',

            function(cmLogger, cmObject, $http, $httpBackend, $injector, $q, $interval, $cacheFactory){
                /***
                All api calls require a config object:

                ie.: api.get(config)

                config works almost like in $http(config)

                most important keys are:
                    path:	api path to call i.e. '/account/check',
                            will give an error message if passed something different from a path (like 'http://dev.cameo.io/...')
                            in that case your call will most likely fail brutally

                    data:	data to send, any plain object

                    exp_ko: key you expect in response body if your request was granted(see below)
                    exp_ok: key you expect in response body if your request was denied (see below)


                Authentication and error handling is dealt with automatically.


                example: (!!check tests in cmApi.spec.js!!)

                cmApi.get({
                    path:     '/pony',
                    exp_ok:  'pony',
                })''


                ---> response:  {
                                    "res" : 'OK',
                                    "data": {
                                                "pony" : "my_new_pony"
                                            }
                                }

                .then(
                    function(pony){         <--- gets called because response.res == 'OK', pony will equal 'my_pony'
                        yay(pony)
                    },

                    function(alternative, res){
                        alternative
                        ? meh(alternative)
                        : error(alternative) //yet error should have already been handled alesewhere
                    }
                )


                ---> response:  {
                                    "res" : 'OK',
                                    "data": {
                                                "dog" : "my_new_dog"
                                            }
                                }

                .then(
                    function(pony){
                        yay(pony)
                    },
                    function(alternative,res){	<--- gets called because response is invalid, "pony" was expected, yet "dog" was delivered
                                                     alternative will be undefined
                                                     res however holds all the response
                        alternative
                        ? meh(alternative)
                        : error(alternative) //yet error should have been handled already elesewhere
                    }
                )




                ---> response:	{
                                    "res" : 'KO',
                                    "data": {
                                                "alternative" : "kitty"
                                            }
                                }

                .then(
                    function(pony){
                        yay(pony)
                    },
                    function(data, res){ <--- gets called because response.res == 'KO', data will be {'alternative': 'kitty'},
                                              because there was no specific key expected for KO.
                                              res however holds all the response
                        alternative
                        ? meh(alternative)
                        : error(alternative) //yet error should have been handled already elesewhere
                    }
                )




                ---> response:	{
                                    "res" : 'XXX',
                                    "data": {
                                                "kitty" : "grumpy cat"
                                            }
                                }

                .then(
                    function(pony){
                        yay(pony)
                    },
                    function(alternative,res){ <--- gets called because response is invalid for neither response.res == 'OK' nor response.res == 'KO',
                                                    alternative will be undefined
                                                    res however holds all the response
                        alternative
                        ? meh(alternative)
                        : error(alternative) //yet error should have been handled already elesewhere
                    }
                )



                */
               
                //check if the sever's response complies with the api conventions
                function compliesWithApiConventions(body, exp_ok, exp_ko){
                    var valid =    body
                                    //response must have a res key that equals 'OK' or 'KO':
                                && (body.res == 'OK' || body.res == 'KO')
                                    //if your request was granted and something was expected in return, it must be present:
                                && (body.res == "OK" && exp_ok ? exp_ok in body.data : true)
                                    //if your request was denied and something was expected in return, it must be present:
                                && (body.res == "KO" && exp_ko ? exp_ko in body.data : true)

                    if(!valid) cmLogger.error('Api response invalid; '+(exp_ok||exp_ko ? 'expected: ':'') + (exp_ok||'') +', '+(exp_ko||''), body)

                    return(valid)
                }
               
               function handleSuccess(response, deferred){
                    //$http call was successfull
                    
                    var config  = response.config,
                        body    = response.data

                    compliesWithApiConventions(body, config.exp_ok, config.exp_ko)
                    ?   //response valid, check if OK:
                        //if a certain key was expected, resolve promise resp. reject the promise with the according values
                        //if nothing was expected, just resolve or reject with value of 'data' in the response body if present or all the data
                        //reponse should now look similar to this:
                        /*
                            "res":  "OK",
                            "data": {
                                        "some_key":             "some_value",
                                        "some expected_key":    "some_other value"
                                    }

                        */
                        body.res =='OK'
                        ? deferred.resolve( config.exp_ok ? body.data[config.exp_ok] : body.data || response)
                        : deferred.reject(  config.exp_ko ? body.data[config.exp_ko] : body.data || response)

                    :   //response invalid, call through:
                        deferred.reject(undefined, response)
                }
            

                function handleError(response, deferred){        
                    cmLogger.error('Api call failed: \n '+response.config.method+' '+response.config.path, response)
//                    window.location.href='#/server_down' //@ Todo
                    //error messages should come trough backend
                    deferred.reject(response)
                }

                function prepareConfig(config, method, token, twoFactorToken){
                    
                    config.url      =   config.url ||
                                        (
                                            rest_api +      // base url API
                                            config.path     // path to specific method
                                        )
                    config.method   =   method || config.method 
                    config.headers  =   angular.extend(token           ? {'Authorization': token} : {}, config.headers || {})   //add authorization token to the header
                    config.headers  =   angular.extend(twoFactorToken  ? {'X-TwoFactorToken': twoFactorToken} : {}, config.headers || {})   //add two factor authorization token to the header

                }


                var api = function(method, config){
                    var deferred	=	$q.defer(),

                        //get authentification token from cmAuth if present
                        token 		    = 	$injector.has('cmAuth')
                                            ?	$injector.get('cmAuth').getToken()
                                            :	undefined,

                        //get twoFactorAuth token from cmAuth if present
                        twoFactorToken	= 	$injector.has('cmAuth')
                                            ?	$injector.get('cmAuth').getTwoFactorToken()
                                            :	undefined


                    prepareConfig(config, method, token, twoFactorToken)                  


                    $http(config).then(
                        function(response){ handleSuccess(response, deferred) },
                        function(response){ handleError(response, deferred) }
                    )

                    return deferred.promise
                }

                api.get		= function(config, force){ return (force || call_stack_disabled) ? api('GET',	 config) : api.stack('GET',    config) }
                api.post	= function(config, force){ return (force || call_stack_disabled) ? api('POST',   config) : api.stack('POST',   config) }
                api.delete	= function(config, force){ return (force || call_stack_disabled) ? api('DELETE', config) : api.stack('DELETE', config) }
                api.head	= function(config, force){ return (force || call_stack_disabled) ? api('HEAD',   config) : api.stack('HEAD',   config) }
                api.put		= function(config, force){ return (force || call_stack_disabled) ? api('PUT',    config) : api.stack('PUT',    config) }
                api.jsonp	= function(config, force){ return (force || call_stack_disabled) ? api('JSONP',  config) : api.stack('JSONP',  config) }



                //CALL STACK:

                api.call_stack = api.call_stack || []
                api.call_stack_cache = $cacheFactory('call_stack_cache')


                //Puts a requests on the call stack
                api.stack = function(method, config){

                    if(call_stack_disabled){
                        cmLogger.error('unable to call ".stack()", callstack disabled.')
                        return null
                    }


                    prepareConfig(config, method)

                    var deferred = $q.defer()

                    api.call_stack.push({
                        deferred : deferred,
                        config   : config
                    })

                    return deferred.promise
                }


                // Commits all requests on callstack to the API
                api.commit = function(){

                    //dont do anything, if call stack is empty:
                    if(api.call_stack.length == 0) return null        

                    var items_to_commit = [],
                        configs         = []

                    //pick items from callstack to commit:
                    api.call_stack.forEach(function(item, index){
                        if(items_to_commit.length < commit_size){
                            items_to_commit.push(item)
                            delete api.call_stack[index]
                        }
                    })

                    //remove undefined elements from call_stack:
                    var index = api.call_stack.length
                    while(index--){ if(!api.call_stack[index]) api.call_stack.splice(index,1) }

                    //prepare request configs:
                    items_to_commit.forEach(function(item, index){ configs.push(item.config) })

                    //post requests to call stack api:
                    api.post({
                        path: call_stack_path,
                        data: { requests: configs },
                        exp_ok : 'responses' 
                    }, true)
                    .then(function(responses){

                        responses.forEach(function(request, index){

                            var response =  {
                                                data   : responses[index].body,
                                                status : responses[index].status,
                                                config : items_to_commit[index].config,
                                            },

                                deferred = items_to_commit[index].deferred

                            200 <= response.status && response.status < 300
                            ?   handleSuccess(response, deferred)
                            :   handleError(response, deferred)
               
                        })                        
                    })

                }

                if(!call_stack_disabled && commit_interval) $interval(function(){ api.commit() }, commit_interval, false)



                //API EVENTS:
                
                cmObject.addEventHandlingTo(api)

                api.subscriptionId

                api.subscribeToEventStream = function(){
                    return  api.post({
                                path: events_path,
                                exp_ok: 'id',
                                data:{
                                    secret: 'b4plIJMNITRDeJ9vl0JG' //only working on dev
                                }
                            }, true)
                            .then(function(id){
                                api.subscriptionId = id
                            })
                }

                api.getEvents = function(force){
                    if(!api.subscriptionId){

                        //if no subscriptionId is present, get one and try again later:
                        api.subscribeToEventStream()
                        .then(function(){ api.getEvents() })

                    }else{
                        api.get({
                            path: events_path + '/' + api.subscriptionId,
                            exp_ok: 'events'
                        }, force)
                        .then(function(events){
                            events.forEach(function(event){
                                api.trigger(event.type, event.content)
                            })
                        })
                    }
                }

                if(!events_disabled && events_interval) $interval(function(){ api.getEvents(false) }, events_interval, false)

                return api
            }
        ]
    }
]);