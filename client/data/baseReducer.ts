export class GenericStore {
    list:any[];
    socket?:SocketIOClient.Socket;
    selected?:any;
}

export const factory = {
    addedOrChanged: (state:GenericStore, payload:any[]):GenericStore => {
        state = {...state};
        state.list = [...state.list];
        payload.forEach(page => {
            if (state.list.indexOf(page) === -1) {
                state.list.push(page);
            }
        })
        return state;
    },
    select: (state:GenericStore, payload:any):GenericStore => {
        return {...state, selected:payload};
    },
    removed: (state:GenericStore, payload:string[]):GenericStore => {
        state = {...state};
        state.list = state.list.filter(item => payload.indexOf(item._id) === -1);
        return state;
    },
    storeSocket: (state:GenericStore, payload:SocketIOClient.Socket):GenericStore => {
        return {...state, socket:payload};
    },
    disconnect: (state:GenericStore, payload:undefined):GenericStore => {
        return new GenericStore();
    },
    joinRoom: (state:GenericStore, payload:string):GenericStore => {
        return {...state, list:[]};
    }
}