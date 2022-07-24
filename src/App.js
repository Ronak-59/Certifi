import logo from './logo.svg';
import './App.css';
import TronWeb from 'tronweb';
import {useEffect} from "react";

function App() {
  const fullNode = 'https://api.shasta.trongrid.io';
  const solidityNode = 'https://api.shasta.trongrid.io';
  const eventServer = 'https://api.shasta.trongrid.io';
  const privateKey = 'xxx';
  const tronWeb = new TronWeb(fullNode,solidityNode,eventServer);
  const publicAddress = window.tronWeb.defaultAddress.base58

  useEffect(() => {

  });

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
      </header>
    </div>
  );
}

export default App;
