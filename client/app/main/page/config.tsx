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
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import Form from 'reactstrap/lib/Form'
import FormGroup from 'reactstrap/lib/FormGroup'
import Card from 'reactstrap/lib/Card'
import CardTitle from 'reactstrap/lib/CardTitle'
import FontAwesome from 'react-fontawesome'


import { usePages } from '../../_common/hooks'
import './page.css'
import { store } from '../../../data/store'
import myPageActions from '../../../data/pages/actions'
import { IPage } from '@mern/server/api/page/model'
import { myNotifActions } from '../../../data/notifications/actions'
import { SubmitHandler, useForm } from 'react-hook-form'
import { handleRegister, hasErorrs, MyInput } from '../utils'

interface Props {
    _id?: string
}

type FormInputs = Omit<IPage, 'bookId' | 'layout' | '_id'>


export const PageConfigButton: React.FunctionComponent<Props> = (props: Props) => {
    const {register, handleSubmit, getValues, reset, formState: {errors, isDirty}} = useForm<FormInputs>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            name: '',
            isDraggable: false,
            isResizable: false,
            preventCollision: false,
            margin: [0,0],
            containerPadding: [0,0],
            cols: 1
        },
    })
    const [isOpen, setOpen] = React.useState(false)
    const [tips, setTips] = React.useState({
        draggable: false,
        resizable: false,
        rearrangeable: false
    })
    const pages = usePages()

    const open = () => {
        const toEdit = store.getState().pages.list.find(page => page._id === props._id)
        if (!toEdit) {
            console.warn(`Unable to find page: ${props._id}`)
            return
        }
        reset(toEdit)
        setOpen(true)
    }

    const close = () => {
        if (hasErorrs(errors)) return
        const data = getValues()
        const page = store.getState().pages.list.find(page => page._id === props._id) as IPage
        myPageActions.update({...page, ...data})
        .then(() => myNotifActions.notify('success', 'Page updated'))
        .then(() => setOpen(false))
        .catch(err => myNotifActions.notify('danger', err.message))
    }

    const toggleTooltip = (loc: string): void => {
        tips[loc] = !tips[loc]
        setTips({ ...tips })
    }

    const getFormTemplate = (): JSX.Element => {
        return <div>
            <Row>
                <Col xs={6}>
                    <FormGroup>
                        <Label>Name</Label>
                        <MyInput
                            register={() => register('name', handleRegister({
                                required: true,
                                minLength: 3,
                                maxLength: 15
                            }))}
                            placeholder='Enter Name'
                            invalid={!!errors.name}
                        />
                        <FormFeedback>{errors.name?.message}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col xs={6}>
                    <FormGroup>
                        <Label>Column Count</Label>
                        <MyInput
                            type='number'
                            min={1}
                            max={30}
                            register={() => register('cols', handleRegister({
                                required: true,
                                min: 1,
                                max: 30
                            }))}
                            invalid={!!errors.cols} 
                        />
                        <FormFeedback>{errors.cols?.message}</FormFeedback>
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
                                <MyInput
                                    type='number'
                                    min={0}
                                    max={100}
                                    register={() => register(`margin.0`, handleRegister({
                                        required: true,
                                        min: 0,
                                        max: 100
                                    }))}
                                    invalid={errors.margin ? !!errors.margin[0]?.message : false}
                                />
                                <FormFeedback>{errors.margin && errors.margin[0]?.message}</FormFeedback>
                            </Col>
                            <Col xs={6}>
                                <Label>Vertical</Label>
                                <MyInput
                                    type='number'
                                    min={0}
                                    max={100}
                                    register={() => register(`margin.1`, handleRegister({
                                        required: true,
                                        min: 0,
                                        max: 100
                                    }))}
                                    invalid={errors.margin ? !!errors.margin[1]?.message : false}
                                />
                                <FormFeedback>{errors.margin && errors.margin[0]?.message}</FormFeedback>
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
                                <MyInput
                                    type='number'
                                    min={0}
                                    max={100}
                                    register={() => register('containerPadding.0', handleRegister({
                                        required: true,
                                        min: 0,
                                        max: 100
                                    }))}
                                    invalid={errors.containerPadding ? !!errors.containerPadding[0]?.message : false} 
                                />
                                <FormFeedback>{errors.containerPadding && errors.containerPadding[0]?.message}</FormFeedback>
                            </Col>
                            <Col xs={6}>
                                <Label>Vertical</Label>
                                <MyInput
                                    type='number'
                                    min={0}
                                    max={100}
                                    register={() => register('containerPadding.1', handleRegister({
                                        required: true,
                                        min: 0,
                                        max: 100
                                    }))}
                                    invalid={errors.containerPadding ? !!errors.containerPadding[1]?.message : false} 
                                />
                                <FormFeedback>{errors.containerPadding && errors.containerPadding[1]?.message}</FormFeedback>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Row style={{ marginTop: 20 }}>
                <Col xs={4}>
                   <FormGroup switch>
                        <MyInput id='isDraggable'
                            type='switch'
                            register={() => register('isDraggable')}
                        />
                        <Label>Draggable</Label>
                        <FontAwesome
                            name='question-circle'
                            id='draggable-tip'
                            style={{ marginLeft: 10 }}/>
                        <Tooltip isOpen={tips.draggable}
                            toggle={() => toggleTooltip('draggable')}
                            target='draggable-tip'>
                            If turned off it will disable dragging on all widgets.
                        </Tooltip>
                    </FormGroup>
                </Col>
                <Col xs={4}>
                    <FormGroup switch>
                        <MyInput
                            type='switch'
                            register={() => register('isResizable')}
                        />
                        <Label>Resizable</Label>
                        <FontAwesome
                            name='question-circle'
                            id='resizable-tip'
                            style={{ marginLeft: 10 }}/>
                        <Tooltip isOpen={tips.resizable}
                            toggle={() => toggleTooltip('resizable')}
                            target='resizable-tip'>
                            If turned off it will resizing dragging on all widgets.
                        </Tooltip>
                    </FormGroup>
                </Col>
                <Col xs={4} style={{ paddingLeft: 0 }}>
                    <FormGroup switch>
                        <MyInput
                            type='switch'
                            register={() => register('preventCollision')}
                        />
                        <Label>No Collision</Label>
                            <FontAwesome
                                name='question-circle'
                                id='rearrangeable-tip'
                                style={{ marginLeft: 10 }}/>
                            <Tooltip isOpen={tips.rearrangeable}
                                toggle={() => toggleTooltip('rearrangeable')}
                                target='rearrangeable-tip'>
                                Grid items won't change position when being dragged over.
                            </Tooltip>
                    </FormGroup>
                </Col>
            </Row>
        </div>
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
                    disabled={hasErorrs(errors)}
                    onClick={() => close()}>
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
