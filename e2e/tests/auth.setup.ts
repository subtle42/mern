import {test, expect} from '@playwright/test'
import { buildLoginPo } from '../po/login.po'


test.describe('login page', () => {
    let loginPage: ReturnType<typeof buildLoginPo>

    test.beforeEach(async({page}) => {
        loginPage = buildLoginPo(page)
        await page.goto('http://localhost:3333')
    })

    test('go to page', async() => {
        await loginPage.goto()
        expect(loginPage.getEmail()).toBeTruthy()
    })

    test('fail login', async({page}) => {
        await loginPage.goto()
        await loginPage.getEmail().fill('bad@bad.com')
        await loginPage.getPassword().fill('notcorrect')
        await loginPage.getSignInBtn().click()
        expect(page.url().split('/')[3]).toEqual('login')
        // TODO: add response for bad login
    })

    test('login success', async({page}) => {
        await loginPage.goto()
        await loginPage.getEmail().fill('test@test.com')
        await loginPage.getPassword().fill('test')
        await loginPage.getSignInBtn().click()
        expect(page.url().split('/')[3]).toEqual('about')
        // Saving token to use in other tests
        await page.context().storageState({ path: `./auth.json` });
    })
})


