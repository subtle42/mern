import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

import { addBookToStore, setUser } from '../../../../testUtils'
import { afterEach, beforeEach, describe, it, expect, vi, Mock, afterAll, beforeAll } from 'vitest';
import { BookEditForm } from './form'

describe('Book Form Component', () => {
    let onDoneMock: Mock
    const mockServer = setupServer()

    beforeAll(() => {
        mockServer.listen({onUnhandledFrame: 'error'})
    })

    beforeEach(() => {
        addBookToStore({
            _id: '1',
            isPublic: false,
            name: 'test1',
            pages: [],
            viewers: [],
            owner: 'asdf',
            editors: ['c', 'd']
        })
        addBookToStore({
            _id: '2',
            isPublic: false,
            name: 'awefwaef',
            pages: [],
            viewers: [],
            owner: 'b',
            editors: ['e']
        })
        setUser({
            _id: 'asdf'
        })
        onDoneMock = vi.fn()

        render(<BookEditForm _id='1' onDone={onDoneMock}/>)
    })

    afterEach(() => {
        mockServer.resetHandlers()
        cleanup()
    })

    afterAll(() => {
        mockServer.close()
    })

    describe('list', () => {
        it('should show work', async() => {
            const tmp = (await screen.findByDisplayValue('test1')).nodeValue
            expect(tmp).not.equal(null)
            // const count = (await screen.findAllByRole("bookItem")).length
            // expect(count).toEqual(2)
        })
    })
})
