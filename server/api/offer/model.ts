
import { Schema, Model } from 'mongoose';
import { createSchema } from '../utils';
import { IOfferModel } from 'server/dbModels';

const OfferSchema = new Schema({
    offerType: {
        type: String,
        required: true,
    },
  clientName: String,
  propertyAddress: {
    street1: String,
    street2: String,
    city: String,
    state: String,
    zip: String
  },
  commision: {
    type: String,
    flatAmout: Number,
    percentRate: Number
}
});

export const Offer: Model<IOfferModel> = createSchema('Offer', OfferSchema);