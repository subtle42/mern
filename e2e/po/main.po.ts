import { Page } from "playwright/test";


export const buildMainPo = (page: Page) => {

    return {
        confirmModal: {
            getConfirmBtn: (name='Confirm') => page.getByRole('button', { name }),
            getCancelBtn: () => page.getByRole('button', { name: 'Cancel' }),
        },
        nav: {
            getMain: () => page.getByText('Main'),
            getLogout: () => page.getByText('Logout'),
        },
        book: {
            getSelected: () => page.locator('.dropdown-toggle.nav-link').innerText(),
            dropdown: {
                getOpenBtn: () => page.getByTestId('bookDropdown'),
                getList: () => page.getByRole('menuitem'),
                getAddBtn: () => page.getByText('Add Book')
            },
            addModal: {
                getNameInput: () => page.getByPlaceholder('Enter Name'),
                getCreateBtn: () => page.getByRole('button', { name: 'Create' }),
                getCancelBtn: () => page.getByRole('button', { name: 'Cancel' })
            },
            editModal: {
                getOpenBtn: () => page.locator('.fa-book'),
                getEditBtn: (name: string) => page.locator('.modal-body').getByText(name).locator('.fa-edit'),
                getDeleteBtn: (name: string) => page.locator('.modal-body').getByText(name).locator('.fa-trash'),
                getNameInput: () => page.getByPlaceholder('Book Name'),
                getDoneBtn: () => page.getByRole('button', { name: 'Done' }),
                getCancelBtn: () => page.getByRole('button', { name: 'Cancel' }),
                getSaveBtn: () => page.getByRole('button', { name: 'Save' })
            }
        },
        page: {

        },
        goto: () => {},
    }
}