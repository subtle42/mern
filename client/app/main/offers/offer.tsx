import * as React from 'react'
import {
    RouteComponentProps
  } from "react-router";
import {IOffer} from 'common/models'
import { Label, Button, Row, Form, Col } from 'reactstrap';
import offerActions from 'data/offer/actions'
import { FormCtrlGroup, FormControl, FormCtrlArray } from '../../_common/validation';
import * as Validators from '../../_common/validators'
import FormFeedback from 'reactstrap/lib/FormFeedback';
import Input from 'reactstrap/lib/Input';
import OfferList from './list'
import FormGroup from 'reactstrap/lib/FormGroup';
import { stateAbbreviations } from '../../_common/consts';
import NotifActions from 'data/notifications/actions'
import { OfferDetails } from './details'


export interface OfferProps extends React.ReactPropTypes, RouteComponentProps {
    offerType: OfferType[];
  }
  
export interface OfferType {
value: string;
displayName: string;
}

export const OfferTypes: OfferType[] = [
    { displayName: "Show a property", value: "showProperty" },
    { displayName: "Hire Home Inspector", value: "hireHomeInspector" },
    { displayName: "Install Sign Post", value: "installSignPost" },
    { displayName: "Write a Contract", value: "writeContract" },
    { displayName: "Transaction Coordination (Single File)", value: "coordinateTransaction"},
    { displayName: "Lead", value: "lead" },
    { displayName: "Pick Up Items", value: "pickUpItem" },
    { displayName: "Other", value: "other" }
];

class MyState {
    rules: FormCtrlGroup
}

class OfferForm extends React.Component<{}, MyState> {
    getBracketValue = new RegExp(/\[(.*?)\]/);

    componentWillMount() {
        const rules = new FormCtrlGroup({
            offerType: new FormControl(OfferTypes[0].value, [
                Validators.isRequired,
            ]),
            clientName: new FormControl('', [
                Validators.isRequired,
                Validators.minLength(3),
                Validators.maxLength(100)
            ]),
            propertyAddress: new FormCtrlGroup ({
                street1: new FormControl('', [
                    Validators.isRequired,
                    Validators.maxLength(100)
                ]),
                street2: new FormControl('', [
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
                    Validators.maxLength(5),
                ])
            }),
            commission: new FormCtrlGroup({
                type: new FormControl('flat', [
                    Validators.isRequired
                ]),
                flatAmount: new FormControl(0),
                percentRate: new FormControl(0)
            })
        })

        this.setState({ rules })
    }

    postOffer = () => {
        console.log(this.state.rules.value)
        offerActions.create(this.state.rules.value as IOffer)
        .then(res => {
            this.state.rules.reset();
            this.setState({
                rules: this.state.rules
            });
        })
        .catch(err => NotifActions.notify('danger', err))
    }

    getError = (field: string): string => {
        let schema: FormCtrlGroup | FormControl | FormCtrlArray = this.state.rules;
        field.split('.').forEach(attr => {
            if (attr.indexOf('[') !== -1) {
                const firstPart = attr.split('[')[0]
                const index: number = parseInt(this.getBracketValue.exec(attr)[1])
                schema = schema.controls[firstPart]
                schema = schema.controls[index]
            } else {
              schema = schema.controls[attr]
            }
        })
        return schema.error
            ? schema.error.message
            : ''
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
        console.log(this.state.rules.value)
        this.setState({
            rules: this.state.rules
        })
    }

