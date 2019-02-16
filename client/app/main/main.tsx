import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import AuthActions from '../../data/auth/actions'
import MainPage from './home/home'
import LoadingPage from '../logon/login'
import RegisterPage from '../logon/register'
import MainNavBar from '../nav/nav'
import { AlertComponent } from '../_common/alert'
import { OfferPage } from './pages/post'
import { OffersPage } from './pages/offers'
import { AdminPage } from './pages/admin'
import { DashboardPage } from '../main/pages/dashboard'

class MyState {
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
                    <Route exact path='/register' component={RegisterPage} />
                    <Route exact path='/offers' component={OffersPage} />
                    <Route exact path='/post' component={OfferPage} />
                    <Route exact path='/admin' component={AdminPage} />
                    <Route exact path='/dashboard' component={DashboardPage} />
                </div>
            </Router>
        )
    }
}
