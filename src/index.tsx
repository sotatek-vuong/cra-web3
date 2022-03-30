import React from 'react';
import ReactDOMClient from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppWeb3Provider } from './hooks';
import BN from 'bignumber.js';

BN.config({
  ROUNDING_MODE: BN.ROUND_DOWN,
});

const container = document.getElementById('root')!;
ReactDOMClient.createRoot(container).render(
  <React.StrictMode>
    <AppWeb3Provider>
      <App />
    </AppWeb3Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
