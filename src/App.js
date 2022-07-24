import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TronWeb from 'tronweb';
import {useEffect} from "react";
import utils from "./utils/wallet";

function App() {
  const fullNode = 'https://api.shasta.trongrid.io';
  const solidityNode = 'https://api.shasta.trongrid.io';
  const eventServer = 'https://api.shasta.trongrid.io';
  let tronWeb = new TronWeb(fullNode,solidityNode,eventServer, '');
  const [publicAddress, setPublicAddress] = useState('')

  function runHashes() {
    utils.runHashes();
  }

  function issueCredential() {
    let cred = utils.issueCredential("test2", publicAddress);
    console.log(cred);
  }

  function revokeCredential() {
    let cred = utils.revokeCredential("test2");
    console.log(cred);
  }

  useEffect(() => {
    if(window.tronWeb) {
      tronWeb = window.tronWeb;
      setPublicAddress(window.tronWeb.defaultAddress.base58);
      utils.setContract(tronWeb);
    }
  });

  //issue credential
  //revoke credential
  //view hashes


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          Your address is {publicAddress}
        </p>
        <button onClick={runHashes}>Run Hashes</button>
        <button onClick={issueCredential}>Issue Credential</button>
        <button onClick={revokeCredential}>Revoke Credential</button>
      </header>
    </div>
  );
}

export default App;
