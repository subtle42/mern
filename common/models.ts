import { Layout } from 'react-grid-layout'
import { ColumnType } from './constants'

export type ColumnType = 'number' | 'group' | 'text' | 'datetime'

export interface IUser {
    _id: any
    name: string
    role: string
    email: string
    password?: string
    company: string
}

export interface IShared {
    owner: string
    editors: string[]
    viewers: string[]
    isPublic: boolean
}

export interface IOffer {
    _id: any
    offerType: string
    clientName: string
    propertyAddress: {
        street1: string,
        street2: string,
        city: string,
        state: string,
        zip: string
    }
    commission: {
        type: string,
        flatAmout: number,
        percentRate: number
    }
    comments: string
    isPublic: boolean
    failover: boolean
    whiteList: string[]
    createdBy?: string
    assignedTo?: string
}
