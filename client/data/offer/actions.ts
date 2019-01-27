import axios, { AxiosPromise } from 'axios'
import { store } from '../store'
import { IUser, IOffer } from 'common/models'
import BaseActions from 'data/baseActions';

class OfferActions extends BaseActions {
    constructor () {
        super(store, 'offer')
    }

    create (offer: IOffer): AxiosPromise<string> {
        return axios.post('/api/offer', offer)
        .then(res => res.data)
    }

    update (offer: IOffer): Promise<IOffer> {
        return axios.put(`/api/offer/${offer._id}`, offer)
        .then(res => res.data as IOffer)
    }

    delete(id: string): Promise<void> {
        return axios.delete(id)
        .then(res => undefined)
    }

    getAll(): Promise<IOffer[]> {
        return axios.get('/api/offer')
        .then(res => res.data as IOffer[])
    }

    getOne(id: string): Promise<IOffer> {
        return axios.get(`/api/offer/${id}`)
        .then(res => res.data as IOffer)
    }
    
    select (id: string): Promise<void> {
        return this._select(id)
    }

}

const offerActions = new OfferActions()

export default offerActions
