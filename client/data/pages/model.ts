import {IPage} from "myModels";
import {GenericStore} from "../baseReducer"

export default class PageStore extends GenericStore {
    list:IPage[] = [];
    selected?:IPage;
}
