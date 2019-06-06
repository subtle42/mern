import { expect } from 'chai'
import * as utils from './cleanup'

describe('Basic User Authentication', () => {
    beforeEach(() => {
        browser.url('/')
    })

    before(() => {
        return utils.cleanDb()
    })

    it('should be able to open the page', () => {
        browser.url('/')
        const title = browser.getTitle()
        expect(title).to.be.equal('Testing')

    })

    it('should register a user', () => {
        $('a=Register').click()
        $(`input[name='name']`).setValue('autouser')
        $(`input[name='email']`).setValue('auto@auto.com')
        $(`input[name='password']`).setValue('mypassword')
        $('button=Submit').click()
    })

    it('should login', () => {
        $('a=Login').click()
        $(`input[name='email']`).setValue('auto@auto.com')
        $(`input[name='password']`).setValue('mypassword')
        $('button=Sign in').click()
        $('a=Logout').waitForExist()
    })
})
