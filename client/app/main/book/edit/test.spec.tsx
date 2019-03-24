import 'jsdom-global/register'
import { expect } from 'chai'
import { shallow, ShallowWrapper, configure, mount, ReactWrapper } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import { createSandbox, SinonSandbox, SinonFakeXMLHttpRequest, SinonSpy, SinonFakeXMLHttpRequestStatic } from 'sinon'

import { BookList } from './list'
import { addBookToStore, setUser } from '../../../../testUtils'
import { store } from 'data/store';

describe('Edit book list component', () => {
    configure({
        adapter: new Adapter()
    })
    let wrapper: ReactWrapper
    const sandbox: SinonSandbox = createSandbox({})
    let xhr: SinonFakeXMLHttpRequestStatic
    let reqs: SinonFakeXMLHttpRequest[]
    let onDone: SinonSpy
    let onEdit: SinonSpy

    beforeEach(() => {
        reqs = []
        xhr = sandbox.useFakeXMLHttpRequest()
        xhr.onCreate = (fakeReq) => {
            reqs.push(fakeReq)
        }
        onDone = sandbox.spy()
        onEdit = sandbox.spy()

        addBookToStore({
            _id: 1,
            owner: 'a',
            editors: []
        })
        addBookToStore({
            _id: 2,
            owner: 'b',
            editors: []
        })
        setUser({
            _id: 'asdf'
        })

        wrapper = mount(<BookList
            onDone={onDone}
            onEdit={onEdit}
        />)
    })

    afterEach(() => {
        xhr.restore()
        sandbox.restore()
        store.dispatch({
            type: 'RESET'
        })
    })

    describe('list', () => {
        it('should show a list of books', () => {
            const count = wrapper.find('ListGroupItem').length
            expect(count).to.equal(2)
        })

        it('should show edit button if user has edit rights')

        it('should show delete button if user has owner rights')
    })

    describe('delete', () => {
        it('should show a confirmation dialog')

        it('should make a REST call on confirm')
    })
})
