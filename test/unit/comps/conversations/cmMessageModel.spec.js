'use strict';

describe('cmMessageModel', function(){
   
    var cmMessageModel,
        $httpBackend

    beforeEach(function(){
        module(function($provide){
            $provide.constant('cmEnv',{});
        })
    })
    
   
    beforeEach(module('cmConversations'));
    beforeEach(inject(function(_cmMessageModel_, _$httpBackend_){
        cmMessageModel  = _cmMessageModel_
        $httpBackend    = _$httpBackend_
    }))
    afterEach(function(){
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()
    })

    /** more Tests needed *//

    it('should not save when improper.', function(){
        var message = new cmMessageModel({conversation:{any:'moep'}})

        $httpBackend.expectGET('/identity').respond(200,{})
        message.save()

        $httpBackend.flush()

        //expect nothing to happen! There must be no further requests.
    })

})