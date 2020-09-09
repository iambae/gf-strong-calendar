import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import {Provider} from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {store, persistor} from "./_helpers/Store"; 
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
    <Provider store={store}>
        {/* Waiting for persisted state to be loaded into the reducer*/}
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>,
    document.getElementById("root"));


if (module.hot && process.env.NODE_ENV !== "production") {
    module.hot.accept();
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
