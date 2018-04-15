import * as React from "react";
import * as ReactDOM from "react-dom";
import {Provider} from "react-redux";
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.css";
import store from "../data/store";

import {Main} from "./main/main"

ReactDOM.render(<Provider store={store}><Main /></Provider>,
    document.getElementById("start"))