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

interface Props {
    id: string
}

export const EditButton: React.StatelessComponent<Props> = (props: Props) => {
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

    const [isOpen, setOpen] = React.useState(false)
    const [currentTab, setTab] = React.useState('general')

    const getErrorMsg = (msg) => {
        return msg.error && msg.error.message
    }

    const toggleModal = () => {
        if (!isOpen) {
            rules.value = store.getState().widgets.list
                .find(w => w._id === props.id)
            setRules(rules)
        }
        setOpen(!isOpen)
    }

    const getFormTemplate = (): JSX.Element => {
        return <Form>
            <Row>
                <Col>
                    <FormGroup>
                        <Label>Top</Label>
                        <Input
                            type='text'
                            name='margins.top'
                            value={rules.get('margins').get('top').value}
                            invalid={rules.get('margins').get('top').error} />
                        <FormFeedback>{getErrorMsg(rules.get('margins').get('top'))}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
                        <Label>Bottom</Label>
                        <Input
                            type='text'
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
                            type='text'
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
                            type='text'
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
                <TabContent activeTab={currentTab}>
                    <TabPane tabId='general'>
                        {getFormTemplate()}
                    </TabPane>
                    <TabPane tabId='specific'></TabPane>
                </TabContent>
            </ModalBody>
            <ModalFooter>
                <Button color='primary'>Done</Button>
                <Button color='secondary'>Cancel</Button>
            </ModalFooter>
        </Modal>
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
