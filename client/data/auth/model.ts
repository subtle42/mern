import { IUser } from 'common/models'

export default class AuthStore {
    token?: string
    me?: IUser
}
