import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import { PaperClipIcon } from '@heroicons/react/solid'

import {fetchCredentialDetails} from "../utils/api";
import utils from "../utils/wallet";
import TronWeb from "tronweb";
import {sha256} from "js-sha256";
import tick from '../tick.gif';
import xmark from '../xmark.png';

const connectUrl = 'https://api.shasta.trongrid.io';
let tronWeb = new TronWeb({ fullHost: connectUrl }, '01');

function Verifier() {
    let { hash } = useParams();
    const navigate = useNavigate();
    const [verifyHash, setVerifyHash] = useState(''); //from the form
    const [verificationStatus, setVerificationStatus] = useState(false);
    const [verificationFailed, setVerificationFailed] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [revoked, setRevoked] = useState(false);
    const [credJsonMetadata, setCredJsonMetadata] = useState({})

    useEffect(() => {
        if(window.tronWeb) {
            tronWeb = window.tronWeb;
        }
        utils.setTronWeb(tronWeb);
        utils.setContract()

        setTimeout(()=>{
            verifyCredsFromAPI()
        }, 1000);

    }, [hash]);

    const verifyCredsFromAPI = async () => {
        setVerifying(true);

        if(!hash)
            return;
        try {
            let data = await fetchCredentialDetails(hash);
            let hashed_data = sha256(JSON.stringify(data.credentialMetadata));
            let h = await utils.runHashes(hashed_data);
            if(h) {
                if(tronWeb.address.fromHex(h.issuer) === data.credentialMetadata.issuer
                    &&
                    tronWeb.address.fromHex(h.recipient) === data.credentialMetadata.recipient
                )
                {
                    setRevoked(h.status === 2);
                    setVerificationStatus(true);
                    setCredJsonMetadata(data.credentialMetadata);
                }
                else
                {
                    setRevoked(h.status === 2);
                    setVerificationStatus(false);
                    setVerificationFailed(true);
                }

            }
        }
        catch (e) {
            setVerificationStatus(false);
            setVerificationFailed(true);
        }

        setVerifying(false);
    }

    function redirect(e) {
        e.preventDefault();
        navigate(verifyHash);
    }

    function manageUpload(e) {
        e.preventDefault();
    };

    function retrieveFile(fl) {

    };

    if(!hash) {
        return (
            <div>
                <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Verification Request</h1>

                <div className="grid place-items-center pt-10">
                    <div className="mt-5 md:mt-0 md:col-span-1">
                        <form onSubmit={redirect}>
                            <div className="shadow sm:rounded-md sm:overflow-hidden">
                                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                                    <div>
                                        <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                                            Verfication Hash
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="about"
                                                name="about"
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 p-2 block w-full md:text-md border border-gray-300"
                                                defaultValue={''}
                                                value={verifyHash}
                                                onChange={(e) => setVerifyHash(e.target.value)} placeholder="Verification Hash"
                                            />
                                        </div>
                                    </div>

                                </div>
                                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Verify Credential
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-2xl mb-2">OR</h1>
                    <div className="mt-5 md:mt-0 md:col-span-1">
                        <form onSubmit={redirect}>
                            <div className="shadow sm:rounded-md sm:overflow-hidden">
                                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Credential Hash File</label>
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
                                                <p className="text-xs text-gray-500">Previously exported JSON file</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Verify Credential
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        );
    };

    return (
        <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Credential Validation Result</h3>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Credential Hash</dt>
                            <dd className="break-words mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{hash}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Verifying Issuer</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 grid place-items-center">{verifying && (<div role="status place-items-center">
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
                            {verificationStatus && (<img className="w-40 h-30" src={tick} />)}{verificationFailed && (<img className="w-20 h-20" src={xmark}></img>)}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Verifying Recipient</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 grid place-items-center">{verifying && (<div role="status place-items-center">
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
                            {verificationStatus && (<img className="w-40 h-30" src={tick} />)}{verificationFailed && (<img className="w-20 h-20" src={xmark}></img>)}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Verifying Credential Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 grid place-items-center">{verifying && (<div role="status place-items-center">
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
                            {verificationStatus && (<img className="w-40 h-30" src={tick} />)}
                                {revoked && (<img className="w-40 h-30" src={xmark}></img>)} </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Download Credentials</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {verificationStatus && (<ul role="list" className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                        <div className="w-0 flex-1 flex items-center">
                                            <PaperClipIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                                            <span className="ml-2 flex-1 w-0 truncate">Credential File</span>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <a href={`https://ipfs.infura.io/ipfs/${credJsonMetadata.credentialFileHash}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                                                Download
                                            </a>
                                        </div>
                                    </li>
                                </ul>)}

                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}

export default Verifier;