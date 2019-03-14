import * as React from 'react'
import Form from 'reactstrap/lib/Form'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import Modal from 'reactstrap/lib/Modal'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import Button from 'reactstrap/lib/Button'
import Nav from 'reactstrap/lib/Nav'
import NavItem from 'reactstrap/lib/NavItem'
import NavLink from 'reactstrap/lib/NavLink'
import TabContent from 'reactstrap/lib/TabContent'
import TabPane from 'reactstrap/lib/TabPane'
import Card from 'reactstrap/lib/Card'
import CardTitle from 'reactstrap/lib/CardTitle'
import * as FontAwesome from 'react-fontawesome'

import widgetActions from 'data/widgets/actions'
import notifActions from 'data/notifications/actions'
import { FormCtrlGroup, FormControl, ValidatorFn } from '../../_common/validation'
import * as Validators from '../../_common/validators'
import * as utils from '../../_common/utils'
import { useWidget, useSource } from '../../_common/hooks'
import CustomInput from 'reactstrap/lib/CustomInput'
import { buildInput } from '../../_common/forms';

interface Props {
    id: string
}

export const EditButton: React.StatelessComponent<Props> = (props: Props) => {
    const config = useWidget(props.id)
    // const source = useSource(config.sourceId)
    const marginRules: ValidatorFn[] = [
        Validators.isRequired,
        Validators.min(0),
        Validators.max(100)
    ]

    const [rules, setRules] = React.useState(new FormCtrlGroup({
        margins: new FormCtrlGroup({
            top: new FormControl(0, marginRules),
            left: new FormControl(0, marginRules),
            bottom: new FormControl(0, marginRules),
            right: new FormControl(0)
        }),
        xAxis: new FormCtrlGroup({
            isHidden: new FormControl(false),
            max: new FormControl(''),
            min: new FormControl(''),
            ticks: new FormControl('', [
                Validators.min(1),
                Validators.max(20)
            ])
        }),
        yAxis: new FormCtrlGroup({
            isHidden: new FormControl(false),
            max: new FormControl(''),
            min: new FormControl(''),
            ticks: new FormControl('', [
                Validators.min(1),
                Validators.max(20)
            ])
        })
    }))

    const [specificRules, setSpecificRules] = React.useState(new FormCtrlGroup({}))
    const [isOpen, setOpen] = React.useState(false)
    const [currentTab, setTab] = React.useState('general')

    const toggleModal = (event?: React.FormEvent<any>) => {
        if (event) event.preventDefault()
        if (!isOpen) {
            rules.value = config
            setRules(rules)
        }
        setOpen(!isOpen)
    }

    const getMarginForm = (): JSX.Element => {
        return <Card body style={{ padding: 10 }}>
            <CardTitle style={{ display: 'flex', justifyContent: 'center' }}>
                Margins
            </CardTitle>
            <Row>
                <Col xs={{ size: 4, offset: 4 }}>
                    <Input
                        type='number'
                        name='margins.top'
                        onChange={utils.handleChange(rules, setRules)}
                        value={rules.get('margins').get('top').value}
                        invalid={rules.get('margins').get('top').error} />
                    <FormFeedback>{utils.getError(rules.get('margins').get('top'))}</FormFeedback>
                </Col>
            </Row>
            <Row>
                <Col xs={{ size: 4 }}>
                    <Input
                        type='number'
                        name='margins.left'
                        onChange={utils.handleChange(rules, setRules)}
                        value={rules.get('margins').get('left').value}
                        invalid={rules.get('margins').get('left').error} />
                    <FormFeedback>{utils.getError(rules.get('margins').get('left'))}</FormFeedback>
                </Col>
                <Col xs={{ size: 4, offset: 4 }}>
                    <Input
                        type='number'
                        name='margins.right'
                        onChange={utils.handleChange(rules, setRules)}
                        value={rules.get('margins').get('right').value}
                        invalid={rules.get('margins').get('right').error} />
                    <FormFeedback>{utils.getError(rules.get('margins').get('right'))}</FormFeedback>
                </Col>
            </Row>
            <Row>
                <Col xs={{ size: 4, offset: 4 }}>
                    <Input
                        type='number'
                        name='margins.bottom'
                        onChange={utils.handleChange(rules, setRules)}
                        value={rules.get('margins').get('bottom').value}
                        invalid={rules.get('margins').get('bottom').error} />
                    <FormFeedback>{utils.getError(rules.get('margins').get('bottom'))}</FormFeedback>
                </Col>
            </Row>
        </Card>
    }

    const getFormTemplate = (): JSX.Element => {
        return <Form>
            <Row>
                <Col>
                    <FormGroup>
                        {getMarginForm()}
                    </FormGroup>
                </Col>
            </Row>
        </Form>
    }

    const getAxisTemplate = (axis: string): JSX.Element => {
        return <Card body style={{ padding: 10 }}>
            <Row>
                <Col>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Label style={{ paddingRight: 15 }}>{axis}</Label>
                        <CustomInput id={`${axis}.isHidden`}
                            label='Hide'
                            name={`${axis}.isHidden`}
                            type='switch'
                            checked={rules.get(axis).get('isHidden').value}
                            onChange={utils.handleToggle(rules, setRules)}>
                        </CustomInput>
                    </div>
                </Col>
            </Row>
            <Row hidden={rules.get(axis).get('isHidden').value}>
                <Col>
                    {buildInput(`${axis}.min`, 'number', rules, setRules, 'Min')}
                </Col>
                <Col>
                    {buildInput(`${axis}.max`, 'number', rules, setRules, 'Max')}
                </Col>
                <Col>
                    {buildInput(`${axis}.ticks`, 'number', rules, setRules, 'Ticks', {
                        min: 1,
                        max: 20
                    })}
                </Col>
            </Row>
        </Card>
    }

    const getModalTemplate = (): JSX.Element => {
        if (!config) return <div />
        return <Modal isOpen={isOpen}>
            <ModalHeader>Edit Widget</ModalHeader>
            <ModalBody>
                <Nav tabs fill={true}>
                    <NavItem>
                        <NavLink
                            active={currentTab === 'general'}
                            onClick={() => setTab('general')}>
                            General
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            active={currentTab === 'specific'}
                            onClick={() => setTab('specific')}>
                            {config.type}
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={currentTab}
                    style={{
                        borderColor: 'transparent #dee2e6 #dee2e6 #dee2e6',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderBottomLeftRadius: '.25rem',
                        borderBottomRightRadius: '.25rem'
                    }}>
                    <TabPane tabId='general' style={{ padding: 10 }}>
                        {getFormTemplate()}
                    </TabPane>
                    <TabPane tabId='specific'>
                        <Form>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        {getAxisTemplate('xAxis')}
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        {getAxisTemplate('yAxis')}
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Form>
                    </TabPane>
                </TabContent>
            </ModalBody>
            <ModalFooter>
                <Button color='primary'
                    onClick={save}>
                    Done
                </Button>
                <Button color='secondary'
                    onClick={cancel}>Cancel</Button>
            </ModalFooter>
        </Modal>
    }

    const histogram = (): JSX.Element => {
        return <Form>
            <Row>
                <Col>
                    <FormGroup>
                        <Label>X Min</Label>
                        <Input type='number'
                            value={specificRules.get('xMin').value}
                            invalid={specificRules.get('xMin').error}/>
                        <FormFeedback>{specificRules.get('xMin').error.msg}</FormFeedback>
                    </FormGroup>
                </Col>
            </Row>
        </Form>
    }

    const getSpecificRules = () => {
        const tmp = {
            histogram: new FormCtrlGroup({
                xMin: new FormControl('', [
                    // Validators.max(source.columns.find(x => x.ref === config.measures[0].ref).min)
                ]),
                xMax: new FormControl('', [
                    // Validators.min(source.columns.find(x => x.ref === config.measures[0].ref).max)
                ]),
                yMin: new FormControl('', [
                    Validators.min(0)
                ]),
                yMax: new FormControl('', []),
                columnCount: new FormControl('', [
                    Validators.min(3),
                    Validators.max(100)
                ])
            })
        }

        setSpecificRules(tmp[config.type])
    }

    const cancel = () => {
        setOpen(false)
    }

    const save = () => {
        widgetActions.update(Object.assign({}, config, rules.value))
        .then(() => notifActions.success('Updated widget'))
        .then(() => setOpen(false))
        .catch(err => notifActions.error(err.message))
    }

    return <div>
        <Button className='pull-left'
            color='secondary'
            outline
            size='sm'
            onClick={toggleModal}>
            <FontAwesome name='cog' />
        </Button>
        {getModalTemplate()}
    </div>
}
