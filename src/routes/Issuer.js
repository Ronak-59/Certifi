import React, {useEffect, useState} from 'react';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import {Buffer} from "buffer";
import {create} from "ipfs-http-client";
import TronWeb from "tronweb";
import utils from "../utils/wallet";
import {sha256} from 'js-sha256'
import {issueCredential as issueCredApi, getIssuedCredentials, revokeCredential} from "../utils/api";

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
            <div className="pt-5 border-b border-gray-200 dark:border-gray-700 grid place-items-center">
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
                            View Issued Credentials
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
    const [spinner, setSpinner] = useState(false);
    const [hashedData, setHashedData] = useState(null);
    const [error, setError] = useState("");
    const [recipient, setRecipient] = useState("");
    const [success, setSuccess] = useState(null);

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
        setSpinner(true);
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
                    setHashedData(hashed_data);
                    setSuccess(txnHash);
                    setRecipient("");
                    let data = issueCredApi(signed_message, credentialMetadata, txnHash);
                }
                catch (error) {
                    setError("We had some trouble sending the data to the TRON blockchain. Please try again.");
                }

            } catch (error) {
                setError("Please upload a file.");
            }
            setSpinner(false);
        }
    };

    return (
        <>
            <div>
                <div className="grid place-items-center pt-10">
                    <div className="mt-5 md:mt-0 md:col-span-1">
                        <form onSubmit={handleSubmit}>
                            <div className="shadow sm:rounded-md sm:overflow-hidden">
                                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">

                                    {error && (<div
                                        className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
                                        role="alert">
                                        <span className="font-medium">{error}!</span>
                                    </div>)}

                                    {spinner && (<div role="status place-items-center">
                                        <svg aria-hidden="true"
                                             className="mr-2 w-full h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"/>
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"/>
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>)}

                                    {success && (<div
                                        className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800"
                                        role="alert">
                                        <span className="font-medium">Credential Issued!</span> Your transaction has succeeded and you can
                                        verify it here <a className="font-medium" href={`https://shasta.tronscan.org/#/transaction/${success}`}>TronScan</a>. The learner will be able to see it in their account and be able to <Link to={`/verifier/${hashedData}`} className="font-medium">verify</Link> it using our verifier.
                                    </div>)}

                                    <div>
                                        <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                                            Recipient Address
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="about"
                                                name="about"
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 p-2 block w-full md:text-md border border-gray-300"
                                                defaultValue={''}
                                                value={recipient}
                                                onChange={(v) => setRecipient(v.target.value)} placeholder=" Recipient address"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Credential File</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                            <div className="space-y-1 text-center">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={retrieveFile} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF, PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Issue Credential
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export function ViewCredentials(props) {

    const [data, setData] = useState([]);

    function timestampToDate(timestamp){
        const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit'}).format(timestamp);
        return date;
    }

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

    const revokeCred = async (encryptedHash) => {
        console.log(encryptedHash);
        let sign = await utils.signMessage();
        let revokeStatus = await utils.revokeCredential(encryptedHash);
        let apiRevoke = await revokeCredential(sign, encryptedHash);
        if(apiRevoke) {
            alert("Credential has been revoked");
        }
    };

    return (
        <>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg mt-1">
                {(!data || !data.length) &&
                <div
                    className="p-4 mb-4 mt-5 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 grid place-items-center"
                    role="alert">
                    <span className="font-medium">No credentials have been issued by your address yet.</span>
                </div>
                }
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="py-3 px-6">
                            Recipient
                        </th>
                        <th scope="col" className="py-3 px-6">
                            Issued On
                        </th>
                        <th scope="col" className="py-3 px-6">
                            Actions
                        </th>
                        <th scope="col" className="py-3 px-6">
                            View
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((item) => (
                        <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                            <th scope="row"
                                className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.credentialMetadata.recipient}
                            </th>
                            <td className="py-4 px-6">
                                {timestampToDate(item.credentialIssuanceTimestamp)}
                            </td>
                            <td className="py-4 px-6">
                                <button type="button" onClick={(e) => {revokeCred(item.encryptedHash)}}
                                        className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Revoke
                                </button>
                                <Link to={`/verifier/${item.encryptedHash}`}>
                                    <button type="button"
                                            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Verify
                                    </button>
                                </Link>
                            </td>
                            <td className="py-4 px-6">
                                <a className="text-blue-600 mr-5" href={`https://ipfs.infura.io/ipfs/${item.credentialMetadata.credentialFileHash}`}>
                                    IPFS Link
                                </a>
                            </td>
                        </tr>
                    ))}

                    </tbody>
                </table>
            </div>

        </>
        // <div>
        //     <table>
        //         {data.map((item) => (
        //             <tr key={item._id}>
        //                 {Object.values(item).map((val) => (
        //                     <td>{val.toString()}</td>
        //                 ))}
        //             </tr>
        //         ))}
        //     </table>
        // </div>
    );
}