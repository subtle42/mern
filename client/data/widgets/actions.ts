import store from "../store";
import BaseActions from "../baseActions";
import axios from "axios";
import pageActions from "../pages/actions"
import { ISource, IWidget } from "myModels";

class WidgetActions extends BaseActions{
    constructor(store) {
        super(store, "widgets");
    }

    select() {
        console.warn("This does nothing");
        return null;
    }

    create(config:{source:ISource, type:string}):Promise<void> {
        const myPage = store.getState().pages.selected;
        
        return axios.post(`/api/widgets`, {
            pageId: myPage._id,
            sourceId: config.source._id,
            type: config.type
        })
        .then(res => undefined);
        // Doing spreads do not modify the store
        // myPage.layout = [...myPage.layout];
        // myPage.layout.push({
        //     i: (myPage.layout.length +1).toString(),
        //     x:0,
        //     y:0,
        //     w:1,
        //     h:1
        // });

        // return pageActions.update(myPage);
    }
    delete(id:string):Promise<void> {
        return axios.delete(`/api/widgets/${id}`)
        .then(res => res.data as undefined);
    }
    update(widget:IWidget):Promise<void> {
        return axios.put(`/api/widgets`, widget)
        .then(res => res.data as undefined);
    }
}

const widgetActions = new WidgetActions(store);

export default widgetActions; 