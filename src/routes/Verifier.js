import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

import {fetchCredentialDetails} from "../utils/api";
import utils from "../utils/wallet";
import TronWeb from "tronweb";
import {sha256} from "js-sha256";

const connectUrl = 'https://api.shasta.trongrid.io';
let tronWeb = new TronWeb({ fullHost: connectUrl }, '01');

function Verifier() {
    let { hash } = useParams();
    const navigate = useNavigate();
    const [verifyHash, setVerifyHash] = useState(''); //from the form
    const [verificationStatus, setVerificationStatus] = useState(false);
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
                }
            }
        }
        catch (e) {
            setVerificationStatus(false);
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
            <p>{hash}</p>
            <p>Verifying: {verifying ? "verifying" : "done"} </p>
            <p>Verified: {verificationStatus? "verified" : "invalid"}</p>
            <p>Revoked: {revoked ? "revoked" : "valid"}</p>
        </div>
    );
}

export default Verifier;