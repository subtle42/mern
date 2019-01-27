import { IOfferModel } from '../../dbModels'
import { Offer } from './model'
import BaseSocket from '../../sockets/sockets'

class OfferSocket extends BaseSocket {
    constructor () {
        super('offers')
    }

    getParentId () {
        return ''
    }

    getInitialState () {
        return Offer.find({}).exec()
    }

    getSharedModel () {
        return {
            isPublic: true
        } as any
    }

    onAddOrChange (model: IOfferModel) {
        this._onAddOrChange(undefined, [model])
    }

    onDelete (model: IOfferModel) {
        this._onDelete(undefined, [model._id])
    }
}

export const offerSocket = new OfferSocket()