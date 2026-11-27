import { CreatePageButton } from './create'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { setSelectedBook } from '../../../testUtils'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event';


const createBtnId = 'addPageBtn'
const modalId = 'addPageModal'

describe('Page Add component', () => {
    const mockServer = setupServer()
    const user = userEvent.setup();
        
    beforeAll(() => mockServer.listen({onUnhandledFrame: 'error'}))

    beforeEach(() => {
        render(<CreatePageButton />)
    })

    afterEach(() => {
        mockServer.resetHandlers()
    })

    it('should have the modal hidden', async() => {
        const modal = await screen.queryByTestId(modalId)
        expect(modal).not.toBeTruthy()
    })

    it('should open the modal on click', async() => {
        const btn = await screen.findByTestId(createBtnId)
        fireEvent.click(btn)
        const modal = await screen.queryByTestId(modalId)
        expect(modal).toBeTruthy()
    })

    describe('modal actions', () => {
        beforeEach(async() => {
            const btn = await screen.findByTestId(createBtnId)
            fireEvent.click(btn)
        })

        it('should close the modal when user clicks the cancel button', async() => {
            const cancelBtn = await screen.findByText('Cancel')
            fireEvent.click(cancelBtn)
            await waitFor(async() => {
                const tmp = await screen.queryByTestId(modalId)
                return expect(tmp).not.toBeTruthy()
            })
            const modal = await screen.queryByTestId(modalId)
            expect(modal).not.toBeTruthy()
        })

        it('should have the create button disabled by default', async() => {
            const createBtn = await screen.findByText<HTMLButtonElement>('Create')
            expect(createBtn.disabled).to.equal(true)
        })

        it('should keep the create button disabled if input NOT valid', async() => {
            const input = await screen.findByPlaceholderText('Enter Name')
            fireEvent.change(input, {target: {value: 'aa'}})
            const createBtn = await screen.findByText<HTMLButtonElement>('Create')
            expect(createBtn.disabled).to.equal(true)
        })

        it('should enable the create button if input is valid', async() => {
            const input = await screen.findByPlaceholderText('Enter Name')
            fireEvent.change(input, {target: {value: 'aaaaaaa'}})
            const createBtn = await screen.findByText<HTMLButtonElement>('Create')
            expect(createBtn.disabled).to.equal(false)
        })

        describe('on success', () => {
            const pageName = 'aoiwevalwe'
            const bookId = 'iubnjl'

            beforeEach(async() => {
                act(() => setSelectedBook(bookId))
            })
            
            it('should send a REST call', async() => {
                const input = await screen.findByPlaceholderText<HTMLInputElement>('Enter Name')
                // await waitFor(async() => {
                    //     const btn = await screen.findByText<HTMLInputElement>('Create')
                    //     return expect(btn.disabled).toBe(false)
                    // })
                const mySpy = vi.fn()
                mockServer.use(http.post('/api/pages', async({request}) => {
                    const data = await request.json()
                    mySpy(data)
                    return new HttpResponse(JSON.stringify(data))
                }))
                await user.type(input, pageName)
                await waitFor(() => expect(input.value).not.equal(""))
                console.log('value', input.value)
                const createBtn = await screen.findByText<HTMLButtonElement>('Create')
                console.log('value', input.value)
                fireEvent.click(createBtn)
                console.log('value', input.value)
                await waitFor(() => expect(mySpy).toHaveBeenCalled())
                expect(mySpy).toHaveBeenCalledWith({})
            })

            // xit('should close the modal on success', () => {
            //     sandbox.stub(PageActions, 'select').returns(Promise.resolve())

            //     expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
            //     const newPageId = 'woeiveojbpt'

            //     return utils.waitATick()
            //     .then(() => requests[0].respond(200, {}, newPageId))
            //     .then(() => utils.waitATick(10))
            //     .then(() => expect(wrapper.find('Modal').prop('isOpen')).to.equal(false))
            // })
        })
    })
})

// describe('Page Delete component', () => {
//     const testName = 'wroivwenvawev'
//     const testId = '893huw9b34n'
//     const sandbox: SinonSandbox = createSandbox({})
//     let wrapper: ReactWrapper<any, any>
//     let xhr: SinonFakeXMLHttpRequestStatic
//     let requests: SinonFakeXMLHttpRequest[]

//     beforeEach(() => {
//         requests = []
//         wrapper = mount(<DeletePageButton _id={testId} pageName={testName}/>)
//         xhr = sandbox.useFakeXMLHttpRequest()
//         xhr.onCreate = (req) => requests.push(req)
//     })

//     afterEach(() => {
//         xhr.restore()
//         sandbox.restore()
//         wrapper.unmount()
//     })

//     it('should prompt a confirm dialog on click', () => {
//         expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
//         wrapper.find('FontAwesome').simulate('click')
//         return utils.waitATick()
//         .then(() => expect(wrapper.find('Modal').prop('isOpen')).to.equal(true))
//     })