    render () {


        return <Form className="container">
            <OfferDetails />
            <OfferList />
            <Row><Col>
                <Label for="clientName">Client's Preferred Name</Label>
                <Input
                    type="text"
                    name="clientName"
                    placeholder="Enter Client's Name"
                    value={this.state.rules.controls.clientName.value}
                    invalid={this.state.rules.controls.clientName.invalid}
                    onChange={this.handleChange}/>
                <FormFeedback>{this.getError('clientName')}</FormFeedback>
            </Col></Row>
            <Row><Col>
                <Label>Offer Type</Label>
                <Input type="select" name="offerType"
                    onChange={this.handleChange}
                    value={this.state.rules.controls.offerType.value}
                    invalid={this.state.rules.controls.offerType.error}>
                    {OfferTypes.map((type, key) => {
                        return <option key={key} value={type.value}>{type.displayName}</option>
                    })}
                </Input>
                <FormFeedback>{this.getError('offerType')}</FormFeedback>
            </Col></Row>
            <Row><Col>
                <Label>Address</Label>
                <Input
                    type="text"
                    name="propertyAddress.street1"
                    placeholder="Address"
                    value={this.state.rules.controls.propertyAddress.controls['street1'].value}
                    invalid={this.state.rules.controls.propertyAddress.controls['street1'].error}
                    onChange={this.handleChange}/>
                <FormFeedback>{this.getError('propertyAddress.street1')}</FormFeedback>
            </Col></Row>
            <Row><Col>
                <Label>Address 2</Label>
                <Input
                    type="text"
                    name="propertyAddress.street2"
                    placeholder="Address"
                    value={this.state.rules.controls.propertyAddress.controls['street2'].value}
                    invalid={this.state.rules.controls.propertyAddress.controls['street2'].error}
                    onChange={this.handleChange}/>
                <FormFeedback>{this.getError('propertyAddress.street2')}</FormFeedback>
            </Col></Row>
            <Row form='true'>
                <Col md={6}>
                    <FormGroup>
                        <Label for="propertyAddress.city">City</Label>
                        <Input 
                            type="text" 
                            name="propertyAddress.city"
                            placeholder="City"
                            value={this.state.rules.controls.propertyAddress.controls['city'].value}
                            invalid={this.state.rules.controls.propertyAddress.controls['city'].error}
                            onChange={this.handleChange}
                        />
                        <FormFeedback>{this.getError('propertyAddress.city')}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col md={4}>
                    <FormGroup>
                        <Label for="exampleState">State</Label>
                        <Input 
                            type="select" 
                            name="propertyAddress.state"
                            onChange={this.handleChange}
                            value={this.state.rules.controls.propertyAddress.controls['state'].value}
                            invalid={this.state.rules.controls.propertyAddress.controls['state'].error}>
                            {stateAbbreviations.map((type, key) => <option key={key} value={type}>{type}</option>)}
                        </Input>
                        <FormFeedback>{this.getError('propertyAddress.state')}</FormFeedback>
                    </FormGroup>
                </Col>
                <Col md={2}>
                    <FormGroup>
                        <Label for="propertyAddress.zip">Zip</Label>
                        <Input 
                            type="text" 
                            name="propertyAddress.zip"
                            placeholder="Zip"
                            value={this.state.rules.controls.propertyAddress.controls['zip'].value}
                            invalid={this.state.rules.controls.propertyAddress.controls['zip'].error}
                            onChange={this.handleChange}
                        />
                        <FormFeedback>{this.getError('propertyAddress.zip')}</FormFeedback>
                    </FormGroup>
                </Col>
            </Row>
            <Row form='true'>
                <Col md={6}>
                    <FormGroup>
                        <Label for="commission.type">Commission</Label>
                        <Input 
                            type="select" 
                            name="commission.type"
                            placeholder="Type"
                            value={this.state.rules.controls.commission.controls['type'].value}
                            invalid={this.state.rules.controls.commission.controls['type'].error}
                            onChange={this.handleChange}
                        >
                            <option value="percent">% of Commission</option>
                            <option value="flat">Flat Fee</option>
                            <option value="both">Both (Applicant Chooses)</option>
                        </Input>
                        <FormFeedback>{this.getError('commission.type')}</FormFeedback>
                    </FormGroup>
                </Col>
                {this.state.rules.controls.commission.controls['type'].value === 'percent' || this.state.rules.controls.commission.controls['type'].value === 'both' ? 
                <Col md={4}>
                    <FormGroup>
                        <Label for="commission.percentRate">% of Commission</Label>
                        <Input 
                            type="number" 
                            name="commission.percentRate"
                            onChange={this.handleChange}
                            value={this.state.rules.controls.commission.controls['percentRate'].value}
                            invalid={this.state.rules.controls.commission.controls['percentRate'].error}
                            />
                        <FormFeedback>{this.getError('commission.percentRate')}</FormFeedback>
                    </FormGroup>
                </Col> : ''
                }
                {this.state.rules.controls.commission.controls['type'].value === 'flat' || this.state.rules.controls.commission.controls['type'].value === 'both' ? 
                <Col md={2}>
                    <FormGroup>
                        <Label for="commission.flatAmount">Flat Fee</Label>
                        <Input 
                            type="number" 
                            name="commission.flatAmount"
                            placeholder="Amount"
                            value={this.state.rules.controls.commission.controls['flatAmount'].value}
                            invalid={this.state.rules.controls.commission.controls['flatAmount'].error}
                            onChange={this.handleChange}
                        />
                        <FormFeedback>{this.getError('commission.flatAmount')}</FormFeedback>
                    </FormGroup>
                </Col> : '' }
            </Row>
            <Button className="btn btn-primary"
                // disabled={!this.state.rules.valid}
                onClick={this.postOffer}>
                Post Offer
            </Button>
            </Form>
    }
}

export default OfferForm;