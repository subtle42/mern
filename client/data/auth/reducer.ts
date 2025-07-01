import { AnyAction } from 'redux'
import { IUser } from 'common/models'
import AuthStore from './model'
import { Socket } from 'socket.io-client'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


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
        set_socket: (state, {payload}: PayloadAction<Socket>) => {
            return { ...state, socket: payload }
        },
        logout: () => {
            return new AuthStore()
        }
    }
})