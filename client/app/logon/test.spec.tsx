import "jsdom-global/register"
import {expect} from "chai"
import {shallow, ShallowWrapper, configure} from "enzyme"
const Adapter = require('enzyme-adapter-react-16');
import * as React from "react";
import {createSandbox, SinonSandbox} from "sinon"
import authActions from "data/auth/actions" 
import LoginPage from "./login";


describe("Login component", () => {
    configure({
        adapter: new Adapter()
    })
    let wrapper:ShallowWrapper<any, any>;
    const sandbox:SinonSandbox = createSandbox({});

    beforeEach(() => {
        wrapper = shallow(<LoginPage />);
    })

    afterEach(() => {
        sandbox.restore();
    })

    it("should have two input fields", () => {
        expect(wrapper.find('Input').length).to.equal(2);
    })

    it("should have a button", () => {
        expect(wrapper.find('Button').length).to.equal(1);
    })

    describe("login", () => {
        it("should call authActions.login", () => {
            const myLogin = sandbox.stub(authActions, "login").returns(new Promise(resolve => {
                return {};
            }));
            wrapper.find('Button').simulate('click');
            expect(myLogin.calledOnce).to.equal(true);
        })
    })
})