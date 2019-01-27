import { Offer } from './model'
import { Response, NextFunction } from 'express'
import { MyRequest } from '../../dbModels'
import * as utils from '../utils'


export class UserController {
    public static getAll (req: MyRequest, res: Response): void {
        Offer.find({}).exec()
        .then(docs => res.json(docs))
        .catch(utils.handleError)
    }

    public static getOne (req: MyRequest, res: Response): void {
        Offer.findById(req.params.id).exec()
        .then(docs => res.json(docs))
        .catch(utils.handleError)
    }

    public static destroy (req: MyRequest, res: Response): void {
        Offer.findByIdAndRemove(req.params.id).exec()
        .then(docs => res.json())
        .catch(utils.handleError)
    }

    public static update (req: MyRequest, res: Response): void {
        Offer.findByIdAndUpdate(req.params.id, req.body).exec()
        .then(docs => res.json(docs))
        .catch(utils.handleError)
    }

    public static create (req: MyRequest, res: Response): void {
        const newOffer = new Offer(req.body);
        
        newOffer.save()
        .then(docs => res.json(docs))
        .catch(utils.handleError)
    }
}
