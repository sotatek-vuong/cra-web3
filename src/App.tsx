import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useAppWeb3, useBalance } from './hooks';

function App() {
  const { connect } = useAppWeb3();
  const { balance } = useBalance();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>{`Balance: ${balance.toString()}`}</h1>
        <button onClick={() => connect('metamask')}>Connect metamask</button>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
