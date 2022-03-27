import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store";
import { Provider } from "react-redux";
import "./styles/reset.css";
import { MoralisProvider } from "react-moralis";

ReactDOM.render(
  <Provider store={store}>
    <MoralisProvider appId="2WUT4CKa3t3Gs3yw8msHrSR4YYZIGfqPlb1N8qsh" serverUrl="https://guj88dedqrr7.usemoralis.com:2053/server">
      <App />
    </MoralisProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
