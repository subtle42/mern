import * as React from 'react'
import { OfferForm } from './create/offer'
import { PostOptions } from './create/post'
import NotifActions from 'data/notifications/actions'
import offerActions from 'data/offer/actions'
import { IOffer } from 'common/models'
import { Failover } from './create/failover'
import { ConfirmCreate } from './create/confirm'
import { Redirect } from 'react-router-dom'

export const CreatePost: React.StatelessComponent = () => {
    const [offer, setOffer] = React.useState({} as IOffer)
    const [step, setStep] = React.useState(0)
    const [isDone, setDone] = React.useState(false)

    const create = () => {
        offerActions.create(offer)
        .then(res => {
            NotifActions.notify('success', 'Offer Created')
            setDone(true)
        })
        .catch(err => {
          console.error(err)
          NotifActions.notify('danger', err)
        })
    }

    const afterStep1 = (newOffer: IOffer) => {
        setOffer(Object.assign(offer, newOffer))
        next()
    }

    const afterStep2 = (newOffer: IOffer) => {
        setOffer(Object.assign(offer, newOffer))
        if (newOffer.isPublic) {
            setStep(step + 2)
        } else {
            next()
        }
    }

    const next = () => setStep(step + 1)
    const back = () => setStep(step - 1)

    const getCurrentForm = (): JSX.Element => {
        if (isDone) {
            return (<Redirect to='/offers' />)
        }

        if (step === 0) {
            return <OfferForm next={newOffer => afterStep1(newOffer)} />
        } else if (step === 1) {
            return <PostOptions
                next={newOffer => afterStep2(newOffer)}
                back={() => back()}
            />
        } else if (step === 2) {
            return <Failover
              next={newOffer => afterStep1(newOffer)}
              back={() => back()}
            />
        } else if (step === 3) {
          return <ConfirmCreate
              next={() => create()}
              back={() => back()}
          />
        }
        return <div/>
    }

    return getCurrentForm()
}
