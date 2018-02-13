import axios, {AxiosPromise} from "axios";

export default {
    create(input:string):Promise<string> {
        return axios.post(`/widget`, {
            name:input
        })
        .then(res => res.data as string);
    },
    delete(page:string):Promise<void> {
        return axios.delete(`/widget/${page}`)
        .then(res => res.data as undefined);
    },
    update(page:string):Promise<void> {
        return axios.put(`/widget`, page)
        .then(res => res.data as undefined);
    }
}