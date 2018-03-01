import {ISource} from "myModels";
import {GenericStore} from "../baseReducer"

export default class SourceStore extends GenericStore {
    list:ISource[] = [];
}
