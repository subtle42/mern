import {AnyAction} from "redux";
import {factory, GenericStore} from "../baseReducer";

class WidgetStore implements GenericStore {
    list:string[] = []
}

const possibleActions:string[] = Object.keys(factory);


export default (state:WidgetStore=new WidgetStore(), action:AnyAction):WidgetStore => {
    if (action.namespace !== "widgets") return state;
    if (possibleActions.indexOf(action.type) === -1) return state;
    return factory[action.type](state, action.payload);
}