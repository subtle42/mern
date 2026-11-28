import {test, expect} from '@playwright/test'
import { buildMainPo } from 'e2e/po/main.po'
import { createBook, generateRandomString } from 'e2e/po/utils'


test.describe('Creating book', () => {
    let mainPage: ReturnType<typeof buildMainPo>

    test.beforeEach(async({page}) => {
        mainPage = buildMainPo(page)
        await page.goto('http://localhost:3333')
        await mainPage.nav.getMain().click()
    })

    test('clicking dropdown should show the add button', async({page}) => {
        await mainPage.book.dropdown.getOpenBtn().click()
        expect(page.getByText('Add Book')).toBeTruthy()
    })

    test('clicking add button should open a modal', async({page}) => {
        await mainPage.book.dropdown.getOpenBtn().click()
        await mainPage.book.dropdown.getAddBtn().click()
        expect(page.getByText('Create Book')).toBeTruthy()
    })

    test.describe('modal', () => {
        test.beforeEach(async() => {
            await mainPage.book.dropdown.getOpenBtn().click()
            await mainPage.book.dropdown.getAddBtn().click()
        })

        test('create button should be disable if input is invalid', async() => {
            await mainPage.book.addModal.getNameInput().fill('a')
            const btnStatus = await mainPage.book.addModal.getCreateBtn()
            await expect(btnStatus).toBeDisabled()
        })

        test('should create new book and select if successful', async({page}) => {
            await mainPage.book.addModal.getNameInput().fill('e2e book')
            await mainPage.book.addModal.getCreateBtn().click()
            expect(await page.getByText('e2e book').count()).toBeGreaterThan(0)
        })

        test('clicking cancel should close the modal', async({page}) => {
            await mainPage.book.addModal.getCancelBtn().click()
            await expect(page.locator('.modal-content')).toHaveCount(0)
        })
    })

    test.describe.skip('after save', () => {
        test('should show up in nav', () => {})
        test('should show up in edit dialog', () => {})
    })
})

test.describe('Updating book', () => {
    let mainPage: ReturnType<typeof buildMainPo>

    test.beforeEach(async({page}) => {
        mainPage = buildMainPo(page)
        await page.goto('http://localhost:3333')
        await mainPage.nav.getMain().click()
    })

    test('clicking the button should open the dialog', async({page}) => {
        await mainPage.book.editModal.getOpenBtn().click()
        await expect(page.locator('.modal-content')).toHaveCount(1)
    })

    test.describe('modal', () => {
        test.beforeEach(async({page}) => {
            await mainPage.book.editModal.getOpenBtn().click()
        })

        test('should list books', async({page}) => {
            const count = await page.locator('.list-group-item').count()
            expect(count).toBeGreaterThan(0)
        })

        test('clicking done button should close the dialog', async({page}) => {
            await mainPage.book.editModal.getDoneBtn().click()
            await expect(page.locator('.modal-content')).toHaveCount(0)
        })

        test('clicking edit button should open second edit screen', async({page}) => {
            await mainPage.book.editModal.getEditBtn('testbook').click()
            await expect(mainPage.book.editModal.getNameInput()).toHaveValue('testbook')
        })

        test.describe('edit form', () => {
            const newName = 'editbookname'

            test.beforeEach(async() => {
                await mainPage.book.editModal.getEditBtn('testbook').click()
            })

            test('it should not save change if canceled', async() => {
                await mainPage.book.editModal.getNameInput().fill(newName)
                await mainPage.book.editModal.getCancelBtn().click()
                await expect(mainPage.book.editModal.getEditBtn('testbook')).toHaveCount(1)
            })

            test('should save if form is valid', async({page}) => {
                await mainPage.book.editModal.getNameInput().fill(newName)
                await mainPage.book.editModal.getSaveBtn().click()
                expect(await page.getByText(newName).count()).toBeGreaterThan(0)
            })
        })
    })
})

test.describe('Deleting book', () => {
    let mainPage: ReturnType<typeof buildMainPo>
    const testBook = `deleteTest_${generateRandomString()}`

    test.beforeAll(async() => {
        await createBook(testBook)
    })

    test.beforeEach(async({page}) => {
        mainPage = buildMainPo(page)
        await page.goto('http://localhost:3333')
        await mainPage.nav.getMain().click()
    })

    test('delete button should be enabled', async() => {
        await mainPage.book.editModal.getOpenBtn().click()
        await expect(mainPage.book.editModal.getDeleteBtn(testBook)).toBeEnabled()
    })


    test.describe('confirm delete', () => {
        test.beforeEach(async() => {
            await mainPage.book.editModal.getOpenBtn().click()
            await mainPage.book.editModal.getDeleteBtn(testBook).click()
        })

        test('should exist', async({page}) => {
            await expect(page.getByText('Delete Book')).toHaveCount(1)
        })
        
        test('should do nothing if canceled', async({page}) => {
            await mainPage.confirmModal.getCancelBtn().click()
            await expect(page.locator('.modal-body').getByText(testBook)).toHaveCount(1)
        })

        test('should delete the book if confirmed', async({page}) => {
            await mainPage.confirmModal.getConfirmBtn().click()
            await expect(page.getByText(testBook)).toHaveCount(0)
        })
    })

    test.skip('delete button is disabled if own only 1 book', () => {})
})