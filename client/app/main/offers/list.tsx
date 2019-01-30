import * as React from 'react'
import {connect} from 'react-redux'
import {StoreModel} from 'data/store'
import { IOffer } from 'common/models';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import {OfferTypes} from './offer'
import offerActions from 'data/offer/actions';
interface Props {
    list: IOffer[]
}

const myComponent: React.StatelessComponent<Props> = (props: Props) => {
     function  getOfferDisplay  (offerType: string): string {
         const myType = OfferTypes.find(type => type.value === offerType)
        return myType ? myType.displayName : ''
    }

    return (
        <ListGroup>
            {props.list.map((offer, index) => {
                return <ListGroupItem key={index}>{getOfferDisplay(offer.offerType)} - {offer._id}</ListGroupItem>
            })}
        </ListGroup>
    )
}

export default connect((store: StoreModel): Props => {
    return {
        list: store.offer.list,
    }
})(myComponent)
