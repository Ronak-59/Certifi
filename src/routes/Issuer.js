import React, { useState } from 'react';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import Verifier from "./Verifier";
import Receiver from "./Receiver";

function Issuer() {
    return (
        <div>
            <h1> Issuer </h1>
            <p><Link to="/issue-credentials">Issue Credentials</Link></p>
            <p><Link to="/view-credentials">View Credentials</Link></p>
            <Routes>
                <Route path="/issue-credentials" element={<issuerCredential />} />
                <Route path="/view-credentials" element={<viewCredentials />} />
            </Routes>
        </div>
    );
}

function issuerCredential() {
    return (
        <div>
            <p>Issue creds</p>
        </div>
    );
}

function viewCredentials() {
    return (
        <div>
            <p>View Creds</p>
        </div>
    );
}

export default Issuer;