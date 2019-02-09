import * as chai from 'chai'
import 'chai-http'
import axios from 'axios'
import * as utils from './utils'
import { IUser } from 'common/models'
const expect = chai.expect
const offerUrl = `/api/offer`

describe('Offer API', () => {
    let server: Express.Application
    let tokens: string[]
    let userIds: string[]

    beforeEach(() => {
        return utils.testSetup()
        .then(setup => ({ server, userIds, tokens } = setup))
    })

    afterEach(() => {
        return utils.cleanDb()
    })

    describe('post /api/offer', () => {
        it('should return an error if user is NOT logged in')
        it('should throw an error if schema does NOT match')
        it('should return an id on success')
    })

    describe('put /api/offer', () => {
        it('should return an error if user is NOT logged in')
        it('should throw an error if schema does NOT match')
        it('should return an empty string on success')
    })

    describe('get /api/offer', () => {
        it('should return an error if user is NOT logged in')
        it('should return a list of all offers')
    })

    describe('get /api/offer/:id', () => {
        it('should return an error if user is NOT logged in')
        it('should return an error if record does NOT exist')
        it('should return the offer with the correct id')
    })

    describe('delete /api/offer', () => {
        it('should return an error if user is NOT admin')
        it('should return an error if record does NOT exist')
        it('should an empty string on success')
    })
})

describe('Offer Websocket', () => {
    let server: Express.Application
    let tokens: string[]
    let userIds: string[]

    beforeEach(() => {
        return utils.testSetup()
        .then(setup => ({ server, userIds, tokens } = setup))
    })

    afterEach(() => {
        return utils.cleanDb()
    })
})
