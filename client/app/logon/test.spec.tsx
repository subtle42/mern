import 'jsdom-global/register'
import { expect } from 'chai'
import { mount, ReactWrapper } from 'enzyme'
import * as React from 'react'
import { createSandbox, SinonSandbox, SinonFakeXMLHttpRequest, SinonStub } from 'sinon'
import LoginPage from './login'
import RegisterPage from './register'
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

        it('should do nothing if email is not valid', () => undefined)

        xit('should do nothing if password is too short', () => undefined)

        it('should redirect to home upon login success', () => {
            const loginStub = sandbox.stub(AuthActions, 'login').returns(Promise.resolve())

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

describe('Register component', () => {
    const sandbox: SinonSandbox = createSandbox({})
    let wrapper: ReactWrapper<any, any>
    let xhr: SinonFakeXMLHttpRequest
    let requests: SinonFakeXMLHttpRequest[]
    let redirectStub: SinonStub

    beforeEach(() => {
        redirectStub = sandbox.stub(router, 'Redirect').returns(<div />)
        requests = []
        wrapper = mount(<RegisterPage />)
        xhr = sandbox.useFakeXMLHttpRequest()
        xhr.onCreate = (req) => requests.push(req)
    })

    afterEach(() => {
        xhr.restore()
        sandbox.restore()
    })

    describe('register process', () => {
        let nameInput: ReactWrapper
        let emailInput: ReactWrapper
        let passwordInput: ReactWrapper
        let submitBtn: ReactWrapper

        beforeEach(() => {
            nameInput = wrapper.find('Input[name="name"]')
            emailInput = wrapper.find('Input[name="email"]')
            passwordInput = wrapper.find('Input[name="password"]')
            submitBtn = wrapper.find('Button')
        })

        it('should not let user submit if form is invalid', () => {
            submitBtn.simulate('click')

            return utils.waitATick()
            .then(() => expect(requests.length).to.equal(0))
        })

        describe('with input', () => {
            const myName = 'awkjvlkwjreovufgope'
            const myEmail = 'asdf@asdf.com'
            const myPswrd = 'whvoibfjgbjrl'
            beforeEach(() => {
                nameInput.simulate('change', {
                    target: {
                        name: 'name',
                        value: myName
                    }
                })
                emailInput.simulate('change', {
                    target: {
                        name: 'email',
                        value: myEmail
                    }
                })
                passwordInput.simulate('change', {
                    target: {
                        name: 'password',
                        value: myPswrd
                    }
                })
            })

            it('should send a REST call with inputs if form is valid', () => {
                submitBtn.simulate('click')

                return utils.waitATick()
                .then(() => expect(requests.length).to.equal(1))
                .then(() => expect(requests[0].method).to.equal('POST'))
                .then(() => expect(requests[0].url).to.equal('/api/user'))
                .then(() => expect(requests[0].requestBody).to.equal(JSON.stringify({
                    email: myEmail,
                    name: myName,
                    password: myPswrd
                })))
            })

            it('should redirect to login page upon register success', () => {
                expect(redirectStub.getCalls().length).to.equal(0)
                submitBtn.simulate('click')

                return utils.waitATick()
                .then(() => requests[0].respond(200, {}, ''))
                .then(() => utils.waitATick())
                .then(() => expect(redirectStub.getCalls().length).to.equal(1))
            })

            it('should do nothing if email is NOT valid', () => {
                emailInput.simulate('change', {
                    target: {
                        name: 'email',
                        value: 'aa'
                    }
                })
                submitBtn.simulate('click')
                return utils.waitATick()
                .then(() => expect(requests.length).to.equal(0))
            })

            it('should do nothing if password is NOT valid', () => {
                passwordInput.simulate('change', {
                    target: {
                        name: 'password',
                        value: 'aa'
                    }
                })
                submitBtn.simulate('click')
                return utils.waitATick()
                .then(() => expect(requests.length).to.equal(0))
            })

            it('should do nothing if user name is NOT valid', () => {
                nameInput.simulate('change', {
                    target: {
                        name: 'name',
                        value: 'aa'
                    }
                })
                submitBtn.simulate('click')
                return utils.waitATick()
                .then(() => expect(requests.length).to.equal(0))
            })
        })
    })
})
