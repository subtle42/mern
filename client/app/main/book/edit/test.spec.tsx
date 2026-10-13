import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

import { addBookToStore, setUser } from '../../../../testUtils'
import { afterEach, beforeEach, describe, it, expect, vi, Mock, afterAll, beforeAll } from 'vitest';
import { BookList } from './list';

describe('Edit book list component', () => {
    let onEditMock: Mock
    let onDoneMock: Mock
    const mockServer = setupServer()

    beforeAll(() => {
        mockServer.listen({onUnhandledFrame: 'error'})
    })

    beforeEach(() => {
        addBookToStore({
            _id: 1,
            owner: 'asdf',
            editors: ['c', 'd']
        })
        addBookToStore({
            _id: 2,
            owner: 'b',
            editors: ['e']
        })
        setUser({
            _id: 'asdf'
        })
        onEditMock = vi.fn()
        onDoneMock = vi.fn()

        render(<BookList onDone={onDoneMock} onEdit={onEditMock} />)
    })

    afterEach(() => {
        mockServer.resetHandlers()
        cleanup()
    })

    afterAll(() => {
        mockServer.close()
    })

    describe('list', () => {
        it('should show a list of books', async() => {
            const count = (await screen.findAllByRole("bookItem")).length
            expect(count).toEqual(2)
        })
    })

    describe('onDone function', () => {
        it('should run fn passed to it', async() => {
            const btn = await screen.findByText('Done')
            fireEvent.click(btn)
            expect(onDoneMock).toHaveBeenCalled()
        })
    })

    describe('delete button', () => {
        it('should make a rest call', async() => {
            mockServer.use(
                http.delete(`/api/books/${1}`, () => new HttpResponse(undefined))
            )
            const btn = await screen.findByRole('delete')
            fireEvent.click(btn)
            const confirmBtn = await screen.findByText('Confirm')
            fireEvent.click(confirmBtn)
        })
    })
})
