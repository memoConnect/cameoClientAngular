'use strict';

angular.module('cmCore')
.factory('cmFileModel', [
    'cmFilesAdapter',
    'cmFileDownload',
    'cmLogger',
    'cmChunk',
    'cmCrypt',
    'cmObject',
    '$q',
    'cmModal',
    'cmEnv',
    function (cmFilesAdapter, cmFileDownload, cmLogger, cmChunk, cmCrypt, cmObject, $q, cmModal, cmEnv){

        function roundToTwo(num) {
            return +(Math.round(num + 'e+2') + 'e-2');
        }

        var FileModel = function(fileData){

            var self = this,
                passphrase = undefined;

            cmObject.addEventHandlingTo(this);

            this.state = '';

            this.chunks = [];

            this.name = '';
            this.encryptedName = '';
            this.encryptedSize = 0;
            this.size = 0;

            this.base64 = '';

            this.setPassphrase = function(p){
                passphrase = p;// TODO: || null;
                return this;
            };

            this.setState = function(state){
                var arr_states = ['new','exists','cached','crashed'];
                if(arr_states.indexOf(state) != -1)
                    this.state = state;
                return this;
            };

            // upload for state = new

            this.importBase64 = function(base64){
                if(typeof base64 !== 'undefined'){
                    this.type = base64.replace(new RegExp('^(data:(.*);base64,.*)','i'),'$2');

                    this.blob = cmFilesAdapter.binaryToBlob(cmFilesAdapter.base64ToBinary(base64),this.type);

                    this.chopIntoChunks(128);
                }

                return this;
            };

            this.importBlob = function(blob){
                this.blob = blob;
                this.id   = undefined;

                this.name = blob.name;
                this.type = blob.type;
                this.size = blob.size;

                return this;
            };

            this.importFile = function(){
                var self = this;

                return cmFilesAdapter.getFile(this.id).then(
                    function(details){
                        self.encryptedName = details.fileName;
                        self.type          = details.fileType;
                        self.size          = details.fileSize;
                        self.chunkIndices  = details.chunks;
                        self.maxChunks     = details.maxChunks;
                        // start download when flag is true
                        if(details.isCompleted) {
                            self.trigger('importFile:finish',self);
                        } else {
                            self.trigger('importFile:incomplete',self);
                        }
                    },
                    function(){
                        self.trigger('file:crashed');
                        self.setState('crashed');
                    }
                );
            };

            this.chopIntoChunks = function(chunkSize){
                var self        = this,
                    startByte   = 0,
                    endByte     = 0,
                    index       = 0,
                    promises    = [];

                if(!this.blob) {
                    cmLogger.debug('Unable to chop file into Chunks; cmFile.blob missing.');
                    return null;
                }

                self.chunks   = [];

                while(endByte < this.blob.size) {

                    startByte = index * 1024 * chunkSize;
                    endByte = startByte + 1024 * chunkSize;

                    endByte = (endByte > this.blob.size) ? this.blob.size : endByte;

                    var chunk = new cmChunk();
                    self.chunks.push(chunk);

                    promises.push(
                        chunk
                            .importFileSlice(self.blob, startByte, endByte)
                            .blobToBase64()
                    );

                    index++;
                }

                return $q.all(promises);
            };

            this.encryptName = function(){
                if(this.name){
                    this.encryptedName = (passphrase == null) ? this.name : cmCrypt.encryptWithShortKey(passphrase, this.name);
                } else {
                    cmLogger.debug('Unable to encrypt filename; cmFile.name missing. Try calling cmFile.importFile() first.');
                }

                return this;
            };

            this.decryptName = function() {
                if(this.encryptedName){
                    this.name = cmCrypt.decrypt(passphrase, this.encryptedName);
                } else {
                    cmLogger.debug('Unable to decrypt filename; cmFile.encryptedFileName missing. Try calling cmFile.imporByFile) first.');
                }
                return this;
            };

            this._encryptChunk = function(index){
                var chunk = this.chunks[index];

                chunk.encrypt(passphrase);
                this.encryptedSize += chunk.encryptedRaw.length;

                if(index == (this.chunks.length - 1)){
                    this.trigger('encrypt:finish');
                } else {
                    this.trigger('encrypt:chunk', index);
                }
            };

            this.encryptChunks = function() {
                if(this.chunks){
                    this._encryptChunk(0);
                } else {
                    cmLogger.debug('Unable to encrypt chunks; cmFile.chunks missing. Try calling cmFile.chopIntoChunks() first.');
                }

                return this;
            };

            this._decryptChunk = function(index){
                var chunk = this.chunks[index];

                chunk
                    .decrypt(passphrase)

                this.encryptedSize += chunk.encryptedRaw.length;
                //this.size += chunk.blob.size;

                if(index == (this.chunkIndices.length - 1)){
                    this.trigger('decrypt:finish');
                } else {
                    this.trigger('decrypt:chunk', index);
                }
            };

            this.decryptChunks = function(){
                if(!this.chunks){
                    cmLogger.debug('Unable to decrypt chunks; cmFile.chunks missing. Try calling cmFile.downloadChunks() first.');
                    return null
                }

                this._decryptChunk(0);

                return this;
            };

            this.decryptStart = function(){
                this.decryptChunks();
            };

            this.reassembleChunks = function(){
                var self = this,
                    binary = '',
                    byteArray = [];

                if(!this.chunks)
                    cmLogger.debug('Unable reassemble chunks; cmFile.chunks missing. Try calling cmFile.downloadChunks() first.');

                this.chunks.forEach(function(chunk){
                    try{
                        binary+= cmFilesAdapter.base64ToBinary(chunk.raw);
                    } catch(e){
                        cmLogger.debug(e);
                    }
                });

                this.blob = cmFilesAdapter.binaryToBlob(binary, self.type);

                self.trigger('file:cached', this);

                return this;
            };

            this.prepareForUpload = function(conversationId) {
                var self = this;

                return (
                        self.encryptedName && self.chunks || self.name && self.chunks
                    ?   cmFilesAdapter.prepareFile({
                            conversationId: conversationId,
                            name: self.encryptedName || self.name,
                            size: self.blob.size,//self.encryptedSize,
                            type: self.type,
                            chunks: self.chunks.length
                        })
                        .then(function(id){
                            return self.id = id
                        })
                    :   cmLogger.debug('Unable to set up file for Download; cmFile.chunks or cmFile.encryptedName missing. Try calling cmFile.chopIntoChunks() and cmFile.encryptName() first.')
                )
            };

            this._uploadChunk = function(index){
                var chunk = this.chunks[index];

                chunk
                    .encrypt(passphrase)
                    .upload(this.id, index)
                    .then(function(){
                        self.trigger('progress:chunk', (index/self.chunks.length));

                        if(index == (self.chunks.length - 1)){
                            self.trigger('upload:complete',{ fileId:self.id });

                            self.on('file:complete', function(){
                                self.trigger('upload:finish');
                            });
                        } else {
                            self.trigger('upload:chunk', index);
                        }
                    });
            };

            this.uploadChunks = function() {
                if(!this.id){
                    cmLogger.debug('Unable to upload chunks; cmFile.id missing. Try calling cmFile.prepareForDownload() first.')
                    return null;
                }

                /**
                 * start upload with first chunk in array
                 */
                this._uploadChunk(0);

                return this;
            };

            this._downloadChunk = function(index){
                var chunk = new cmChunk();

                this.chunks[index] = chunk;

                chunk
                    .download(self.id, index)
                    .then(
                    function(){
                        self.trigger('progress:chunk', (index/self.chunks.length));

                        if(index == (self.chunkIndices.length - 1)){
                            self.trigger('download:finish', index);
                        } else {
                            self.trigger('download:chunk', index);
                        }
                    },
                    function(){
                        self.trigger('progress:chunk', 1);
                        self.trigger('download:finish', {'error':true});
                        self.trigger('file:cached');
                    }
                );
            };

            this.downloadChunks = function(){
//                cmLogger.debug('cmFileModel:downloadChunks');
                if(!this.id && this.state == 'exists'){
//                    cmLogger.debug('cmFile.downloadChunks();')
                    return null;
                }

                this.importFile();

                this.on('importFile:finish',function(){
                    self
                        .setState('exists')
                        .trigger('import:finish');

                    /**
                     * start download with first chunk in array
                     */
                    self._downloadChunk(0);
                });

                return this;
            };

            this.downloadStart = function(){
//                cmLogger.debug('cmFileModel:downloadStart');
                if(this.id != '' && this.state == 'exists'){
                    cmFileDownload.add(this);
                }
            };

            this.promptSaveAs = function(){
                // iOS can't save blob via browser

                var downloadAttrSupported = ( "download" in document.createElement("a") );
                var iOSWorkingMimeTypes = ( this.type.match(/(application\/pdf)/g) ? true : false );

                if(cmEnv.isiOS && !downloadAttrSupported && !iOSWorkingMimeTypes){
                    cmModal.create({
                        id:'saveas',
                        type: 'alert'
                    },'<span>{{\'NOTIFICATIONS.TYPES.SAVE_AS.IOS_NOT_SUPPORT\'|cmTranslate}}</span>');
                    cmModal.open('saveas');
                } else {
                    if(this.blob){
                        saveAs(this.blob, this.name != false ? this.name : 'download');
                    } else {
                        cmLogger.debug('Unable to prompt saveAs; cmFile.blob is missing, try cmFile.importByFile().');
                    }
                }
                return this;
            };

            this.hasBlob = function(){
                if(this.blob !== 'undefined'){
                    return true;
                }

                return false;
            };

            /**
             * keep the buffer clean when file is cached
             * @returns {FileModel}
             */
            this.clearBuffer = function(){
                if(this.state == 'cached') {
                    this.encryptedName = null;
                    this.chunkIndices = null;
                    this.chunks = null;
                    passphrase = undefined;
                }

                return this;
            };

            /**
             *
             * @param fileData
             * @param chunkSize
             * @returns {FileModel}
             */
            this.init = function(fileData, chunkSize){
                var self = this;

                if(typeof fileData !== 'undefined'){
                    // existing file via fileId
                    if(typeof fileData == 'string'){
                        this
                            .setState('exists')
                            .id = fileData;
                        // fileApi blob prepare upload
                    } else if(typeof fileData == 'object') {
                        this
                            .setState('new')
                            .importBlob(fileData);

                        if (!chunkSize) {
                            chunkSize = 128;
                        }

                        self.chopIntoChunks(chunkSize);
                    }
                }

                return this;
            };

            this.init(fileData);

            /**
             * Event Handling
             */
            this.on('download:chunk', function(event, index){
                self._downloadChunk(index + 1);
                self._decryptChunk(index);
            });

            this.on('download:finish', function(event, index){
//                cmLogger.debug('download:finish');
                if(typeof index == 'number') {
                    self._decryptChunk(index);
                    // error on download
                } else if(index.error) {
                    cmLogger.debug('chunk not found');
                    self.setState('cached');
                }
            });

            this.on('upload:chunk', function(event, index){
                self._uploadChunk(index + 1);
            });

            this.on('upload:finish', function(){
//                cmLogger.debug('upload:finish');
                self.setState('cached');
            });

            this.on('encrypt:chunk', function(event, index){
//                cmLogger.debug('encrypt:chunk');
                self._encryptChunk(index + 1);
            });

            this.on('decrypt:chunk', function(event, index){
//                cmLogger.debug('decrypt:chunk '+index);
//                self._decryptChunk(index + 1);
//                self._downloadChunk(index + 1);
            });

            this.on('decrypt:finish', function(event, index){
//                cmLogger.debug('decrypt:finish');
                self.reassembleChunks();
            });

            this.on('file:cached', function(){
//                cmLogger.debug('file:cached');
                self
                    .setState('cached')
                    .decryptName()
                    .clearBuffer()
            });
        };

        return FileModel;
    }
]);