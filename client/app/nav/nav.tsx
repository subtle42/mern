import * as React from 'react'
import authActions from 'data/auth/actions'
import bookActions from 'data/books/actions'
import { connect, Dispatch } from 'react-redux'
import { IUser, IBook } from 'common/models'
import store from 'data/store'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import AddBookButton from '../main/book/add'

import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem } from 'reactstrap'

interface NavProps {
    user: IUser,
    books: IBook[],
    selectedBook?: IBook
}
interface NavState {
    isOpen?: boolean,
}

const myComponent: React.StatelessComponent<NavProps> = (props: NavProps) => {
    const getBookDropDown = (): JSX.Element => {
        return (
            <Nav>
                <UncontrolledDropdown nav inNavbar>
                 <DropdownToggle nav caret>{props.selectedBook.name || 'No Book Selected'}</DropdownToggle>
                 <DropdownMenu right>
                     {props.books.map((book, index) => {
                         return <DropdownItem
                            key={index}
                            onClick={() => bookActions.select(book)}>
                            {book.name}
                        </DropdownItem>
                     })}
                     <DropdownItem divider />
                     <AddBookButton />
                 </DropdownMenu>

             </UncontrolledDropdown>
            </Nav>
        )
    }

    return (
        <Navbar color='light' light expand='md'>
            <NavbarBrand> WhIM </NavbarBrand>
            <Collapse navbar style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {getBookDropDown()}
            <Nav >
                <NavItem key={1}>
                    <NavLink>
                        <Link to='/home'>Home</Link>
                    </NavLink>
                </NavItem>
                    { !props.user
                        ? <NavItem key={2}><NavLink><Link to='/register'>Register</Link></NavLink></NavItem>
                        : undefined
                    }
                <NavItem key={3}>
                    <NavLink>
                    { props.user
                        ? <Link onClick={() => authActions.logout()} to='/home'>Logout</Link>
                        : <Link to='/login'>Login</Link>
                    }
                    </NavLink>
                </NavItem>
            </Nav>
            </Collapse>
        </Navbar>
    )
}

export default connect((store: any) => {
    return {
        user: store.auth.me,
        books: store.books.list,
        selectedBook: store.books.selected || {}
    }
})(myComponent)
