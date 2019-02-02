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
    DropdownMenu,
    DropdownItem } from 'reactstrap'
import { StoreModel } from 'data/store'

interface NavProps {
    user: IUser,
}

const myComponent: React.StatelessComponent<NavProps> = (props: NavProps) => {
    return (
        <Navbar color='light' light expand='md'>
            <NavbarBrand>Digi-Team</NavbarBrand>
            <Collapse navbar style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
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
                    { props.user && <NavItem><NavLink><Link to="/post">Post</Link></NavLink></NavItem> }
                    { props.user && <NavItem><NavLink><Link to="/offers">Offers</Link></NavLink></NavItem> }
                    { props.user&& props.user.role === 'admin' && <NavItem><NavLink><Link to="/admin">Admin</Link></NavLink></NavItem> }
                    { props.user && <NavItem><NavLink><Link to='/home'
                        onClick={() => authActions.logout()}>
                        Logout</Link></NavLink></NavItem> }
                    { !props.user && <NavItem><NavLink><Link to='/login'>Login</Link></NavLink></NavItem> }
            </Nav>
            </Collapse>
        </Navbar>
    )
}

export default connect((store: StoreModel): NavProps => {
    return {
        user: store.auth.me,
    }
})(myComponent)
