import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import {Buffer} from 'buffer';

import Home from './routes/Home';
import {Issuer, IssueCredentials, ViewCredentials} from './routes/Issuer';
import Receiver from "./routes/Receiver";
import Verifier from "./routes/Verifier";

import logo from './logo.svg';
import './App.css';
import TronWeb from 'tronweb';
import {useEffect} from "react";
import utils from "./utils/wallet";

import { create } from "ipfs-http-client";
const client = create('https://ipfs.infura.io:5001/api/v0');

function App() {
  const fullNode = 'https://api.shasta.trongrid.io';
  const solidityNode = 'https://api.shasta.trongrid.io';
  const eventServer = 'https://api.shasta.trongrid.io';
  let tronWeb = new TronWeb(fullNode,solidityNode,eventServer, '');

  const [publicAddress, setPublicAddress] = useState('');

  function runHashes() {
    utils.runHashes();
  }

  function revokeCredential() {
    let cred = utils.revokeCredential("test2");
    console.log(cred);
  }

  function signMessage() {
    utils.signMessage().then( (result) => console.log(result));
  }

  useEffect(() => {
    if(window.tronWeb) {
      tronWeb = window.tronWeb;
      setPublicAddress(window.tronWeb.defaultAddress.base58);
      utils.setTronWeb(tronWeb);
      utils.setContract();
    }
  });

  return (
      <div className={"App"}>
        <Router>
          <nav>
            <ul>
              <li><Link to="/issuer">Issuer</Link></li>
              <li><Link to="/verifier">Verifier</Link></li>
              <li><Link to="/receiver">Receiver</Link></li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issuer" element={<Issuer />}>
              <Route path="issue-credentials" element={<IssueCredentials />} />
              <Route path="view-credentials" element={<ViewCredentials/>} />
            </Route>
            <Route path="/verifier" element={<Verifier />}>
              <Route path=":hash" element={<Verifier />} />
            </Route>
            <Route path="/receiver" element={<Receiver />} />
          </Routes>
        </Router>
      </div>
  );

  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>src/App.js</code> and save to reload.
  //       </p>
  //       <p>
  //         Your address is {publicAddress}
  //       </p>
  //       <button onClick={runHashes}>Run Hashes</button>
  //       <button onClick={issueCredential}>Issue Credential</button>
  //       <button onClick={revokeCredential}>Revoke Credential</button>
  //
  //       <form onSubmit={handleSubmit}>
  //         <input type="file" onChange={retrieveFile} />
  //         <button type="submit" className="button">Submit</button>
  //       </form>
  //
  //       <button onClick={signMessage}>Sign Message</button>
  //
  //     </header>
  //   </div>
  // );
}

export default App;
