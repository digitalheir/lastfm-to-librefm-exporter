import * as React from "react";
import {render} from "react-dom";
// import { Provider } from "react-redux";
// import {applyMiddleware, createStore} from "redux";
// import {rootReducer} from "./reducers";
import {App} from "./components/App";
import {parseUrlParams} from "./browser";
// import thunkMiddleware from "redux-thunk";
// import {createLogger} from "redux-logger";

// const loggerMiddleware = createLogger();
//
// const store = createStore(rootReducer,
//     applyMiddleware(
//         thunkMiddleware, // lets us dispatch() functions
//         loggerMiddleware // neat middleware that logs actions
//     ));

const mountPoint = document.getElementById("mount-point");
const l = window ? window.location : null;
const params = parseUrlParams(l ? l.search : null);
if (mountPoint) render(<App {...params}/>, mountPoint);

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('js/service-worker.js', {
//     // scope: '/'
//   }).then(function(sw) {
//     console.log("Service worker registered");
//   }).catch(function(e) {
//     console.error("Could not register service worker");
//     console.error(e);
//   });
// }
