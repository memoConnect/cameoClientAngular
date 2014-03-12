var path = 'http://localhost:6108/app/index.html'

module.exports = {
    'without-token.js': function(test){
        test
            .open(path)
            // login
            .wait(1500)// wait for otherwise
            .assert.
                url(path+'#/login', 'on route login')
            .assert
                .numberOfElements('.form-control')
                    .is(3, '3 form-controls are present')
            .click("a[href='#/registration']")
            // registration
            .assert
                .url(path+'#/registration', 'on route registration')
            .assert
                .numberOfElements('.form-control')
                    .is(5, '5 form-controls are present')
            .click("a[href='#/terms']")
            // terms
            .assert
            .url(path+'#/terms', 'on route terms')
            .assert
                .text('h2')
                    .is.not('', 'terms header is shown')
            .assert
                .text('.well')
                    .is.not('', 'terms are full of paragraphs')
        .done()
    }
}