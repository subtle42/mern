import { expect } from 'chai'
import { ReactWrapper, mount } from 'enzyme'
import * as React from 'react'
import { createSandbox, SinonSandbox, SinonFakeXMLHttpRequest, stub } from 'sinon'
import { CreatePageButton } from './create'
import * as utils from '../../../testUtils'
import PageActions from 'data/pages/actions'

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
            pageNameInput = wrapper.find('Input')
            createBtn = wrapper.find('Button').filterWhere(el => el.text() === 'Create')
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

        xit('should enable the create button if input is greater than 3', () => {
            pageNameInput.simulate('change', {
                target: {
                    value: 'aaaa',
                    name: 'title'
                }
            })
            expect(createBtn.prop('disabled')).to.equal(false)
        })

        describe('on success', () => {
            const pageName = 'aoiwevalwe'
            const bookId = 'iubnjl'

            beforeEach(() => {
                pageNameInput.simulate('change', {
                    target: {
                        value: pageName,
                        name: 'title'
                    }
                })
                utils.setSelectedBook(bookId)
                createBtn.simulate('click')

                return utils.waitATick()
            })

            it('should send a REST', () => {
                expect(requests.length).to.equal(1)
                expect(requests[0].requestBody).to.equal(JSON.stringify({
                    name: pageName,
                    bookId
                }))
            })

            it('should set the selected page to the created page on success', () => {})

            xit('should close the modal on success', () => {
                sandbox.stub(PageActions, 'select').returns(Promise.resolve())

                expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
                const newPageId = 'woeiveojbpt'
                requests[0].respond(200, {}, newPageId)

                return utils.waitATick()
                .then(() => expect(wrapper.find('Modal').prop('isOpen')).to.equal(false))
            })
        })
    })
})
