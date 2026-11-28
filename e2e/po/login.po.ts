import { Page } from "playwright/test"



export const buildLoginPo = (page: Page) => {
    const res = {
        goto: () => page.getByText('Login').click(),
        getEmail: () => page.getByPlaceholder('Email'),
        getPassword: () => page.getByPlaceholder('Password'),
        getSignInBtn: () => page.getByText('Sign In'),
        fullLogin: async() => {
            await res.goto()
            await res.getEmail().fill('test@test.com')
            await res.getPassword().fill('test')
            await res.getSignInBtn().click()
            await page.waitForSelector('.dropdown')
        }
    }

    return res
}