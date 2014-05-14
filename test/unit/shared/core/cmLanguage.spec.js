'use strict';

describe("cmLanguage", function() {

    describe("setup", function(){

        var language_tables = {};

        it('should find an array of correctly formatted keys for supported languages at cameo.supported_languages', function() {
            expect(Object.prototype.toString.call( cameo_config.supported_languages )).toEqual('[object Array]')
            cameo_config.supported_languages.forEach(function(lang_key){
                expect(lang_key.match(/^[a-z]{2}_[A-Z]{2}$/)).not.toEqual(null) // e.g. de_DE
            })
        })

        it('should find string with path to languages files at cameo.path_to_language files.', function(){
            expect(typeof cameo_config.path_to_languages).toEqual('string')
        })

        it('should find and load correctly named and json formatted files for all supported languages within 5 second.', function() {
            var count = cameo_config.supported_languages.length

            
            cameo_config.supported_languages.forEach(function(lang_key){
                var file = 'app/'+cameo_config.path_to_languages+'/'+lang_key+'.json';
                language_tables[lang_key] = window.__html__[file]
            })
            
            expect(Object.keys(language_tables).length).toEqual(cameo_config.supported_languages.length)            
        })

        it('should find a translation for each message_id for all supported langauges.', function(){
            var message_ids = {}

            //Helper function to serialize all message ids
            function extendList(list, str, obj){
                if(typeof obj == 'string') {
                    list.push(str)
                } else {
                    $.each(obj, function(key, value){
                        extendList(list, str+(str?'.':'')+key, value)
                    })
                }
            }

            //Helper function to compare language lists od message ids
            function diffLists(list1, list2){
                list1.sort()
                list2.sort()

                var i = 0

                while (list1[i] && (list1[i] == list2[i])) { i++ }

                return(list1[i] || list2[i])
            }

            var list = [],
                all_the_same = true

            $.each(language_tables, function(lang_key, language_data){
                if(list.length == 0){
                    extendList(list, '', language_data)
                }else{
                    var next_list = [],
                        last_diff = undefined

                    extendList(next_list, '', language_data)
                    last_diff = diffLists(list, next_list)

                    if(last_diff) console.log('Missing or surplus message id in '+lang_key+': '+last_diff)

                    all_the_same = all_the_same && !last_diff
                    list = next_list
                }
            })

            expect(all_the_same).toEqual(true)
        })
    })

    describe("module", function() {

        var ctrl, scope, cmLanguage, cmTranslate, $compile, $httpBackend

        beforeEach(module('cmCore', [

            'cmLanguageProvider',

            function(cmLanguageProvider){
                cmLanguageProvider
                .preferredLanguage( 'en_US' )
                .supportedLanguages(['en_US, de_DE'])
                .pathToLanguages('i18n')
                .translations('en_US', {
                    'LANG.EN_US' : 'english',
                    'TEST': 'works'
                })
            }
        ]))


        beforeEach(inject(function(_$rootScope_, _$compile_, _cmLanguage_, _cmTranslate_, _$httpBackend_){
            scope        = _$rootScope_.$new()
            cmLanguage   = _cmLanguage_
            cmTranslate  = _cmTranslate_
            $compile     = _$compile_
            $httpBackend = _$httpBackend_
        }))

        it('should provide a service "cmTranslate".', function(){
            expect(cmTranslate).toBeDefined()
        })

        it('should provide a service "cmLanguage".', function(){
            expect(cmLanguage).toBeDefined()
        })

        describe("cmLanguage filter", function(){

            it('should provide a functionen "getLanguageName" to get the translation of a languages\'s name by its key.', function(){
                expect(cmLanguage.getLanguageName('en_US')).toEqual('english')
            })


            it('should provide a functionen "getCurrentLanguage" to return the currently active languages\'s key.', function(){
                expect(cmLanguage.getCurrentLanguage()).toEqual('en_US')
            })


            it('should provide a functionen "getSupportedLanguages" to return the keys of supported languages\'.', function(){
                expect(cmLanguage.getSupportedLanguages()).toEqual(['en_US, de_DE'])
            })


            it('should provide a functionen "getPathToLanguage" to return the path to language files.', function(){
                expect(cmLanguage.getPathToLanguage()).toEqual('i18n')
            })

            it('should provide a functionen "switchLanguage" to switch between supported languages.', function(){
                expect(typeof cmLanguage.switchLanguage).toEqual('function')

                $httpBackend.whenGET('i18n/de_DE.json')
                .respond('{"LANG": {"FR_FR":"Französisch"} }')

                //return a promise
                cmLanguage.switchLanguage('de_DE')

                //resolves all promises
                $httpBackend.flush();

                expect(cmLanguage.getLanguageName('fr_FR')).toBe('Französisch')
                $httpBackend.verifyNoOutstandingExpectation()
            })
        })

        it('should provide translation filter \'cmTranslate\'', function(){
            var el = $('<span>{{"TEST"|cmTranslate}}</span>')

            $compile(el)(scope)
            scope.$digest()
            expect(el.text()).toEqual('works')
        })
    })
})
