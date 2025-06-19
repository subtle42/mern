import { User } from './model'
import * as jwt from 'jsonwebtoken'
import config from '../../config/environment'
import * as utils from '../utils'
import { handleApiCall } from '../utils'

export const getPublic = handleApiCall(async(req, res) => {
    const users = await User.find({}, '-salt -password')
    utils.handleResponse(res)(users.map(x => x.toJSON()))
})

export const index = handleApiCall(async(req, res) => {
    const users = await User.find({}, '-salt -password')
    utils.handleResponse(res)(users.map(x => x.toJSON()))
})

export const create = handleApiCall(async(req, res) => {
    const newUser = new User(req.body)
    newUser.provider = 'local'
    newUser.role = 'user'
    await newUser.validate()
    newUser.salt = await newUser.makeSalt()
    newUser.password = await newUser.encryptPassword(newUser.password)
    const myUser = await newUser.save()

    const tmp = { _id: myUser._id, role: myUser.role }
    const token = jwt.sign(tmp, config.shared.secret, {
        expiresIn: 60 * 60 * 5
    })
    res.json({ token })
})

export const show = handleApiCall(async(req, res) => {
    const userId: string = req.params.id
    const myUser = await User.findById(userId)
    if (!myUser) return res.status(404).end()
    res.json(myUser.profile)
})

export const destroy = handleApiCall(async(req, res) => {
    await User.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

export const changePassword = handleApiCall(async(req, res) => {
    const userId: string = req.user._id
    const oldPass = String(req.body.oldPassword)
    const newPass = String(req.body.newPassword)
    const myUser = await User.findById(userId)
    
    await myUser.authenticate(oldPass)
    myUser.password = newPass
    await myUser.save()
    utils.handleNoResult(res)()
})

export const me = handleApiCall(async(req, res) => {
    const userId: string = req.user._id

    const myUser = await User.findOne({
        _id: userId
    }, '-salt -password')
    if (!myUser) {
        return res.status(401).end()
    }
    res.json(myUser)
})
