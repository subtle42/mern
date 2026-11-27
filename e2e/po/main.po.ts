import { Page } from "playwright/test";


export const buildMainPo = (page: Page) => {

    return {
        nav: {
            getMain: () => page.getByText('Main'),
            getLogout: () => page.getByText('Logout'),
        },
        book: {
            dropdown: {
                getOpenBtn: () => page.getByTestId('bookDropdown'),
                getList: () => page.getByRole('menuitem'),
                getAddBtn: () => page.getByText('Add Book')
            },
            addModal: {
                getName: () => page.getByPlaceholder('Enter Name'),
                getCreateBtn: () => page.getByText('Create'),
                getCancelBtn: () => page.getByText('Cancel')
            }
        },
        goto: () => {},
    }
}