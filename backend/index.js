const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cors = require('cors')
const {createHash, encrypt, decrypt, getAddressFromSignature} = require('./utils/utils');
const Credentials = require('./models/credentialSchema');
require('dotenv').config();
const app = express()
const port = 5544

app.use(bodyParser.json());
app.use(cors())

app.get('/', (req, res) => {
    res.send('Backend all set');
})

app.post('/issued-credentials', async (req, res) => {
    const signature = req.body.signature;

    try {
        const issuer = await getAddressFromSignature(process.env.SIGNATURE_MESSAGE, signature);
        const issuedCredentials = await Credentials.find({'credentialMetadata.issuer':issuer});
        res.status(200).json(issuedCredentials);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.post('/received-credentials', async(req, res) => {
    const signature = req.body.signature;
    console.log(signature);
    try {
        const recipient = await getAddressFromSignature(process.env.SIGNATURE_MESSAGE, signature);
        const receivedCredentials = await Credentials.find({'credentialMetadata.recipient':recipient});
        res.status(200).json(receivedCredentials);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.post('/issue-credential', async(req, res) => {
    const signature = req.body.signature;
    const blockchainTxnHash = req.body.blockchainTxnHash;
    const credentialMetadata = req.body.credentialMetadata;

    try {
        const issuer = await getAddressFromSignature(process.env.SIGNATURE_MESSAGE, signature);

        if(issuer===credentialMetadata.issuer){
            const credentialHash = await createHash(credentialMetadata);
            const encryptedHash = await encrypt(credentialHash);

            const credential = await Credentials.create({
                credentialMetadata: {
                    issuer,
                    recipient: credentialMetadata.recipient,
                    credentialFileHash: credentialMetadata.credentialFileHash
                },
                encryptedHash,
                blockchainTxnHash,
                credentialIssuanceTimestamp: Date.now()
            });
            res.status(200).json(credential);
        } else {
            res.status(400).send("Issuer signature mismatch.");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.post('/revoke-credential', async (req, res) => {
    const signature = req.body.signature;
    const encryptedHash = req.body.encryptedHash;

    try {
        const issuer = await getAddressFromSignature(process.env.SIGNATURE_MESSAGE, signature);

        const revokedCredential = await Credentials.updateOne({
            'credentialMetadata.issuer':issuer,
            encryptedHash
        }, {
            $set: {
                'credentialRevoked': true
            }
        });
        res.status(200).json({"success": true});
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

});

app.post('/fetch-credential-recipient', async (req, res) => {
    const signature = req.body.signature;
    const encryptedHash = req.body.encryptedHash;

    try {
        const recipient = await getAddressFromSignature(process.env.SIGNATURE_MESSAGE, signature);

        const credential = await Credentials.findOne({
            'credentialMetadata.recipient':recipient,
            encryptedHash
        });
        res.status(200).json(credential);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

app.get('/fetch-credential-verifier/:encryptedHash', async (req, res) => {
    const encryptedHash = req.params.encryptedHash;

    try {
        const credential = await Credentials.findOne({encryptedHash});
        res.status(200).json(credential);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

});

mongoose.connect(process.env.MONGO_DATABASE_URL).then(()=>{
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Certifi backend listening on port ${port}`)
    })
})
