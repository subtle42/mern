import * as React from 'react'
import {
    RouteComponentProps
  } from "react-router";
import {IOffer} from 'common/models'
import { Label, Button } from 'reactstrap';
import offerActions from 'data/offer/actions'
import { FormCtrlGroup, FormControl } from '../../_common/validation';
import * as Validators from '../../_common/validators'
import FormFeedback from 'reactstrap/lib/FormFeedback';
import Input from 'reactstrap/lib/Input';
import OfferList from './list'


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
            offerType: new FormControl('', [
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
                state: new FormControl('', [
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
                flatAmount: new FormControl(''),
                percentrate: new FormControl('')
            })
        })

        this.setState({ rules })
    }

    postOffer() {
        offerActions.create({} as any)
        .then()
    }

    getError = (field: string): string => {
        return this.state.rules.controls[field].error
            ? this.state.rules.controls[field].error.message
            : ''
    }

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.state.rules.controls[target.name].value = target.value
        this.setState({
            rules: this.state.rules
        })
    }

    render () {
        return <div> 
            <OfferList />
        <section className="container">
        <h2>Show a property</h2>
        <form>
          {/* {this.Address()} */}
          <div className="form-row">
            <div className="form-group col-md-6">
              <Label for="clientName">Client's Preferred Name</Label>
              <Input
                type="text"
                name="clientName"
                placeholder="Enter Client's Name"
                value={this.state.rules.controls.clientName.value}
                invalid={this.state.rules.controls.clientName.invalid}
                onChange={this.handleChange}
              />
            <FormFeedback>{this.getError('clientName')}</FormFeedback>

            </div>
          </div>
          {/* {this.Commission()} */}
          <Button className="btn btn-primary" onClick={this.postOffer}>
            Post Offer
          </Button>
        </form>
      </section>
      </div>
    }
}


export default asdf;