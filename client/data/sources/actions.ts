import store from "../store";
import BaseActions from "../baseActions";
import axios from "axios";
import {ISource} from "myModels";

class SourceActions extends BaseActions{
    constructor(store) {
        super(store, "sources");
    }

    select() {
        console.warn("This does nothing");
        return null;
    }

    create(file:File):Promise<string> {
        return axios.post(`/source`, file)
        .then(res => res.data);
    }
    delete(sourceId:string):Promise<void> {
        return axios.delete(`/source/${sourceId}`)
        .then(res => res.data as undefined);
    }
    
    update(page:ISource):Promise<void> {
        return axios.put(`/source`, page)
        .then(res => res.data as undefined);
    }
}

const sourceActions = new SourceActions(store);

export default sourceActions; 