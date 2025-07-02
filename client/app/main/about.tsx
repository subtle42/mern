import * as React from 'react'
import { Redirect } from 'react-router'
import { store } from '../../data/store'

export const AboutPage: React.FunctionComponent<void> = (props) => {
    const [shouldRedirect, setRedirect] = React.useState(false)
    const user = store.getState().auth.me

    React.useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const newData = store.getState().auth.me
            if (!user && newData) setRedirect(true)
        })
        return () => unsubscribe()
    })

    if (shouldRedirect) {
        return <Redirect to='/main'/>
    }
    return <h1>About</h1>
}
