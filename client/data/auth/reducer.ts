import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IUser } from '@mern/server/api/user/model'

class AuthStore {
    token?: string
    me?: IUser
}

export const AuthSlice = createSlice({
    name: 'auth',
    initialState: new AuthStore(),
    reducers: {
        set_token: (state, {payload}: PayloadAction<string>) => {
            return { ...state, token: payload }
        },
        set_user: (state, {payload}: PayloadAction<IUser>) => {
            return { ...state, me: payload }
        },
        logout: () => {
            return new AuthStore()
        }
    }
})

export const authCmds = AuthSlice.actions