import * as React from 'react'
import {
    RouteComponentProps
  } from 'react-router'
import { IOffer } from 'common/models'
import { Label, Button, Row, Form, Col } from 'reactstrap'
import { FormCtrlGroup, FormControl, FormCtrlArray, ValidatorFn } from '../../../_common/validation'
import * as Validators from '../../../_common/validators'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import Input from 'reactstrap/lib/Input'
import FormGroup from 'reactstrap/lib/FormGroup'
import { stateAbbreviations } from '../../../_common/consts'
import * as utils from '../../../_common/utils'

export interface OfferProps extends React.ReactPropTypes, RouteComponentProps {
    offerType: OfferType[]
}

export interface OfferType {
    value: string
    displayName: string
}

export const OfferTypes: OfferType[] = [
    { displayName: 'Show a property', value: 'showProperty' },
    // { displayName: 'Hire Home Inspector', value: 'hireHomeInspector' },
    { displayName: 'Install Sign Post', value: 'installSignPost' },
    { displayName: 'Write a Contract', value: 'writeContract' },
    { displayName: 'Transaction Coordination (Single File)', value: 'coordinateTransaction' },
    { displayName: 'Lead', value: 'lead' },
    { displayName: 'Pick Up Items', value: 'pickUpItem' },
    { displayName: 'Other', value: 'other' }
]

class MyState {
    rules: FormCtrlGroup
}

interface Props {
    next: (offer: IOffer) => void
}

export class OfferForm extends React.Component<Props, MyState> {
    getBracketValue = new RegExp(/\[(.*?)\]/)
    commissionRules: ValidatorFn[] = [
        Validators.isRequired,
        Validators.isNumber,
        Validators.min(0)
    ]

    componentWillMount () {
        const rules = new FormCtrlGroup({
            offerType: new FormControl(OfferTypes[0].value, [
                Validators.isRequired
            ]),
            clientName: new FormControl('', [
                Validators.isRequired,
                Validators.minLength(3),
                Validators.maxLength(100)
            ]),
            comments: new FormControl('', [
                Validators.maxLength(1000)
            ]),
            propertyAddress: new FormCtrlGroup({
                street1: new FormControl('', [
                    Validators.isRequired,
                    Validators.maxLength(100)
                ]),
                city: new FormControl('', [
                    Validators.isRequired,
                    Validators.maxLength(100)
                ]),
                state: new FormControl(stateAbbreviations[0], [
                    Validators.isRequired,
                    Validators.maxLength(2),
                    Validators.minLength(2)
                ]),
                zip: new FormControl('', [
                    Validators.isRequired,
                    Validators.isNumber,
                    Validators.minLength(5),
                    Validators.maxLength(5)
                ])
            }),
            additionalInfo: new FormControl('', []),
            commission: new FormCtrlGroup({
                type: new FormControl('flat', [
                    Validators.isRequired
                ]),
                flatAmount: new FormControl('', this.commissionRules),
                percentRate: new FormControl('')
            })
        })
        this.setState({ rules })
    }

    postOffer = () => {
        this.props.next(this.state.rules.value as IOffer)
    }

    getError = (ctrl: FormControl | FormCtrlArray | FormCtrlGroup): string => {
        return ctrl.error
            ? ctrl.error.message
            : ''
    }

    getPercentRateTemplate (): JSX.Element {
        if (this.state.rules.get('commission').get('type').value !== 'percent'
            && this.state.rules.get('commission').get('type').value !== 'both') {
            return
        }
        return <Col md={4}>
            <FormGroup>
                <Label for='commission.percentRate'>% of Commission</Label>
                <Input
                    type='number'
                    name='commission.percentRate'
                    onChange={this.handleChangeNumber}
                    value={this.state.rules.get('commission').get('percentRate').value}
                    invalid={!!this.state.rules.get('commission').get('percentRate').error}
                    />
                <FormFeedback>{this.getError(this.state.rules.get('commission').get('percentRate'))}</FormFeedback>
            </FormGroup>
        </Col>
    }

    getFlatRateTemplate (): JSX.Element {
        if (this.state.rules.get('commission').get('type').value !== 'flat'
            && this.state.rules.get('commission').get('type').value !== 'both') {
            return
        }
        return <Col md={2}>
            <FormGroup>
                <Label for='commission.flatAmount'>Flat Fee</Label>
                <Input
                    type='number'
                    name='commission.flatAmount'
                    placeholder='Amount'
                    value={this.state.rules.get('commission').get('flatAmount').value}
                    invalid={!!this.state.rules.get('commission').get('flatAmount').error}
                    onChange={this.handleChangeNumber}
                />
                <FormFeedback>{this.getError(this.state.rules.get('commission').get('flatAmount'))}</FormFeedback>
            </FormGroup>
        </Col>
    }

    getClientNameTemplate (): JSX.Element {
        const offerType = this.state.rules.get('offerType').value
        if (offerType === 'installSignPost') {
            return <div />
        }

        return <Row><Col>
            <FormGroup>
                <Label for='clientName'>Client's Preferred Name</Label>
                <Input
                    type='text'
                    name='clientName'
                    placeholder="Enter Client's Name"
                    value={this.state.rules.get('clientName').value}
                    invalid={this.state.rules.get('clientName').invalid}
                    onChange={this.handleChange}/>
                <FormFeedback>{this.getError(this.state.rules.get('clientName'))}</FormFeedback>
            </FormGroup>
        </Col></Row>
    }

