import 'jsdom-global/register'
import { expect } from 'chai'
import { mount, ReactWrapper } from 'enzyme'
import * as React from 'react'
import { createSandbox, SinonSandbox, SinonFakeXMLHttpRequest, SinonStub } from 'sinon'
import LoginPage from './login'
import * as utils from '../../testUtils'
import * as router from 'react-router-dom'
import AuthActions from 'data/auth/actions'

describe('Login component', () => {
    const sandbox: SinonSandbox = createSandbox({})
    let wrapper: ReactWrapper<any, any>
    let xhr: SinonFakeXMLHttpRequest
    let requests: SinonFakeXMLHttpRequest[]
    let redirectStub: SinonStub

    beforeEach(() => {
        redirectStub = sandbox.stub(router, 'Redirect').returns(<div />)
        requests = []
        wrapper = mount(<LoginPage />)
        xhr = sandbox.useFakeXMLHttpRequest()
        xhr.onCreate = (req) => requests.push(req)
    })

    afterEach(() => {
        xhr.restore()
        sandbox.restore()
    })

    it('should have two input fields', () => {
        expect(wrapper.find('Input').length).to.equal(2)
    })

    it('should have a button', () => {
        expect(wrapper.find('Button').length).to.equal(1)
    })

    describe('login', () => {
        let emailInput: ReactWrapper
        let pswrdInput: ReactWrapper

        beforeEach(() => {
            emailInput = wrapper.find('Input[name="email"]')
            pswrdInput = wrapper.find('Input[name="password"]')
        })

        it('should send a REST call with inputs if form is valid', () => {
            const myEmail = 'aweoverjvler'
            const myPswrd = 'wiejrvkrgjio'

            emailInput.simulate('change', {
                target: {
                    value: myEmail,
                    name: 'email'
                }
            })

            pswrdInput.simulate('change', {
                target: {
                    value: myPswrd,
                    name: 'password'
                }
            })

            wrapper.update()
            wrapper.find('Button').simulate('click')

            return utils.waitATick()
            .then(() => expect(requests.length).to.equal(1))
            .then(() => expect(requests[0].method).to.equal('POST'))
            .then(() => expect(requests[0].url).to.equal('/api/auth/local'))
            .then(() => expect(requests[0].requestBody).to.equal(JSON.stringify({
                email: myEmail,
                password: myPswrd
            })))
        })

        it('should do nothing if email is too short', () => undefined)

        it('should do nothing if passwrod is too short', () => undefined)

        it('should redirect to home upon login success', () => {
            let loginStub: SinonStub
            loginStub = sandbox.stub(AuthActions, 'login').returns(Promise.resolve())

            emailInput.simulate('change', {
                target: {
                    value: 'awefwef',
                    name: 'email'
                }
            })

            pswrdInput.simulate('change', {
                target: {
                    value: 'erervserv',
                    name: 'password'
                }
            })

            wrapper.update()
            wrapper.find('Button').simulate('click')
            return utils.waitATick()
            .then(() => expect(loginStub.getCalls().length).to.equal(1))
            .then(() => expect(redirectStub.getCalls().length).to.equal(1))
        })
    })
})
