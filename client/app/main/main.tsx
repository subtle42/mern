import * as React from "react";
import {BrowserRouter as Router, Route} from "react-router-dom";
import MainNavbar from "../nav/nav";
import {MainConent} from "./content/content"
import RegisterPage from "../logon/register";
import AuthActions from "../../data/auth/actions";
import LoginPage from "../logon/login";
import {IPage} from "common/models";

class myState {
    currentPage?:IPage;
}

export class Main extends React.Component<{}, myState> {
    state:myState = new myState()
    
    componentDidMount() {
        AuthActions.preloadUser();

    }

    handleChange = (event:React.FormEvent<HTMLInputElement>) => {
        const target:any = event.target
        this.setState({
            [target.name]: target.value
        });
    }
    
    render() {
        return (
            <Router>
                <div>
                    <MainNavbar />
                    
                    {/* <MainConent /> */}
                    <Route exact path="/home" component={MainConent}/>
                    <Route exact path="/login" component={LoginPage}/>
                    <Route exact path="/register" component={RegisterPage}/>
                </div>
            </Router>
        )
    }
}