    onCommissionTypeChange = (event: React.FormEvent<any>) => {
        this.handleChange(event)
        const typeCtrl: FormControl = this.state.rules.get('commission').get('type') as FormControl
        const percentCtrl: FormControl = this.state.rules.get('commission').get('percentRate') as FormControl
        const flatCtrl: FormControl = this.state.rules.get('commission').get('flatAmount') as FormControl

        if (typeCtrl.value === 'flat') {
            percentCtrl.setValidators([])
            flatCtrl.setValidators(this.commissionRules)
        } else if (typeCtrl.value === 'percent') {
            percentCtrl.setValidators(this.commissionRules)
            flatCtrl.setValidators([])
        } else if (typeCtrl.value === 'both') {
            percentCtrl.setValidators(this.commissionRules)
            flatCtrl.setValidators(this.commissionRules)
        }

        this.state.rules.get('commission').value = this.state.rules.get('commission').value
        this.setState({
            rules: this.state.rules
        })
    }

    handleChange = (event: React.FormEvent<any>) => {
        utils.handleChange(event, this.state.rules)
        this.setState({
            rules: this.state.rules
        })
    }

    handleChangeNumber = (event) => {
        event.target.value = parseInt(event.target.value)
        utils.handleChange(event, this.state.rules)
        this.setState({
            rules: this.state.rules
        })
    }

    render () {
        return <Form className='container'>
            <Row><Col>
                <FormGroup>
                    <Label>Offer Type</Label>
                    <Input type='select' name='offerType'
                        onChange={this.handleChange}
                        value={this.state.rules.get('offerType').value}
                        invalid={this.state.rules.get('offerType').error}>
                        {OfferTypes.map((type, key) => {
                            return <option key={key} value={type.value}>{type.displayName}</option>
                        })}
                    </Input>
                    <FormFeedback>{this.getError(this.state.rules.get('offerType'))}</FormFeedback>
                </FormGroup>
            </Col></Row>
                {this.getClientNameTemplate()}
            <Row><Col>
                <FormGroup>
                    <Label>Address</Label>
                    <Input
                        type='text'
                        name='propertyAddress.street1'
                        placeholder='Address'
                        value={this.state.rules.get('propertyAddress').get('street1').value}
                        invalid={this.state.rules.get('propertyAddress').get('street1').error}
                        onChange={this.handleChange}/>
                    <FormFeedback>{this.getError(this.state.rules.get('propertyAddress').get('street1'))}</FormFeedback>
                </FormGroup>
            </Col></Row>
            <Row form='true'>
                <Col md={6}>
                    <FormGroup>
                        <Label for='propertyAddress.city'>City</Label>
                        <Input
                            type='text'
                            name='propertyAddress.city'
                            placeholder='City'
                            value={this.state.rules.get('propertyAddress').get('city').value}
                            invalid={this.state.rules.get('propertyAddress').get('city').error}
                            onChange={this.handleChange}
                        />
                        <FormFeedback>{this.getError(this.state.rules.get('propertyAddress').get('city'))}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col md={4}>
                    <FormGroup>
                        <Label for='exampleState'>State</Label>
                        <Input
                            type='select'
                            name='propertyAddress.state'
                            onChange={this.handleChange}
                            value={this.state.rules.get('propertyAddress').get('state').value}
                            invalid={this.state.rules.get('propertyAddress').get('state').error}>
                            {stateAbbreviations.map((type, key) => <option key={key} value={type}>{type}</option>)}
                        </Input>
                        <FormFeedback>{this.getError(this.state.rules.get('propertyAddress').get('state'))}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col md={2}>
                    <FormGroup>
                        <Label for='propertyAddress.zip'>Zip</Label>
                        <Input
                            type='text'
                            name='propertyAddress.zip'
                            placeholder='Zip'
                            value={this.state.rules.get('propertyAddress').get('zip').value}
                            invalid={this.state.rules.get('propertyAddress').get('zip').error}
                            onChange={this.handleChange}
                        />
                        <FormFeedback>{this.getError(this.state.rules.get('propertyAddress').get('zip'))}</FormFeedback>
                    </FormGroup>
                </Col>
            </Row>
            <Row form='true'>
                <Col md={6}>
                    <FormGroup>
                        <Label for='commission.type'>Commission</Label>
                        <Input
                            type='select'
                            name='commission.type'
                            placeholder='Type'
                            value={this.state.rules.get('commission').get('type').value}
                            invalid={this.state.rules.get('commission').get('type').error}
                            onChange={this.onCommissionTypeChange}>
                            <option value='percent'>% of Commission</option>
                            <option value='flat'>Flat Fee</option>
                            <option value='both'>Both (Applicant Chooses)</option>
                        </Input>
                        <FormFeedback>{this.getError(this.state.rules.get('propertyAddress').get('zip'))}</FormFeedback>
                    </FormGroup>
                </Col>
                {this.getPercentRateTemplate()}
                {this.getFlatRateTemplate()}
            </Row>
            <Row><Col>
                <FormGroup>
                    <Label>Additional Info</Label>
                    <Input type='textarea' rows='5'
                      value={this.state.rules.get('comments').value}
                      invalid={this.state.rules.get('comments').error}>
                    </Input>
                    <FormFeedback>{this.getError(this.state.rules.get('comments'))}</FormFeedback>
                </FormGroup>
            </Col></Row>
            <Row><Col>
                <Button className='btn btn-primary'
                    disabled={!this.state.rules.valid}
                    onClick={this.postOffer}>
                    Next
                </Button>
          </Col></Row>
        </Form>
    }
}
