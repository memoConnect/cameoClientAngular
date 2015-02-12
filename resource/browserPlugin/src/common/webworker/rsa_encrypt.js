importScripts('-mock-vendor.js');
importScripts('../lib/vendor.0.2.6.js');

var crypt = new JSEncrypt()

self.addEventListener('message', function(event) {
    var data    = event.data

    switch (data.cmd) {
        case 'start':
            try {
                crypt.setKey(data.params.pubKey)

                var result = crypt.encrypt(data.params.secret)

                self.postMessage({
                    msg:    result ? 'finished' : 'failed',
                    result: result
                })

            } catch(e){
                self.postMessage({
                    msg:    'error',
                    error:  JSON.stringify(e)
                })
            }
            
        break;
        case 'cancel':
            if(crypt != null)
                crypt = null;
            self.postMessage({
                msg:'canceled'
            });
            self.close()
        break;
    }
}, false);