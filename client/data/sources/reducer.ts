import {AnyAction} from "redux";
import {factory, GenericStore} from "../baseReducer";

class SourceStore implements GenericStore {
    list:string[] = []
}

const possibleActions:string[] = Object.keys(factory);


export default (state:SourceStore=new SourceStore(), action:AnyAction):SourceStore => {
    if (action.namespace !== "sources") return state;
    if (possibleActions.indexOf(action.type) === -1) return state;
    return factory[action.type](state, action.payload);
}