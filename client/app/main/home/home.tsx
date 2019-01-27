
import * as React from 'react';
import OfferForm from '../offers/offer'
class State {
}

export default class LoginPage extends React.Component<any, State> {
    state: State = new State()

    render() {
        return <OfferForm />
    }
}