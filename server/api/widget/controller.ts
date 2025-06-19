import { Widget, WidgetDoc } from './model'
import * as utils from '../utils'
import { Page } from '../page/model'
import { Book } from '../book/model'
import { Source, SourceDoc } from '../source/model'
import { pageSocket } from '../page/socket'
import { widgetSocket } from './socket'
// import { Layout } from 'react-grid-layout'
import { handleApiCall } from '../utils'
import * as auth from '../../auth/auth.service'

const widgetLayout = {
    x: 0, y: 0, w: 1, h: 1
}

export const create = handleApiCall(async(req, res) => {
    const { pageId, sourceId, type } = req.body

    const myWidget = new Widget({
        pageId: pageId,
        sourceId: sourceId,
        type: type
    })

    const myPage = await Page.findById(pageId).exec()
    const myBook = await Book.findById(myPage.bookId).exec()
    await auth.hasEditAccess(req.user._id, myBook)
    const mySource = await Source.findById(sourceId).exec()
    addDefaultsToWidget(myWidget, mySource)

    await myWidget.validate()
    const newWidget = await Widget.create(myWidget)
    myPage.layout.push(Object.assign({}, widgetLayout, { i: newWidget._id }))
    await myPage.updateOne(myPage).exec()
    
    widgetSocket.onAddOrChange(newWidget)
    pageSocket.onAddOrChange(myPage)
    utils.handleResponse(res)(newWidget._id)
})

const canUserEdit = async(pageId: string, userId: string): Promise<void> => {
    const myPage = await Page.findById(pageId).exec()
    const myBook = await Book.findById(myPage.bookId).exec()
    await auth.hasEditAccess(userId, myBook)
}

export const createMultiple = handleApiCall(async(req, res) => {
    const pageId: string = req.body.pageId
    const sourceId: string = req.body.sourceId
    const types: string[] = req.body.types

    const myWidgets = types.map(type => new Widget({
        pageId,
        sourceId,
        type
    }))

    await canUserEdit(pageId, req.user._id)
    const mySource = await Source.findById(sourceId).exec()
    myWidgets.forEach(myWidget => addDefaultsToWidget(myWidget, mySource))

    await Promise.all(myWidgets.map(w => w.validate()))
    const createdList = await Promise.all(myWidgets.map(w => Widget.create(w)))
    const myPage = await Page.findById(pageId)
    createdList.forEach(newWidget => {
        myPage.layout.push(Object.assign({}, widgetLayout, { i: newWidget._id }))
    })

    await myPage.updateOne(myPage).exec()
    await widgetSocket.onManyAdd(createdList)
    pageSocket.onAddOrChange(myPage)
    utils.handleResponse(res)(createdList.map(w => w._id))
})

const addDefaultsToWidget = (myWidget: WidgetDoc, mySource: SourceDoc) => {
    if (myWidget.get('type') === 'histogram') {
        myWidget.set('dimensions', [getDefaultColumn('number', mySource)])
    } else if (myWidget.get('type') === 'scatter') {
        myWidget.set('dimensions', [
            getDefaultColumn('number', mySource),
            getDefaultColumn('number', mySource),
        ])
    } else if (myWidget.get('type') === 'line') {
        myWidget.set('dimensions', [
            getDefaultColumn('datetime', mySource),
            { formula: 'sum', ref: getDefaultColumn('number', mySource, true) }
        ])
    } else {
        myWidget.set('dimensions', [
            getDefaultColumn('group', mySource),
            { formula: 'sum', ref: getDefaultColumn('number', mySource, true) }
        ])
    }
}

export const getDefaultColumn = (type: string, source: SourceDoc, includeCount?: boolean): string => {
    const cols = source.get('columns').filter(col => col.type === type)
    if (includeCount) {
        cols.push({
            ref: 'count',
            name: 'Count(*)',
            type: 'number'
        })
    }
    return cols[Math.floor(Math.random() * cols.length)].ref
}

export const remove = handleApiCall(async(req, res) => {
    const { id, pageId, bookId } = req.params

    const myBook = await Book.findById(bookId).exec()
    await auth.hasEditAccess(req.user._id, myBook)
    const myPage = await Page.findById(pageId).exec()

    myPage.layout = myPage.layout.filter(item => item.i !== id)
    await myPage.updateOne(myPage).exec()
    Widget.findByIdAndDelete(id).exec()

    pageSocket.onAddOrChange(myPage)
    widgetSocket.onDelete({ _id: id, pageId })
    utils.handleResponseNoData(res)()
})

export const update = handleApiCall(async(req, res) => {
    const myWidget = new Widget(req.body)
    const myId: string = req.body._id
    delete req.body._id

    await myWidget.validate()
    const myPage = await Page.findById(myWidget.pageId).exec()
    const myBook = await Book.findById(myPage.bookId).exec()

    await auth.hasEditAccess(req.user._id, myBook)
    await Widget.findByIdAndUpdate(myId, req.body).exec()

    widgetSocket.onAddOrChange(myWidget)
    utils.handleResponseNoData(res)()
})

export const get = handleApiCall(async(req, res) => {
    const myId: string = req.params.id

    const myWidget = await Widget.findById(myId)
    const myPage = await Page.findById(myWidget.pageId)
    const myBook = await Book.findById(myPage.bookId)

    await auth.hasViewerAccess(req.user._id, myBook)
    utils.handleResponse(res)(myWidget)
})

