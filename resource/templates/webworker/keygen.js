importScripts('-mock-vendor.js');
importScripts('../vendor.0.2.6.js');

var crypt = null,
    time = 0;

self.addEventListener('message', function(event) {
    var data = event.data;
    switch (data.cmd) {
        case 'start':
            time = -((new Date()).getTime());
            crypt = new JSEncrypt({default_key_size: data.keySize});
            crypt.getKey(function(){
                self.postMessage({
                    msg:        'finished',
                    timeElapsed:(time + ((new Date()).getTime())),
                    privKey:    crypt.key.getPrivateKey()
                });
            });
        break;
        case 'cancel':
            if(crypt != null) {
                crypt.cancelAsync();
                crypt = null;
            }
            self.postMessage({'msg':'canceled'});
            self.close()
        break;
    }
}, false);