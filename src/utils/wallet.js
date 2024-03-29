import Cookies from 'js-cookie';

const utils = {
    tronWeb: false,
    contract: false,
    signature_message: "TRON_HACKATHON_2022",
    abi: [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "issuer",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                }
            ],
            "name": "CredentialIssued",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "CredentialRevoked",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "hashes",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "issuer",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "enum CredentialStore.State",
                    "name": "status",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                }
            ],
            "name": "issue_credential",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "revoke_credential",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ],
    contract_address: "TGowP5LUwFR2ZfCqJp3R46Wym6JkWy9Mek",

    setTronWeb(tronWeb) {
        this.tronWeb  = tronWeb;
    },

    async setContract() {
        this.contract = await this.tronWeb.contract(this.abi, this.contract_address);
    },

    async runHashes(encryptedHash) {
        return await this.contract.hashes(encryptedHash).call();
    },

    async issueCredential(_hash, recipient) {
        let h = await this.contract.issue_credential(_hash, recipient).send({
            feeLimit:100_000_000,
            callValue: 0,
            shouldPollResponse: false
        });
        return h;
    },

    async revokeCredential(_hash) {
        let h = await this.contract.revoke_credential(_hash).send({
            feeLimit:100_000_000,
            callValue: 0,
            shouldPollResponse:false
        });
        return h;
    },

    async signMessage() {
        let res = Cookies.get('signedMessage');
        if(res){
            return res;
        }
        res = await this.tronWeb.trx.sign(this.tronWeb.toHex(this.signature_message));
        Cookies.set('signedMessage', res, { expires: 1 });
        return res;
    }
};

export default utils;