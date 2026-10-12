import { render, screen, cleanup, RenderResult } from '@testing-library/react';

// import { addBookToStore, setUser } from '../../../../testUtils'
import { Dantest } from './dantest';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';

describe('Edit book list component', () => {
    beforeEach(() => {

        // addBookToStore({
        //     _id: 1,
        //     owner: 'a',
        //     editors: ['c', 'd']
        // })
        // addBookToStore({
        //     _id: 2,
        //     owner: 'b',
        //     editors: ['e']
        // })
        // setUser({
        //     _id: 'asdf'
        // })

        render(<Dantest />)
    })

    afterEach(() => {
        cleanup()
    })

    describe('list', () => {
        it('should show a list of books', async(t) => {
            const count = (await screen.findAllByRole("bookItem")).length
            expect(count).toEqual(2)
        })
    })
})
