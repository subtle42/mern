import {expect} from "chai";

describe("my first test", () => {
    it("should do a thing", () => {
        let asdf:string = "hello";
        browser.url('http://webdriver.io');
        console.log(browser.getTitle())
        expect(browser.getTitle().length).to.greaterThan(1)
    })
})