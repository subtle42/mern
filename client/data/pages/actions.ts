import axios from "axios";
import store from "../store";
import {IPage} from "myModels";
import BaseActions from "../baseActions";
import WidgetActions from "../widgets/actions";

class PageActions extends BaseActions{
    constructor(store) {
        super(store, "pages");
    }

    select(page:IPage) {
        return this._select(page)
        .then(() => WidgetActions.joinRoom(page._id));
        // WidgetActions.joinRoom(page._id);
    }

    mySelect(pageId:string) {
        let myPage = this.store.getState().pages.list.filter(x => x._id === pageId)[0];
        this.select(myPage);
    }

    create(input:string):Promise<string> {
        return axios.post(`/api/pages`, {
            name: input,
            bookId: this.store.getState().books.selected._id
        })
        .then(res => res.data as string);
    }

    delete(page:string):Promise<void> {
        return axios.delete(`/api/pages/${page}`)
        .then(res => res.data as undefined);
    }

    update(page:IPage):Promise<void> {
        return axios.put(`/api/pages`, page)
        .then(res => res.data as undefined);
    }
}

const myPageActions = new PageActions(store);

export default myPageActions; 