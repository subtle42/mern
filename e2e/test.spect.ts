import {expect} from "chai";
import * as chai from 'chai';
import {default as chaiWebdriver} from "chai-webdriverio"
chai.use(chaiWebdriver(browser));

describe("my first test", () => {
    it("should do a thing", () => {
        let asdf:string = "hello";
        browser.url('http://webdriver.io');
        console.log(browser.getTitle())
        
        expect(browser.getTitle().length).to.greaterThan(1)
        expect(browser.getTitle()).to.not.contain("awlfkjawf")
    })
})