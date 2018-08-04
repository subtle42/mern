import * as React from 'react'
// import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from "react-bootstrap";
import { Link } from 'react-router-dom'
import bookActions from 'data/books/actions'
import { connect, Dispatch } from 'react-redux'
import { IBook } from 'common/models'
import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    DropdownToggle,
    DropdownItem, Dropdown } from 'reactstrap'

interface NavProps {
    login: () => void,
    books: IBook[]
}

const NavComp: React.StatelessComponent<NavProps> = (props: NavProps) => {

    return (
        <Navbar>
            <NavbarBrand> WhIM </NavbarBrand>

            <Nav>
                <NavItem onClick={() => props.login()}>
                    <Link to='/login'> Connect</Link>
                </NavItem>
                <Dropdown id='bookDropDown'>
                <DropdownToggle nav caret> Books </DropdownToggle>
                {props.books.map((book, index) => {
                    return (<DropdownItem key={index}
                    onClick={() => bookActions.select(book)}>
                        {book.name}
                    </DropdownItem>)
                })}
                </Dropdown>
            </Nav>
        </Navbar>
    )
}

export default connect((store: any) => {
    return {
        books: store.books.list
    }
}, (dispatch: Dispatch<any>) => {
    return {
        login: () => undefined// authActions.login("", "")
    }
})(NavComp)

export class MainNavbar extends React.Component<{}, {}> {
    render () {
        return <Navbar>
            <NavbarBrand> WhIM </NavbarBrand>
            <Nav>
                <NavItem >
                    <NavLink href='#'> Link </NavLink>
                </NavItem>
            </Nav>
        </Navbar>
    }

    test (): boolean {
        return true
    }
}
