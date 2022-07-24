const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let credentialSchema = new Schema({
   credentialMetadata: {
       issuer: {
           type: String,
           required: true
       },
       recipient: {
           type: String,
           required: true
       },
       credentialFileHash: {
           type: String,
           required: false
       }
   },
    encryptedHash: {
       type: String, required: true
    },
    blockchainTxnHash: {
       type: String, required: true
    },
    credentialIssuanceTimestamp: {
        type: Number,
        required: true
    },
    credentialRevoked: {
       type: Boolean,
        required: false
    }

});

const Credentials = mongoose.model('Credential', credentialSchema);

module.exports = Credentials;
