import 'jsdom-global/register'
import { expect } from 'chai'
import { mount, ReactWrapper } from 'enzyme'
import * as React from 'react'
import { createSandbox, SinonSandbox, SinonFakeXMLHttpRequest, SinonStub } from 'sinon'

describe('Offer List', () => {
    it('should show where is the item')
    it('should show the timeblock of the item')
    it('should show payout of the item')

    it('should let someone accept an offer')
    it('should let someone make a counter offer')

    it('should let realator accept counter offer')
    it('should let realator reject counter offer')

    it('should send notification via email')
    it('should be able to filter offers based on type')
    it('should be able to filter offers based time block')
    it('should be able to filter offers based time block')
})

describe('Offer posting', () => {
    it('should let a realator create an offer')
    it('should let a realator send an offer to specific agents')
    it('should let a realator post an offer the general public')
    it('should let a realator auto post to public after specific agents rejects offer')

    describe('agent interaction', () => {
        it('should allow agent to accept offer')
        it('should allow agent to reject offer')
    })
})
