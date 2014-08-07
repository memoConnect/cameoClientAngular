var config = require("../config-e2e-tests.js")
var util = require("../../lib/e2e/cmTestUtil.js")

describe('Route conversation:', function () {

    var ptor = util.getPtorInstance()
    var newSubject = "wicked_test_subject_" + Date.now();
    var messageText = "wicked_test_message_text_" + Date.now();
    var messageText2 = "another_wicked_test_message_text_" + Date.now();
    afterEach(function() { util.stopOnError() });


    it('should be at "#/talks"', function () {
        util.login()
        util.get('/conversation/new')
        util.waitForPageLoad("/conversation/new")
    })

    it('should have a header', function () {
        expect($('cm-header').isPresent()).toBe(true)
    })

    it('should not have a footer', function () {
        expect($('cm-footer').isPresent()).toBe(false)
    })

    it('change the subject', function () {
        $("[data-qa='input-subject']").sendKeys(newSubject)
    })

    it('add message text', function(){
        util.setVal('input-answer',messageText)
    })

    it('display warning when encryption settings are not ok', function(){
        $("[data-qa='btn-send-answer']").click()
        util.waitAndCloseNotify()
    })

    it('disable encryption', function () {
        util.disableEncryption();
    })

    it('display warning when there is no recipient', function(){
        $("[data-qa='btn-send-answer']").click()
        util.waitForElement("[data-qa='checkbox-dont-ask-me-again']")
        util.waitAndCloseNotify()
    })

    it('add recipient', function () {
        $(".cm-add-button").click()
        util.waitForPageLoad("/conversation/new/recipients")
    })

    it('should filter contacts', function () {
        util.searchInList(config.contactUser1DisplayName)
        util.waitForElement("[data-qa='contact-display-name']")
    })

    it('add contact to conversation', function () {
        $("[data-qa='btn-select-contact']").click()
    })

    it('go back to conversation on click on "done"', function () {
        $("[data-qa='btn-done']").click()
        util.waitForPageLoad("/conversation/new")
    })

    it('added recipient should be displayed', function () {
        expect($(".recipients-counter").getText()).toBe('(1)')
        expect($(".recipient-name").getText()).toBe(config.contactUser1DisplayName)
    })

    it('should have an answer bar', function () {
        expect($('.answer').isPresent()).toBe(true)
    })

    it('send message', function () {
        $("[data-qa='btn-send-answer']").click()
    })

    it('there should be only one message, and it should contain the message text', function () {
       util.waitForElements('cm-message',1)
       expect($('cm-message').getText()).toContain(messageText)
    })

    it('log in as contact, the created conversation should be listed first', function () {
        util.login(config.contactUser1Login, config.contactUser1Password)

        util.get('/talks');
        util.expectCurrentUrl('#/talks')

        util.waitForElement("cm-conversation-tag")
        $$("cm-conversation-tag").then(function (elements) {
            expect(elements[0].$("[data-qa='conversation-subject']").getText()).toContain(newSubject.substring(0.10))
            expect(elements[0].$("[data-qa='conversation-last-message']").getText()).toContain(messageText.substring(0.10))
        })
    })

    it('the conversation should contain the message', function () {
        $$("cm-conversation-tag").then(function (elements) {
            elements[0].click()
            util.waitForPageLoad("/conversation/.*")
            $$('cm-message').then(function (elements) {
                expect(elements.length).toBe(1)
                expect(elements[0].getText()).toContain(messageText)
            })
        })
    })

    it('send reply', function() {
        util.setVal('input-answer',messageText2)
        $("[data-qa='btn-send-answer']").click()
    })

    it('there should be two messages, in the right order with the right text and authors', function () {
        // wait until second message appears
        util.waitForElements("cm-message", 2)

        $$('cm-message').then(function (elements) {
            expect(elements.length).toBe(2)
            expect(elements[0].getText()).toContain(messageText)
            expect(elements[1].getText()).toContain(messageText2)
        })
    })

    it('log in as original user, the created conversation should be listed first', function() {
        util.login()

        util.get('/talks');
        util.expectCurrentUrl('#/talks')

        util.waitForElement("cm-conversation-tag")
        $$("cm-conversation-tag").then(function (elements) {
            expect(elements[0].$("[data-qa='conversation-subject']").getText()).toContain(newSubject.substring(0.10))
            expect(elements[0].$("[data-qa='conversation-last-message']").getText()).toContain(messageText2.substring(0.10))
        })
    })

    it('the conversation should contain both messages and check sort by date', function () {
        $$("cm-conversation-tag").then(function (elements) {
            elements[0].click()
            util.waitForPageLoad("/conversation/.*")
            util.waitForElements("cm-message", 2)
            $$('cm-message').then(function (elements) {
                expect(elements.length).toBe(2)
                expect(elements[0].$(".text").getText()).toContain(messageText)
                expect(elements[1].$(".text").getText()).toContain(messageText2)
                expect(elements[1].$("[data-qa='message-author']").getText()).toBe(config.contactUser1DisplayName)
            })
        })
    })
})
