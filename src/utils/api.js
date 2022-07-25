import axios from 'axios';

const BASE_URL = 'http://54.89.89.217:5544';

const instance = axios.create({
    baseURL: 'https://some-domain.com/api/'
});
const signature = "TODO";

const issueCredential = async (signature, credentialMetadata, blockchainTxnHash) => {
    try {
        const response = await instance.post('/issue-credential', {
            signature,
            credentialMetadata,
            blockchainTxnHash
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const revokeCredential = async (signature, encryptedHash) => {
    try {
        const response = await instance.post('/revoke-credential', {
            signature,
            encryptedHash
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const getIssuedCredentials = async (signature) => {
    try {
        const response = await instance.post('/issued-credential', {
            signature,
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const getReceivedCredentials = async (signature) => {
    try {
        const response = await instance.post('/received-credential', {
            signature,
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const fetchCredentialDetails = async (encryptedHash) => {
    try {
        const response = await instance.get('/fetch-credential-verifier/'+encryptedHash);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}
