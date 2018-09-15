import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import AuthActions from '../../data/auth/actions'
import { IPage } from 'common/models'
import MainPage from './content/content'
import LoadingPage from '../logon/login'
import RegisterPage from '../logon/register'
import MainNavBar from '../nav/nav'
import { AlertComponent } from '../_common/alert'

class MyState {
    currentPage?: IPage
}

export class Main extends React.Component<{}, MyState> {
    state: MyState = new MyState()

    componentDidMount () {
        AuthActions.preloadUser()
    }

    render () {
        return (
            <Router>
                <div>
                    <AlertComponent />
                    <MainNavBar />
                    <Route exact path='/home' component={MainPage}/>
                    <Route exact path='/login' component={LoadingPage}/>
                    <Route exact path='/register' component={RegisterPage}
                    />
                </div>
            </Router>
        )
    }
}
