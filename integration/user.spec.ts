import * as chai from 'chai'
import 'chai-http'
import * as utils from './utils'
import { IUser } from 'common/models'
const expect = chai.expect

describe('User API', () => {
    const userName = 'test'
    const email = 'test@test.com'
    const password = 'testPass'
    let server: Express.Application
    let tokens: string[]
    let userIds: string[]

    before(done => {
        utils.testSetup()
        .then(setup => ({ server, userIds, tokens } = setup))
        .then(() => done())
    })

    after(done => {
        utils.cleanDb()
        .then(() => done())
    })

    describe('post /api/user', () => {
        it('should create a user', done => {
            chai.request(server)
            .post('/api/user')
            .send({
                name: userName,
                email: email,
                password: password
            })
            .then(res => expect(res.status).to.equal(200))
            .then(() => done())
        })

        it('should not create a user if the email already exists', done => {
            chai.request(server)
            .post('/api/user')
            .send({
                name: userName,
                email: email,
                password: password
            })
            .then(res => expect(res.status).not.to.equal(200))
            .then(() => done())
        })
    })

    describe('get /api/user/me', () => {
        let token: string
        const myUser = utils.USERS[1]

        before(() => {
            token = tokens[1]
        })

        it('should return an error user if is NOT logged in', done => {
            chai.request(server)
            .get('/api/user/me')
            .then(res => expect(res.status).to.equal(401))
            .then(() => done())
        })

        it("should get current user's info", done => {
            chai.request(server)
            .get('/api/user/me')
            .set('Authorization', token)
            .then(res => {
                expect(res.status).to.equal(200)
                const user: IUser = res.body
                expect(user.email).to.equal(myUser.email)
                expect(user.name).to.equal(myUser.name)
            })
            .then(() => done())
        })
    })
})
