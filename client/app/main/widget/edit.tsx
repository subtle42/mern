import * as React from 'react'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'
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
import { useWidget } from '../../_common/hooks'
import { chartFormStrategy } from './edit/chartFormStrategy'

interface Props {
    id: string
}

export const EditButton: React.FunctionComponent<Props> = (props: Props) => {
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
            right: new FormControl(0, marginRules)
        }),
        xAxis: new FormCtrlGroup({
            show: new FormControl(false),
            max: new FormControl(''),
            min: new FormControl(''),
            ticks: new FormControl('', [
                Validators.min(1),
                Validators.max(20)
            ])
        }),
        yAxis: new FormCtrlGroup({
            show: new FormControl(false),
            max: new FormControl(''),
            min: new FormControl(''),
            ticks: new FormControl('', [
                Validators.min(1),
                Validators.max(20)
            ])
        }),
        other: new FormCtrlGroup({
            ticks: new FormControl('', [
                Validators.min(1),
                Validators.max(50)
            ]),
            showLegend: new FormControl(false)
        })
    }))

    const [isOpen, setOpen] = React.useState(false)
    const [currentTab, setTab] = React.useState('general')

    const toggleModal = (event?: React.FormEvent<any>) => {
        if (event) event.preventDefault()
        if (!isOpen) {
            rules.value = config
            setRules(rules)
            setTab('general')
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
                            Chart
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
                        {getMarginForm()}
                    </TabPane>
                    <TabPane tabId='specific' style={{ padding: 10 }}>
                        {chartFormStrategy[config.type](rules, setRules)}
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
            style={{ padding: '2 4 2 4' }}
            color='link'
            outline
            size='sm'
            onClick={toggleModal}>
            <FontAwesome name='cog' />
        </Button>
        {getModalTemplate()}
    </div>
}
