import React, {useEffect, useState} from 'react';
import {getReceivedCredentials} from "../utils/api";
import utils from "../utils/wallet";
import TronWeb from "tronweb";

const fullNode = 'https://api.shasta.trongrid.io';
const solidityNode = 'https://api.shasta.trongrid.io';
const eventServer = 'https://api.shasta.trongrid.io';
let tronWeb = new TronWeb(fullNode,solidityNode,eventServer, '');

async function Receiver() {
    const [publicAddress, setPublicAddress] = useState('');

    useEffect(() => {
        if(window.tronWeb) {
            tronWeb = window.tronWeb;
            setPublicAddress(window.tronWeb.defaultAddress.base58);
            utils.setTronWeb(tronWeb);
            utils.setContract();
        }
    });

    let signedMessage = await utils.signMessage();

    let receivedCredentials = await getReceivedCredentials(signedMessage);
    console.log(receivedCredentials);
    return (
        <table>
            <tr key={"header"}>
                {Object.keys(receivedCredentials[0]).map((key) => (
                    <th>{key}</th>
                ))}
            </tr>
            {receivedCredentials.map((item) => (
                <tr key={item._id}>
                    {Object.values(item).map((val) => (
                        <td>{val.toString()}</td>
                    ))}
                </tr>
            ))}
        </table>
    );
}

export default Receiver;
