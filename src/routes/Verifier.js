import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

import {fetchCredentialDetails} from "../utils/api";

function Verifier() {
    let { hash } = useParams();
    const navigate = useNavigate();
    const [verifyHash, setVerifyHash] = useState(null);

    useEffect(() => {
        let data = fetchCredentialDetails(hash);
    }, []);

    function redirect(e) {
        e.preventDefault();
        navigate(verifyHash);
    }

    if(!hash) {
       return (
           <div>
               <form onSubmit={redirect}>
                   <input type="text" onChange={(e) => setVerifyHash(e.target.value)} />
                       <button type="submit">Verify</button>
               </form>
           </div>
       );
    };

    return (
        <div>
            <p>{hash}</p>
        </div>
    );
}

export default Verifier;