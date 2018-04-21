import * as React from "react";
import authActions from "../../data/auth/actions";
import bookActions from "../../data/books/actions";
import { connect, Dispatch } from "react-redux";
import { IUser, IBook } from "myModels";
import store from "../../data/store";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AddBookButton from "../main/book/add";
import EditBookButton from "../main/book/edit"
import * as FontAwesome from "react-fontawesome";

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
    DropdownItem,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Modal
} from 'reactstrap';

interface NavProps {
    user: IUser,
    books: IBook[],
    selectedBook?: IBook
}
interface NavState {
    isOpen?: boolean,
    canEdit: boolean,
    showModal:boolean
}

export class Navigation extends React.Component<NavProps, NavState> {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
            canEdit: true,
            showModal: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    editBook(book) {
        console.log("editing book:", book)
        this.setState({
            showModal: true
        })
    }

    renderModal():JSX.Element {
        return (<Modal size="md" isOpen={this.state.showModal}>
            <ModalHeader>Edit Book</ModalHeader>
            <ModalBody></ModalBody>
            <ModalFooter></ModalFooter>
        </Modal>);
    }

    renderEditableItem() {
        let { isOpen, canEdit, showModal } = this.state;
        return (
            <DropdownItem style={{ padding: '0.25rem 1.0rem' }}>
                <span>Option 1</span>
                {canEdit && <FontAwesome onClick={(book) => this.editBook(book)} className="float-right text-muted sidemenuicon" name="edit" />}
                {showModal && this.renderModal()}
            </DropdownItem>
        )
    }

    getBookDropDown() {
        if (!this.props.selectedBook) {
            return (
                <Nav>
                    <UncontrolledDropdown nav inNavbar>
                        <DropdownToggle nav caret> No Book Selected </DropdownToggle>
                        <DropdownMenu right>
                            {this.renderEditableItem()}

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
                        {this.props.selectedBook.name || "No Book Selected"}
                    </DropdownToggle>
                    <DropdownMenu right>
                        {this.props.books.map(book => {
                            return (
                                <EditBookButton 
                                _id={book._id} 
                                key={book._id}
                                name={book.name}
                            />
                                // <DropdownItem
                                //     key={book._id}
                                //     onClick={() => bookActions.select(book)}
                                // >
                                //     {book.name}
                                // </DropdownItem>
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
                <Collapse isOpen={this.state.isOpen} navbar style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {this.getBookDropDown()}
                    <Nav >
                        <NavItem key={1}>
                            <NavLink>
                                <Link to="/home">Home</Link>
                            </NavLink>
                        </NavItem>
                        {!this.props.user
                            ? <NavItem key={2}><NavLink><Link to="/register">Register</Link></NavLink></NavItem>
                            : undefined
                        }
                        <NavItem key={3}>
                            <NavLink>
                                {this.props.user
                                    ? <Link onClick={() => authActions.logout()} to="/home">Logout</Link>
                                    : <Link to="/login">Login</Link>
                                }
                            </NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }
}

export default connect((store: any) => {
    return {
        user: store.auth.me,
        books: store.books.list,
        selectedBook: store.books.selected
    }
})(Navigation);