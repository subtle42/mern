import * as React from 'react'
import authActions from 'data/auth/actions'
import bookActions from 'data/books/actions'
import { Link } from 'react-router-dom'
import { CreateBookButton } from '../main/book/add'
import {
    Collapse,
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem } from 'reactstrap'
import { useBooks, useUser, useSelected } from '../_common/hooks'

interface NavProps {}

export const MainNavBar: React.FunctionComponent<NavProps> = (props: NavProps) => {
    const books = useBooks()
    const selectedBook = useSelected('books')
    const user = useUser()

    const getBookName = (): string => {
        const myBook = books.filter(book => book._id === selectedBook)[0]
        return myBook ? myBook.name : 'No Book Selected'
    }

    const getBookDropDown = (): JSX.Element => {
        if (!user) return <div />
        return <Nav>
            <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>{getBookName()}</DropdownToggle>
                <DropdownMenu right>
                    {books.map((book, index) => {
                        return <DropdownItem
                        key={index}
                        onClick={() => bookActions.select(book._id)}>
                        {book.name}
                    </DropdownItem>
                    })}
                    <DropdownItem divider />
                    <CreateBookButton />
                </DropdownMenu>

            </UncontrolledDropdown>
        </Nav>
    }

    return <Navbar style={{ padding: '0 16' }} color='light' light expand='md'>
        <NavbarBrand> WhIM </NavbarBrand>
        <Collapse navbar style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        {getBookDropDown()}
        <ul className='nav'>
            <NavItem key={1}>
                <div className='nav-link'>
                    <Link to='/main'>Main</Link>
                </div>
            </NavItem>
                { user && <NavItem key={2}>
                    <div className='nav-link'>
                        <Link to='/register'>Register</Link>
                    </div>
                </NavItem> }
            <NavItem key={3}>
                <div className='nav-link'>
                { user
                    ? <Link onClick={() => authActions.logout()} to='/about'>Logout</Link>
                    : <Link to='/login'>Login</Link>
                }
                </div>
            </NavItem>
        </ul>
        </Collapse>
    </Navbar>
}
