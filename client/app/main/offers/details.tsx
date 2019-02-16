import * as React from 'react'
import { connect } from 'react-redux'
import {StoreModel, store} from 'data/store'
import Button from 'reactstrap/lib/Button'
import { IOffer } from 'common/models'
import NotifActions from 'data/notifications/actions'
import { ConfirmModal } from '../../_common/confirmation'
import offerActions from 'data/offer/actions'

interface Props {
    id: string
}

const myComponent:React.StatelessComponent<Props> = (props: Props) => {
    if (!props.id) return <div/>
    const myOffer = store.getState().offer.list.find(offer => offer._id === props.id);


    const takeOffer = (offer: IOffer) => {
        offerActions.take(offer._id)
        .then(() => NotifActions.notify('success', 'Offer taken'))
        .catch(err => console.error(err))
    }


    return <div>
        <h2>{myOffer.clientName}</h2>
        <p>{myOffer.offerType} - {`${myOffer.propertyAddress.city}, ${myOffer.propertyAddress.state} ${myOffer.propertyAddress.zip}`}</p>
        <ConfirmModal header='Take Task'
            message='Are you sure you want to take this task?'>
            <Button color='primary'
                onClick={() => takeOffer(myOffer)}
                size='xs'>
                Take
            </Button>
          </ConfirmModal>
    </div>
}

export const OfferDetails = connect((store: StoreModel): Props => {
    return {
        id: store.offer.selected,
    }
})(myComponent)
