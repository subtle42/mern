import store from "../store";
import BaseActions from "../baseActions";
import axios from "axios";

class WidgetActions extends BaseActions{
    constructor(store) {
        super(store, "widgets");
    }

    select() {
        console.warn("This does nothing");
        return null;
    }

    create(input:string):Promise<string> {
        return axios.post(`/widget`, {
            name:input
        })
        .then(res => res.data as string);
    }
    delete(page:string):Promise<void> {
        return axios.delete(`/widget/${page}`)
        .then(res => res.data as undefined);
    }
    update(page:string):Promise<void> {
        return axios.put(`/widget`, page)
        .then(res => res.data as undefined);
    }
}

const widgetActions = new WidgetActions(store);

export default widgetActions; 