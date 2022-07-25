import React, {useEffect, useState} from 'react';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import {Buffer} from "buffer";
import {create} from "ipfs-http-client";
import TronWeb from "tronweb";
import utils from "../utils/wallet";
import {sha256} from 'js-sha256'
import {issueCredential as issueCredApi, getIssuedCredentials} from "../utils/api";

const IPFSClient = create('https://ipfs.infura.io:5001/api/v0');

const fullNode = 'https://api.shasta.trongrid.io';
const solidityNode = 'https://api.shasta.trongrid.io';
const eventServer = 'https://api.shasta.trongrid.io';
let tronWeb = new TronWeb(fullNode,solidityNode,eventServer, '');

export function Issuer(props) {
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
        <div>
            <h1> Issuer </h1>
            <p><Link to="issue-credentials">Issue Credentials</Link></p>
            <p><Link to="view-credentials">View Credentials</Link></p>

            <Outlet />

        </div>
    );
}

export function IssueCredentials(props) {

    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [recipient, setRecipient] = useState(null);

    const retrieveFile = (e) => {
        const data = e.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);

        reader.onloadend = () => {
            setFile(Buffer.from(reader.result, 'base64'));
        };

        console.log(file);
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!utils.tronWeb.isAddress(recipient)){
            setError("Please enter a valid address");
        } else {
            if(recipient.charAt(0) != 'T'){
                let h = await utils.tronWeb.address.fromHex(recipient);
                setRecipient(h);
            }
            setError("");

            try {
                const created = await IPFSClient.add(file);
                const url = `https://ipfs.infura.io/ipfs/${created.path}`;

                try {
                    let credentialMetadata = {
                        issuer: utils.tronWeb.defaultAddress.base58,
                        recipient: recipient,
                        credentialFileHash: created.path
                    }
                    let hashed_data = sha256(JSON.stringify(credentialMetadata));
                    let txnHash = await utils.issueCredential(hashed_data, recipient);
                    let signed_message = await utils.signMessage();

                    let data = issueCredApi(signed_message, credentialMetadata, txnHash);
                }
                catch (error) {
                    setError("We had some trouble sending the data to the TRON blockchain. Please try again.");
                }



            } catch (error) {
                setError("Please upload a file.");
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <p>{error}</p>
                <input type="input" onChange={(v) => setRecipient(v.target.value)} placeholder="recipient address" />
                <input type="file" onChange={retrieveFile} />
                <button type="submit" className="button">Issue Credential</button>
            </form>
        </div>
    );
}

export function ViewCredentials(props) {

    const fetchData = async () => {
        let signature = utils.signMessage();
        let data = await getIssuedCredentials(signature);
    };

    fetchData();

    return (
        <div>
            <p>View Creds</p>
        </div>
    );
}