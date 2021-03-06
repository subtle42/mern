import * as React from 'react'
import Button from 'reactstrap/lib/Button'
import Input from 'reactstrap/lib/Input'
import ListGroup from 'reactstrap/lib/ListGroup'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import Form from 'reactstrap/lib/Form'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import CustomInput from 'reactstrap/lib/CustomInput'

import { store } from 'data/store'
import { ISource } from 'common/models'
import sourceActions from 'data/sources/actions'
import NotifActions from 'data/notifications/actions'
import { FormControl, FormCtrlGroup, FormCtrlArray } from '../../../_common/validation'
import * as Validators from '../../../_common/validators'
import * as utils from '../../../_common/utils'

import { ColumnNameField } from './columnName'
import { ColumnTypeDropdown } from './columnType'

interface Props {
    source: ISource
    onDone: () => void
}

export const SourceDetails: React.FunctionComponent<Props> = (props: Props) => {
    const [rules, setRules] = React.useState(new FormCtrlGroup({
        title: new FormControl(props.source.title, [
            Validators.isRequired,
            Validators.max(30)
        ]),
        isPublic: new FormControl(props.source.isPublic),
        columns: new FormCtrlArray(
            props.source.columns.map(col => new FormCtrlGroup({
                name: new FormControl(col.name),
                ref: new FormControl(col.ref),
                type: new FormControl(col.type)
            }))
        )
    }))

    const save = (): void => {
        const tmp = Object.assign({}, props.source, rules.value)
        sourceActions.update(tmp)
        .then(() => NotifActions.success(`Updated source: ${tmp.title}`))
        .then(() => props.onDone())
        .catch(err => NotifActions.error(err.message))
    }

    const getColumnColor = (type: string): string => {
        if (type === 'number') {
            return 'info'
        } else if (type === 'group') {
            return 'success'
        } else if (type === 'datetime') {
            return 'warning'
        }
        return ''
    }

    const updateColumn = (index: number, field: string, value: string) => {
        rules.get('columns').get(index).get(field).value = value
        setRules(Object.create(rules))
    }

    const renderColumns = (columns: FormCtrlGroup[]): JSX.Element => {
        return <ListGroup style={{ height: 300, overflowY: 'auto' }}>
            {columns.map((sourceCol, index) => {
                return <ListGroupItem
                    color={getColumnColor(sourceCol.get('type').value)}
                    key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <ColumnNameField name={sourceCol.get('name').value}
                            update={newName => updateColumn(index, 'name', newName)} />
                        <ColumnTypeDropdown
                            selectType={type => updateColumn(index, 'type', type)}
                            type={sourceCol.get('type').value} />
                    </div>
                </ListGroupItem>
            })}
        </ListGroup>
    }

    const getBody = (): JSX.Element => {
        return <ModalBody>
            <Form>
                <FormGroup row>
                    <Label xs={3}>Title:</Label>
                    <Col xs={9}>
                        <Input name='title'
                        onChange={utils.handleChange(rules, setRules)}
                        value={rules.get('title').value}
                        invalid={rules.get('title').invalid}/>
                        <FormFeedback>{utils.getError(rules.get('title'))}</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for='isPublicInput' xs={3}>
                        Is Public:
                    </Label>
                    <Col xs={9}>
                        <CustomInput id='isPublic'
                            type='switch'
                            name='isPublic'
                            onChange={utils.handleToggle(rules, setRules)}
                            checked={rules.get('isPublic').value}>
                        </CustomInput>
                    </Col>
                </FormGroup>
                <Row>
                    <Col xs={12}>
                        {renderColumns(rules.get('columns').controls as FormCtrlGroup[])}
                    </Col>
                </Row>
            </Form>
        </ModalBody>
    }

    const getFooter = (): JSX.Element => {
        return <ModalFooter>
            <Button color='primary' onClick={e => save()}>Save</Button>
            <Button color='secondary'
                onClick={e => props.onDone()}>
                Cancel
            </Button>
        </ModalFooter>
    }

    return <div>
        <ModalHeader>Edit Source</ModalHeader>
        {getBody()}
        {getFooter()}
    </div>
}
