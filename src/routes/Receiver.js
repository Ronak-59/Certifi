import React, {useEffect, useState} from 'react';
import {getReceivedCredentials} from "../utils/api";
import utils from "../utils/wallet";
import TronWeb from "tronweb";

const fullNode = 'https://api.shasta.trongrid.io';
const solidityNode = 'https://api.shasta.trongrid.io';
const eventServer = 'https://api.shasta.trongrid.io';
let tronWeb = new TronWeb(fullNode,solidityNode,eventServer, '');

function Receiver() {
    const [publicAddress, setPublicAddress] = useState('');

    useEffect(() => {
        if(window.tronWeb) {
            tronWeb = window.tronWeb;
            setPublicAddress(window.tronWeb.defaultAddress.base58);
            utils.setTronWeb(tronWeb);
            utils.setContract();
        }
    });

    let signedMessage = utils.signMessage();

    let data = getReceivedCredentials(signedMessage);

    return (
        <p>Receive</p>
    );
}

export default Receiver;