//     describe('confirm dialog', () => {
//         beforeEach(() => wrapper.find('FontAwesome').simulate('click'))

//         it('should show page name', () => {
//             expect(wrapper.find('ModalBody').text().indexOf(testName)).to.not.equal(-1)
//         })

//         describe('on cancel', () => {
//             beforeEach(() => {
//                 wrapper.find('Button')
//                 .filterWhere(btn => btn.props().children === 'Cancel')
//                 .simulate('click')
//             })

//             it('should NOT set send a REST', () => {
//                 expect(requests.length).to.equal(0)
//                 return utils.waitATick()
//                 .then(() => expect(requests.length).to.equal(0))
//             })

//             it('should close the dialog', () => {
//                 expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
//             })
//         })

//         describe('on confirm', () => {
//             beforeEach(() => {
//                 wrapper.find('Button')
//                 .filterWhere(btn => btn.props().children === 'Confirm')
//                 .simulate('click')
//             })

//             it('should set send a REST call', () => {
//                 expect(requests.length).to.equal(0)
//                 return utils.waitATick()
//                 .then(() => {
//                     expect(requests.length).to.equal(1)
//                     expect(requests[0].method).to.equal('DELETE')
//                     expect(requests[0].url).to.equal(`/api/pages/${testId}`)
//                 })
//             })

//             it('should close the dialog', () => {
//                 expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
//             })

//             it('should notify success on a 200', () => {
//                 const myStub = sandbox.stub(NotifActions, 'success')
//                 return utils.waitATick()
//                 .then(() => requests[0].respond(200, {}, ''))
//                 .then(() => utils.waitATick())
//                 .then(() => expect(myStub.called).to.equal(true))
//             })

//             it('should notify error if NOT a 200', () => {
//                 const myStub = sandbox.stub(NotifActions, 'error')
//                 return utils.waitATick()
//                 .then(() => requests[0].respond(500, {}, ''))
//                 .then(() => utils.waitATick())
//                 .then(() => expect(myStub.called).to.equal(true))
//             })
//         })
//     })
// })

// describe('Page Conifg component', () => {
//     const testId = '2o38f923h'
//     const sandbox: SinonSandbox = createSandbox({})
//     let wrapper: ReactWrapper<any, any>
//     let xhr: SinonFakeXMLHttpRequestStatic
//     let requests: SinonFakeXMLHttpRequest[]

//     beforeEach(() => {
//         requests = []
//         wrapper = mount(<PageConfigButton _id={testId}/>)
//         xhr = sandbox.useFakeXMLHttpRequest()
//         xhr.onCreate = (req) => requests.push(req)
//     })

//     afterEach(() => {
//         xhr.restore()
//         sandbox.restore()
//         utils.resetStore()
//         wrapper.unmount()
//     })

//     describe('on open', () => {
//         const testPage: IPage = {
//             _id: testId,
//             name: 'aweoanev',
//             bookId: 'bookId',
//             isDraggable: false,
//             isResizable: true,
//             preventCollision: true,
//             margin: [0, 1],
//             containerPadding: [2, 3],
//             cols: 10,
//             layout: []
//         }

//         beforeEach(() => {
//             utils.pages.upsert(testPage)
//         })

//         it('should show the modal', () => {
//             expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
//             wrapper.find('FontAwesome').simulate('click')
//             expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
//         })

//         describe('populating fields', () => {
//             beforeEach(() => wrapper.find('FontAwesome').simulate('click'))

//             it('should populate name', () => {
//                 expect(wrapper.find('Input')
//                     .filterWhere(x => x.prop('name') === 'name')
//                     .prop('value')
//                 )
//                 .to.equal(testPage.name)
//             })

//             it('should populate columns', () => {
//                 expect(wrapper.find('Input')
//                     .filterWhere(x => x.prop('name') === 'cols')
//                     .prop('value')
//                 )
//                 .to.equal(testPage.cols)
//             })

//             it('should populate padding width', () => {
//                 expect(wrapper.find('Input')
//                     .filterWhere(x => x.prop('name') === 'containerPadding[0]')
//                     .prop('value')
//                 )
//                 .to.equal(testPage.containerPadding[0])
//             })

//             it('should populate padding height', () => {
//                 expect(wrapper.find('Input')
//                     .filterWhere(x => x.prop('name') === 'containerPadding[1]')
//                     .prop('value')
//                 )
//                 .to.equal(testPage.containerPadding[1])
//             })

//             it('should populate margins width', () => {
//                 expect(wrapper.find('Input')
//                     .filterWhere(x => x.prop('name') === 'margin[0]')
//                     .prop('value')
//                 )
//                 .to.equal(testPage.margin[0])
//             })

