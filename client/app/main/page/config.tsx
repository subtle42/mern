import * as React from 'react'
import {
    FormText, Label, FormFeedback, ModalBody, ModalFooter, ModalHeader,
    Row, Col, Input, Modal, Button, FormGroup, Tooltip
} from 'reactstrap'
import PageActions from 'data/pages/actions'
import { store } from 'data/store'
import { IPage } from 'common/models'
import * as FontAwesome from 'react-fontawesome'
import * as Validators from '../../_common/validators'
import { FormCtrlGroup, FormControl, FormCtrlArray } from '../../_common/validation'
import './page.css'

class State {
    rules: FormCtrlGroup
    page?: IPage
    showModal: boolean = false
    validationState?: myStyle = undefined
    tips: {
        draggable?: boolean,
        resizable?: boolean,
        rearrangeable?: boolean
    } = {}
}

interface Props {
    _id?: string
}

type myStyle = 'success' | 'warning' | 'error'

export class PageConfigButton extends React.Component<Props, State> {
    state: State = new State()
    getBracketValue = new RegExp(/\[(.*?)\]/);

    componentDidMount() {
      const rules = new FormCtrlGroup({
          name: new FormControl('', [
              Validators.isRequired,
              Validators.minLength(3),
              Validators.maxLength(15)
          ]),
          isDraggable: new FormControl(false),
          isResizable: new FormControl(false),
          isRearrangeable: new FormControl(false),
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
      })

      this.setState({ rules })
    }

    close = (event) => {
        const tmp = Object.assign({}, this.state.page, this.state.rules.value)
        PageActions.update(tmp)
        .then(() => this.setState(new State()))
    }

    open = () => {
        const myPage: IPage = store.getState()
        .pages.list.filter(page => page._id === this.props._id)[0]
        this.state.rules.value = myPage
        this.setState({
            showModal: true,
            rules: this.state.rules,
            page: myPage
        })
    }

    cancel = () => {
        if (event) event.stopPropagation()
        this.setState(new State())
    }


    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target

        let schema: FormCtrlGroup | FormControl | FormCtrlArray = this.state.rules;
        target.name.split('.').forEach(attr => {
            if (attr.indexOf('[') !== -1) {
                const firstPart = attr.split('[')[0]
                const index: number = parseInt(this.getBracketValue.exec(attr)[1])
                schema = schema.controls[firstPart]
                schema = schema.controls[index]
            } else {
              schema = schema.controls[attr]
            }
        })
        schema.value = target.value;

