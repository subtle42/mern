import * as React from "react";
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from "react-bootstrap";
import authActions from "../../data/auth/actions";
import bookActions from "../../data/books/actions";
import {connect, Dispatch} from "react-redux";
import {IUser, IBook} from "myModels";
import store from "../../data/store";
import {BrowserRouter as Router, Route, Link} from "react-router-dom";
import AddBookButton from "../main/book/add";


interface NavProps {
    user:IUser,
    books:IBook[],
    selectedBook?:IBook
}

const NavComp:React.StatelessComponent<NavProps> = (props:NavProps) => {
    const getBookDropDown = () => {
        if (!props.selectedBook) {
           return (
            <Nav>
            <NavDropdown  title="No Book Selected" id="basic-nav-dropdown">
                <MenuItem divider />
                <AddBookButton />
                <MenuItem key="add">Add Book</MenuItem>
            </NavDropdown>
        </Nav>
           )
        }

        return (
            <Nav>
                <NavDropdown  title={props.selectedBook.name || "No Book Selected" } id="basic-nav-dropdown">
                    {props.books.map(book => {
                        return (
                            <MenuItem
                                key={book._id}
                                onClick={() => bookActions.select(book)}
                            >
                                {book.name}
                            </MenuItem>
                        );
                    })}
                    <MenuItem divider />
                    <AddBookButton />
                    {/* <MenuItem key="add">Add Book</MenuItem> */}
                </NavDropdown>
            </Nav>
        );
    }

    return (
        <Navbar>
            <Navbar.Header>
                <Navbar.Brand>
                    <a href="#">WhIM</a>
                </Navbar.Brand>
            </Navbar.Header>
            {getBookDropDown()}
            <Nav pullRight>
                <NavItem>
                    <Link to="/home">Home</Link>
                </NavItem>
                    { !props.user
                        ? <NavItem><Link to="/register">Register</Link></NavItem>
                        : undefined
                    }
                <NavItem>
                    { props.user
                        ? <Link onClick={() => authActions.logout()} to="/home">Logout</Link>
                        : <Link to="/login">Login</Link>
                    }                
                </NavItem>
            </Nav>
        </Navbar>
    );
}

export default connect((store:any) => {
    return {
        user: store.auth.me,
        books: store.books.list,
        selectedBook: store.books.selected
    }
}, (dispatch:Dispatch<any>) => {
    return {};
})(NavComp);