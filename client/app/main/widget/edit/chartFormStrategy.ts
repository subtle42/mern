import { FormCtrlGroup } from '../../../_common/validation'
import { histogramForm } from './histogram'
import { barGroupForm } from './barGrouped'
import { scatterForm } from './scatter'
import * as React from 'react'

export const chartFormStrategy: {[key: string]: (rules: FormCtrlGroup, setRules: React.Dispatch<React.SetStateAction<FormCtrlGroup>>) => React.JSX.Element} = {
    histogram: histogramForm,
    barGroup: barGroupForm,
    scatter: scatterForm,
    line: scatterForm
}
