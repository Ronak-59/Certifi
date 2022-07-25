import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppHeader from "./components/AppHeader";

import Home from './routes/Home';
import {Issuer, IssueCredentials, ViewCredentials} from './routes/Issuer';
import Receiver from "./routes/Receiver";
import Verifier from "./routes/Verifier";

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
        <AppHeader address={publicAddress} />
        <Router>
          {/*<nav>*/}
          {/*  <ul>*/}
          {/*    <li><Link to="/issuer">Issuer</Link></li>*/}
          {/*    <li><Link to="/verifier">Verifier</Link></li>*/}
          {/*    <li><Link to="/receiver">Receiver</Link></li>*/}
          {/*  </ul>*/}
          {/*</nav>*/}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/institution" element={<Issuer />}>
              <Route path="issue-credentials" element={<IssueCredentials />} />
              <Route path="view-credentials" element={<ViewCredentials/>} />
            </Route>
            <Route path="/verifier" element={<Verifier />}>
              <Route path=":hash" element={<Verifier  />} />
            </Route>
            <Route path="/learner" element={<Receiver />} />
          </Routes>
        </Router>
      </div>
  );
}

export default App;
