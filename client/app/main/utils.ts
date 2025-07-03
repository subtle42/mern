import { myNotifActions } from "../../data/notifications/actions"

export const handleAsync = async(myFn: (...inputs) => void) => {
    return async(...inputs) => {
        try {
            myFn(...inputs)
        }
        catch(err: any) {
            myNotifActions.error(err.message || err)
        }
    }
}