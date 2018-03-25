import {IWidget} from "myModels";
import {GenericStore} from "../baseReducer"

export default class PageStore extends GenericStore {
    list:IWidget[] = [];
}
