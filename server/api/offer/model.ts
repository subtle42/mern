
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
        required: true,
    },
    comments: {type: String},
    clientName: String,
    propertyAddress: addressSchema,
    commission: commissionSchema,
    isPublic: Boolean,
    whiteList: {default: [], required: true, type: [String]},
    failover: Boolean,
    createdBy: {type: String, required: true},
    assignedTo: {type: String}
});

export const Offer: Model<IOfferModel> = createSchema('Offer', OfferSchema);
