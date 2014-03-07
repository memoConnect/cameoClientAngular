//define(function(require){
//
//    var angular = require('angular');

    var deviceReady = false;

    // Wait for device API libraries to load
    document.addEventListener("deviceready", onDeviceReady, false);

    // device APIs are available
    function onDeviceReady() {
        console.log('device ready')
        console.log('check requirejs '+(typeof define))
        console.log('check angularjs '+(typeof angular))
        // set global var
        deviceReady = true;
        // do function
        checkConnection();
    }

    function prettify(object){
        return JSON.stringify(object, undefined, 2);
    }

    function loadContacts(){
        if(!deviceReady)
            return false;

        var options = new ContactFindOptions();
            // search string
            options.filter = "";
            options.multiple = true;
        // looks specific type
        var filter = ['name','displayName','phoneNumbers','emails'];

        console.log('start of reading contacts---------------');
        // find contacts
        navigator.contacts.find(filter,
            function(contacts) {
                console.log('contacts success '+contacts.length)
                document.getElementById('contactsNumber').innerHTML = 'contacts success '+contacts.length;
                for (var i = 0; i < contacts.length; i++) {
                    var clearContact = contacts[i];

//                    for(var data in clearContact){
//                        if(data == null)
//                            delete clearContact[data];
//                    }

                    console.log(prettify(clearContact));
                }
                console.log('end of reading contacts---------------');
            }, function onError(contactError) {
                alert('onError!');
            }, options
        );
    }

    function checkConnection() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';

        document.getElementById('networkState').innerHTML = 'Connection type: ' + states[networkState];
    }

//})