import * as React from 'react'
import { OfferForm } from './create/offer'
import { PostOptions } from './create/post'
import NotifActions from 'data/notifications/actions'
import offerActions from 'data/offer/actions'
import { IOffer } from 'common/models'

export const CreatePost: React.StatelessComponent = () => {
    const [offer, setOffer] = React.useState({} as IOffer)
    const [step, setStep] = React.useState(1)

    const create = () => {
        offerActions.create(offer)
        .then(res => NotifActions.notify('success', 'Offer Created'))
        .catch(err => NotifActions.notify('danger', err))
    }

    const afterStep1 = (newOffer: IOffer) => {
        setOffer(Object.assign(offer, newOffer))
        next()
    }

    const next = () => setStep(step + 1)
    const back = () => setStep(step - 1)

    const getCurrentForm = (): JSX.Element => {
        if (step === 0) {
            return <OfferForm next={newOffer => afterStep1(newOffer)} />
        } else if (step === 1) {
            return <PostOptions next={newOffer => afterStep1(newOffer)} />
        }
    }

    return getCurrentForm()
}
