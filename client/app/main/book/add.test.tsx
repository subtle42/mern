import { CreateBookButton } from './add'
import { afterEach, beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { SetupServer, setupServer } from 'msw/node'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

describe('Book Add component', () => {
    let mockServer:SetupServer

    beforeAll(() => {
        mockServer  = setupServer(http.get('*', () => {
            console.log('hello')
        }))
        mockServer.listen({onUnhandledFrame: 'error'})
    })

    beforeEach(() => {
        render(<CreateBookButton />)
    })

    afterEach(() => {
        mockServer.resetHandlers()
        cleanup()
    })

    it('should open a modal if the item is clicked', async() => {
        const btn = await screen.findByRole('menuitem')
        act(() => fireEvent.click(btn))
        const modal = await screen.findByRole('addBookBtn')
        expect(modal).not.toBeFalsy()
    })

    describe.skip('on save', () => {
        const myName = 'testing'
        let requestSpy: Mock

        beforeEach(async() => {
            const btn = await screen.findByRole('menuitem')
            await act(() => fireEvent.click(btn))
            const input = await screen.findByPlaceholderText<HTMLInputElement>('Enter Name')
            await act(() => fireEvent.change(input, {target: { value: myName}}))

            requestSpy = vi.fn()
            mockServer.use(
                http.post(`/api/books`, async({request}) => {
                    console.log('in intercpt')
                    const data = await request.json()
                    requestSpy(JSON.parse(data?.toString() || '{}'))
                    return HttpResponse.json({body: {...data as any, _id: 'alkwelkjaweflkj'}})
                })
            )
        })

        it('should make a rest call', async() => {
            const createBtn = await screen.findByText('Create')
            await act(() => fireEvent.click(createBtn))
            await vi.waitFor(() => expect(requestSpy).toHaveBeenCalled())
            expect(requestSpy).toHaveBeenCalledWith({name: myName})
        })

    //     it('should close the modal after REST call is finished', () => {
    //         const myId = 'welvovweviherpovj'
    //         sandbox.stub(BookActions, 'select').returns(Promise.resolve())
    //         utils.addBookToStore({
    //             _id: myId
    //         })
    //         // expect(wrapper.find('Modal').prop('isOpen')).to.equal(true)
    //         wrapper.find('Button')
    //             .filterWhere(btn => btn.props().children === 'Create')
    //             .simulate('click')

    //         return utils.waitATick()
    //         .then(() => reqs[0].respond(200, {}, myId))
    //         .then(() => utils.waitATick())
    //         .then(() => expect(wrapper.find('Modal').prop('isOpen')).to.equal(false))
    //     })
    })

    // describe('input validation', () => {
    //     beforeEach(() => {
    //         wrapper.find('DropdownItem').simulate('click')
    //     })

    //     it('should set Create button to disabled if input is less than 3 characters', () => {
    //         expect(reqs.length).to.equal(0)
    //         wrapper.find('Input')
    //         .simulate('change', {
    //             target: {
    //                 value: 'aa',
    //                 name: 'title'
    //             }
    //         })
    //         wrapper.update()
    //         const createBtn = wrapper.find('Button')
    //         .filterWhere(btn => btn.props().children === 'Create')

    //         expect(createBtn.prop('disabled')).to.equal(true)
    //     })
    // })

    // describe('on cancel', () => {
    //     let cancelBtn
    //     beforeEach(() => {
    //         cancelBtn = wrapper.find('Button')
    //         .filterWhere(btn => btn.props().children === 'Cancel')
    //     })

    //     it('should close the modal', () => {
    //         wrapper.find('DropdownItem').simulate('click')
    //         wrapper.find('Button')
    //             .filterWhere(btn => btn.props().children === 'Cancel')
    //             .simulate('click')
    //         expect(wrapper.find('Modal').prop('isOpen')).to.equal(false)
    //     })

    //     it('should make NO REST calls', () => {
    //         expect(reqs.length).to.equal(0)
    //         cancelBtn.simulate('click')
    //         return utils.waitATick()
    //         .then(() => expect(reqs.length).to.equal(0))
    //     })
    // })
})
