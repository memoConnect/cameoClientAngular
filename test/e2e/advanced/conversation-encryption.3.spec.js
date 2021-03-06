var config = require("../config/specs.js")
var util = require("../cmUtil.js")

describe('Conversation encryption -', function () {

    var ptor = util.getPtorInstance()
    var date = Date.now()

    /*
     Helper functions
     */
    var checkConversation = function (recipients, negativeAspects, positiveAspects, encryptionType, password) {

        var conversationId
        var messages = []
        var sender = recipients[0]
        var getPurl = false
        var purlId
        var subject = undefined

        // use first recipient to create conversation
        it("create new conversation", function () {
            util.login(sender.login, "password")
            util.get("/conversation/new")
            // clear all test user messages
            util.getTestUserNotifications(recipients[0].login)
        })

        it("add subject", function () {
            subject = encryptionType + "_" + date + Math.random()
            $("[data-qa='input-subject']").sendKeys(subject)
        })

        it("add recipients to conversation", function () {

            util.get("/conversation/new/recipients")

            $("[data-qa='btn-header-list-search']").click()

            for (var i = 1; i < recipients.length; i++) {
                var recipient = recipients[i]

                $("[data-qa='inp-list-search']").sendKeys(recipient.login)
                util.waitForElement(".contact-list [data-qa='btn-select-contact']")
                $(".contact-list [data-qa='btn-select-contact']").click()
                $("[data-qa='btn-list-search-clear']").click()

                if (recipient.external) {
                    getPurl = true
                }
            }

            $("[data-qa='btn-done']").click()
            util.expectCurrentUrl('/conversation/new')

        })

        it("add message text", function () {
            var text = "moep_message_" + Math.floor(Math.random() * 1000000);
            util.setVal('input-answer',text)
            var message = {
                text: text,
                author: sender.login
            }
            messages.push(message)

            expect(util.getVal('input-answer')).toBe(text)
        })

        it("show modal when security settings need to be adjusted", function () {
            if (encryptionType == "password" || encryptionType == "passCaptcha" || encryptionType == "none") {
                $("[data-qa='btn-send-answer']").click()
                util.waitAndCloseNotify()
            }
        })

        it("set encryption settings", function () {
            util.get("/conversation/new/security")
            util.waitForElement("[data-qa='btn-encryption']")

            switch (encryptionType) {
                case "asym" :
                    expect($("[data-qa='btn-encryption']").isElementPresent(by.css(".cm-checkbox-right"))).toBe(true)
                    expect(ptor.isElementPresent(by.css("[data-qa='btn-toggle-captcha']"))).toBe(false)
                    expect(ptor.isElementPresent(by.css("cm-captcha"))).toBe(false)
                break;

                case "password" :
                    expect($("[data-qa='btn-encryption']").isElementPresent(by.css(".cm-checkbox-right"))).toBe(true)
                    expect($("[data-qa='btn-toggle-captcha']").isDisplayed()).toBe(true)
                    expect($("[data-qa='btn-toggle-captcha']").isElementPresent(by.css(".cm-checkbox"))).toBe(true)
                    expect(ptor.isElementPresent(by.css("cm-captcha"))).toBe(false)
                    expect($("[data-qa='input-password']").getAttribute('value')).toBe("")
                    $("[data-qa='input-password']").sendKeys(password)
                    $("[data-qa='input-password']").sendKeys(protractor.Key.TAB)
                break;

                case "passCaptcha" :
                    expect($("[data-qa='btn-encryption']").isElementPresent(by.css(".cm-checkbox-right"))).toBe(true)
                    $("[data-qa='btn-toggle-captcha']").click()
                    expect($("[data-qa='btn-toggle-captcha']").isElementPresent(by.css(".cm-checkbox-right"))).toBe(true)
                    expect(ptor.isElementPresent(by.css("cm-captcha"))).toBe(true)
                    expect($("[data-qa='input-password']").getAttribute('value')).not.toBe("")
                    util.clearInput('input-password')
                    $("[data-qa='input-password']").sendKeys(password)
                    $("[data-qa='input-password']").sendKeys(protractor.Key.TAB)
                break;

                case "none" :
                    expect($("[data-qa='btn-encryption']").isElementPresent(by.css(".cm-checkbox-right"))).toBe(true)
                    $("[data-qa='btn-encryption']").click()
                    expect(ptor.isElementPresent(by.css("[data-qa='btn-toggle-captcha']"))).toBe(false)
                    expect(ptor.isElementPresent(by.css("cm-captcha"))).toBe(false)
                break;

            }
            $("[data-qa='btn-security-done']").click()
        })

        var checkSecurityAspects = function (trust) {
            it("check security aspects", function () {
                util.waitForElement('cm-header:not(.ng-hide)')

                var p,n

                ptor.wait(function(){

                    $$('cm-header:not(.ng-hide) cm-icons.positive i').then(function (icons) {
                        if (trust) {
                            p = (icons.length == positiveAspects + 1)
                        } else {
                            p = (icons.length == positiveAspects)
                        }
                    })

                    $$('cm-header:not(.ng-hide) cm-icons.negative i').then(function (icons) {
                        n = (icons.length == negativeAspects)
                    })


                    return p && n
                    
                }, config.waitForTimeout, "expected "+positiveAspects+" positive aspect(s) and "+negativeAspects+" negative aspect(s), found "+p+"/"+n+" instead.")
            })
        }
//        checkSecurityAspects(encryptionType == "asym" && sender.hasKey)
        checkSecurityAspects()

        it("send initial message", function () {

            $("[data-qa='btn-send-answer']").click()
            util.waitForElement('cm-message')
            .then(function(){
                return util.getConversation(subject)
            }).then(function() {
                // get conversation Id
                return ptor.wait(function () {
                    return ptor.getCurrentUrl().then(function (url) {
                        conversationId = url.split("/").pop()
                        return conversationId != "new"
                    })
                }, 5000, 'unable to get conversation id')
            })

        })

        it("get purl for external user (if needed)", function () {
            if (getPurl) {
                ptor.wait(function () {
                    return util.getTestUserNotifications(recipients[0].login).then(function (response) {
                        //console.log('getPurl',response['data'])
                        if(response['data'].length > 0 && 'content' in response['data'][0])
                            purlId = response['data'][0]['content'].split("/p/")[1]
                        return purlId != undefined
                    })
                }, 5000, 'unable to get purlId because of empty testuser notifications. existing eventSubscription?')
            } else {
                expect(typeof purlId).toBe('undefined')
            }
        })

        var checkMessages = function (recipient, index) {

            describe("recipient number " + index + " -", function () {

                var conversationRoute

                it("login recipient", function () {
                    if (recipient.external) {
                        util.logout()

                        expect(typeof purlId).not.toBe('undefined')

                        conversationRoute = "/purl/" + purlId
                    } else {
                        expect(typeof conversationId).not.toBe('undefined')

                        util.login(recipient.login, "password")
                        conversationRoute = "/conversation/" + conversationId
                    }

                    util.get(conversationRoute)
                    util.waitForElement("cm-conversation")
                })

                it("enter password (if required)", function () {

                    if (recipient.hasKey || recipient.storedPassword) {
                        $$("cm-modal.active").then(function (modals) {
                            expect(modals.length).toBe(0)
                        })
                    } else {
                        if(['password', 'passCaptcha'].indexOf(encryptionType) != -1){

                            util.waitForModalOpen()
                            util.get(conversationRoute + "/security")

                            if(encryptionType == "passCaptcha")
                                util.waitForElement("[data-qa='captcha-image']")
                            
                            util.waitForElement("[data-qa='input-password']")

                            util.click('input-password')
                            util.setVal('input-password', password)

                            ptor.wait(function(){
                                return util.getVal('input-password')
                                .then(function(val){
                                    return val == password
                                })
                            }).then(function(){
                                // make sure that the input loses focus and ng-blur gets fired:
                                $("[data-qa='input-password']").sendKeys(protractor.Key.TAB)
                                $("#cm-app").click()

                                return util.waitForElement("[data-qa='icon-conversation-decrypted']")
                                    .then(function(){
                                        return $("[data-qa='btn-security-done']").click()
                                    })
                            }).then(function(){
                                return util.waitForPageLoad(conversationRoute)
                            })
                        }
                    }
                })

                it("recipient read message(s)", function () {

                    util.waitForElements("cm-message", messages.length)

                    // wait until they are decrypted (just in case)
                    ptor.wait(function () {
                        return $$('cm-message').then(function (elements) {
                            return elements[0].getText().then(function (text) {
                                return text.indexOf("moep") != -1
                            })
                        })
                    })
                    .then(function(){
                        return $$('cm-message').then(function (elements) {
                            expect(elements.length).toBe(messages.length)
                            for (var j = 1; j < messages.length; j++) {
                                expect(elements[j].getText()).toContain(messages[j].text)
                                if (messages[j].author != recipient) {
                                    //check author
                                    expect(elements[j].$("[data-qa='message-author']").getText()).toBe(messages[j].author)
                                }
                            }
                        })
                    })
                    //check signatures:
                    .then(function(){
                        return  $$('cm-message').then(function (elements) {
                                    elements.forEach(function(element, i){
                                        var author = recipients.filter(function(recipient){
                                                        return messages[i].author == recipient.login
                                                    })[0]

                                        if(author.hasKey){
                                            ptor.wait(function() {
                                                return element.$("[data-qa = 'signed']").isPresent()
                                            }, 3000, 'Message signature indicator did not show up.')
                                        }
                                        else{
                                            ptor.wait(function() {
                                                return element.$("[data-qa = 'unsigned']").isPresent()
                                            }, 3000, 'Missing message signature indicator did not show up.')
                                        }
                                    })
                                })
                    })
                })

                it("recipient send response", function () {
                    var text = "moep_message_" + Math.floor(Math.random() * 1000000)
                    $("[data-qa='input-answer']").sendKeys(text)
                    var message = {
                        text: text,
                        author: recipient.login
                    }
                    messages.push(message)
                    $("[data-qa='btn-send-answer']").click()
                })

                checkSecurityAspects()
            })

        }

        // login as all other recipients and send a message
        recipients.forEach(function (recipient, index) {
            if (index > 0) {
                checkMessages(recipient, index)
            }
        })

        describe("sender should be able to read all messages -", function () {
            checkMessages(recipients[0], 0)
        })

    }

    /*
     Tests start here
     */

    // creates conversation
    var testUserId1 = Math.random().toString(36).substring(2, 9)
    var testUser1 = "testUser23_" + testUserId1
//    console.log("user1: " + testUser1)
    // recipient with key
    var testUserId2 = Math.random().toString(36).substring(2, 9)
    var testUser2 = "testUser23_" + testUserId2
//    console.log("user2: " + testUser2)
    // recipient without key
    var testUserId3 = Math.random().toString(36).substring(2, 9)
    var testUser3 = "testUser23_" + testUserId3
//    console.log("user3: " + testUser3)
    // external User
    var externalUser1 = "external_moep1",
        externalUser2 = "external_moep2",
        externalUser3 = "external_moep3",
        externalUser4 = "external_moep4",
        externalUser5 = "external_moep5";

    // password
    var password1 = "1_" + Math.floor(Math.random() * 1000000)
    var password2 = "2_" + Math.floor(Math.random() * 1000000)

    describe("prepare tests -", function () {

        it("create test user 1", function () {
            util.createTestUser(testUserId1)
        })

        it("create test user 2, generate key and send friend request", function () {
            util.createTestUser(testUserId2)
            util.generateKey(2)
            util.sendFriendRequest(testUser1)
        })

        it("create test user 3 and send friend request", function () {
            util.createTestUser(testUserId3)
            .then(function(){
                return util.sendFriendRequest(testUser1)
            })
        })

        it("user 1 accept friend request", function () {
            util.login(testUser1, "password")
            util.acceptFriendRequests()
            util.addExternalContact(externalUser1)
            util.addExternalContact(externalUser2)
            util.addExternalContact(externalUser3)
            util.addExternalContact(externalUser4)
            util.addExternalContact(externalUser5)
        })
    })

    describe("no keys -", function () {

        describe("conversation with user that has a key -", function () {
            var recipients = [
                {login: testUser1, hasKey: false, storedPassword: true},
                {login: testUser2, hasKey: true}
            ]
            checkConversation(recipients, 1, 1, "password", Math.floor(Math.random() * 1000000))
        })

        describe("conversation with users without keys -", function () {
            var recipients = [
                {login: testUser1, hasKey: false, storedPassword: true},
                {login: testUser2, hasKey: true},
                {login: testUser3, hasKey: false},
                {login: externalUser1, external: true, hasKey: false}
            ]
            checkConversation(recipients, 1, 1, "password", Math.floor(Math.random() * 1000000))
        })
    })

    describe("with local key -", function () {

        it(" user 1 login and generate key", function () {
            util.login(testUser1, "password")
            util.generateKey(1)
        })

        describe("asym key transmission -", function () {
            var recipients = [
                {login: testUser1, hasKey: true},
                {login: testUser2, hasKey: true}
            ]

            checkConversation(recipients, 0, 2, "asym")
        })

        describe("password transmission -", function () {
            var recipients = [
                {login: testUser1, hasKey: true},
                {login: testUser2, hasKey: true},
                {login: testUser3, hasKey: false},
                {login: externalUser2, external: true, hasKey: false}
            ]
            checkConversation(recipients, 1, 1, "password", password1)
        })

        describe("passCaptcha transmission -", function () {
            var recipients = [
                {login: testUser1, hasKey: true},
                {login: testUser2, hasKey: true},
                {login: testUser3, hasKey: false},
                {login: externalUser3, external: true, hasKey: false}
            ]
            checkConversation(recipients, 2, 1, "passCaptcha", password2)
        })

        describe("no encryption -", function () {
            var recipients = [
                {login: testUser1, hasKey: true},
                {login: testUser2, hasKey: true},
                {login: testUser3, hasKey: false},
                {login: externalUser4, external: true, hasKey: false}
            ]
            checkConversation(recipients, 3, 0, "none")
        })

    })

   describe("no local private key -", function () {

        it("delete key and create local key for user2", function () {
            util.logout()
            util.clearLocalStorage()
            util.login(testUser2, "password")
            util.generateKey(3)
            util.login(testUser1, "password")
        })

        describe("open existing conversations -", function () {

            it("should not be able to open conversation with asym key transmission", function () {

                util.get("/talks")                
                util.headerSearchInList("asym_" + date)
                ptor.sleep(50)
                $("cm-conversation-tag").click()

                util.waitForElement("cm-message")
                util.waitAndCloseNotify()

                $$('cm-message').then(function (elements) {
                    elements.forEach(function (element) {
                        expect(element.getText()).not.toContain("moep")
                    })
                })
            })

            it("ask for password for password encrypted conversation", function () {

                util.get("/talks")
                util.headerSearchInList("password_" + date)
                ptor.sleep(50);
                $$("cm-conversation-tag").then(function (tags) {
                    tags[0].click()

                    util.waitForElement("cm-modal.active .cm-modal-alert")
                    $("cm-modal.active").$(".body").$("a").click()
                    util.waitForElement("[data-qa='input-password']")
                    $("[data-qa='input-password']").sendKeys(password1)
                    $("[data-qa='btn-security-done']").click()

                    $$('cm-message').then(function (elements) {
                        elements.forEach(function (element) {
                            expect(element.getText()).toContain("moep")
                        })
                    })
                })
            })

            it("show passcaptcha for passCaptcha encrypted conversation", function () {

                util.get("/talks")
                util.headerSearchInList("passCaptcha_" + date)
                ptor.sleep(50)
                $("cm-conversation-tag").click()

                util.waitForElement("cm-modal.active .cm-modal-alert")
                $("cm-modal.active").$(".body").$("a").click()
                util.waitForElement("[data-qa='captcha-image']")
                $("[data-qa='input-password']").sendKeys(password2)
                $("[data-qa='btn-security-done']").click()

                $$('cm-message').then(function (elements) {
                    elements.forEach(function (element) {
                        expect(element.getText()).toContain("moep")
                    })
                })
            })

            it("open unencrypted conversation", function () {

                util.get("/talks")
                util.headerSearchInList("none_" + date)
                $("cm-conversation-tag").click()
                util.waitForElement("cm-message")

                $$('cm-message').then(function (elements) {
                    elements.forEach(function (element) {
                        expect(element.getText()).toContain("moep")
                    })
                })
            })

        })

        describe("conversation with user that has key -", function () {
            var recipients = [
                {login: testUser1, hasKey: false, storedPassword: true},
                {login: testUser2, hasKey: true}
            ]
            checkConversation(recipients, 1, 1, "password", Math.floor(Math.random() * 1000000))
        })



        describe("conversation with users without keys -", function () {
            var recipients = [
                {login: testUser1, hasKey: false, storedPassword: true},
                {login: testUser2, hasKey: true},
                {login: testUser3, hasKey: false},
                {login: externalUser5, external: true, hasKey: false}
            ]
            checkConversation(recipients, 1, 1, "password", Math.floor(Math.random() * 1000000))
        })
    })

    describe("delete test users -", function () {
        it("delete test users", function () {
            util.deleteTestUser(testUser1)
            util.deleteTestUser(testUser2)
            util.deleteTestUser(testUser3)
        })
    })

})
