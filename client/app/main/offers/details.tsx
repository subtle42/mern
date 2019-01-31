import * as React from 'react'
import { connect } from 'react-redux'
import {StoreModel, store} from 'data/store'
import { IOffer } from 'common/models';

interface Props {
    id: string
}

const myComponent:React.StatelessComponent<Props> = (props: Props) => {
    if (!props.id) return <div/>
    const myOffer = store.getState().offer.list.find(offer => offer._id === props.id);

    return <div>
        <h2>{myOffer.clientName}</h2>
        <p>{myOffer.offerType} - {`${myOffer.propertyAddress.city}, ${myOffer.propertyAddress.state} ${myOffer.propertyAddress.zip}`}</p>
    </div>
}

export const OfferDetails = connect((store: StoreModel): Props => {
    return {
        id: store.offer.selected,
    }
})(myComponent)
