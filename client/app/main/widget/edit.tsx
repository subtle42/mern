import * as React from 'react'
import Form from 'reactstrap/lib/Form'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import { FormCtrlGroup, FormControl, ValidatorFn } from '../../_common/validation'
import * as Validators from '../../_common/validators'
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import { store } from 'data/store'
import Modal from 'reactstrap/lib/Modal'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import Button from 'reactstrap/lib/Button'
import Nav from 'reactstrap/lib/Nav'
import NavItem from 'reactstrap/lib/NavItem'
import NavLink from 'reactstrap/lib/NavLink'
import * as FontAwesome from 'react-fontawesome'
import TabContent from 'reactstrap/lib/TabContent'
import TabPane from 'reactstrap/lib/TabPane'
import { IWidget, ISource } from 'common/models'
import * as utils from '../../_common/utils'

interface Props {
    id: string
}

export const EditButton: React.StatelessComponent<Props> = (props: Props) => {
    let config: IWidget
    let source: ISource
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
        type: new FormControl('', [
            Validators.isRequired
        ])
    }))

    const [specificRules, setSpecificRules] = React.useState(new FormCtrlGroup({}))
    const [isOpen, setOpen] = React.useState(false)
    const [currentTab, setTab] = React.useState('general')

    const getErrorMsg = (msg) => {
        return msg.error && msg.error.message
    }

    const toggleModal = () => {
        if (!isOpen) {
            config = store.getState().widgets.list
                .find(w => w._id === props.id)
            source = store.getState().sources.list
                .find(s => s._id === config.sourceId)
            rules.value = config
            setRules(rules)
        }
        setOpen(!isOpen)
    }

    const handleChange = (event: React.FormEvent<any>) => {
        utils.handleChange(event, rules)
        setRules(rules)
    }

    const getFormTemplate = (): JSX.Element => {
        return <Form>
            <Row>
                <Col>
                    <FormGroup>
                        <Label>Top</Label>
                        <Input
                            type='number'
                            name='margins.top'
                            onChange={handleChange}
                            value={rules.get('margins').get('top').value}
                            invalid={rules.get('margins').get('top').error} />
                        <FormFeedback>{getErrorMsg(rules.get('margins').get('top'))}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <Label>Bottom</Label>
                        <Input
                            type='number'
                            onChange={handleChange}
                            name='margins.bottom'
                            value={rules.get('margins').get('bottom').value}
                            invalid={rules.get('margins').get('bottom').error} />
                        <FormFeedback>{getErrorMsg(rules.get('margins').get('bottom'))}</FormFeedback>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup>
                        <Label>Left</Label>
                        <Input
                            type='number'
                            onChange={handleChange}
                            name='margins.left'
                            value={rules.get('margins').get('left').value}
                            invalid={rules.get('margins').get('left').error} />
                        <FormFeedback>{getErrorMsg(rules.get('margins').get('left'))}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <Label>Right</Label>
                        <Input
                            type='number'
                            onChange={handleChange}
                            name='margins.right'
                            value={rules.get('margins').get('right').value}
                            invalid={rules.get('margins').get('right').error} />
                        <FormFeedback>{getErrorMsg(rules.get('margins').get('right'))}</FormFeedback>
                    </FormGroup>
                </Col>
            </Row>
        </Form>
    }

    const getModalTemplate = (): JSX.Element => {
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
                            {rules.get('type').value}
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
                    <TabPane tabId='specific'></TabPane>
                </TabContent>
            </ModalBody>
            <ModalFooter>
                <Button color='primary'>Done</Button>
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
                    Validators.max(source.columns.find(x => x.ref === config.measures[0].ref).min)
                ]),
                xMax: new FormControl('', [
                    Validators.min(source.columns.find(x => x.ref === config.measures[0].ref).max)
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

    return <Button className='pull-left'
        color='secondary'
        outline
        size='small'
        onClick={toggleModal}>
        <FontAwesome name='cog' />
        {getModalTemplate()}
    </Button>
}
