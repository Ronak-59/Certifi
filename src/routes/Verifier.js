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
    const [verifyHash, setVerifyHash] = useState(null); //from the form
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
                <form onSubmit={redirect}>
                    <input type="text" onChange={(e) => setVerifyHash(e.target.value)} />
                    <button type="submit">Verify</button>
                </form>
                <br/>
                <form onSubmit={manageUpload}>
                    <input type="file" onChange={retrieveFile} />
                    <button type="submit">Verify Uploaded Credentials</button>
                </form>
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