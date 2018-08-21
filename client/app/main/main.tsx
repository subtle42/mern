import * as React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import AuthActions from '../../data/auth/actions'
import { IPage } from 'common/models'
import Loading from '../_common/loading'
import * as Loadable from 'react-loadable'

class MyState {
    currentPage?: IPage
}

export class Main extends React.Component<{}, MyState> {
    state: MyState = new MyState()

    componentDidMount () {
        AuthActions.preloadUser()
    }

    main = Loadable({
        loader: () => import(
            /* webpackChunkName: "content" */
            './content/content'),
        loading () {
            return <Loading/>
        }
    })

    login = Loadable({
        loader: () => import(
            /* webpackChunkName: "logon" */
            '../logon/login'),
        loading () {
            return <Loading/>
        }
    })

    register = Loadable({
        loader: () => import(
            /* webpackChunkName: "register" */
            '../logon/register'),
        loading () {
            return <Loading/>
        }
    })

    MainNavBar = Loadable({
        loader: () => import('../nav/nav'),
        loading () {
            return <Loading/>
        }
    })

    render () {
        return (
            <Router>
                <div>
                    <this.MainNavBar />
                    <Route exact path='/home' component={this.main}/>
                    <Route exact path='/login' component={this.login}/>
                    <Route exact path='/register' component={this.register}
                    />
                </div>
            </Router>
        )
    }
}
