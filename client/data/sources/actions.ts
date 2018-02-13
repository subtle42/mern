import store from "../store";
import BaseActions from "../baseActions";
import axios from "axios";

class SourceActions extends BaseActions{
    constructor(store) {
        super(store, "sources");
    }

    select() {
        console.warn("This does nothing");
        return null;
    }

    create(input:string):Promise<any> {
        return axios.post(`/source`, {
            name:input
        })
        .then(res => res.data);
    }
    delete(page:string):Promise<void> {
        return axios.delete(`/source/${page}`)
        .then(res => res.data as undefined);
    }
    
    update(page:string):Promise<void> {
        return axios.put(`/source`, page)
        .then(res => res.data as undefined);
    }
}

const sourceActions = new SourceActions(store);

export default sourceActions; 