'use strict';

angular.module('cmUi').directive('cmAvatar',[

    'cmLogger',

    function (cmLogger){

        var avatarMocks = {
            none: 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAeAB4AAD/4QA6RXhpZgAATU0AKgAAAAgAA1EQAAEAAAABAQAAAFERAAQAAAABAAAAAFESAAQAAAABAAAAAAAAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAqACoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9hKKKuaFHZy6tCt+8kdqW+dkHP/6qAKdFep2GneF7i8+w28VlNNjO0AuTxn73/wBeuO+IvhOHwvqkf2dm8i4Usqk5KEdRn05oA52iiigAooooA9E+GXhuHR9IbWLkrvkRmUnpFGOp+px+X41yfjbxU3ivV/NClIIhsiU9cep9zXX2/wAPUbwov/EwvhI1vu4m/cjIzjb/AHe1ecUAFFFFABRRRQBpL4u1JNJ+wi7k+ykbdnGcemeuPbOKzaKKACiiigD/2Q=='
        };

        return {
            restrict: 'AE',

            link: function(scope, element, attrs){
                function refresh(identity){
                    // hide the complete avatar
                    if(attrs.cmView == 'hide-owner' && identity.isAppOwner){
                        element.css('display','none');
                    } else {
                        // get avatar image from model
                        var file = identity.getAvatar();

                        file.on('file:cached', function(){
//                            console.log('avatar:cached');
//                            console.log(file);
//                            console.log(file.blob);
//                            var urlCreator = window.URL || window.webkitURL;
//                            var imageUrl = urlCreator.createObjectURL( file.blob );
//                            element.css({'background-image': 'url('+imageUrl+')'});

                            var reader = new FileReader();
                            reader.onload = function(e){
//                                console.log(e.target.result)
                                element.css({'background-image': 'url('+ e.target.result +')'});
                            };
                            reader.readAsDataURL(file.blob);
                        });

                        // show name under avatar
                        if(attrs.cmWithName){
                            element.addClass('with-name');
                            element.append('<div class="name" data-qa="avatar-display-name">'+identity.getDisplayName()+'</div>');
                            element.attr('title',identity.getDisplayName());
                        }
                    }
                }

                // is unknown avatar for add reciepients or choose avatar
                if(attrs.cmView == 'unknown'){
                    element.css({'background-image': 'url(' + avatarMocks.none +')'});
                } else {
                    var identity = scope.$eval(attrs.cmData);

                    if(identity && identity['getAvatar'] != undefined){
                        refresh(identity);

                        identity.on('init:finish',function(event, identity){
                            refresh(identity);
                        })
                    }

                    element.on('click',function(){
                        refresh(identity)
                    })
                }
            }
        }
    }
])
