'use strict';

/**
 * @ngdoc object
 * @name cmPassphrase
 * @description
 * Handle Passphrase Conversation
 *
 * @requires cmFactory
 * @requires cmUserModel
 * @requires cmCrypt
 * @requires cmObject
 * @requires cmLogger
 */
angular.module('cmCore').factory('cmPassphraseVault',[
    'cmKeyFactory',

    function(cmKeyFactory){

        /** utility functions **/

        /**
         * @ngdoc method
         * @methodOf cmPassphraseVault
         *
         * @name couldBeAPassword
         * @description
         * private function to check minimal requirements for a password.
         *
         * @param {String} pw Anything to be checked wether it could be a password.
         * @return {Boolean} result Wheter the suggested password seems okay or not
         */
        function couldBeAPassword(pw){
            return ((typeof pw == "string") && pw.length >= 1); //Todo, require better passwords.
        }



        /**
         * @ngdoc method
         * @methodOf cmPassphraseVault
         *
         * @name couldBeAPassphrase
         * @description  private function to check minimal requirements for a passphrase.
         *
         * @param {String} pp Anything to be checked wether it could be a passphrase.
         * @return {Boolean} Wheater the suggested passphrase seems okay or not
         */
        function couldBeAPassphrase(pp){
            return ((typeof pp == "string") && (pp.length >= 60))
        }



        /**
         * Constructor PassphraseVault
         */
        function PassphraseVault(data){

            var sePassphrase        = data.sePassphrase,
                aePassphraseList    = data.aePassphraseList || [],
                self                = this

            /**
             * @ngdoc method
             * @methodOf PassphraseVault
             *
             * @name getKeyTransmission
             * @description
             * return encryption type
             *
             * @returns {String} encryption type - 'none' || 'symmetric' || 'asymmetric' || 'mixed'
             */
            this.getKeyTransmission = function(){
                if(sePassphrase && aePassphraseList.length > 0)
                    return 'mixed';

                if(sePassphrase)                                        
                    return 'symmetric';

                if(aePassphraseList.length > 0 ) 
                    return 'asymmetric';

                return 'none';
            };


            /**
             * @ngdoc mehtod
             * @methodOf PassphraseVault
             *
             * @name get
             * 
             * @param {String} [password] A password to decrypt with
             * @return {promise} Resolves with passphrase if successfull
             */

            this.get = function(password){
                return  $q.reject()
                        //try symmetric decryption first:,               
                        .catch(function(){
                            //check if a valid password has been passed to the function 
                            //and a symmetrically encrypted passphrase is present:
                            return  couldBeAPassword(password) && symmetricallyEncryptedPassphrase)
                                    ?   cmCrypt.decrypt(password, cmCrypt.base64Decode(sePassphrase))
                                    :   $q.reject()
                        })
                        //try asymmetrical decryption if neccessary:                
                        .catch(function(){
                            asymmetricallyEncryptedPassphrases // could be an empty array
                            .reduce(function(previous_try, item) {
                                previous_try                
                                //if decryption has been successfull already there will be nothing to catch:
                                .catch(function(){
                                    return cmUserModel.decryptPassphrase(item.encryptedPassphrase, item.keyId)
                                })
                            }, $q.reject())
                        })
                        //finally check if decryption resolved with a proper passphrase,
                        //if so resolve with passphrase,
                        //if not reject with null
                        .then(
                            function(new_passphrase){
                            return  couldBeAPassphrase(new_passphrase)
                                        ?   $q.resolve(new_passphrase)
                                        :   $q.reject(null)
                            },
                            function(){
                                return $q.reject(null)
                            }
                        )
            }

            /**
             * @ngdoc method
             * @methodOf PassphraseVault
             *
             * @name exportData
             * 
             *
             * @return {Object} returns encryption data ready to be submitted to the API.
             */
            this.exportData = function(){                
                return  {
                            sePassphrase        : symmetricallyEncryptedPassphrase,
                            aePassphraseList    : asymmetricallyEncryptedPassphrases,
                            keyTransmission     : this.getKeyTransmission()
                        }
            }
        }











        /**
         * @ngdoc method
         * @methodOf cmPassphraseVault
         *
         * @name create
         *
         * @discription
         * Creates a new PassphraseVault 
         *
         * @return {PassphraseVault}
         */
        this.create = function(data){

            data =  {
                        sePassphrase:       data.sePassphrase       || null
                        aePassphraseList:   data.aePassphraseList   || []
                    }

            return new PassphraseVault(data)
        }

        /**
         * @ngdoc method
         * @methodOf cmPassphraseVault
         *
         * @name encryptPassphrase
         *
         * @description
         * Creates a new PassphraseVault 
         *
         * @params {Object} config
         * config =    {
         *                  passphrase:         config.passphrase       || cmCrypt.generatePassphrase(),
         *                  password:           config.password         || null,
         *                  identities:         config.identities       || [],
         *                  restrict_to_keys:   config.restrict_to_keys || null
         *              }
         *
         * @return {PassphraseVault}
         */
        this.encryptPassphrase = function(config){
            config =    {
                            passphrase:         config.passphrase       || cmCrypt.generatePassphrase(),
                            password:           config.password         || null,
                            identities:         config.identities       || [],
                            restrict_to_keys:   config.restrict_to_keys || null
                        }

            return $q.all([
                        //symmetrical encryption:
                        function(){
                            return  couldBeAPassword(config.password) && couldBeAPassphrase(config.passphrase)
                                    ?   cmCrypt.base64Encode(cmCrypt.encryptWithShortKey(password, passphrase))
                                    :   $q.when(undefined)
                        },
                        //asymmetrically encrypt:
                        function(){
                            return  couldBeAPassphrase(passphrase)
                                    ?   config.identities.reduce(function(list, key){
                                            return list.concat(identity.encryptPassphrase(passphrase, config.restrict_to_keys))
                                        }, [])
                                    :   $q.when([])
                        }
                    ])
                    .then(
                        function(result){
                            return  self.create({
                                        sePassphrase:       result[0]
                                        aePassphraseList:   result[1]
                                    })
                        },
                        function(){
                            cmLogger.debug('cmPassphraseVault: encryption failed.')
                            return null
                        }
                    )
        }







            /**
             * @TODO mit AP klären, BS!!!
             * @returns {*|number}
             */
            this.getWeakestKeySize = function(){
                return  conversation.recipients.reduce(function(size, recipient){
//                            return size != undefined ? Math.min(recipient.getWeakestKeySize(), size) : recipient.getWeakestKeySize()
                            return size != undefined ? Math.min(recipient.getWeakestKeySize(), size.getWeakestKeySize()) : recipient.getWeakestKeySize()
                        }) || 0
            }

            /**
             * @ngdoc method
             * @methodOf cmPassphrase
             *
             * @name isInPassphraseList
             * @description
             * checks if local user keys in passphraselist
             *
             * @returns {Boolean} boolean Returns a Boolean
             */
            this.isInPassphraseList = function(){
                var localKeys = cmUserModel.loadLocalKeys(),
                    check = false;

                if(asymmetricallyEncryptedPassphrases.length > 0 && cmUtil.isArray(localKeys) && localKeys.length > 0){
                    localKeys.forEach(function(value){
                        asymmetricallyEncryptedPassphrases.forEach(function(key){
                            if(key.keyId == value.id){
                                check = true;
                            }
                        })
                    });
                }

                return check;
            }

        }

        return cmPassphrase;
    }
]);