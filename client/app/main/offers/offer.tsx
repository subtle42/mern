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

class asdf extends React.Component<{}, MyState> {
    getBracketValue = new RegExp(/\[(.*?)\]/);

    // Address(): React.ReactNode {
    //     return (
    //       <div>
    //         <div className="form-group">
    //           <Label for="inputAddress">Address</Label>
    //           <input
    //             type="text"
    //             className="form-control"
    //             id="inputAddress"
    //             placeholder="1234 Main St"
    //             value={this.state.propertyAddress.street1}
    //             onChange={event => {
    //               let address = this.state.propertyAddress;
    //               address.street1 = event.target.value;
    //               this.setState({ propertyAddress: address });
    //             }}
    //           />
    //         </div>
    //         <div className="form-group">
    //           <Label for="inputAddress2">Address 2</Label>
    //           <input
    //             type="text"
    //             className="form-control"
    //             id="inputAddress2"
    //             placeholder="Apartment, studio, or floor"
    //             value={this.state.propertyAddress.street2}
    //             onChange={event => {
    //               let address = this.state.propertyAddress;
    //               address.street2 = event.target.value;
    //               this.setState({ propertyAddress: address });
    //             }}
    //           />
    //         </div>
    //         <div className="form-row">
    //           <div className="form-group col-md-6">
    //             <Label for="inputCity">City</Label>
    //             <input
    //               type="text"
    //               className="form-control"
    //               id="inputCity"
    //               value={this.state.propertyAddress.city}
    //               onChange={event => {
    //                 let address = this.state.propertyAddress;
    //                 address.city = event.target.value;
    //                 this.setState({ propertyAddress: address });
    //               }}
    //             />
    //           </div>
    //           <div className="form-group col-md-4">
    //             <Label for="inputState">State</Label>
    //             <select
    //               id="inputState"
    //               className="form-control"
    //               value={this.state.propertyAddress.state}
    //               onChange={event => {
    //                 let address = this.state.propertyAddress;
    //                 address.state = event.target.value;
    //                 this.setState({ propertyAddress: address });
    //               }}
    //             >
    //               {stateAbbreviations.map(state => <option key={state}>{state}</option>)}
    //             </select>
    //           </div>
    //           <div className="form-group col-md-2">
    //             <Label for="inputZip">Zip</Label>
    //             <input
    //               type="text"
    //               className="form-control"
    //               id="inputZip"
    //               value={this.state.propertyAddress.zip}
    //               onChange={event => {
    //                 let address = this.state.propertyAddress;
    //                 address.zip = event.target.value;
    //                 this.setState({ propertyAddress: address });
    //               }}
    //             />
    //           </div>
    //         </div>
    //       </div>
    //     );
    //   }

    // Commission() {
    //     let type = this.state.commissionType;
    //     return (
    //       <div className="form-row">
    //         <div className="form-group col-md-4">
    //           <Label for="commissionType">Compenstation</Label>
    //           <select
    //             id="commissionType"
    //             className="form-control"
    //             value={this.state.commissionType}
    //             onChange={event =>
    //               this.setState({ commissionType: event.target.value })
    //             }
    //           >
    //             <option >Choose...</option>
    //             <option value="percent">% of Commission</option>
    //             <option value="flat">Flat Fee</option>
    //             <option value="both">Both (Applicant Chooses)</option>
    //           </select>
    //         </div>
    //         {type === "percent" || type === "both"
    //           ? this.renderPercentCommission()
    //           : ""}
    //         {type === "flat" || type === "both" ? this.renderFlatCommission() : ""}
    //       </div>
    //     );
    //   }
    componentWillMount() {
        const rules = new FormCtrlGroup({
            offerType: new FormControl(OfferTypes[0].value, [
                Validators.isRequired,
            ]),
            clientName: new FormControl('', [
                Validators.isRequired,
                // Validators.minLength(3),
                // Validators.maxLength(100)
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
                type: new FormControl('', [
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
            <OfferList />
            <Row>
                <Label for="clientName">Client's Preferred Name</Label>
                <Input
                    type="text"
                    name="clientName"
                    placeholder="Enter Client's Name"
                    value={this.state.rules.controls.clientName.value}
                    invalid={this.state.rules.controls.clientName.invalid}
                    onChange={this.handleChange}/>
                <FormFeedback>{this.getError('clientName')}</FormFeedback>
            </Row>
            <Row>
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
            </Row>
            <Row>
                <Label>Address</Label>
                <Input
                    type="text"
                    name="propertyAddress.street1"
                    placeholder="Address"
                    value={this.state.rules.controls.propertyAddress.controls['street1'].value}
                    invalid={this.state.rules.controls.propertyAddress.controls['street1'].error}
                    onChange={this.handleChange}/>
                <FormFeedback>{this.getError('propertyAddress.street1')}</FormFeedback>
            </Row>
            <Row>
                <Label>Address 2</Label>
                <Input
                    type="text"
                    name="propertyAddress.street2"
                    placeholder="Address"
                    value={this.state.rules.controls.propertyAddress.controls['street2'].value}
                    invalid={this.state.rules.controls.propertyAddress.controls['street2'].error}
                    onChange={this.handleChange}/>
                <FormFeedback>{this.getError('propertyAddress.street2')}</FormFeedback>
            </Row>
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
            <Button className="btn btn-primary"
                // disabled={!this.state.rules.valid}
                onClick={this.postOffer}>
                Post Offer
            </Button>
            </Form>
    }
}


export default asdf;