import * as React from 'react'
import {connect} from 'react-redux'
import {StoreModel} from 'data/store'
import { IOffer } from 'common/models';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';

interface Props {
    list: IOffer[]
}

const myComponent: React.StatelessComponent<Props> = (props: Props) => {
    return (
        <ListGroup>
            {props.list.map((offer, index) => {
                return <ListGroupItem key={index}>{offer.offerType} - {offer._id}</ListGroupItem>
            })}
        </ListGroup>
    )
}

export default connect((store: StoreModel): Props => {
    return {
        list: store.offer.list,
    }
})(myComponent)
