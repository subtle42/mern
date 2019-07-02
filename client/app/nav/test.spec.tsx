import 'jsdom-global/register'
import { expect } from 'chai'
import { configure, mount, ReactWrapper } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import { createSandbox, SinonSandbox } from 'sinon'
import { BrowserRouter as Router } from 'react-router-dom'

import * as utils from '../../testUtils'
import { MainNavBar } from './nav'

describe('Book Add component', () => {
    configure({
        adapter: new Adapter()
    })
    let wrapper: ReactWrapper<any, any>
    const sandbox: SinonSandbox = createSandbox({})

    beforeEach(() => {
        wrapper = mount(
            <Router><MainNavBar/></Router>
        )
    })

    afterEach(() => {
        sandbox.restore()
        wrapper.unmount()
    })

    it('should NOT show a dropdown if user is NOT logged in', () => {
        expect(wrapper.find('DropdownMenu')).to.have.lengthOf(0)
    })

    describe('user is logged in', () => {
        beforeEach(() => {
            utils.setUser({
                name: 'test'
            })
            wrapper.update()
        })

        it('should show a dropdown if user is logged in', () => {
            expect(wrapper.find('DropdownMenu')).to.have.lengthOf(1)
        })
    })
})
