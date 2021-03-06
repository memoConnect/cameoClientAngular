'use strict';

angular.module('cmFiles').directive('cmBlobImage',[
    'cmFilesAdapter',
    function (cmFilesAdapter) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs){

                function showFile(file){
                    // mocked
                    if('url' in file && 'src' in file.url){
                        element.attr('src', file.url.src);
                        element.on('load', function(){
                            // hide spinner
                            scope.$apply(function(){
                                file.loaded = true;
                            });
                        });
                    // loaded
                    } else if(typeof file.blob == 'object'){
                        cmFilesAdapter
                        .getBlobUrl(file.blob, true)
                        .then(
                            function(objUrl){
                                file.url = objUrl;
                                element.attr('src', file.url.src);
                                element.on('load', function(){
                                    // hide spinner
                                    scope.$apply(function(){
                                        file.loaded = true;
                                    });
                                });
                                element.on('error', function(){
                                    scope.$apply(function(){
                                        file.loaded = true;
                                    });
                                })
                            }
                        );

                    } else {
                        // hide spinner
                        file.loaded = true;
                    }
                }

                function handleBlob(file){
                    if(typeof file !== 'undefined'){
                        if(file.state.is('cached') || file.state.is('new')){
                            showFile(file);
                        }

                        file.on('file:cached', function(){
                            showFile(file);
                        });

                        file.on('upload:finish', function(){
                            showFile(file);
                        });
                    }
                }

                // load image via fileapi
                scope.$watch(attrs.cmBlobImage, handleBlob);
            }
        }
    }
]);