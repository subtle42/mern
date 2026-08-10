


export default abstract class BaseActions {
    constructor (
        protected store,
        private nameSpace: string
    ) {}

    protected sendDispatch (type: string, payload: any): Promise<void> {
        return this.store.dispatch(new Promise((resolve) => {
            resolve({
                type: `${this.nameSpace}/${type}`,
                payload,
            })
        }))
    }


    protected _select (id: string): Promise<void> {
        return this.sendDispatch(`select`, id)
    }

    abstract select (id: string): Promise<void>
    abstract create (item: any): Promise<any>
    abstract update (item: any): Promise<any>
    abstract delete (item: any): Promise<void>
}
