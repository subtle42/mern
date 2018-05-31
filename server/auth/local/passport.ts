import * as passport from 'passport';
import {Request, Response, NextFunction} from "express";
import {signToken} from "../auth.service";
import {Strategy as LocalStrategy} from 'passport-local';

export default class LocalAuth {
    private static localAuthenticate(User, email:string, password:string, done:Function):void {
        User.findOne({
            email:email.toLocaleLowerCase()
        })
        .then(user => {
            if(!user) return Promise.reject({message: "This email is not registered"});
            return user.authenticate(password)
        })
        .then(user => done(null, user))
        .catch(err => done(err, false));
    }

    static setup(User) {
        passport.use(new LocalStrategy({
            usernameField: "email",
            passwordField: "password"
        }, (email:string, password:string, done:Function) => {
            return this.localAuthenticate(User, email, password, done);
        }));
    }

    static authenticate(req:Request, res: Response, next:NextFunction) {
        passport.authenticate("local", (err, user) => {
            if (err) {
                return res.status(401).json(err);
            }
            if (!user) {
                return res.status(404).json({
                    message: 'Something went wrong, please try again.'
                });
            }
            var token = signToken(user._id, user.role);
            res.json({token});
        })(req, res, next);
    }
}