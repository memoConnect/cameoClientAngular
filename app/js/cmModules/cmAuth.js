//This Module handels authorization and all api calls prior to authorization
//requires: 
//	passchk_fast.js



var cmAuth = angular.module('cmAuth', ['ngCookies', 'cmApi', 'cmCrypt', 'cmLogger'])


//Service to handle all authenticateion matters

cmAuth.provider('cmAuth', function(){
    
    //Config stuff here

    this.$get = [

    	'cmApi',
        'cmCrypt',
        'cmLogger',
    	'$cookieStore',
        '$q',

    	function(cmApi, cmCrypt, cmLogger, $cookieStore, $q){
    	    return {

                //check if the response of an api call has the expected entries
                responseValid:      function(response, key, alt){
                                        return     response
                                                && 'res'  in response
                                                && (response.res == "OK"           ? response.data !== undefined        : true)  //if the result is OK, response.data must be defined
                                                && (response.res == "OK" && key    ? response.data[key]!== undefined    : true)  //if the result is OK and key expected, response.data[key] must be defined
                                                && (response.res == "KO" && alt    ? response.data[alt]!== undefined    : true)
                                    },

    	    	//ask the api for a new authentication token:
    	        requestToken: 		function(login, pass){                    
                                        var auth        = Base64.encode(login + ":" + cmCrypt.hash(pass)),
                                            deferred    = $q.defer(),
                                            self        = this

                                        this.storeLogin(login)

                                        cmApi.get('/token', { headers: { 'Authorization': 'Basic '+auth } }).then(

                                            function(response){
                                                var valid = self.responseValid(response, 'token')

                                                if(!valid) cmLogger.error('Invalid response to authorization request.')

                                                valid && response.res == "OK"
                                                ? deferred.resolve(response.data.token)
                                                : deferred.reject(response)  
                                            }

                                            //error already handled in cmApi                                            
                                        )

    						            return deferred.promise
    						        },

                //storeLogin and getLogin should become absolete, once BE handles requests by auth token only

                storeLogin:         function(login){
                                        return $cookieStore.put("login", login);
                                    },

                getLogin:           function(){
                                        return $cookieStore.get("login");
                                    },

    			//store the token in a cookie:
    			storeToken:			function(token){
                                        return $cookieStore.put("token", token);
    								},

    			//retrieve thr token from a cookie
    	        getToken:			function(){
    			        				return $cookieStore.get('token');
    			        			},

    	       	createUser: 		function(data){                                    
    		            				return cmApi.post('/account', { data: data })
    		        				},

       			checkAccountName:	function(name){
                                        var deferred = $q.defer(),
                                            self     = this                                            

                                        cmApi.post('/account/check', { data: { loginName: name } }).then(
                                            function(response){
                                                var valid = self.responseValid(response, 'reservationSecret', 'alternatives')

                                                valid && response.res == "OK"
                                                ? deferred.resolve(response.data)
                                                : deferred.reject(response.data)
                                            }                                            
                                        )

    								    return deferred.promise
        							},

                checkPhoneNumber:   function(number){
                                        return cmApi.post('/services/checkPhoneNumber', { data: { phoneNumber:number } })
                                    }
    		}
    	}
    ]
});



//	DIRECTIVES:  -----------------




/**
 * This directive needs passchk_fast.js
 */

