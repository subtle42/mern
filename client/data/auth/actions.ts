import axios, { AxiosPromise, AxiosAdapter } from "axios";
import store from "../store";
import bookActions from "../books/actions";
import pageActions from "../pages/actions";
import widgetActions from "../widgets/actions";
import sourceActions from "../sources/actions";
import { IUser } from "common/models";
import * as promise from "bluebird";


class AuthActions {
    private nameSpace = "auth";

    constructor(
        private store
    ) {}

    private sendDispatch(type:string, payload:any):promise<void> {
        return this.store.dispatch(new promise((resolve) => {
            resolve({
                type,
                payload,
                namespace: this.nameSpace
            });
        }));
    }

    create(user:{email:string, password:string, name:string}):AxiosPromise<string> {
        return axios.post("/api/user", user)
        .then(res => res.data);
    }

    update(user:IUser):Promise<void> {
        return axios.put("/api/user", user)
        .then(res => this.setUser(user));
    }

    private setAuths(token:string):void {
        axios.defaults.headers.common['Authorization'] = token;
        document.cookie = `authToken=${token}`;
    }

    private getCookieAuth():string|void {
        const myCookies = document.cookie.split(";");
        console.log("COOKIES: ", myCookies);
        return myCookies.filter(cookie => {
            return cookie.trim().indexOf("authToken") === 0; 
        })[0];
    }

    preloadUser():void {
        const token = this.getCookieAuth();
        if (!token) return;
        this.loadConnections(token.split("=")[1]);
    }

    private loadConnections(token:string):Promise<void> {
        return this.setToken(token)
        .then(() => this.me())
        .then(() => bookActions.connect(token))
        .then(() => pageActions.connect(token))
        .then(() => bookActions.joinRoom(this.store.getState().auth.me._id))
        .then(() => {
            const store = this.store.getState()
            if (!store.books) return;
            return pageActions.joinRoom(store.books.selected._id);
        })
    }

    login(email:string, password:string):Promise<void> {
        return axios.post("/api/auth/local", {
            email,
            password,
        })
        .then(res => this.loadConnections(res.data.token));
    }

    logout():Promise<void> {
        return axios.get("/api/auth/logout")
        .then(() => this._logout())
        .then(() => promise.all([
            bookActions.disconnect(),
        ]))
        .then(() => {
            axios.defaults.headers.common['Authorization'] = undefined;
            this.deleteAuthCookie();
        })
        .then(() => this.setUser(undefined))
        .then(() => bookActions.disconnect())
        .then(() => pageActions.disconnect());
    }

    private deleteAuthCookie() {
        this.deleteCookie("authToken");
    }

    private deleteCookie(name:string) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }

    private _logout():promise<void> {
        return this.sendDispatch("logout", undefined);
    }

    private setUser(user:IUser):promise<void> {
        return this.sendDispatch("set_user", user);
    }

    private setToken(token:string):promise<void> {
        this.setAuths(token);
        return this.sendDispatch("set_token", token);
    }

    private me():Promise<void> {
        return axios.get("/api/user/me")
        .then(res => res.data)
        .then(user => this.setUser(user));
    }
}

const authActions = new AuthActions(store);

export default authActions;