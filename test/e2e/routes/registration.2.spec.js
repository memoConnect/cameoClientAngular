var config = require("../config-e2e-tests.js")
var util = require("../../lib/e2e/cmTestUtil.js")

var loginName = "Z" + Date.now();
var password = "PWD_Z" + Date.now();

describe('registration', function () {

    var ptor = util.getPtorInstance()
    afterEach(function() { util.stopOnError() });


    it('should contain 7 input fields with placeholders', function () {

        util.logout()

        util.get("/registration");

        $$("input").then(function (elements) {
            expect(elements.length).toBe(7)
            elements.forEach(function (element) {
                element.getAttribute("placeholder").then(function (text) {
                    element.getAttribute("type").then(function (type) {
                        if (type != "checkbox") {
                            expect(text).not.toBe("")
                        }
                    })
                });
            })
        })
    })

    it('should display errors if required fields are empty', function () {

        $("[data-qa='btn-createUser']").click()

        util.checkWarning("register-info-username-empty")
        util.checkWarning("drtv-password-error-empty")
        util.checkWarning("register-info-terms")
    })

    it('should display error if username too short', function () {

        util.get("/registration");

        $("[data-qa='input-loginName']").sendKeys("moep")
        ptor.sleep(501)//adaptive change delay
        util.checkWarning("register-info-user-min-letter-count")

        // it should disappear if we type more letters
        $("[data-qa='input-loginName']").sendKeys("moep")
        ptor.sleep(501)//adaptive change delay
        expect($("[data-qa='register-info-user-min-letter-count']").isDisplayed()).toBe(false)

        util.clearInput('input-loginName')
    })

    it('should display error if username is invalid', function () {

        util.get("/registration");

        $("[data-qa='input-loginName']").sendKeys("moep-moep")

        ptor.wait(function () {
            return $("[data-qa='register-info-username-invalid']").isDisplayed()
        }, 1000, "username invalid timeout")

        util.checkWarning("register-info-username-invalid")

        util.clearInput('input-loginName')
    })

    it('should display error if username exists', function () {

        util.get("/registration")

        $("[data-qa='input-loginName']").sendKeys(config.loginUser1)

        ptor.wait(function () {
            return $("[data-qa='register-info-username-exists']").isDisplayed()
        }, 5000, "username exists timeout")

        util.checkWarning("register-info-username-exists")
        util.clearInput('input-loginName')

    })

    it('should return error on wrong password repeat', function () {

        $("[data-qa='input-password']").sendKeys(password)
        $("[data-qa='input-passwordConfirm']").sendKeys("moep")
        $("[data-qa='icon-passwordConfirm']").getAttribute("class").then(function(cl){
            expect(cl).toContain("cm-checkbox-wrong")
        })

    })

    it('should link to term of use', function() {
        $("body").sendKeys(protractor.Key.END)

        util.waitForElement("[data-qa='link-terms']")
        $("[data-qa='link-terms']").click()
        util.waitForPageLoad("/terms")
    })

    it('should create account with valid credentials', function() {

        var loginName = util.createTestUser()

        util.waitForElement("cm-modal")

        $("body").sendKeys(protractor.Key.ESCAPE)
        util.waitForModalClose()
        expect($(".empty-list").isPresent()).toBe(true)

        // modal should only be displayed on first visit
        ptor.refresh()
        $$("cm-modal").then(function(elements) {
            expect(elements.length).toBe(0)
        })

        util.deleteTestUser(loginName)
    })
})
