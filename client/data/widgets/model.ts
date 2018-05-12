import {IWidget} from "common/models";
import {GenericStore} from "../baseReducer"

export default class PageStore extends GenericStore {
    list:IWidget[] = [];
}
