import {AnyAction} from "redux";
import {factory} from "../baseReducer";
import PageStore from "./model";

const possibleActions:string[] = Object.keys(factory);

export default (state:PageStore=new PageStore(), action:AnyAction):PageStore => {
    if (action.namespace !== "pages") return state;
    if (possibleActions.indexOf(action.type) === -1) return state;
    return factory[action.type](state, action.payload);
}