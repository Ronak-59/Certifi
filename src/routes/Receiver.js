import React, {useEffect, useState} from 'react';
import {getReceivedCredentials} from "../utils/api";
import utils from "../utils/wallet";
import TronWeb from "tronweb";
import '../index.scss';

const fullNode = 'https://api.shasta.trongrid.io';
const solidityNode = 'https://api.shasta.trongrid.io';
const eventServer = 'https://api.shasta.trongrid.io';
let tronWeb = new TronWeb(fullNode,solidityNode,eventServer, '');

function Receiver() {
    const [publicAddress, setPublicAddress] = useState('');
    const [creds, setCreds] = useState([])
    let dataReady = false

    useEffect(() => {
        if(window.tronWeb) {
            tronWeb = window.tronWeb;
            setPublicAddress(window.tronWeb.defaultAddress.base58);
            utils.setTronWeb(tronWeb);
            utils.setContract();
            fetchData();
        }
    }, []);

    const fetchData = async () => {
        if(!dataReady) {
            let signedMessage = await utils.signMessage();
            let receivedCredentials = await getReceivedCredentials(signedMessage);
            dataReady = true;
            setCreds(receivedCredentials);
        }
    }

    return (
        <div>
        <div className="cover">
            <div className="overlay"></div>
            <div
                className="
        row
        d-flex
        justify-content-center
        align-items-center
        w-100
        flex-column
        profileDesc
      "
            style={{display: "flex"}}>
                <div className="profileImage">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{width: "8rem", height:"8rem", color: "#3056D3"}}>
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>


                </div>
                <div style={{cursor: "pointer", textAlign: "center"}} title="Copy to Clipboard">


                <p className="profileName" id="walletAddress" style={{wordBreak: "break-all", marginTop: "50px"}}>
                    {publicAddress}
                </p>



            </div>

        </div>

        </div>
            <div>
                <header className="app-header"></header>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Credentials Issued to You</h3>
                {(!creds || !creds.length) &&
                <div
                    className="p-4 mb-4 mt-5 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
                    role="alert">
                    <span className="font-medium">No credentials have been issued to your address yet.</span>
                </div>
                }
                <div className="card-grid" id="app-card-list">
                    {
                        Object
                            .keys(creds)
                            .map(key => <Card details={creds[key]}/>)
                    }
                </div>
            </div>
        </div>
    );
}


class Button extends React.Component {
    render() {
        return (
            <button type="button" onClick={(e) => {
                e.preventDefault();
                window.location.href=this.props.link;
            }}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">{this.props.value}</button>

        )
    }
}


function timestampToDate(timestamp){
    const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit'}).format(timestamp);
    return date;
}

class Card extends React.Component {

    render() {
        return (
        <a href='#'
           className="block p-6 max-w-md bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            <div style={{textAlign: 'center', display: 'inline-table', position: 'relative'}}>
                <img className="rounded-t-lg" onError={(event)=>event.target.setAttribute("src","https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Gnome-application-certificate.svg/1024px-Gnome-application-certificate.svg.png")} src={'https://ipfs.infura.io/ipfs/'+this.props.details.credentialMetadata.credentialFileHash} alt="" style={{height: '150px'}}  />
            </div>
            <p className="mb-2 font-bold tracking-tight text-gray-900 dark:text-white">Issuer: {this.props.details.credentialMetadata.issuer}</p>
            <p className="font-normal text-gray-700 dark:text-gray-400">Issued on: {timestampToDate(this.props.details.credentialIssuanceTimestamp)}</p>
            <Button link={'https://ipfs.infura.io/ipfs/'+this.props.details.credentialMetadata.credentialFileHash} value='View'/>
            <Button link={'../verifier/'+this.props.details.encryptedHash} value='Verify'/>
            <Button link={'https://shasta.tronscan.org/#/transaction/'+this.props.details.blockchainTxnHash} value='View on TronScan'/>
            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Download</button>
        </a>
        )
    }
}

// function downloadCredential(metaData) {
//     const json=JSON.stringify(metaData);
//     const blob=new Blob([json],{type:'application/json'});
//     const href = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = href;
//     link.download = "credential.json";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }


export default Receiver;
