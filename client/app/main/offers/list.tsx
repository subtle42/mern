import * as React from 'react'
import { connect } from 'react-redux'
import { StoreModel } from 'data/store'
import { IOffer } from 'common/models'
import ListGroup from 'reactstrap/lib/ListGroup'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import ListGroupItemHeading from 'reactstrap/lib/ListGroupItemHeading'
import ListGroupItemText from 'reactstrap/lib/ListGroupItemText'
import { OfferTypes } from './create/offer'
import offerActions from 'data/offer/actions'

interface Props {
    list: IOffer[],
    selectedId: string
}

const myComponent: React.StatelessComponent<Props> = (props: Props) => {
    const getOfferDisplay = (offerType: string): string => {
        const myType = OfferTypes.find(type => type.value === offerType)
        return myType ? myType.displayName : ''
    }

    return (
        <ListGroup>
            {props.list.map((offer, index) => {
                return <ListGroupItem key={index} action onClick={() => offerActions.select(offer._id)} active={props.selectedId === offer._id}>
                    <ListGroupItemHeading>{getOfferDisplay(offer.offerType)} - {offer._id}</ListGroupItemHeading>
                    <ListGroupItemText> {offer.propertyAddress.city}, {offer.propertyAddress.state}</ListGroupItemText>
                    <ListGroupItemText> {offer.commission.flatAmout}</ListGroupItemText>

                </ListGroupItem>
            })}
        </ListGroup>
    )
}

export default connect((store: StoreModel): Props => {
    return {
        list: store.offer.list.filter(offer => !offer.assignedTo),
        selectedId: store.offer.selected
    }
})(myComponent)
