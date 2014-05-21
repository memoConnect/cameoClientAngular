'use strict';

//This service provides extra funcionality for core objects

angular.module('cmCore')
.service('cmObject', [

    '$q',

    function($q){
        var self = this

        /**
         * Function to add basic event handling to any object, to bubbling up or down provided
         * @param {Object} obj any objevct to extend with event ahndlung capabilities
         */

        this.addEventHandlingTo = function(obj){
            obj._callbacks = {}


            /**
             * Function to call a callback bound to an event. This function is not meant to me called from outside the object.
             * @param  {Function} cb    callback function
             * @param  {Object}   event event data to be passed to the callback function
             * @param  {Object}   data  extra data to be passed to the callback function
             * @return {boolean}  returns if the callback should be called on the next occurance of event or not         
             */
            
            function _call(cb, event, data){
                var cb_result    = cb.fn.apply(obj, [event, data]),     //call the callback on the base object
                    limit_set    = typeof cb.limit == "number",         //check if the number of calls should be limited
                    cb_complete  = limit_set                            //check if the call should count as successful (and thus recude the number number of future calls)
                                   ?    cb_result == true || cb_result == undefined //if there is no return value treat the call as successful (default)
                                   :    cb_result == true               //if there is no limit set, the number of calls is unlimited anyway
                    
                 
                if(limit_set && cb_complete) cb.limit-- //reduce number of future calls of callback for event

                var call_again   = limit_set            
                                   ?    cb.limit > 0
                                   :    !cb_complete

                return call_again
            }


            /**
             * Function to trigger callback bound to an event
             * @param  {string} event_name Name of the event to trigger
             * @param  {Object} data       Data to be passsed to the callback function
             * @return {Object}            returns the base object for chaining
             */
            
            obj.trigger = function(event_name, data){                
                var event = { target : obj }

                obj._callbacks[event_name] = obj._callbacks[event_name] || []   //create the according callback array, if neccessary

                obj._callbacks[event_name].forEach(function(callback_obj, index){
                    // call callback function and delete if need be, see ._call()
                    if(!_call(callback_obj, event, data)) delete obj._callbacks[event_name][index]
                })

                return obj
            }



            /**
             * Function to bind a call back to event(s).
             * @param  {String}   event_names Names of the events to bind to. Multiple event names should be separated by ' '.
             * @param  {Function} callback    Function to call, when the event is triggered. Should return wether the call was successfull or not.
             * @param  {number}   [limit]     Number of times the callback should be (succsessfully) called. If not provided, there is no limit to the number of calls.
             * @return {Object}               returns the object for chaining.
             */
            
            obj.on = function(event_names, callback, limit){
                var event_names = event_names instanceof Array ? event_names : event_names.split(' ') 

                event_names.forEach(function(event_name){
                    obj._callbacks[event_name] = obj._callbacks[event_name] || [] //create according callback array, if neccessary
                    obj._callbacks[event_name].push({       // add callback object with callback function an limit for number of calls
                        'fn' : callback,
                        'limit': limit || false
                    })
                })

                return obj
            }

            /**
             * Function to remove binding of a callback function to an event.
             * @param  {String}   event_names Names of the events to bind to. Multiple event names should be separated by ' '.
             * @param  {Function} callback    Funcation that has been bound to an event.
             * @return {Object}               returns the object for chaining.
             */
            obj.off = function(event_names, callback){
                var event_names = event_names instanceof Array ? event_names : event_names.split(' ') 
                
                event_names.forEach(function(event_name){
                    if(!callback) obj._callbacks[event_name] = []

                    obj._callbacks[event_name].forEach(function(callback_obj, index){
                        if(callback_obj.fn == callback) delete obj._callbacks[event_name][index]
                    })
                })

                return obj
            }

            obj.one = function(event_names, callback){
                obj.on(event_names, callback, 1)
            }

            return this 
        }


        this.addChainHandlingTo = function(obj){
            obj._chains = {}

            function Chain(obj){
                var deferred     = $q.defer(),
                    self         = this,
                    last_promise = deferred.promise


                angular.forEach(obj, function(value, key){                    
                    if(typeof obj[key] != 'function')  return null

                    self[key] = function(){
                        var args = Array.prototype.slice.call(arguments, 0)

                        last_promise = last_promise.then(function(result){                                
                            return obj[key].apply(obj, args.length > 0 ? args : [result])                                 
                        })

                        return self
                    }
                })

                self.then = function(){                    
                    last_promise = last_promise.then.apply(last_promise, Array.prototype.slice.call(arguments, 0))
                    return self
                }

                deferred.resolve()

                return self
            }


            obj.$chain = function(name){
                name  = name || 'default'

                obj._chains[name] = obj._chains[name] || new Chain(obj)
                
                return obj._chains[name]
            }

            return this 
        }
        
    }
]);