import * as chai from 'chai'
import { default as chaiWebdriver } from 'chai-webdriverio'
import * as utils from '../integration/utils'
chai.use(chaiWebdriver(browser))

describe('Basic User Authentication', () => {
    beforeEach(() => {
        browser.url('./')
        browser.waitForText('body')
    })

    before(() => {
        return utils.cleanDb()
    })

    after(() => {
        return utils.cleanDb()
    })

    it('should be able to open the page', () => {
        chai.expect(browser.getTitle()).to.equal('Testing')
    })

    it('should register a user', () => {
        browser.click('a=Register')
        browser.waitForExist('div.form-group')
        browser.setValue("input[name='userName']", 'autouser')
        browser.setValue("input[name='email']", 'auto@auto.com')
        browser.setValue("input[name='password']", 'mypassword')
        browser.click('button=Submit')
    })

    it('should login', () => {
        browser.click('a=Login')
        browser.waitForExist('button=Sign in')
        browser.setValue("input[name='email']", 'auto@auto.com')
        browser.setValue("input[name='password']", 'mypassword')
        browser.click('button=Sign in')
        browser.waitForExist('a=Logout')
    })
})
