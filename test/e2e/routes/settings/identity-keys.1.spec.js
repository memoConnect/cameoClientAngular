var config = require("../../config-e2e-tests.js")
var util = require("../../../lib/e2e/cmTestUtil.js")

describe('Identity key settings: ', function () {

    var ptor = util.getPtorInstance()
    var login
    var password = "password"
    var keyName = "Moeps key"

    afterEach(function () {
        util.stopOnError()
    });

    it('create new user and open identity settings', function () {
        login = util.createTestUser()
        util.get('/settings/identity/edit')
    })

    it('key settings should open when clicked on the according button', function () {
        $("[data-qa='btn-identity-keys']").click()
        util.waitForPageLoad('/settings/identity/key/list')
    })

    it('there should be no keys', function () {
        $$("[data-qa='key-list-item']").then(function (elements) {
            expect(elements.length).toBe(0)
        })
    })

    it('click button to create key', function () {
        $("[data-qa='btn-create-key']").click()
        util.waitForPageLoad('/settings/identity/key/create')
    })

    it('select key size and generate', function () {
        util.waitForElement("[data-qa='select-key-size']")

        util.click("select-key-size")
        util.waitForElement("[data-qa='keysize-2048']")
        util.waitForElement("[data-qa='keysize-4096']")

        $("[data-qa='btn-generate-key']").click()
    })

    it('page for key generation should be shown', function () {
        util.waitForElement("[data-qa='page-generating-key']")
        expect($("[data-qa='btn-cancel-key-generation']").isDisplayed()).toBe(true)
    })

    it('cancel generation', function () {
        $("[data-qa='btn-cancel-key-generation']").click()
        util.waitForPageLoad("/settings/identity/key/list")
    })

    it('start generation again', function () {
        $("[data-qa='btn-create-key']").click()
        util.waitForPageLoad('/settings/identity/key/create')
        $("[data-qa='btn-generate-key']").click()
    })

    describe('with increased timeout', function () {
        beforeEach(function () {
            jasmine.getEnv().defaultTimeoutInterval = 120000
        })

        afterEach(function () {
            jasmine.getEnv().defaultTimeoutInterval = 30000
        })

        it('wait for key generation and display key', function () {
            util.waitForElementVisible("[data-qa='page-save-key']", 110000)

            expect($("[data-qa='input-key-name']").getAttribute('value')).toBeTruthy()

            util.clearInput("input-key-name")
            $("[data-qa='input-key-name']").sendKeys(keyName)

            /**
             * test
             */
            $("body").click();

            $("[data-qa='btn-save-key']").click()

        })
    })

    it('the new key should be displayed as local', function () {
        util.waitForPageLoad('/settings/identity/key/list')
        util.waitForElement("[data-qa='key-list-item']")

        $$("[data-qa='key-list-item']").then(function (elements) {
            expect(elements.length).toBe(1)
            // key is local
            expect(elements[0].isElementPresent(by.css("[data-qa='key-is-local']"))).toBe(true)
            // check name
            expect(elements[0].getText()).toContain(keyName)
            // should contain date
            expect(elements[0].getText()).toMatch(/\d\d\.\d\d\.\d\d\s-\s\d\d:\d\d/)
        })
    })

    it('the key should still be there after logout/login', function () {
        util.logout()
        util.login(login, password, '/talks')
        util.get('/settings/identity/key/list')

        $$("[data-qa='key-list-item']").then(function (elements) {
            expect(elements.length).toBe(1)
            // key is local
            expect(elements[0].isElementPresent(by.css("[data-qa='key-is-local']"))).toBe(true)
            // check name
            expect(elements[0].getText()).toContain(keyName)
            // should contain date
            expect(elements[0].getText()).toMatch(/\d\d\.\d\d\.\d\d\s-\s\d\d:\d\d/)
        })
    })

    it('delete key and confirm that it is deleted after logout/login', function () {
        $("[data-qa='btn-remove-modal']").click()
        $("[data-qa='btn-remove-key']").click()

        util.logout()
        util.login(login, password)
        util.get('/settings/identity/key/list')
        $$("[data-qa='key-list-item']").then(function (elements) {
            expect(elements.length).toBe(0)
        })
    })


    it('generate another local key and delete local storage', function () {
        util.generateKey(1, keyName)
        util.clearLocalStorage()
        util.login(login, password)
        util.get('/settings/identity/key/list')
        util.waitForPageLoad('/settings/identity/key/list')

        $$("[data-qa='key-list-item']").then(function (elements) {
            expect(elements.length).toBe(1)
            // key is not local
            expect(elements[0].isElementPresent(by.css("[data-qa='key-is-local']"))).toBe(false)
            // check name
            expect(elements[0].getText()).toContain(keyName)
            // should contain date
            expect(elements[0].getText()).toMatch(/\d\d\.\d\d\.\d\d\s-\s\d\d:\d\d/)
        })
    })

    it('generate yet another local key', function () {
        util.generateKey(2)
        util.get('/settings/identity/key/list')
        util.waitForPageLoad('/settings/identity/key/list')
        util.waitForElements("[data-qa='key-list-item']", 2)
    })

    it('delete test user', function () {
        util.deleteTestUser(login)
    })
})