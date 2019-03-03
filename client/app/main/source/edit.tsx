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

import { store } from '../../../data/store'
import { ISource } from 'common/models'
import sourceActions from 'data/sources/actions'
import NotifActions from 'data/notifications/actions'
import { FormControl, FormCtrlGroup, FormCtrlArray } from '../../_common/validation'
import * as Validators from '../../_common/validators'
import * as utils from '../../_common/utils'

import { ColumnNameField } from './edit/columnName'
import { ColumnTypeDropdown } from './edit/columnType'

interface Props {
    _id: any
    done: () => void
}

export const EditSource: React.StatelessComponent<Props> = (props: Props) => {
    const toEdit: ISource = store.getState().sources.list.find(s => s._id === props._id)
    const [rules, setRules] = React.useState(new FormCtrlGroup({
        title: new FormControl(toEdit.title, [
            Validators.isRequired,
            Validators.max(30)
        ]),
        isPublic: new FormControl(toEdit.isPublic),
        columns: new FormCtrlArray(
            toEdit.columns.map(col => new FormCtrlGroup({
                name: new FormControl(col.name),
                ref: new FormControl(col.ref),
                type: new FormControl(col.type)
            }))
        )
    }))

    const save = (): void => {
        const tmp = Object.assign({}, toEdit, rules.value)
        sourceActions.update(tmp)
        .then(() => NotifActions.success(`Updated source: ${tmp.title}`))
        .then(() => props.done())
        .catch(err => NotifActions.error(err.message))
    }

    const getColumnColor = (type: string): string => {
        if (type === 'number') {
            return 'info'
        } else if (type === 'group') {
            return 'success'
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
                    <Row>
                        <Col xs={10}>
                            <ColumnNameField name={sourceCol.get('name').value}
                            update={newName => updateColumn(index, 'name', newName)} />
                        </Col>
                        <Col xs={2}>
                            <ColumnTypeDropdown
                            selectType={type => updateColumn(index, 'type', type)}
                            type={sourceCol.get('type').value} />
                        </Col>
                    </Row>
                </ListGroupItem>
            })}
        </ListGroup>
    }

    const getBody = (): JSX.Element => {
        return <ModalBody>
            <Form>
                <FormGroup row>
                    <Label xs={2}>Title:</Label>
                    <Col xs={10}>
                        <Input name='title'
                        onChange={utils.handleChange(rules, setRules)}
                        value={rules.get('title').value}
                        invalid={rules.get('title').invalid}/>
                        <FormFeedback>{utils.getError(rules.get('title'))}</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for='isPublicInput' xs={2}>
                        Is Public:
                    </Label>
                    <Col xs={10}>
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
                onClick={e => props.done()}>
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
