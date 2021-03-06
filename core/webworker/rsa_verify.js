importScripts('-mock-vendor.js');
importScripts('../vendor.<%= currentVersion %>.js');

var crypt = new JSEncrypt()

self.addEventListener('message', function(event) {
    var data    = event.data

    switch (data.cmd) {
        case 'start':
            try {
                crypt.setKey(data.params.pubKey)

                var result = crypt.verify(data.params.data, data.params.signature, function(x){ return x })

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