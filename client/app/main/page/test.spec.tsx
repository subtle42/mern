import { expect } from 'chai'
import { ReactWrapper, mount } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'

import { createSandbox, SinonSandbox, SinonFakeXMLHttpRequest, SinonStub } from 'sinon'
import { CreatePageButton } from './create'
import * as utils from '../../../testUtils'

describe('Page Add component', () => {
    const sandbox: SinonSandbox = createSandbox({})
    let wrapper: ReactWrapper<any, any>
    let xhr: SinonFakeXMLHttpRequest
    let requests: SinonFakeXMLHttpRequest[]

    beforeEach(() => {
        requests = []
        wrapper = mount(<CreatePageButton />)
        xhr = sandbox.useFakeXMLHttpRequest()
        xhr.onCreate = (req) => requests.push(req)
    })

    afterEach(() => {
        xhr.restore()
        sandbox.restore()
    })

    it('should have the modal hidden', () => {
        expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
    })

    it('should open the modal on click', () => {
        wrapper.find('NavItem').simulate('click')
        expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
    })

    describe('modal actions', () => {
        let createBtn: ReactWrapper
        let pageNameInput: ReactWrapper
        beforeEach(() => {
            wrapper.find('NavItem').simulate('click')
            createBtn = wrapper.find('Button')
                .filterWhere(el => el.text() === 'Create')
            pageNameInput = wrapper.find('Input')
        })

        it('should close the modal when user clicks the cancel button', () => {
            wrapper.find('Button')
            .filterWhere(el => el.text() === 'Cancel')
            .simulate('click')
            expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
        })

        it('should have the create button disabled', () => {
            expect(createBtn.prop('disabled')).to.equal(true)
        })

        it('should keep the create button disabled if input is less than 3', () => {
            pageNameInput.simulate('change', {
                target: {
                    value: 'aa',
                    name: 'title'
                }
            })
            expect(createBtn.prop('disabled')).to.equal(true)
        })

        it('should enable the create button if input is greater than 3', () => {
            pageNameInput.simulate('change', {
                target: {
                    value: 'aaaa',
                    name: 'title'
                }
            })
            expect(createBtn.prop('disabled')).to.equal(false)
        })

        it('should send a REST call on create', () => {
            pageNameInput.simulate('change', {
                target: {
                    value: 'aaaa',
                    name: 'title'
                }
            })
            utils.addBookToStore({
                _id: 'bookId'
            })
            createBtn.simulate('click')
            utils.waitATick()
            .then(() => expect(requests.length).to.equal(1))
        })
    })
})
