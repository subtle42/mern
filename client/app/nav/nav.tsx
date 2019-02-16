import * as React from 'react'
import authActions from 'data/auth/actions'
import { connect } from 'react-redux'
import { IUser } from 'common/models'
import { Link } from 'react-router-dom'
import {
    Collapse,
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    Dropdown,
    DropdownMenu,
    DropdownItem } from 'reactstrap'
import { StoreModel } from 'data/store'

interface NavProps {
    user: IUser,
    dropdownOpen: boolean
}

const myComponent: React.StatelessComponent<NavProps> = (props: NavProps) => {
    return (
        <Navbar expand='md'>
            <NavbarBrand>Digi-Team</NavbarBrand>
            <Collapse navbar>
                <Nav className="ml-auto" navbar>
                    <NavItem key={1}>
                        <NavLink> <Link to='/home'>Home</Link> </NavLink>
                    </NavItem>
                        { !props.user
                            ? <NavItem key={2}><NavLink><Link to='/register'>Register</Link></NavLink></NavItem>
                            : undefined
                        }
                        {  props.user && <NavItem><NavLink><Link to="/post">Post</Link></NavLink></NavItem> }
                        {  props.user && <NavItem><NavLink><Link to="/offers">Offers</Link></NavLink></NavItem> }
                        { !props.user && <NavItem><Link to='/login'><NavLink>Login</NavLink></Link></NavItem> }
                        { props.user && (<UncontrolledDropdown nav>
                            <DropdownToggle nav caret>
                                {props.user.name}
                            </DropdownToggle>
                            <DropdownMenu right>
                                <Link to="/dashboard">
                                    <DropdownItem>Dashboard</DropdownItem>
                                </Link>
                                <DropdownItem divider/>
                                <Link to='/home' onClick={() => authActions.logout()}>
                                    <DropdownItem> Logout </DropdownItem>
                                </Link>
                            </DropdownMenu>
                            </UncontrolledDropdown>)
                        }
                </Nav>
            </Collapse>
        </Navbar>
    )
}

export default connect((store: StoreModel): NavProps => {
    return {
        user: store.auth.me,
        dropdownOpen: false,
    }
})(myComponent)
