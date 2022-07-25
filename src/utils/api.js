import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://api.getcertifi.app'
});

export const issueCredential = async (signature, credentialMetadata, blockchainTxnHash) => {
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

export const revokeCredential = async (signature, encryptedHash) => {
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

export const getIssuedCredentials = async (signature) => {
    try {
        const response = await instance.post('/issued-credentials', {
            signature,
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const getReceivedCredentials = async (signature) => {
    try {
        const response = await instance.post('/received-credentials', {
            signature,
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const fetchCredentialDetails = async (encryptedHash) => {
    try {
        const response = await instance.get('/fetch-credential-verifier/'+encryptedHash);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}
