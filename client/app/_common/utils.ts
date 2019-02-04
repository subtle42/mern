import { FormCtrlGroup, FormControl, FormCtrlArray } from "./validation";


export const handleChange = (event, schema: FormCtrlGroup | FormControl | FormCtrlArray) => {
    const target: any = event.target
    target.name.split('.').forEach(attr => {
        if (attr.indexOf('[') !== -1) {
            const firstPart = attr.split('[')[0]
            const index: number = parseInt(this.getBracketValue.exec(attr)[1])
            schema = schema.controls[firstPart]
            schema = schema.controls[index]
        } else {
          schema = schema.controls[attr]
        }
    })
    schema.value = target.value
}