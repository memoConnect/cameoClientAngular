'use strict';

angular.module('cmUi').filter('cmSearch', [
    'cmUtil',
    function(cmUtil){
        return function(arrayToSearch, searchType, searchString){
            if(!cmUtil.isArray(arrayToSearch) || typeof searchString != 'string') return arrayToSearch;

            /**
             * @name isMatch
             * @description
             * try to find a string in a string
             * @param {String} text haystack for match
             * @returns {boolean} if the match was complete
             */
            var isMatch = function(text){
                if(text == undefined) return false;
                return (''+text).toLowerCase().indexOf((''+searchString).toLowerCase()) > -1;
            };

            /**
             * @name isInArrayMatch
             * @param {Array} array for iteration
             * @param {Function} callback for matching
             * @returns {boolean} if the match was complete
             */
            var isInArrayMatch = function(array, callback){
                var boolean = false;
                if(!cmUtil.isArray(array) || typeof callback != 'function') return false;
                for ( var j = 0; j < array.length; j++) {
                    var item = array[j];
                    if(!boolean){
                        boolean = callback(item);
                    }
                }
                return boolean;
            };

            /**
             * @name search
             * @param {Object} item cmModel of cmFactory
             * @returns {boolean} if the search was complete
             */
            var search = function(item){
                var boolean = false;
                switch (searchType) {
                    case 'contacts':
                        if('contactType' in item && isMatch(item.contactType) ||
                            'identity' in item && isMatch(item.identity.getDisplayName()) ||
                            'identity' in item && isMatch(item.identity.email.value) ||
                            'identity' in item && isMatch(item.identity.phoneNumber.value)
                            )
                            boolean = true;
                        break;
                    case 'talks':
                        if('subject' in item && isMatch(item.subject) ||
                            'messages' in item && isInArrayMatch(item.messages, function(arrayItem){return isMatch(arrayItem.text)}) ||
                            'recipients' in item && isInArrayMatch(item.recipients, function(arrayItem){return isMatch(arrayItem.getDisplayName())})
                            )
                            boolean = true;
                        break;
                }
                return boolean;
            };

            // filter array
            var arrayFiltered = [];
            // iterate all
            for ( var j = 0; j < arrayToSearch.length; j++) {
                var item = arrayToSearch[j];
                if (search(item)) {
                    arrayFiltered.push(item);
                }
            }
            // return filtered array
            return arrayFiltered;
        }
    }
]);