import { Offer } from './model'
import { Response, NextFunction } from 'express'
import { MyRequest, IOfferModel } from '../../dbModels'
import * as utils from '../utils'
import { offerSocket } from './socket'

export class UserController {
    public static getAll (req: MyRequest, res: Response): void {
        Offer.find({}).exec()
        .then(docs => res.json(docs))
        .catch(utils.handleError(res))
    }

    public static getOne (req: MyRequest, res: Response): void {
        Offer.findById(req.params.id).exec()
        .then(docs => res.json(docs))
        .catch(utils.handleError(res))
    }

    public static destroy (req: MyRequest, res: Response): void {
        Offer.findByIdAndRemove(req.params.id).exec()
        .then(docs => {
            offerSocket.onDelete({
                _id: req.params.id
            } as IOfferModel);
            res.json()
        })
        .catch(utils.handleError(res))
    }

    public static update (req: MyRequest, res: Response): void {
        Offer.findByIdAndUpdate(req.params.id, req.body).exec()
        .then(doc => {
            offerSocket.onAddOrChange(doc)
            res.json(doc)
        })
        .catch(utils.handleError(res))
    }

    public static takeOffer (req: MyRequest, res: Response): void {
        const id = req.params.id
        Offer.findById(id)
        .then(offer => {
            if (offer.assignedTo) return Promise.reject('Offer is already taken')
            offer.assignedTo = req.user._id
            return offer.update(offer).exec()
            .then(() => offer)
        })
        .then(offer => offerSocket.onAddOrChange(offer))
        .then(() => res.json(''))
        .catch(utils.handleError(res))
    }

    public static create (req: MyRequest, res: Response): void {
        const newOffer = new Offer(req.body);
        newOffer.createdBy = req.user._id

        newOffer.validate()
        .then(() => newOffer.save())
        .then(doc => {
            offerSocket.onAddOrChange(doc)
            return res.json(doc)
        })
        .catch(utils.handleError(res))
    }
}
