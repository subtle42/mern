import { expect } from 'chai'
import * as utils from '../integration/utils'

describe('Basic User Authentication', () => {
    beforeEach(() => {
        browser.url('/')
    })

    before(() => {
        // return utils.cleanDb()
    })

    after(() => {
        // return utils.cleanDb()
    })

    it('should be able to open the page', () => {
        browser.url('/')
        const title = browser.getTitle()
        expect(title).to.be.equal('Testing')

    })

    xit('should pass', () => {
        console.log('hi')
    })

    xit('should register a user', () => {
        // $('a=Register').click()
        // .then(ele => ele.click())
        // .then(() => $(`input[name='userName']`))
        // .then(input => input.setValue('autouser'))
        // .then(() => $(`input[name='email']`))
        // .then(input => input.setValue('auto@auto.com'))
        // .then(() => $(`input[name='password']`))
        // .then(input => input.setValue('mypassword'))
        // .then(() => $('button=Submit'))
        // .then(btn => btn.click())
    })

    // it('should login', () => {
    //     browser.click('a=Login')
    //     browser.waitForExist('button=Sign in')
    //     browser.setValue("input[name='email']", 'auto@auto.com')
    //     browser.setValue("input[name='password']", 'mypassword')
    //     browser.click('button=Sign in')
    //     browser.waitForExist('a=Logout')
    // })
})
