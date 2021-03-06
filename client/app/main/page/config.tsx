import * as React from 'react'
import Modal from 'reactstrap/lib/Modal'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import Label from 'reactstrap/lib/Label'
import Tooltip from 'reactstrap/lib/Tooltip'
import Button from 'reactstrap/lib/Button'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import CustomInput from 'reactstrap/lib/CustomInput'
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import Form from 'reactstrap/lib/Form'
import FormGroup from 'reactstrap/lib/FormGroup'
import Card from 'reactstrap/lib/Card'
import CardTitle from 'reactstrap/lib/CardTitle'
import * as FontAwesome from 'react-fontawesome'

import PageActions from 'data/pages/actions'
import NotifActions from 'data/notifications/actions'
import { store } from 'data/store'
import { IPage } from 'common/models'

import { FormCtrlGroup, FormControl, FormCtrlArray } from '../../_common/validation'
import * as utils from '../../_common/utils'
import * as Validators from '../../_common/validators'
import { usePages } from '../../_common/hooks'
import './page.css'

interface Props {
    _id?: string
}

export const PageConfigButton: React.FunctionComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [tips, setTips] = React.useState({
        draggable: false,
        resizable: false,
        rearrangeable: false
    })
    const [rules, setRules] = React.useState(new FormCtrlGroup({
        name: new FormControl('', [
            Validators.isRequired,
            Validators.minLength(3),
            Validators.maxLength(15)
        ]),
        isDraggable: new FormControl(false),
        isResizable: new FormControl(false),
        preventCollision: new FormControl(false),
        margin: new FormCtrlArray([
            new FormControl(0, [
                Validators.isRequired,
                Validators.min(0),
                Validators.max(100)
            ]),
            new FormControl(0, [
                Validators.isRequired,
                Validators.min(0),
                Validators.max(100)
            ])
        ]),
        containerPadding: new FormCtrlArray([
            new FormControl(0, [
                Validators.isRequired,
                Validators.min(0),
                Validators.max(100)
            ]),
            new FormControl(0, [
                Validators.isRequired,
                Validators.min(0),
                Validators.max(100)
            ])
        ]),
        cols: new FormControl(1, [
            Validators.isRequired,
            Validators.min(1),
            Validators.max(30)
        ])
    }))
    const pages = usePages()

    const open = () => {
        rules.value = store.getState().pages.list
            .find(page => page._id === props._id)
        setOpen(true)
    }

    const close = () => {
        const page: IPage = store.getState().pages.list
            .find(page => page._id === props._id)
        const tmp = Object.assign({}, page, rules.value)
        PageActions.update(tmp)
        .then(() => NotifActions.notify('success', 'Page updated'))
        .then(() => setOpen(false))
        .catch(err => NotifActions.notify('danger', err.message))
    }

    const toggleTooltip = (loc: string): void => {
        tips[loc] = !tips[loc]
        setTips({ ...tips })
    }

    const getFormTemplate = (): JSX.Element => {
        return <Form style={{ margin: 0 }}>
            <Row>
                <Col xs={6}>
                    <FormGroup>
                        <Label>Name</Label>
                        <Input
                            type='text'
                            name='name'
                            placeholder='Enter Name'
                            value={rules.get('name').value}
                            invalid={rules.get('name').invalid}
                            onChange={utils.handleChange(rules, setRules)} />
                        <FormFeedback>{utils.getError(rules.get('name'))}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col xs={6}>
                    <FormGroup>
                        <Label>Column Count</Label>
                        <Input
                            type='number'
                            min={1}
                            max={30}
                            value={rules.get('cols').value}
                            invalid={rules.get('cols').invalid}
                            onChange={utils.handleChange(rules, setRules)}
                            name='cols' />
                        <FormFeedback>{utils.getError(rules.get('cols'))}</FormFeedback>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Card body style={{ padding: 10 }}>
                        <CardTitle style={{ display: 'flex', justifyContent: 'center' }}>
                            Widget Padding
                        </CardTitle>
                        <Row>
                            <Col xs={6}>
                                <Label>Sides</Label>
                                <Input
                                    type='number'
                                    min={0}
                                    max={100}
                                    value={rules.get('margin').get(0).value}
                                    invalid={rules.get('margin').get(0).invalid}
                                    onChange={utils.handleChange(rules, setRules)}
                                    name='margin[0]' />
                                <FormFeedback>{utils.getError(rules.get('margin').get(0))}</FormFeedback>
                            </Col>
                            <Col xs={6}>
                                <Label>Vertical</Label>
                                <Input
                                    type='number'
                                    min={0}
                                    max={100}
                                    value={rules.get('margin').get(1).value}
                                    invalid={rules.get('margin').get(1).invalid}
                                    onChange={utils.handleChange(rules, setRules)}
                                    name='margin[1]' />
                                <FormFeedback>{utils.getError(rules.get('margin').get(1))}</FormFeedback>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs ={6}>
                    <Card body style={{ padding: 10 }}>
                        <CardTitle style={{ display: 'flex', justifyContent: 'center' }}>
                            Page Margins
                        </CardTitle>
                        <Row>
                            <Col xs={6}>
                                <Label>Sides</Label>
                                <Input
                                    type='number'
                                    min={0}
                                    max={100}
                                    value={rules.get('containerPadding').get(0).value}
                                    invalid={rules.get('containerPadding').get(0).invalid}
                                    onChange={utils.handleChange(rules, setRules)}
                                    name='containerPadding[0]' />
                                <FormFeedback>{utils.getError(rules.get('containerPadding').get(0))}</FormFeedback>
                            </Col>
                            <Col xs={6}>
                                <Label>Vertical</Label>
                                <Input
                                    type='number'
                                    min={0}
                                    max={100}
                                    value={rules.get('containerPadding').get(1).value}
                                    invalid={rules.get('containerPadding').get(1).invalid}
                                    onChange={utils.handleChange(rules, setRules)}
                                    name='containerPadding[1]' />
                                <FormFeedback>{utils.getError(rules.get('containerPadding').get(1))}</FormFeedback>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Row style={{ marginTop: 20 }}>
                <Col xs={4}>
                   <FormGroup>
                        <CustomInput id='isDraggable'
                            type='switch'
                            name='isDraggable'
                            label='Draggable'
                            onChange={utils.handleToggle(rules, setRules)}
                            checked={rules.get('isDraggable').value}>
                            <FontAwesome
                                name='question-circle'
                                id='draggable-tip'
                                style={{ marginLeft: 10 }}/>
                            <Tooltip isOpen={tips.draggable}
                                toggle={() => toggleTooltip('draggable')}
                                target='draggable-tip'>
                                If turned off it will disable dragging on all widgets.
                            </Tooltip>
                        </CustomInput>
                    </FormGroup>
                </Col>
                <Col xs={4}>
                    <FormGroup>
                        <CustomInput id='isResizable'
                            type='switch'
                            label='Resizable'
                            onChange={utils.handleToggle(rules, setRules)}
                            name='isResizable'
                            checked={rules.get('isResizable').value}>
                            <FontAwesome
                                name='question-circle'
                                id='resizable-tip'
                                style={{ marginLeft: 10 }}/>
                            <Tooltip isOpen={tips.resizable}
                                toggle={() => toggleTooltip('resizable')}
                                target='resizable-tip'>
                                If turned off it will resizing dragging on all widgets.
                            </Tooltip>
                        </CustomInput>
                    </FormGroup>
                </Col>
                <Col xs={4} style={{ paddingLeft: 0 }}>
                    <FormGroup>
                        <CustomInput id='isRearrangeable'
                            type='switch'
                            name='preventCollision'
                            label='No Collision'
                            onChange={utils.handleToggle(rules, setRules)}
                            checked={rules.get('preventCollision').value}>
                            <FontAwesome
                                name='question-circle'
                                id='rearrangeable-tip'
                                style={{ marginLeft: 10 }}/>
                            <Tooltip isOpen={tips.rearrangeable}
                                toggle={() => toggleTooltip('rearrangeable')}
                                target='rearrangeable-tip'>
                                Grid items won't change position when being dragged over.
                            </Tooltip>
                        </CustomInput>
                    </FormGroup>
                </Col>
            </Row>
        </Form>
    }

    const getModal = (): JSX.Element => {
        return <Modal size='md'
            isOpen={isOpen}
            onClosed={() => setOpen(false)}>
            <ModalHeader>Page Config</ModalHeader>
            <ModalBody>
                {getFormTemplate()}
            </ModalBody>
            <ModalFooter>
                <Button color='primary'
                    disabled={!rules.valid}
                    onClick={close}>
                    Save
                </Button>
                <Button color='secondary'
                    onClick={() => setOpen(false)}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    }

    return <div hidden={pages.length === 0}>
        <div className='fixed-plugin' onClick={() => open()}>
            <FontAwesome style={{ paddingTop: 6 }} size='2x' name='cog' />
        </div>
        {getModal()}
    </div>
}
