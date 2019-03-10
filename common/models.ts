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

export interface IBook extends IShared {
    _id: any
    name: string
}

export interface IFilter {
    ref: string
    range?: [number, number]
    option?: string[]
}

export interface IQuery {
    sourceId: string
    measures: {ref: string}[]
    dimensions: string[]
    filters: {
        [key: string]: any[]
    }
}

export interface IPage {
    _id: any
    bookId: string
    name: string
    isDraggable: boolean
    isResizable: boolean
    isRearrangeable: boolean
    preventCollision: boolean
    margin: [number, number]
    containerPadding: [number, number]
    cols: number
    layout: Layout[]
}

export interface IMeasure {
    ref: string
    formula?: string
}

export interface IWidget {
    _id: any
    pageId: string
    sourceId: string
    margins: {
        top: number,
        bottom: number,
        left: number,
        right: number
    },
    type: string
    measures: IMeasure[]
    dimensions: string[]
    columnCount?: number
    xAxis?: {
        isHidden?: boolean,
        min?: number,
        max?: number,
        ticks?: number
    },
    yAxis?: {
        isHidden?: boolean,
        min?: number,
        max?: number,
        ticks?: number
    }
}

export interface ISource extends IShared {
    _id: any
    title: string
    location: string
    size: number
    rowCount: number
    columns: ISourceColumn[]
}

export interface ISourceColumn {
    name: string
    ref: string
    type: ColumnType
    min?: number
    max?: number
    values?: string[]
}

export interface IUser {
    _id: any
    name: string
}