//             it('should populate margins height', () => {
//                 expect(wrapper.find('Input')
//                     .filterWhere(x => x.prop('name') === 'margin[1]')
//                     .prop('value')
//                 )
//                 .to.equal(testPage.margin[1])
//             })

//             it('should populate isDraggable', () => {
//                 expect(wrapper.find('CustomInput')
//                     .filterWhere(x => x.prop('name') === 'isDraggable')
//                     .prop('checked')
//                 )
//                 .to.equal(testPage.isDraggable)
//             })

//             it('should populate isResizable', () => {
//                 expect(wrapper.find('CustomInput')
//                     .filterWhere(x => x.prop('name') === 'isResizable')
//                     .prop('checked')
//                 )
//                 .to.equal(testPage.isResizable)
//             })

//             it('should populate preventCollision', () => {
//                 expect(wrapper.find('CustomInput')
//                     .filterWhere(x => x.prop('name') === 'preventCollision')
//                     .prop('checked')
//                 )
//                 .to.equal(testPage.preventCollision)
//             })
//         })

//         describe('on cancel', () => {
//             let cancelBtn: ReactWrapper
//             beforeEach(() => {
//                 wrapper.find('FontAwesome').simulate('click')
//                 cancelBtn = wrapper.find('Button')
//                 .filterWhere(x => x.props().children === 'Cancel')
//             })

//             it('should close then modal', () => {
//                 expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
//                 cancelBtn.simulate('click')
//                 expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
//             })

//             it('should NOT send a REST call', () => {
//                 cancelBtn.simulate('click')
//                 return utils.waitATick()
//                 .then(() => expect(requests.length).to.equal(0))
//             })
//         })

//         describe('validation', () => {
//             beforeEach(() => wrapper.find('FontAwesome').simulate('click'))

//             describe('save button', () => {
//                 it('should be disabled if any part of form is invalid')
//                 it('should be enabled if entire form is valid', () => {
//                     expect(wrapper.find('Button')
//                     .filterWhere(x => x.props().children === 'Save')
//                     .prop('disabled'))
//                     .to.equal(false)
//                 })
//             })

//             describe('name field', () => {
//                 it('should be invalid if input is less than 3', () => {
//                     const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'name')
//                     expect(input.prop('invalid')).to.equal(false)
//                     input.simulate('change', {
//                         target: {
//                             name: 'name',
//                             value: 'a'
//                         }
//                     })
//                     expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'name')
//                         .prop('invalid'))
//                     .to.equal(true)
//                 })

//                 it('should be invalid if input is greater than 20', () => {
//                     const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'name')
//                     expect(input.prop('invalid')).to.equal(false)
//                     input.simulate('change', {
//                         target: {
//                             name: 'name',
//                             value: 'aweljvalwejvlakwjelkvajevlkajweivawronbaworeihaoehbaoiwrhbarb'
//                         }
//                     })
//                     expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'name')
//                         .prop('invalid'))
//                     .to.equal(true)
//                 })
//             })

//             describe('column field', () => {
//                 it('should be invalid if input is less than 1', () => {
//                     const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'cols')
//                     expect(input.prop('invalid')).to.equal(false)
//                     input.simulate('change', {
//                         target:  {
//                             name: 'cols',
//                             value: 0
//                         }
//                     })
//                     expect(wrapper.find('Input')
//                     .filterWhere(x => x.prop('name') === 'cols')
//                     .prop('invalid'))
//                     .to.equal(true)
//                 })

//                 it('should be invalid if input is greater than 30', () => {
//                     const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'cols')
//                     expect(input.prop('invalid')).to.equal(false)
//                     input.simulate('change', {
//                         target:  {
//                             name: 'cols',
//                             value: 100
//                         }
//                     })
//                     expect(wrapper.find('Input')
//                     .filterWhere(x => x.prop('name') === 'cols')
//                     .prop('invalid'))
//                     .to.equal(true)
//                 })
//             })

//             describe('padding', () => {
//                 describe('sides field', () => {
//                     it('should be invalid if input is less than 0', () => {
//                         const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'containerPadding[0]')
//                         expect(input.prop('invalid')).to.equal(false)
//                         input.simulate('change', {
//                             target:  {
//                                 name: 'containerPadding[0]',
//                                 value: -1
//                             }
//                         })
//                         expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'containerPadding[0]')
//                         .prop('invalid'))
//                         .to.equal(true)
//                     })

//                     it('should be invalid if input is greater than 100', () => {
//                         const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'containerPadding[0]')
//                         expect(input.prop('invalid')).to.equal(false)
//                         input.simulate('change', {
//                             target:  {
//                                 name: 'containerPadding[0]',
//                                 value: 101
//                             }
//                         })
//                         expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'containerPadding[0]')
//                         .prop('invalid'))
//                         .to.equal(true)
//                     })
//                 })

