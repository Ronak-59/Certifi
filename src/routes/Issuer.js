import React, {useEffect, useState} from 'react';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import {Buffer} from "buffer";
import {create} from "ipfs-http-client";
import TronWeb from "tronweb";
import utils from "../utils/wallet";
import {sha256} from 'js-sha256'
import {issueCredential as issueCredApi, getIssuedCredentials} from "../utils/api";
import { useLocation } from 'react-router-dom'

const IPFSClient = create('https://ipfs.infura.io:5001/api/v0');

const fullNode = 'https://api.shasta.trongrid.io';
const solidityNode = 'https://api.shasta.trongrid.io';
const eventServer = 'https://api.shasta.trongrid.io';
let tronWeb = new TronWeb(fullNode,solidityNode,eventServer, '');

const activeClasses = "inline-flex p-4 text-blue-600 rounded-t-lg border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500 group";
const inActiveClasses = "inline-flex p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group";

export function Issuer(props) {
    const [publicAddress, setPublicAddress] = useState('');
    const [currentlyVieweing, setCurrentlyViewing] = useState(0);
    const [tab1, setTab1] = useState(activeClasses);
    const [tab2, setTab2] = useState(inActiveClasses);

    useEffect(() => {
        if(window.tronWeb) {
            tronWeb = window.tronWeb;
            setPublicAddress(window.tronWeb.defaultAddress.base58);
            utils.setTronWeb(tronWeb);
            utils.setContract();
        }
    }, []);

    function toggle(activeTab, inActiveTab) {
        activeTab(activeClasses);
        inActiveTab(inActiveClasses);
    }

    return (
        <div>
            <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Institution Dashboard</h1>
            <div className="border-b border-gray-200 dark:border-gray-700 grid place-items-center">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                    <li className="mr-2" onClick={(e) => toggle(setTab1, setTab2)}>
                        <Link to="issue-credentials"
                           className={tab1}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Issue Credentials
                        </Link>
                    </li>
                    <li className="mr-2" onClick={(e) => toggle(setTab2, setTab1)}>
                        <Link to="view-credentials"
                           className={tab2}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            View Issues Credentials
                        </Link>
                    </li>
                </ul>
            </div>

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

    const [data, setData] = useState([])

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if(!data.length) {
            let signature = await utils.signMessage();
            let data = await getIssuedCredentials(signature);
            setData(data);
        }
    };

    return (
        <div>
            <table>
                {data.map((item) => (
                    <tr key={item._id}>
                        {Object.values(item).map((val) => (
                            <td>{val.toString()}</td>
                        ))}
                    </tr>
                ))}
            </table>
        </div>
    );
}