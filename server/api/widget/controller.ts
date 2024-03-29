import { Request, Response } from 'express'
import { Widget } from './model'
import * as utils from '../utils'
import { Page } from '../page/model'
import { Book } from '../book/model'
import { Source } from '../source/model'
import { pageSocket } from '../page/socket'
import { widgetSocket } from './socket'
import { Layout } from 'react-grid-layout'
import * as auth from '../../auth/auth.service'
import { IWidgetModel, ISourceModel, MyRequest } from 'server/dbModels'

const widgetLayout: Layout = {
    x: 0, y: 0, w: 1, h: 1
}

export const create = (req: MyRequest, res: Response) => {
    const { pageId, sourceId, type } = req.body

    let myWidget = new Widget({
        pageId: pageId,
        sourceId: sourceId,
        type: type
    })

    Page.findById(pageId).exec()
    .then(page => Book.findById(page.bookId).exec())
    .then(book => auth.hasEditAccess(req.user._id, book))
    .then(() => Source.findById(sourceId).exec())
    .then(mySource => addDefaultsToWidget(myWidget, mySource))
    .then(() => myWidget.validate())
    .then(() => Widget.create(myWidget))
    .then(widget => {
        return Page.findById(widget.pageId)
        .then(page => {
            page.layout.push(Object.assign({}, widgetLayout, { i: widget._id }))
            return page.updateOne(page).exec()
            .then(() => widgetSocket.onAddOrChange(widget))
            .then(() => pageSocket.onAddOrChange(page))
        })
        .then(() => widget._id)
    })
    .then(utils.handleResponse(res))
    .catch(utils.handleError(res))
}

const canUserEdit = (pageId: string, userId: string): Promise<void> => {
    return Page.findById(pageId).exec()
    .then(page => Book.findById(page.bookId).exec())
    .then(book => auth.hasEditAccess(userId, book))
}

export const createMultiple = (req: MyRequest, res: Response) => {
    const pageId: string = req.body.pageId
    const sourceId: string = req.body.sourceId
    const types: string[] = req.body.types

    const myWidgets: IWidgetModel[] = types.map(type => new Widget({
        pageId,
        sourceId,
        type
    }))

    canUserEdit(pageId, req.user._id)
    .then(() => Source.findById(sourceId).exec())
    .then(mySource => myWidgets.forEach(myWidget => addDefaultsToWidget(myWidget, mySource)))
    .then(() => Promise.all(myWidgets.map(w => w.validate())))
    .then(() => Promise.all(myWidgets.map(w => Widget.create(w))))
    .then(createdList => {
        return Page.findById(pageId)
        .then(page => {
            createdList.forEach(newWidget => {
                page.layout.push(Object.assign({}, widgetLayout, { i: newWidget._id }))
            })
            return page.updateOne(page).exec()
            .then(() => widgetSocket.onManyAdd(createdList))
            .then(() => pageSocket.onAddOrChange(page))
        })
        .then(() => createdList.map(w => w._id))
    })
    .then(utils.handleResponse(res))
    .catch(utils.handleError(res))
}

const addDefaultsToWidget = (myWidget: IWidgetModel, mySource: ISourceModel) => {
    if (myWidget.type === 'histogram') {
        myWidget.dimensions.push(getDefaultColumn('number', mySource))
    } else if (myWidget.type === 'scatter') {
        myWidget.dimensions.push(getDefaultColumn('number', mySource))
        myWidget.dimensions.push(getDefaultColumn('number', mySource))
    } else if (myWidget.type === 'line') {
        myWidget.dimensions.push(getDefaultColumn('datetime', mySource))
        myWidget.measures.push({
            formula: 'sum',
            ref: getDefaultColumn('number', mySource, true)
        })
    } else {
        myWidget.dimensions.push(getDefaultColumn('group', mySource))
        myWidget.measures.push({
            formula: 'sum',
            ref: getDefaultColumn('number', mySource, true)
        })
    }
}

export const getDefaultColumn = (type: string, source: ISourceModel, includeCount?: boolean): string => {
    const cols = source.columns.filter(col => col.type === type)
    if (includeCount) {
        cols.push({
            ref: 'count',
            name: 'Count(*)',
            type: 'number'
        })
    }
    return cols[Math.floor(Math.random() * cols.length)].ref
}

export const remove = (req: MyRequest, res: Response) => {
    const { id, pageId, bookId } = req.params

    Book.findById(bookId).exec()
    .then(book => auth.hasEditAccess(req.user._id, book))
    .then(() => Page.findById(pageId).exec())
    .then(page => {
        page.layout = page.layout.filter(item => item.i !== id)
        return page.updateOne(page).exec()
        .then(() => pageSocket.onAddOrChange(page))
    })
    .then(() => Widget.findByIdAndRemove(id).exec())
    .then(() => widgetSocket.onDelete({
        _id: id,
        pageId
    } as IWidgetModel))
    .then(utils.handleResponseNoData(res))
    .catch(utils.handleError(res))
}

export const update = (req: MyRequest, res: Response) => {
    let myWidget = new Widget(req.body)
    const myId: string = req.body._id
    delete req.body._id

    myWidget.validate()
    .then(() => Page.findById(myWidget.pageId).exec())
    .then(page => Book.findById(page.bookId).exec())
    .then(book => auth.hasEditAccess(req.user._id, book))
    .then(() => Widget.findByIdAndUpdate(myId, req.body).exec())
    .then(() => widgetSocket.onAddOrChange(myWidget))
    .then(utils.handleResponseNoData(res))
    .catch(utils.handleError(res))
}

export const get = (req: MyRequest, res: Response) => {
    const myId: string = req.params.id

    Widget.findById(myId)
    .then(widget => {
        return Page.findById(widget.pageId)
        .then(page => {
            return Book.findById(page.bookId)
            .then(book => auth.hasViewerAccess(req.user._id, book))
            .then(() => widget)
        })
    })
    .then(utils.handleResponse(res))
    .catch(utils.handleError(res))
}

