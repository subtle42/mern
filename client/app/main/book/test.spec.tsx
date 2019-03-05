import 'jsdom-global/register'
import { expect } from 'chai'
import { shallow, ShallowWrapper, configure } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'

import { createSandbox, SinonSandbox, SinonFakeXMLHttpRequest } from 'sinon'
import { CreateBookButton } from './add'
import * as utils from '../../../testUtils'
import BookActions from 'data/books/actions'

describe('Book Add component', () => {
    configure({
        adapter: new Adapter()
    })
    let wrapper: ShallowWrapper<any, any>
    const sandbox: SinonSandbox = createSandbox({})
    let xhr: SinonFakeXMLHttpRequest
    let reqs: SinonFakeXMLHttpRequest[]

    beforeEach(() => {
        reqs = []
        xhr = sandbox.useFakeXMLHttpRequest()
        xhr.onCreate = (fakeReq) => {
            reqs.push(fakeReq)
        }
        wrapper = shallow(<CreateBookButton />)
    })

    afterEach(() => {
        xhr.restore()
        sandbox.restore()
    })

    xit('should open a modal if the item is clicked', () => {
        expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
        console.log(wrapper.find('DropdownItem').props())
        wrapper.find('DropdownItem').simulate('click')
        return utils.waitATick(10)
        .then(() => console.log(wrapper.find('Modal').props()))
        .then(() => expect(wrapper.find('Modal').prop('isOpen')).to.equal(true))
    })

    describe('on save', () => {
        const myName = 'testing'
        beforeEach(() => {
            // Opens the modal
            wrapper.find('DropdownItem').simulate('click')
            // Sets the input
            wrapper.find('Input')
            .simulate('change', {
                target: {
                    value: myName,
                    name: 'title'
                }
            })
        })

        it('should make a rest call', () => {
            wrapper.find('Button')
                .filterWhere(btn => btn.props().children === 'Create')
                .simulate('click')

            return utils.waitATick()
            .then(() => {
                expect(reqs.length).to.equal(1)
                expect(reqs[0].method).to.equal('POST')
                expect(reqs[0].url).to.equal('/api/books')
                expect(reqs[0].requestBody).to.equal(JSON.stringify({
                    name: myName
                }))
            })
        })

        xit('should close the modal after REST call is finished', () => {
            const myId = 'welvovweviherpovj'
            sandbox.stub(BookActions, 'select').returns(Promise.resolve())
            utils.addBookToStore({
                _id: myId
            })
            expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
            wrapper.find('Button')
                .filterWhere(btn => btn.props().children === 'Create')
                .simulate('click')

            return utils.waitATick()
            .then(() => reqs[0].respond(200, {}, myId))
            .then(() => utils.waitATick())
            .then(() => expect(wrapper.find('Modal').prop('isOpen')).to.equal(false))
        })
    })

    describe('input validation', () => {
        beforeEach(() => {
            wrapper.find('DropdownItem').simulate('click')
        })

        it('should set Create button to disabled if input is less than 3 characters', () => {
            expect(reqs.length).to.equal(0)
            wrapper.find('Input')
            .simulate('change', {
                target: {
                    value: 'aa',
                    name: 'title'
                }
            })
            wrapper.update()
            const createBtn = wrapper.find('Button')
            .filterWhere(btn => btn.props().children === 'Create')

            expect(createBtn.prop('disabled')).to.equal(true)
        })
    })

    describe('on cancel', () => {
        let cancelBtn
        beforeEach(() => {
            cancelBtn = wrapper.find('Button')
            .filterWhere(btn => btn.props().children === 'Cancel')
        })

        it('should close the modal', () => {
            wrapper.find('DropdownItem').simulate('click')
            cancelBtn.simulate('click')
            expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
        })

        it('should make NO REST calls', () => {
            expect(reqs.length).to.equal(0)
            cancelBtn.simulate('click')
            return utils.waitATick()
            .then(() => expect(reqs.length).to.equal(0))
        })
    })
})
