
import { Schema, Model } from 'mongoose';
import { createSchema } from '../utils';
import { IOfferModel } from 'server/dbModels';

const addressSchema = new Schema ({
    street1: String,
    street2: String,
    city: String,
    state: String,
    zip: String
})

const commissionSchema = new Schema({
    type: String,
    flatAmount: Number,
    percentRate: Number
})

const OfferSchema = new Schema({
    offerType: {
        type: String,
        // required: true,
    },
  clientName: String,
  propertyAddress: addressSchema,
  commission: commissionSchema
});

export const Offer: Model<IOfferModel> = createSchema('Offer', OfferSchema);