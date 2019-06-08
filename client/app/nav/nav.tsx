import * as React from 'react'
import authActions from 'data/auth/actions'
import bookActions from 'data/books/actions'
import { connect } from 'react-redux'
import { IUser, IBook } from 'common/models'
import { Link } from 'react-router-dom'
import { CreateBookButton } from '../main/book/add'

import {
    Collapse,
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem } from 'reactstrap'
import { StoreModel } from 'data/store'

interface NavProps {
    user: IUser,
    books: IBook[],
    selectedBook: string
}

const myComponent: React.FunctionComponent<NavProps> = (props: NavProps) => {
    const getBookName = (): string => {
        const myBook: IBook = props.books.filter(book => book._id === props.selectedBook)[0]
        return myBook ? myBook.name : 'No Book Selected'
    }

    const getBookDropDown = (): JSX.Element => {
        if (!props.user) return <div />
        return <Nav>
            <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>{getBookName()}</DropdownToggle>
                <DropdownMenu right>
                    {props.books.map((book, index) => {
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
                { !props.user
                    ? <NavItem key={2}><div className='nav-link'><Link to='/register'>Register</Link></div></NavItem>
                    : undefined
                }
            <NavItem key={3}>
                <div className='nav-link'>
                { props.user
                    ? <Link onClick={() => authActions.logout()} to='/about'>Logout</Link>
                    : <Link to='/login'>Login</Link>
                }
                </div>
            </NavItem>
        </ul>
        </Collapse>
    </Navbar>
}

export default connect((store: StoreModel): NavProps => {
    return {
        user: store.auth.me,
        books: store.books.list,
        selectedBook: store.books.selected
    }
})(myComponent)