        this.setState(this.state)
    }

    toggleCheckBox = (event: React.FormEvent<any>) => {
        const target: any = event.target
        const ctrl = this.state.rules.controls[target.name]
        ctrl.value = !ctrl.value
        this.setState({
            rules: this.state.rules
        })
    }

    toggleTooltip = (loc: string): void => {
        let tmp = this.state.tips
        tmp[loc] = !tmp[loc]
        this.setState({
            tips: tmp
        })
    }

    getErrorMsg = (err): string => {
        if (err) return err.message
        return ''
    }

    getModal (): JSX.Element {
        if (!this.state.page) return

        return (<Modal size='lg' isOpen={this.state.showModal} onClosed={this.cancel}>
            <ModalHeader>Page Config</ModalHeader>
            <ModalBody>
                <Row className='row-padding'>
                    <Col xs={6}>
                        <Label>Name:</Label>
                        <Input
                            type='text'
                            name='name'
                            placeholder='Enter Name'
                            value={this.state.rules.controls.name.value}
                            invalid={this.state.rules.controls.name.invalid}
                            onChange={this.handleChange} />
                        <FormFeedback>{this.getErrorMsg(this.state.rules.controls.name.error)}</FormFeedback>
                    </Col>
                    <Col xs={6}>
                        <Label>Column Count</Label>
                        <Input
                            type='number'
                            min={1}
                            max={30}
                            value={this.state.rules.controls.cols.value}
                            invalid={this.state.rules.controls.cols.invalid}
                            onChange={this.handleChange}
                            name='cols' />
                        <FormFeedback>{this.getErrorMsg(this.state.rules.controls.cols.error)}</FormFeedback>
                    </Col>
                </Row>
                <Row className='row-padding'>
                    <Col xs={3}>
                        <Label>Margins</Label>
                        <Input
                            type='number'
                            min={0}
                            max={100}
                            value={this.state.rules.controls.margin.controls[0].value}
                            invalid={this.state.rules.controls.margin.controls[0].invalid}
                            onChange={this.handleChange}
                            name='margin[0]' />
                        <FormFeedback>{this.getErrorMsg(this.state.rules.controls.margin.controls[0].error)}</FormFeedback>
                    </Col>
                    <Col xs={3}>
                        <Label>Margins</Label>
                        <Input
                            type='number'
                            min={0}
                            max={100}
                            value={this.state.rules.controls.margin.controls[1].value}
                            invalid={this.state.rules.controls.margin.controls[1].invalid}
                            onChange={this.handleChange}
                            name='margin[1]' />
                        <FormFeedback>{this.getErrorMsg(this.state.rules.controls.margin.controls[0].error)}</FormFeedback>
                    </Col>
                    <Col xs={3}>
                        <Label>Padding</Label>
                        <Input
                            type='number'
                            min={0}
                            max={100}
                            value={this.state.rules.controls.containerPadding.controls[0].value}
                            invalid={this.state.rules.controls.containerPadding.controls[0].invalid}
                            onChange={this.handleChange}
                            name='containerPadding[0]' />
                        <FormFeedback>{this.getErrorMsg(this.state.rules.controls.containerPadding.controls[0].error)}</FormFeedback>
                    </Col>
                    <Col xs={3}>
                        <Label>Padding</Label>
                        <Input
                            type='number'
                            min={0}
                            max={100}
                            value={this.state.rules.controls.containerPadding.controls[1].value}
                            invalid={this.state.rules.controls.containerPadding.controls[1].invalid}
                            onChange={this.handleChange}
                            name='containerPadding[1]' />
                        <FormFeedback>{this.getErrorMsg(this.state.rules.controls.containerPadding.controls[1].error)}</FormFeedback>
                    </Col>
                </Row>
                <Row className='row-padding'>
                    <Col xs={6}>
                        <FormGroup row>
                            <Label xs={6}>
                                <span style={{ paddingRight: 10 }}>Is Draggable</span>
                                <FontAwesome name='question-circle' id='draggable-tip'/>
                                <Tooltip isOpen={this.state.tips.draggable} toggle={() => this.toggleTooltip('draggable')} target='draggable-tip'>
                                    If turned off it will disable dragging on all widgets.
                                </Tooltip>
                            </Label>
                            <Col xs={6}>
                                <Button color={this.state.rules.controls.isDraggable.value ? 'success' : 'danger'}
                                    name='isDraggable'
                                    onClick={this.toggleCheckBox}>
                                    {this.state.rules.controls.isDraggable.value.toString().toLocaleUpperCase()}
                                </Button>
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup row>
                            <Label xs={6}>
                                <span style={{ paddingRight: 10 }}>Is Resizable</span>
                                <FontAwesome name='question-circle' id='resizable-tip'/>
                                <Tooltip isOpen={this.state.tips.resizable} toggle={() => this.toggleTooltip('resizable')} target='resizable-tip'>
                                    If turned off it will resizing dragging on all widgets.
                                </Tooltip>
                            </Label>
                            <Col xs={6}>
                                <Button color={this.state.rules.controls.isResizable.value ? 'success' : 'danger'}
                                    name='isResizable'
                                    onClick={this.toggleCheckBox}>
                                    {this.state.rules.controls.isResizable.value.toString().toLocaleUpperCase()}
                                </Button>
                            </Col>
                        </FormGroup>
                    </Col>
                </Row>
                <Row className='row-padding'>
                    <Col xs={6}>
                        <FormGroup row>
                            <Label xs={6}>
                                <span style={{ paddingRight: 10 }}>Is Rearrangeable</span>
                                <FontAwesome name='question-circle' id='rearrangeable-tip'/>
                                <Tooltip isOpen={this.state.tips.rearrangeable} toggle={() => this.toggleTooltip('rearrangeable')} target='rearrangeable-tip'>
                                    Enable or disable grid rearrangement when dragging/resizing a widget.
                                </Tooltip>
                            </Label>
                            <Col xs={6}>
                                <Button color={this.state.rules.controls.isRearrangeable.value ? 'success' : 'danger'}
                                    name='isRearrangeable'
                                    onClick={this.toggleCheckBox}>
                                    {this.state.rules.controls.isRearrangeable.value.toString().toLocaleUpperCase()}
                                </Button>
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col xs={6}></Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color='primary'
                    disabled={!this.state.rules.valid}
                    onClick={this.close}>
                    Save
                </Button>
                <Button color='secondary' onClick={this.cancel}>Cancel</Button>
            </ModalFooter>
        </Modal>)
    }

    render () {
        return (<div className='fixed-plugin' onClick={this.open}>
            <div>
                <FontAwesome style={{ paddingTop: 6 }} size='2x' name='cog' />
                {this.getModal()}
            </div>
        </div>)
    }
}
