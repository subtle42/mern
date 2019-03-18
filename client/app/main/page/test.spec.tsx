import { expect } from 'chai'
import { ReactWrapper, mount } from 'enzyme'
import * as React from 'react'
import { createSandbox, SinonSandbox, SinonFakeXMLHttpRequest } from 'sinon'
import { IPage } from 'common/models'
import PageActions from 'data/pages/actions'
import NotifActions from 'data/notifications/actions'
import * as utils from '../../../testUtils'
import { CreatePageButton } from './create'
import { DeletePageButton } from './delete'
import { PageConfigButton } from './config'

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

            it('should send a REST call', () => {
                expect(requests.length).to.equal(1)
                expect(requests[0].requestBody).to.equal(JSON.stringify({
                    name: pageName,
                    bookId
                }))
            })

            xit('should close the modal on success', () => {
                sandbox.stub(PageActions, 'select').returns(Promise.resolve())

                expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
                const newPageId = 'woeiveojbpt'

                return utils.waitATick()
                .then(() => requests[0].respond(200, {}, newPageId))
                .then(() => utils.waitATick())
                .then(() => expect(wrapper.find('Modal').prop('isOpen')).to.equal(false))
            })
        })
    })
})

describe('Page Delete component', () => {
    const testName = 'wroivwenvawev'
    const testId = '893huw9b34n'
    const sandbox: SinonSandbox = createSandbox({})
    let wrapper: ReactWrapper<any, any>
    let xhr: SinonFakeXMLHttpRequest
    let requests: SinonFakeXMLHttpRequest[]

    beforeEach(() => {
        requests = []
        wrapper = mount(<DeletePageButton _id={testId} pageName={testName}/>)
        xhr = sandbox.useFakeXMLHttpRequest()
        xhr.onCreate = (req) => requests.push(req)
    })

    afterEach(() => {
        xhr.restore()
        sandbox.restore()
    })

    it('should prompt a confirm dialog on click', () => {
        expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
        wrapper.find('FontAwesome').simulate('click')
        return utils.waitATick()
        .then(() => expect(wrapper.find('Modal').prop('isOpen')).to.equal(true))
    })

    describe('confirm dialog', () => {
        beforeEach(() => wrapper.find('FontAwesome').simulate('click'))

        it('should show page name', () => {
            expect(wrapper.find('ModalBody').text().indexOf(testName)).to.not.equal(-1)
        })

        describe('on cancel', () => {
            beforeEach(() => {
                wrapper.find('Button')
                .filterWhere(btn => btn.props().children === 'Cancel')
                .simulate('click')
            })

            it('should NOT set send a REST', () => {
                expect(requests.length).to.equal(0)
                return utils.waitATick()
                .then(() => expect(requests.length).to.equal(0))
            })

            it('should close the dialog', () => {
                expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
            })
        })

        describe('on confirm', () => {
            beforeEach(() => {
                wrapper.find('Button')
                .filterWhere(btn => btn.props().children === 'Confirm')
                .simulate('click')
            })

            it('should set send a REST call', () => {
                expect(requests.length).to.equal(0)
                return utils.waitATick()
                .then(() => {
                    expect(requests.length).to.equal(1)
                    expect(requests[0].method).to.equal('DELETE')
                    expect(requests[0].url).to.equal(`/api/pages/${testId}`)
                })
            })

            it('should close the dialog', () => {
                expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
            })

            it('should notify success on a 200', () => {
                const myStub = sandbox.stub(NotifActions, 'success')
                return utils.waitATick()
                .then(() => requests[0].respond(200, {}, ''))
                .then(() => utils.waitATick())
                .then(() => expect(myStub.called).to.equal(true))
            })

            it('should notify error if NOT a 200', () => {
                const myStub = sandbox.stub(NotifActions, 'error')
                return utils.waitATick()
                .then(() => requests[0].respond(500, {}, ''))
                .then(() => utils.waitATick())
                .then(() => expect(myStub.called).to.equal(true))
            })
        })
    })
})

