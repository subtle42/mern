import 'jsdom-global/register'
import { expect } from 'chai'
import { shallow, ShallowWrapper, configure } from 'enzyme'
const Adapter = require('enzyme-adapter-react-16')
import * as React from 'react'
import { createSandbox, SinonSandbox } from 'sinon'

import AddBook from './add'

describe('Book Add component', () => {
    configure({
        adapter: new Adapter()
    })
    let wrapper: ShallowWrapper<any, any>
    const sandbox: SinonSandbox = createSandbox({})

    beforeEach(() => {
        wrapper = shallow(<AddBook />)
    })

    afterEach(() => {
        sandbox.restore()
    })

    it('should open a modal if the item is clicked', () => {
        expect(wrapper.find('Modal').filterWhere(item => item.prop('isOpen') === false).length).not.to.equal(0)
        wrapper.find('DropdownItem').simulate('click')
        expect(wrapper.find('Modal').filterWhere(item => item.prop('isOpen') === true).length).not.to.equal(0)
    })
})