cmAuth.directive('cmPassword', ['cmCrypt',
    function (cmCrypt) {
        return  {
            restrict: 'E',
            templateUrl: 'tpl/directives/cm-password.html',
            scope: {
                password: '=parentItem'
            },
            controller: function($scope, $element, $attrs){
                $scope.showConfirmPWStatus = false;
                $scope.showStrengthMeter = false;
                $scope.passwordType = 'password';
                $scope.showPassword = false;

                $scope.togglePassword = function(){
                    if($scope.showPassword){
                        $scope.showPassword = false;
                        $scope.passwordType = 'password';
                    } else {
                        $scope.showPassword = true;
                        $scope.passwordType = 'text';
                    }
                }

                $scope.checkPWStrength = function(){
                    var pw = $scope.pw;

                    if(pw != undefined && pw.length > 3){
                        $scope.showStrengthMeter= true;
                        var bits = passchk_fast.passEntropy(pw);

                        if(bits < 28){
                            $scope.percent = 10;
                            $scope.color = '#d9534f';
                            //very weak
                        } else if(bits < 36){
                            $scope.percent = 25;
                            $scope.color = '#f0ad4e';
                            //weak
                        } else if(bits < 60){
                            $scope.percent = 50;
                            $scope.color = '#f0df43';
                            //reasonable || normal
                        } else if(bits < 128){
                            $scope.percent = 75;
                            $scope.color = '#c4f04e';
                            //strong
                        } else {
                            $scope.percent = 100;
                            $scope.color = '#5cb85c';
                            //very strong
                        }

                        $scope.pwStrength = pw;
                    } else {
                        $scope.percent = 0;
                        $scope.color = '#d9534f';
                    }
                };

                /**
                 * validates both password inputs
                 */
                $scope.confirmPW = function(){
                    if($scope.pw == $scope.pwConfirm){
                        $scope.showConfirmPWStatus = true;
                        setPassword(cmCrypt.hash($scope.pw));
                    } else {
                        $scope.showConfirmPWStatus = false;
                        setPassword('none');
                    }
                };

                /**
                 * Wrapper Function to inject Password in extern Controller
                 * if password (empty || none) it is wrong, else it is right
                 */
                function setPassword(pw){
                    if(angular.isDefined(pw)){
                        $scope.password = pw;
                    }
                };
            }
        }
}]);



cmAuth.directive('cmValidateEmail',function(){
    //http://stackoverflow.com/questions/16863389/angular-js-email-validation-with-unicode-characters
    return {
        require: 'ngModel',
        link: function(scope,element,attrs,model){
            element.on('blur', function(evt){
                scope.$apply(function(){
                    var val = element.val();
                    var check = true;
                    if(val != ""){
                        // http://stackoverflow.com/a/46181/11236
                        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        check = re.test(val);
                    }
                    if(check !== true){
                        model.$setValidity('email', false);
                    } else {
                        model.$setValidity('email', true);
                    }
                });
            });
        }
    }
});






cmAuth.directive('cmValidatePhone',[

    'cmAuth',

    function(cmAuth){
        return {
            require: 'ngModel',
            link: function(scope,element,attrs,model){
                element.on('blur', function(evt){
                    scope.$apply(function(){
                        var val = element.val();
                        if(val != ""){
                            cmAuth.checkPhoneNumber(val)
                            .success(function(r){
                                if(angular.isDefined(r) && angular.isDefined(r.res) && r.res == 'OK' ){
                                    model.$setValidity('phone', true);

                                    if(angular.isDefined(r.data) && angular.isDefined(r.data.phoneNumber) && r.data.phoneNumber != ''){
                                        model.$setViewValue(r.data.phoneNumber);
                                        model.$render();
                                    }
                                } else {
                                    model.$setValidity('phone', false);
                                }
                            }).error(function(r){
                                model.$setValidity('phone', false);
                            });
                        } else {
                            model.$setValidity('phone', true);
                            model.$setPristine();
                        }
                    });
                });
            }
        }
    }
]);





cmAuth.directive('cmLogin', [

    'cmAuth', 
    'cmLogger',
    '$location',

    function (cmAuth, cmLogger, $location) {
        return  {
            restrict    :   'E',
            templateUrl :   'tpl/directives/cm-login.html',
            scope       :   {},
            controller  :   function ($scope, $element, $attrs) {                
                		        $scope.formData = {};	        

                		        $scope.autologin = function(){
                		            cmLogger.debug("autologin called")
                		            $scope.formData = {
                		                user: "Max"
                		                ,pass: "max.mustermann"
                		            };
                		        };

                		        $scope.getToken = function(){
                		            cmLogger.debug("requestToken called")
                		            cmAuth.requestToken($scope.formData.user, $scope.formData.pass).then(
                		                function(token){		                    
                		                    cmAuth.storeToken(token);		                    
                		                    $location.path("/start");
                		                }
                                        //error handling is done by cmAuth
                                    )
                		        };
                			}
        }
    }
]);