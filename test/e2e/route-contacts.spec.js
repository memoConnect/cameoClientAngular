var config = require("./config-e2e-tests.js")
var util = require("../lib/e2e/cmTestUtil.js")

describe('Route: Contacts', function () {
    var ptor = util.getPtorInstance()

    it('should be found at "#/contacts".', function(){
        util.login()
        util.get('/contacts')
        util.expectCurrentUrl('#/contacts')
    })

    it('should have a header.', function(){
        expect($('cm-header').isPresent()).toBe(true)
    })

    it('should have a footer.', function(){
        expect($('cm-footer').isPresent()).toBe(true)
    })

    it('should have a button to add new a contact.', function(){
        //Todo: Funktionalität testen:
        $([data-qa="add-contact"]).isPresent()).toBe(true)
    })

    //Todo:Filter

    it('should have a contact list.', function(){
        expect($('cm-contacts-list').isPresent()).toBe(true)
    })

    describe('contact list', function(){
        
    })


})