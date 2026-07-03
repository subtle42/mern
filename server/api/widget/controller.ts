import { IWidget, Widget, WidgetDoc } from './model'
import { Page } from '../page/model'
import { Book } from '../book/model'
import { Source, SourceDoc } from '../source/model'
import { pageSocket } from '../page/socket'
import { widgetSocket } from './socket'
// import { Layout } from 'react-grid-layout'
import { FastifyReply, FastifyRequest } from 'fastify'

const widgetLayout = {
    x: 0, y: 0, w: 1, h: 1
}

export const create = async(
    req: FastifyRequest<{Body: {pageId: string, sourceId: string, type: string}}>,
    res: FastifyReply<{Reply: string}>
) => {
    const { pageId, sourceId, type } = req.body

    const myWidget = new Widget({
        pageId: pageId,
        sourceId: sourceId,
        type: type
    })

    const myPage = await Page.findById(pageId).exec()
    const myBook = await Book.findById(myPage.bookId).exec()
    myBook.hasEditAccess(req.user._id)
    const mySource = await Source.findById(sourceId).exec()
    addDefaultsToWidget(myWidget, mySource)

    await myWidget.validate()
    const newWidget = await Widget.create(myWidget)
    myPage.layout.push(Object.assign({}, widgetLayout, { i: newWidget._id }))
    await myPage.updateOne(myPage).exec()
    
    widgetSocket.onAddOrChange(newWidget)
    pageSocket.onAddOrChange(myPage)
    res.send(newWidget._id.toString())
}

const canUserEdit = async(pageId: string, userId: string): Promise<void> => {
    const myPage = await Page.findById(pageId).exec()
    const myBook = await Book.findById(myPage.bookId).exec()
    myBook.hasEditAccess(userId)
}

export const createMultiple = async(
    req: FastifyRequest<{Body: {pageId: string, sourceId: string, types: string[]}}>,
    res: FastifyReply<{Reply: string[]}>
) => {
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
    res.send(createdList.map(w => w._id.toString()))
}

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

export const remove = async(
    req: FastifyRequest<{Params: {id: string, pageId: string, bookId: string}}>,
    res: FastifyReply
) => {
    const { id, pageId, bookId } = req.params

    const myBook = await Book.findById(bookId).exec()
    myBook.hasEditAccess(req.user._id)
    const myPage = await Page.findById(pageId).exec()

    myPage.layout = myPage.layout.filter(item => item.i !== id)
    await myPage.updateOne(myPage).exec()
    Widget.findByIdAndDelete(id).exec()

    pageSocket.onAddOrChange(myPage)
    widgetSocket.onDelete({ _id: id, pageId })
    res.send()
}

export const update = async(
    req: FastifyRequest<{Body: {_id: string}}>,
    res: FastifyReply<{Reply: void}>
) => {
    const myWidget = new Widget(req.body)
    const myId: string = req.body._id
    delete req.body._id

    await myWidget.validate()
    const myPage = await Page.findById(myWidget.pageId).exec()
    const myBook = await Book.findById(myPage.bookId).exec()

    myBook.hasEditAccess(req.user._id)
    await Widget.findByIdAndUpdate(myId, req.body).exec()

    widgetSocket.onAddOrChange(myWidget)
    res.send()
}

export const get = async(
    req: FastifyRequest<{Params: {id: string}}>,
    res: FastifyReply<{Reply: IWidget}>
) => {
    const myId: string = req.params.id

    const myWidget = await Widget.findById(myId)
    const myPage = await Page.findById(myWidget.pageId)
    const myBook = await Book.findById(myPage.bookId)

    myBook.hasViewerAccess(req.user._id)
    res.send(myWidget)
}
