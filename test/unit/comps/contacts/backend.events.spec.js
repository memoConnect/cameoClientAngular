'use strict';

describe('Event chain for Contacts', function(){

    var cmApi,
        cmContactsAdapter,
        cmContactsModel,
        cmUserModel, 
        $rootScope,
        $httpBackend,

        friendRequest_data = {
            "identityId":"80D8zD6OysTfoZA7Bzso",
            "message":"my test message",
            "created":1404313824779
        }

    beforeEach(function(){
        module(function($provide){
            $provide.constant('cmEnv',{});
        })
    })

    beforeEach(module('cmContacts'))

    beforeEach(inject(function(_cmApi_, _cmContactsAdapter_,_cmContactsModel_, _cmUserModel_, _$rootScope_, _$httpBackend_){
        cmApi               = _cmApi_
        cmContactsAdapter   = _cmContactsAdapter_
        cmContactsModel     = _cmContactsModel_
        cmUserModel         = _cmUserModel_
        $rootScope          = _$rootScope_
        $httpBackend        = _$httpBackend_
    }))

    describe('backend event friendRequest:new.', function(){

        it('should add a new friend request', function(){
            var adapter_triggered  = 0,
                number_of_requests = cmContactsModel.requests.length


            
            $httpBackend.expectGET('/identity').respond(200, {})


            cmContactsAdapter.on('friendRequest:new', function(){ adapter_triggered++ })

            cmApi.trigger('friendRequest:new', {
                friendRequest   : friendRequest_data,
                to              : cmUserModel.data.identity.id
            })

            cmApi.trigger('friendRequest:new', {
                friendRequest   : friendRequest_data,
                to              : 'non-existing-id-jgfjdsgfjg'
            })

            $rootScope.$apply()

            expect(adapter_triggered).toBe(2)
            expect(cmContactsModel.requests.length).toBe(number_of_requests + 1)
        })
    })

    describe('backend event friendRequest:accepted', function(){

        it('should update a contact corresponding to a friend request from another user.', function(){
            var adapter_triggered   =   0,
                contact             =   cmContactsModel.contacts.create({
                                            identity:       { id: 'my_new_friend' }, 
                                            contactType:    'pending'
                                        }),
                number_of_contacts  =   cmContactsModel.contacts.length

            expect(number_of_contacts).toBe(1)
            expect(contact.contactType).toBe('pending')

            $httpBackend.expectGET('/identity').respond(200, {})
            $httpBackend.expectGET('/identity/my_new_friend').respond(200, {})

            // :(
            $httpBackend.expectGET('/contacts').respond(200, {})
            $httpBackend.expectGET('/contact-groups').respond(200, {})
            $httpBackend.expectGET('/friendRequests').respond(200, {})

            cmContactsAdapter.on('friendRequest:accepted', function(){ adapter_triggered++ })

            //good event:
            cmApi.trigger('friendRequest:accepted', {
                to              : 'my_new_friend',
                from            : cmUserModel.data.identity.id
            })

            //bad event:
            cmApi.trigger('friendRequest:accepted', {
                to              : 'non-existing-id-jgfjdsgfjg',
                from            : '123'
            })

            
            $rootScope.$apply()

            expect(contact.contactType).toBe('internal')
            expect(adapter_triggered).toBe(2)
            
        })


        it('should update friend requests if accepted by current user (on another device).', function(){
            var adapter_triggered   =   0,
                friend_request      =   cmContactsModel.requests.create({ identity :  { id:'my_new_friend' } }),
                number_of_requests  =   cmContactsModel.requests.length

            expect(number_of_requests).toBe(1)
            expect(
                cmContactsModel.requests.filter(function(request){ 
                    return request.identity.id == 'my_new_friend' 
                })[0]
            ).toBe(friend_request)

            $httpBackend.expectGET('/identity').respond(200, {})
            $httpBackend.expectGET('/identity/my_new_friend').respond(200, {})

            // :(
            $httpBackend.expectGET('/contacts').respond(200, {})
            $httpBackend.expectGET('/contact-groups').respond(200, {})
            $httpBackend.expectGET('/friendRequests').respond(200, {})

            cmContactsAdapter.on('friendRequest:accepted', function(){ adapter_triggered++ })

            //good event:
            cmApi.trigger('friendRequest:accepted', {
                to              : cmUserModel.data.identity.id,
                from            : 'my_new_friend'
            })

            //bad event:
            cmApi.trigger('friendRequest:accepted', {
                to              : 'non-existing-id-jgfjdsgfjg',
                from            : '123'
            })

            $rootScope.$apply()

            expect(
                cmContactsModel.requests.filter(function(request){ 
                    return request.identity.id == 'my_new_friend' 
                })[0]
            ).toBeUndefined()
            expect(adapter_triggered).toBe(2)            
        })
    })
})