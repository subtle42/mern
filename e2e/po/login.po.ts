import { Page } from "playwright/test"



export const buildLoginPo = (page: Page) => {
    return {
        goto: () => page.getByText('Login').click(),
        getEmail: () => page.getByPlaceholder('Email'),
        getPassword: () => page.getByPlaceholder('Password'),
        getSignInBtn: () => page.getByText('Sign In')
    }
}