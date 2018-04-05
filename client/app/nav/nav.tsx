import * as React from "react";
import authActions from "../../data/auth/actions";
import bookActions from "../../data/books/actions";
import {connect, Dispatch} from "react-redux";
import {IUser, IBook} from "myModels";
import store from "../../data/store";
import {BrowserRouter as Router, Route, Link} from "react-router-dom";
import AddBookButton from "../main/book/add";

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
    DropdownItem } from 'reactstrap';
  
interface NavProps {
    user:IUser,
    books:IBook[],
    selectedBook?:IBook
}
interface NavState {
    isOpen?:boolean,
}

export class Navigation extends React.Component<NavProps, NavState> {
    constructor(props) {
        super(props);
    
        this.toggle = this.toggle.bind(this);
        this.state = {
          isOpen: false
        };
      }
      toggle() {
        this.setState({
          isOpen: !this.state.isOpen
        });
      }


      getBookDropDown() {
        if (!this.props.selectedBook) {
           return (
            <Nav>
            <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret> No Book Selected </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>
                    Option 1
                  </DropdownItem>
                  <AddBookButton />
                  <DropdownItem divider />
                  <DropdownItem key="add">
                    Add Book
                  </DropdownItem>
                </DropdownMenu>

            </UncontrolledDropdown>
        </Nav>
        )
        }

        return (
            <Nav>
                <UncontrolledDropdown>
                <DropdownToggle nav caret>
                {this.props.selectedBook.name || "No Book Selected" }
                </DropdownToggle>
                <DropdownMenu right>
                    {this.props.books.map(book => {
                        return (
                            <DropdownItem
                                key={book._id}
                                onClick={() => bookActions.select(book)}
                            >
                                {book.name}
                            </DropdownItem>
                        );
                    })}
                    <DropdownItem divider />
                    <AddBookButton />
                    {/* <MenuItem key="add">Add Book</MenuItem> */}
                    </DropdownMenu>
                </UncontrolledDropdown >
            </Nav>
        );
    }
      
      render() {
        return (
            <Navbar color="light" light expand="md"> 
                    <NavbarBrand> WhIM </NavbarBrand>
    
                <Collapse isOpen={this.state.isOpen} navbar>
                {this.getBookDropDown()}
                <Nav>
                    <NavItem>
                        <NavLink href="/home">Home</NavLink>
                    </NavItem>
                        { !this.props.user
                            ? <NavItem><NavLink href="/register">Register</NavLink></NavItem>
                            : undefined
                        }
                    <NavItem>
                        { this.props.user
                            ? <NavLink onClick={() => authActions.logout()} href="/home">Logout</NavLink>
                            : <NavLink href="/login">Login</NavLink>
                        }                
                    </NavItem>
                </Nav>
                </Collapse>
            </Navbar>
        );
      }
}

export default connect((store:any) => {
    return {
        user: store.auth.me,
        books: store.books.list,
        selectedBook: store.books.selected
    }
}, (dispatch:Dispatch<any>) => {
    return {};
})(Navigation);