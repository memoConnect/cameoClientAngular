/*
define([
    'app',

    'cmNotify',
    'cmLogger',
    'mContacts',

    'comps/type-chooser/type-chooser-drtv',
    'comps/validate/email-drtv'
], function(app){
*/

    'use strict';

    app.register.directive('cmAddExternContact',[
        'ModelContacts',
        'cmLogger',
        'cmNotify',
        '$location',
        function(ModelContacts, cmLogger, cmNotify, $location){

            function fulltrim(string){
                return String(string||'').replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,'');
            }

            return {
                restrict: 'A',
                scope: {},
                templateUrl: 'comps/contacts/add-extern-contact.html',
                controller: function($scope, $element, $attrs, $timeout){

                    var colClass = 'col-sm-';
                    $scope.labelSize = colClass+'2';
                    $scope.offsetSize = colClass+'offset-2';
                    $scope.colSize = colClass+'6';

                    var pristineDisplayName = true;
                    $scope.formVisible = false;
                    $scope.displayNameExists = false;

                    $scope.data = {
                        displayName: '',
                        name: '',
                        surName: '',
                        email: '',
                        phone: ''
                    };

                    /**
                     * simple toggle for form visibility
                     */
                    $scope.toggleForm = function(){
                        $scope.formVisible = $scope.formVisible ? false : true;
                    };

                    /**
                     * handle the nickname input
                     * change lock Nickname boolean
                     * and trim all white spaces
                     */
                    var timeoutCheckDisplayName;
                    $scope.handlePristine = function(){
                        pristineDisplayName = $scope.data.displayName == '' ? true : false;
                    };

                    $scope.$watch('data.displayName',function(val){
                        if(fulltrim(val) == ''){
                            $scope.displayNameExists = true;
                            return false;
                        } else {
                            $scope.displayNameExists = false;
                        }

                        var tmpVal = fulltrim(val);
                        $scope.data.displayName = tmpVal;

                        // handle timeout and kill if is pending
                        if(timeoutCheckDisplayName) $timeout.cancel(timeoutCheckDisplayName)
                        timeoutCheckDisplayName = $timeout(function(){
                            ModelContacts
                            .checkDisplayName(tmpVal)
                            .then(
                                function(){
                                    $scope.displayNameExists = false;
                                },
                                function(){
                                    $scope.displayNameExists = true;
                                }
                            )
                        },250);

                        return true;
                    });

                    /**
                     * concat name and surname to nickname if the input isnt locked
                     */
                    $scope.createDisplayName = function(){
                        if(pristineDisplayName === false)
                            return false;

                        $scope.data.displayName = fulltrim($scope.data.name+" "+$scope.data.surName);
                        return true;
                    };

                    /**
                     * Validateform and create external contact
                     */
                    $scope.checkForm = function(){
                        var form = $scope.addExternContact,
                        data = {
                            identity: {
                                displayName: null,
                                email: null,
                                phoneNumber: null,
                                preferredMessageType: null,
                                // TODO: not implemented in BE
                                name: null,
                                surName: null,
                                phoneProvider: null,
                                phoneType: null,
                                emailType: null
                            }
                        };

                        if (form.displayName.$valid == false) {
                            cmNotify.warn('DIRV.EXTERN_CONTACT.INFO.EMPTY.DISPLAYNAME', {ttl: 5000});
                            return false;
                        } else {
                            data.identity.displayName = form.displayName.$viewValue;
                        }

                        if (form.name.$valid == false) {
                            cmNotify.warn('DIRV.EXTERN_CONTACT.INFO.EMPTY.NAME', {ttl: 5000});
                            return false;
                        } else {
                            data.identity.name = form.name.$viewValue;
                        }

                        if (form.surName.$valid == false) {
                            cmNotify.warn('DIRV.EXTERN_CONTACT.INFO.EMPTY.SURNAME', {ttl: 5000});
                            return false;
                        } else {
                            data.identity.surName = form.surName.$viewValue;
                        }

                        if (form.phone.$valid == false && form.phone != '') {
                            cmNotify.warn('DIRV.VALIDATE_PHONE.INFO.INVALID_PHONE_NUMBER', {ttl: 5000});
                            return false;
                        } else {
                            data.identity.phoneNumber = form.phone.$viewValue;
                        }

                        if (form.email.$valid == false) {
                            cmNotify.warn('DIRV.VALIDATE_EMAIL.INFO.INVALID', {ttl: 5000});
                            return false;
                        } else {
                            data.identity.email = form.email.$viewValue;
                        }

                        if(data.identity.phoneNumber == '' && data.identity.email == ''){
                            cmNotify.warn('DIRV.EXTERN_CONTACT.INFO.EMPTY.PHONE_OR_EMAIL', {ttl: 5000});
                            return false;
                        }

                        // everything is fine let's add the contact
                        ModelContacts
                        .addContact(data)
                        .then(
                            function(){
                                $location.path('/contacts/all');
                            },
                            function(){
                                cmNotify.error('DIRV.EXTERN_CONTACT.INFO.SAVE_FAIL', {ttl: 5000});
                            }
                        );

                        return true;
                    };
                }
            }
        }
    ]);

/*
    return app;
});
*/
