import store from "../store";
import BaseActions from "../baseActions";
import axios from "axios";
import pageActions from "../pages/actions"

class WidgetActions extends BaseActions{
    constructor(store) {
        super(store, "widgets");
    }

    select() {
        console.warn("This does nothing");
        return null;
    }

    create():Promise<void> {
        // return axios.post(`/widget`, {
        //     name:input
        // })
        // .then(res => res.data as string);
        let myPage = {...store.getState().pages.selected};
        // Doing spreads do not modify the store
        myPage.layout = [...myPage.layout];
        myPage.layout.push({
            _id: myPage.layout.length +1,
            x:0,
            y:0,
            w:1,
            h:1
        });

        return pageActions.update(myPage);
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