//                 describe('vertical field', () => {
//                     it('should be invalid if input is less than 0', () => {
//                         const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'containerPadding[1]')
//                         expect(input.prop('invalid')).to.equal(false)
//                         input.simulate('change', {
//                             target:  {
//                                 name: 'containerPadding[1]',
//                                 value: -1
//                             }
//                         })
//                         expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'containerPadding[1]')
//                         .prop('invalid'))
//                         .to.equal(true)
//                     })

//                     it('should be invalid if input is greater than 100', () => {
//                         const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'containerPadding[1]')
//                         expect(input.prop('invalid')).to.equal(false)
//                         input.simulate('change', {
//                             target:  {
//                                 name: 'containerPadding[1]',
//                                 value: 101
//                             }
//                         })
//                         expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'containerPadding[1]')
//                         .prop('invalid'))
//                         .to.equal(true)
//                     })
//                 })
//             })

//             describe('margins', () => {
//                 describe('sides field', () => {
//                     it('should be invalid if input is less than 0', () => {
//                         const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'margin[0]')
//                         expect(input.prop('invalid')).to.equal(false)
//                         input.simulate('change', {
//                             target:  {
//                                 name: 'margin[0]',
//                                 value: -1
//                             }
//                         })
//                         expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'margin[0]')
//                         .prop('invalid'))
//                         .to.equal(true)
//                     })

//                     it('should be invalid if input is greater than 100', () => {
//                         const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'margin[0]')
//                         expect(input.prop('invalid')).to.equal(false)
//                         input.simulate('change', {
//                             target:  {
//                                 name: 'margin[0]',
//                                 value: 101
//                             }
//                         })
//                         expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'margin[0]')
//                         .prop('invalid'))
//                         .to.equal(true)
//                     })
//                 })

//                 describe('vertical field', () => {
//                     it('should be invalid if input is less than 0', () => {
//                         const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'margin[1]')
//                         expect(input.prop('invalid')).to.equal(false)
//                         input.simulate('change', {
//                             target:  {
//                                 name: 'margin[1]',
//                                 value: -1
//                             }
//                         })
//                         expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'margin[1]')
//                         .prop('invalid'))
//                         .to.equal(true)
//                     })

//                     it('should be invalid if input is greater than 100', () => {
//                         const input = wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'margin[1]')
//                         expect(input.prop('invalid')).to.equal(false)
//                         input.simulate('change', {
//                             target:  {
//                                 name: 'margin[1]',
//                                 value: 101
//                             }
//                         })
//                         expect(wrapper.find('Input')
//                         .filterWhere(x => x.prop('name') === 'margin[1]')
//                         .prop('invalid'))
//                         .to.equal(true)
//                     })
//                 })
//             })
//         })

//         describe('on save', () => {
//             let saveBtn: ReactWrapper
//             beforeEach(() => {
//                 wrapper.find('FontAwesome').simulate('click')
//                 saveBtn = wrapper.find('Button')
//                     .findWhere(x => x.props().children === 'Save' && x.props().tag === 'button')
//             })

//             it('should send a rest call', () => {
//                 saveBtn.simulate('click')
//                 return utils.waitATick()
//                 .then(() => {
//                     expect(requests.length).to.equal(1)
//                     expect(requests[0].method).to.equal('PUT')
//                     expect(requests[0].url).to.equal('/api/pages')
//                 })
//             })

//             it('should send new name', () => {
//                 const name = 'aweioawv'
//                 wrapper.find('Input')
//                 .filterWhere(x => x.prop('name') === 'name')
//                 .simulate('change', {
//                     target: {
//                         name: 'name',
//                         value: name
//                     }
//                 })
//                 saveBtn.simulate('click')
//                 return utils.waitATick()
//                 .then(() => JSON.parse(requests[0].requestBody) as IPage)
//                 .then(page => expect(page.name).to.equal(name))

//             })

//             it('should send new columns', () => {
//                 const cols = 11
//                 wrapper.find('Input')
//                 .filterWhere(x => x.prop('name') === 'cols')
//                 .simulate('change', {
//                     target: {
//                         name: 'cols',
//                         value: cols
//                     }
//                 })
//                 saveBtn.simulate('click')
//                 return utils.waitATick()
//                 .then(() => JSON.parse(requests[0].requestBody) as IPage)
//                 .then(page => expect(page.cols).to.equal(cols))
//             })

//             describe('padding', () => {
//                 it('should send new side padding')
//                 it('should send new vertical padding')
//             })
//             it('should send new margins')
//             it('should send new isDraggable')
//             it('should send new isResizable')
//             it('should send new isRearrangeable')

//             describe('on success', () => {
//                 it('should close the modal')
//             })

//             describe('on error', () => {
//                 it('should do nothing')
//             })
//         })
//     })
// })
