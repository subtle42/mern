import { Layout } from 'react-grid-layout'
import { ColumnType } from './constants'

export type ColumnType = 'number' | 'group' | 'text' | 'datetime'

export interface IUser {
    _id: any
    name: string
    email: string
    password?: string
}

export interface IShared {
    owner: string
    editors: string[]
    viewers: string[]
    isPublic: boolean
}

export interface IOffer {
    offerType: string;
    clientName: string;
    propertyAddress: {
        street1: string,
        street2: string,
        city: string,
        state: string,
        zip: string
    }
    commision: {
        type: string,
        flatAmout: number,
        percentRate: number
    }
}