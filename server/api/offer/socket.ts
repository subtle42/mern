import { IOfferModel, ISharedModel } from '../../dbModels'
import { Offer } from './model'
import BaseSocket from '../../sockets/sockets'

class OfferSocket extends BaseSocket {
    constructor () {
        super('offer')
    }

    getParentId () {
        return ''
    }

    getInitialState () {
        return Offer.find({}).exec()
    }

    getSharedModel (id: string) {
        const response: any = {
            isPublic: true
        }
        return new Promise(resolve => resolve(response)) as Promise<ISharedModel>;
    }

    onAddOrChange (model: IOfferModel) {
        this._onAddOrChange(undefined, [model])
    }

    onDelete (model: IOfferModel) {
        this._onDelete(undefined, [model._id])
    }
}

export const offerSocket = new OfferSocket()