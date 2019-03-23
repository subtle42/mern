import { FormCtrlGroup } from '../../../_common/validation'
import { histogramForm } from './histogram'
import { barGroupForm } from './barGrouped'
import { scatterForm } from './scatter';

export const chartFormStrategy: {[key: string]: (rules: FormCtrlGroup, setRules: React.Dispatch<React.SetStateAction<FormCtrlGroup>>) => JSX.Element} = {
    histogram: histogramForm,
    barGroup: barGroupForm,
    scatter: scatterForm
}
