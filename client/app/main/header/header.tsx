import * as React from "react";
// import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from "react-bootstrap";
import authActions from "../../../data/auth/actions";
import bookActions from "../../../data/books/actions";
import {connect, Dispatch} from "react-redux";
import {IBook} from "myModels";



interface NavProps {
    login:()=>void,
    books:IBook[]
}

const NavComp:React.StatelessComponent<NavProps> = (props:NavProps) => {

    return (
        // <Navbar>
        //     <Navbar.Header>
        //         <Navbar.Brand>
        //             <a href="#">WhIM</a>
        //         </Navbar.Brand>
        //     </Navbar.Header>
        //     <Nav>
        //         <NavItem onClick={()=>props.login()} href="#">
        //             Connect
        //         </NavItem>
        //         <NavDropdown id="bookDropDown" title="Books">
        //             {props.books.map((book, index) => {
        //                 return (<MenuItem key={index}
        //                 onClick={() => bookActions.select(book)}>
        //                     {book.name}
        //                 </MenuItem>);
        //             })}
        //         </NavDropdown>
        //     </Nav>
        // </Navbar>
    );
}

export default connect((store:any) => {
    return {
        books: store.books.list
    }
}, (dispatch:Dispatch<any>) => {
    return {
        login: () => {}//authActions.login("", "")
    };
})(NavComp)

// export class MainNavbar extends React.Component<{}, {}> {
//     render() {
//         return <Navbar>
//             <Navbar.Header>
//                 <Navbar.Brand>
//                     <a href="#">WhIM</a>
//                 </Navbar.Brand>
//             </Navbar.Header>
//             <Nav>
//                 <NavItem href="#">
//                     Link
//                 </NavItem>
//             </Nav>
//         </Navbar>
//     }

//     test():boolean {
//         return true;
//     }
// }