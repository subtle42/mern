import {test, expect} from '@playwright/test'
import { buildLoginPo } from '../po/login.po'
import { buildMainPo } from 'e2e/po/main.po'

test.describe('Creating a book', () => {
    let loginPage: ReturnType<typeof buildLoginPo>
    let mainPage: ReturnType<typeof buildMainPo>

    test.beforeEach(async({page}) => {
        loginPage = buildLoginPo(page)
        mainPage = buildMainPo(page)
        await page.goto('http://localhost:3333')
        await loginPage.fullLogin()
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
            await expect(page.getByText('e2e book')).toHaveCount(2)
        })

        test('clicking cancel should close the modal', async({page}) => {
            await mainPage.book.addModal.getCancelBtn().click()
            await expect(page.locator('.modal-content')).toHaveCount(0)
        })
    })
})

test.describe('Updating book', () => {
    let loginPage: ReturnType<typeof buildLoginPo>
    let mainPage: ReturnType<typeof buildMainPo>

    test.beforeEach(async({page}) => {
        loginPage = buildLoginPo(page)
        mainPage = buildMainPo(page)
        await page.goto('http://localhost:3333')
        await loginPage.fullLogin()
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

        test('it should list books', async({page}) => {
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
            test.beforeEach(async() => {
                await mainPage.book.editModal.getEditBtn('testbook').click()
            })

            test('it should not save change if canceled', async() => {
                await mainPage.book.editModal.getNameInput().fill('awlekfjawlkjeflkjaerf')
                await mainPage.book.editModal.getCancelBtn().click()
                await expect(mainPage.book.editModal.getEditBtn('testbook')).toHaveCount(1)
            })
        })
    })
})