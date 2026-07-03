import { IUser, User } from './model'
import { FastifyReply, FastifyRequest } from 'fastify'

export const getPublic = async(
    req: FastifyRequest,
    res: FastifyReply<{Reply: IUser[]}>
) => {
    const users = await User.find({}, '-salt -password')
    res.send(users.map(x => x.toJSON()))
}

export const create = async(
    req: FastifyRequest,
    res: FastifyReply
) => {
    const newUser = new User(req.body)
    newUser.provider = 'local'
    newUser.role = 'user'
    await newUser.validate()
    newUser.salt = await newUser.makeSalt()
    newUser.password = await newUser.encryptPassword(newUser.password)
    await newUser.save()
    res.send()

    // const tmp = { _id: myUser._id, role: myUser.role }
    // const token = jwt.sign(tmp, config.shared.secret, {
    //     expiresIn: 60 * 60 * 5
    // })
    // res.json({ token })
}

export const show = async(
    req: FastifyRequest<{Params: {id: string}}>,
    res: FastifyReply<{Reply: {name: string, role: string}}>
) => {
    const userId: string = req.params.id
    const myUser = await User.findById(userId)
    if (!myUser) throw Error('Unable to find user')
    res.send(myUser.profile)
}

export const destroy = async(
    req: FastifyRequest<{Params: {id: string}}>,
    res: FastifyReply
) => {
    await User.findByIdAndDelete(req.params.id)
    res.status(204).send()
}

export const changePassword = async(
    req: FastifyRequest<{Body: {oldPassword: string, newPassword: string}}>,
    res: FastifyReply<{Reply: void}>
) => {
    const userId: string = req.user._id
    const oldPass = String(req.body.oldPassword)
    const newPass = String(req.body.newPassword)
    const myUser = await User.findById(userId)
    
    await myUser.authenticate(oldPass)
    myUser.password = newPass
    await myUser.save()
    res.send()
}

export const me = async(
    req: FastifyRequest,
    res: FastifyReply<{Reply: IUser}>
) => {
    const userId: string = req.user._id
    const myUser = await User.findOne({
        _id: userId
    }, '-salt -password')
    
    if (!myUser) throw new Error(`unable to find user: ${req.user._id}`)
    res.send(myUser)
}
