import {IWidget} from "common/models";
import {GenericStore} from "../baseReducer"

interface WidgetSize {
    height:number;
    width:number;
}

export default class WidgetStore extends GenericStore {
    list:IWidget[] = [];
    sizes:{} = {}
}
