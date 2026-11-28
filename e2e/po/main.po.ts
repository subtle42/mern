import { Page } from "playwright/test";


export const buildMainPo = (page: Page) => {

    return {
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
                getNameInput: () => page.getByPlaceholder('Book Name'),
                getDoneBtn: () => page.getByRole('button', { name: 'Done' }),
                getCancelBtn: () => page.getByRole('button', { name: 'Cancel' })
            }
        },
        page: {

        },
        goto: () => {},
    }
}