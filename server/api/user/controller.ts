import { User } from './model'
import { Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'
import config from '../../config/environment'
import { MyRequest, IUserModel } from '../../dbModels'

export class UserController {
    public static getPublic (req: MyRequest, res: Response): void {
        let userIdList = req.body
        User.find({}, '-salt -password')
        .then(users => res.json(users))
        .catch(err => res.status(500).json(err))
    }

    public static index (req: MyRequest, res: Response): void {
        User.find({}, '-salt -password')
        .then(users => res.json(users))
        .catch(err => res.status(500).json(err))
    }

    public static create (req: MyRequest, res: Response): void {
        let newUser = new User(req.body)
        newUser.provider = 'local'
        newUser.role = 'user'
        newUser.validate()
        .then(() => newUser.makeSalt())
        .then(salt => {
            newUser.salt = salt
            return newUser.encryptPassword(newUser.password)
        })
        .then(encryptedPassword => {
            newUser.password = encryptedPassword
            return newUser.save()
        })
        .then(user => {
            let tmp = { _id: user._id, role: user.role }
            let token = jwt.sign(tmp, config.shared.secret, {
                expiresIn: 60 * 60 * 5
            })
            res.json({ token })
        })
        .catch(err => {
            res.status(422).json(err)
        })
    }

    public static show (req: MyRequest, res: Response, next: NextFunction): void {
        let userId: string = req.params.id
        User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).end()
            }
            res.json(user.profile)
        })
        .catch(err => res.status(500).json(err))
    }

    public static destroy (req: MyRequest, res: Response) {
        User.findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json(err))
    }

    public static changePassword (req: MyRequest, res: Response): void {
        let userId: string = req.user._id
        let oldPass = String(req.body.oldPassword)
        let newPass = String(req.body.newPassword)
        let myUser = null

        User.findById(userId)
        .then(user => {
            myUser = user
            return user.authenticate(oldPass)
        })
        .then(() => {
            myUser.password = newPass
            return myUser.save()
        })
        .then(user => res.json())
        .catch(err => res.status(500).json(err))
    }

    public static me (req: MyRequest, res: Response) {
        let userId: string = req.user._id

        User.findOne({
            _id: userId
        }, '-salt -password')
        .then(user => {
            if (!user) {
                return res.status(401).end()
            }
            res.json(user)
        })
        .catch(err => res.status(500).json(err))
    }

    public static authCallback (req: MyRequest, res: Response) {
        res.redirect('/')
    }
}
