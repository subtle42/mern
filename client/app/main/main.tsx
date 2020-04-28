import * as React from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import AuthActions from '../../data/auth/actions'
import MainPage from './content/content'
import { LoginPage } from '../logon/login'
import { RegisterPage } from '../logon/register'
import { MainNavBar } from '../nav/nav'
import { AlertComponent } from '../_common/alert'
import { AboutPage } from './about'

interface Props {}

export const Main: React.FunctionComponent<Props> = (props: Props) => {
    AuthActions.preloadUser()

    return <Router>
        <div>
            <AlertComponent />
            <MainNavBar />
            <Route exact path='/main' component={MainPage}/>
            <Route exact path='/login' component={LoginPage}/>
            <Route exact path='/register' component={RegisterPage}/>
            <Route exact path='/index' component={AboutPage}/>
        </div>
    </Router>
}
