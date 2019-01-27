import * as React from 'react'
import {
    RouteComponentProps
  } from "react-router";
import {IOffer} from 'common/models'


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
    {
      displayName: "Transaction Coordination (Single File)",
      value: "coordinateTransaction"
    },
    { displayName: "Lead", value: "lead" },
    { displayName: "Pick Up Items", value: "pickUpItem" },
    { displayName: "Other", value: "other" }
  ];

