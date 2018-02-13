import * as crypto from "crypto";
import * as mongoose from 'mongoose';
import {IUserModel} from "../../dbModels";
import * as Promise from "bluebird";


const authTypes = ['github', 'twitter', 'facebook', 'google'];


var UserSchema = new mongoose.Schema({
    name: {required:true, type:String},
    email: {lowercase:true, type:String, required() {
        if(authTypes.indexOf(this.provider) == -1) {
            return true;
        } else {
            return false;
        }
    }},
    password: {type:String, required() {
        if(authTypes.indexOf(this.provider) == -1) {
            return true;
        } else {
            return false;
        }
    }},
    role: {type:String, default: "user"},
    provider: String,
    salt: String,
    facebook: {},
    google: {}
});

/**
 * Virtuals
 */

// Public profile information
UserSchema
.virtual("profile")
.get(() => {
    return {
        name: this.name,
        role: this.role
    }
});
// Non-sensitive info we'll be putting in the token
UserSchema
.virtual("token")
.get(() => {
    return {
        _id: this._id,
        role: this.role
    }
});

/**
 * Validations
 */

// Validate empty email
UserSchema
.path("email")
.validate((email:string) => {
    if(authTypes.indexOf(this.provider) !== -1) {
        return true;
    }
    return email.length;

    
}, "Email cannot be blank")
// Need to use 
.validate(function(email:string/*, respond:Function*/) {
    return new Promise((resolve, reject) => {
        if(authTypes.indexOf(this.provider) !== -1) {
            return resolve(this);
        }
        this.constructor.findOne({email:email})
        .then(user => {
            if(!user) {
                resolve(this);
            }
            else {
                reject("This email address is already taken");
            }
        })
        .catch(err => {
            throw err;
        });
    });
});

UserSchema
.path("password")
.validate((password:string) => {
    if(authTypes.indexOf(this.provider) !== -1) {
        return true;
    }
    return password.length;
}, "Password cannot be blank");

UserSchema.methods = {
    authenticate(password:string):Promise<string> {
        return new Promise((resolve, reject) => {
            this.encryptPassword(password)
            .then(pwdGen => {
                if(this.password === pwdGen) {
                    resolve(this)
                } else {
                    reject("Incorrect password.");
                }
            })
        });
    },
    makeSalt(byteSize?:number):Promise<string> {
        return new Promise((resolve, reject) => {
            var defaultByteSize = 16;
            if (!byteSize) {
                byteSize = defaultByteSize;
            }

            crypto.randomBytes(byteSize,  (err, salt) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(salt.toString('base64'));
                }
            });
        })
    },
    encryptPassword(password:string):Promise<string> {
        return new Promise((resolve, reject) => {
            if(!password || !this.salt) {
                reject("Missing password or salt");
            }
            
            var defaultIterations = 10000;
            var defaultKeyLength = 64;
            var salt = new Buffer(this.salt, 'base64');
            var digest = "sha512"

            crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, digest, (err, key) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(key.toString('base64'));
                }
            });
        });
    }
};


export default mongoose.model<IUserModel>('User', UserSchema);