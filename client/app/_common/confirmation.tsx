// import {Button, Modal, Glyphicon, Row, Col, Checkbox, FormGroup, ControlLabel, ModalBody} from "react-bootstrap";
// import * as React from "react";

// interface Props {}

// class State {
//     showModal:boolean = false;
// }

// export class DeletePageButton extends React.Component<Props, State> {
//     state:State = new State();

//     open = (event) => {
//         this.setState({showModal: true});
//     }

//     cancel = (event) => {
//         if (event) event.stopPropagation();
//         this.setState(new State());
//     }

//     close = (event) => {}

//     getHeader():JSX.Element {
//         return (<Modal.Header>Page Configuration</Modal.Header>);
//     }

//     getFooter():JSX.Element {
//         return (
//             <Modal.Footer>
//                 <Button onClick={this.cancel} color="warning">Cancel</Button>
//                 <Button onClick={this.cancel} color="primary">Save</Button>
//             </Modal.Footer>
//         );
//     }

//     getBody():JSX.Element {
//         return (<ModalBody></ModalBody>);
//     }

//     render() {
//         return (<div>
//             <Button>
//                 <Glyphicon glyph="cog" />
//                 <Modal size="large" show={this.state.showModal} onHide={this.cancel}>
//                     <form>
//                         {this.getHeader()}
//                         {this.getBody()}
//                         {this.getFooter()}
//                     </form>
//                 </Modal>
//             </Button>
//         </div>);
//     }
// }