describe('Page Conifg component', () => {
    const testId = '2o38f923h'
    const sandbox: SinonSandbox = createSandbox({})
    let wrapper: ReactWrapper<any, any>
    let xhr: SinonFakeXMLHttpRequest
    let requests: SinonFakeXMLHttpRequest[]

    beforeEach(() => {
        requests = []
        wrapper = mount(<PageConfigButton _id={testId}/>)
        xhr = sandbox.useFakeXMLHttpRequest()
        xhr.onCreate = (req) => requests.push(req)
    })

    afterEach(() => {
        xhr.restore()
        sandbox.restore()
        utils.resetStore()
    })

    describe('on open', () => {
        const testPage: IPage = {
            _id: testId,
            name: 'aweoanev',
            bookId: 'bookId',
            isDraggable: false,
            isResizable: true,
            isRearrangeable: false,
            preventCollision: true,
            margin: [0, 1],
            containerPadding: [2, 3],
            cols: 10,
            layout: []
        }

        beforeEach(() => {
            utils.pages.upsert(testPage)
        })

        it('should show the modal', () => {
            expect(wrapper.find('Modal').length).to.equal(0)
            wrapper.find('FontAwesome').simulate('click')
            expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
        })

        describe('populating fields', () => {
            beforeEach(() => wrapper.find('FontAwesome').simulate('click'))

            it('should populate name', () => {
                expect(wrapper.find('Input')
                    .filterWhere(x => x.prop('name') === 'name')
                    .prop('value')
                )
                .to.equal(testPage.name)
            })

            it('should populate columns', () => {
                expect(wrapper.find('Input')
                    .filterWhere(x => x.prop('name') === 'cols')
                    .prop('value')
                )
                .to.equal(testPage.cols)
            })

            it('should populate padding width', () => {
                expect(wrapper.find('Input')
                    .filterWhere(x => x.prop('name') === 'containerPadding[0]')
                    .prop('value')
                )
                .to.equal(testPage.containerPadding[0])
            })

            it('should populate padding height', () => {
                expect(wrapper.find('Input')
                    .filterWhere(x => x.prop('name') === 'containerPadding[1]')
                    .prop('value')
                )
                .to.equal(testPage.containerPadding[1])
            })

            it('should populate margins width', () => {
                expect(wrapper.find('Input')
                    .filterWhere(x => x.prop('name') === 'margin[0]')
                    .prop('value')
                )
                .to.equal(testPage.margin[0])
            })

            it('should populate margins height', () => {
                expect(wrapper.find('Input')
                    .filterWhere(x => x.prop('name') === 'margin[1]')
                    .prop('value')
                )
                .to.equal(testPage.margin[1])
            })

            it('should populate isDraggable', () => {
                expect(wrapper.find('CustomInput')
                    .filterWhere(x => x.prop('name') === 'isDraggable')
                    .prop('checked')
                )
                .to.equal(testPage.isDraggable)
            })

            it('should populate isResizable', () => {
                expect(wrapper.find('CustomInput')
                    .filterWhere(x => x.prop('name') === 'isResizable')
                    .prop('checked')
                )
                .to.equal(testPage.isResizable)
            })

            it('should populate isRearrangeable', () => {
                expect(wrapper.find('CustomInput')
                    .filterWhere(x => x.prop('name') === 'isRearrangeable')
                    .prop('checked')
                )
                .to.equal(testPage.isRearrangeable)
            })
        })

        describe('on cancel', () => {
            let cancelBtn: ReactWrapper
            beforeEach(() => {
                wrapper.find('FontAwesome').simulate('click')
                cancelBtn = wrapper.find('Button')
                .filterWhere(x => x.props().children === 'Cancel')
            })

            it('should close then modal', () => {
                expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
                cancelBtn.simulate('click')
                expect(wrapper.find('Modal').length).to.equal(0)
            })

            it('should NOT send a REST call', () => {
                cancelBtn.simulate('click')
                return utils.waitATick()
                .then(() => expect(requests.length).to.equal(0))
            })
        })

        describe('validation', () => {
            beforeEach(() => wrapper.find('FontAwesome').simulate('click'))

            describe('save button', () => {
                it('should be disabled if any part of form is invalid')
                it('should be enabled if entire form is valid', () => {
                    expect(wrapper.find('Button')
                    .filterWhere(x => x.props().children === 'Save')
                    .prop('disabled'))
                    .to.equal(false)
                })
            })

            describe('name field', () => {
                it('should be invalid if input is less than 3', () => {
                    const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'name')
                    expect(input.prop('invalid')).to.equal(false)
                    input.simulate('change', {
                        target: {
                            name: 'name',
                            value: 'a'
                        }
                    })
                    expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'name')
                        .prop('invalid'))
                    .to.equal(true)
                })

                it('should be invalid if input is greater than 20', () => {
                    const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'name')
                    expect(input.prop('invalid')).to.equal(false)
                    input.simulate('change', {
                        target: {
                            name: 'name',
                            value: 'aweljvalwejvlakwjelkvajevlkajweivawronbaworeihaoehbaoiwrhbarb'
                        }
                    })
                    expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'name')
                        .prop('invalid'))
                    .to.equal(true)
                })
            })

            describe('column field', () => {
                it('should be invalid if input is less than 1', () => {
                    const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'cols')
                    expect(input.prop('invalid')).to.equal(false)
                    input.simulate('change', {
                        target:  {
                            name: 'cols',
                            value: 0
                        }
                    })
                    expect(wrapper.find('Input')
                    .filterWhere(x => x.prop('name') === 'cols')
                    .prop('invalid'))
                    .to.equal(true)
                })

                it('should be invalid if input is greater than 30', () => {
                    const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'cols')
                    expect(input.prop('invalid')).to.equal(false)
                    input.simulate('change', {
                        target:  {
                            name: 'cols',
                            value: 100
                        }
                    })
                    expect(wrapper.find('Input')
                    .filterWhere(x => x.prop('name') === 'cols')
                    .prop('invalid'))
                    .to.equal(true)
                })
            })

            describe('padding', () => {
                describe('sides field', () => {
                    it('should be invalid if input is less than 0', () => {
                        const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'containerPadding[0]')
                        expect(input.prop('invalid')).to.equal(false)
                        input.simulate('change', {
                            target:  {
                                name: 'containerPadding[0]',
                                value: -1
                            }
                        })
                        expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'containerPadding[0]')
                        .prop('invalid'))
                        .to.equal(true)
                    })

                    it('should be invalid if input is greater than 100', () => {
                        const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'containerPadding[0]')
                        expect(input.prop('invalid')).to.equal(false)
                        input.simulate('change', {
                            target:  {
                                name: 'containerPadding[0]',
                                value: 101
                            }
                        })
                        expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'containerPadding[0]')
                        .prop('invalid'))
                        .to.equal(true)
                    })
                })

                describe('vertical field', () => {
                    it('should be invalid if input is less than 0', () => {
                        const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'containerPadding[1]')
                        expect(input.prop('invalid')).to.equal(false)
                        input.simulate('change', {
                            target:  {
                                name: 'containerPadding[1]',
                                value: -1
                            }
                        })
                        expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'containerPadding[1]')
                        .prop('invalid'))
                        .to.equal(true)
                    })

                    it('should be invalid if input is greater than 100', () => {
                        const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'containerPadding[1]')
                        expect(input.prop('invalid')).to.equal(false)
                        input.simulate('change', {
                            target:  {
                                name: 'containerPadding[1]',
                                value: 101
                            }
                        })
                        expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'containerPadding[1]')
                        .prop('invalid'))
                        .to.equal(true)
                    })
                })
            })

            describe('margins', () => {
                describe('sides field', () => {
                    it('should be invalid if input is less than 0', () => {
                        const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'margin[0]')
                        expect(input.prop('invalid')).to.equal(false)
                        input.simulate('change', {
                            target:  {
                                name: 'margin[0]',
                                value: -1
                            }
                        })
                        expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'margin[0]')
                        .prop('invalid'))
                        .to.equal(true)
                    })

                    it('should be invalid if input is greater than 100', () => {
                        const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'margin[0]')
                        expect(input.prop('invalid')).to.equal(false)
                        input.simulate('change', {
                            target:  {
                                name: 'margin[0]',
                                value: 101
                            }
                        })
                        expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'margin[0]')
                        .prop('invalid'))
                        .to.equal(true)
                    })
                })

                describe('vertical field', () => {
                    it('should be invalid if input is less than 0', () => {
                        const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'margin[1]')
                        expect(input.prop('invalid')).to.equal(false)
                        input.simulate('change', {
                            target:  {
                                name: 'margin[1]',
                                value: -1
                            }
                        })
                        expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'margin[1]')
                        .prop('invalid'))
                        .to.equal(true)
                    })

                    it('should be invalid if input is greater than 100', () => {
                        const input = wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'margin[1]')
                        expect(input.prop('invalid')).to.equal(false)
                        input.simulate('change', {
                            target:  {
                                name: 'margin[1]',
                                value: 101
                            }
                        })
                        expect(wrapper.find('Input')
                        .filterWhere(x => x.prop('name') === 'margin[1]')
                        .prop('invalid'))
                        .to.equal(true)
                    })
                })
            })
        })

        describe('on save', () => {
            let saveBtn: ReactWrapper
            beforeEach(() => {
                wrapper.find('FontAwesome').simulate('click')
                saveBtn = wrapper.find('Button')
                    .findWhere(x => x.props().children === 'Save' && x.props().tag === 'button')
            })

            it('should send a rest call', () => {
                saveBtn.simulate('click')
                return utils.waitATick()
                .then(() => {
                    expect(requests.length).to.equal(1)
                    expect(requests[0].method).to.equal('PUT')
                    expect(requests[0].url).to.equal('/api/pages')
                })
            })

            it('should send new name', () => {
                const name = 'aweioawv'
                wrapper.find('Input')
                .filterWhere(x => x.prop('name') === 'name')
                .simulate('change', {
                    target: {
                        name: 'name',
                        value: name
                    }
                })
                saveBtn.simulate('click')
                return utils.waitATick()
                .then(() => JSON.parse(requests[0].requestBody) as IPage)
                .then(page => expect(page.name).to.equal(name))

            })

            it('should send new columns', () => {
                const cols = 11
                wrapper.find('Input')
                .filterWhere(x => x.prop('name') === 'cols')
                .simulate('change', {
                    target: {
                        name: 'cols',
                        value: cols
                    }
                })
                saveBtn.simulate('click')
                return utils.waitATick()
                .then(() => JSON.parse(requests[0].requestBody) as IPage)
                .then(page => expect(page.cols).to.equal(cols))
            })

            describe('padding', () => {
                it('should send new side padding')
                it('should send new vertical padding')
            })
            it('should send new margins')
            it('should send new isDraggable')
            it('should send new isResizable')
            it('should send new isRearrangeable')

            describe('on success', () => {
                it('should close the modal')
            })

            describe('on error', () => {
                it('should do nothing')
            })
        })
    })
})
