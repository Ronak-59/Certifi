const crypto = require('crypto');
const TronWeb = require('tronweb');
const {keccak256, toUtf8Bytes, recoverAddress, SigningKey} = require('./etherUtils');
const code = require('./code');

const fullNode = 'https://api.shasta.trongrid.io';
const solidityNode = 'https://api.shasta.trongrid.io';
const eventServer = 'https://api.shasta.trongrid.io';
const tronWeb = new TronWeb(fullNode,solidityNode,eventServer, '');

const createHash = async(data) => {
    return crypto.createHash('sha256')

        // updating data
        .update(JSON.stringify(data))

        // Encoding to be used
        .digest('hex');
}

const encrypt = async(data) => {
    const iv = process.env.ENCRYPTION_IV;
    const key = process.env.ENCRYPTION_SECRET;
    //encrypter function
    const encrypter = crypto.createCipheriv("aes-256-cbc", key, iv);
    // encrypt the message
    // set the input encoding
    // and the output encoding
    let encryptedMsg = encrypter.update(data, "utf8", "hex");
    encryptedMsg += encrypter.final("hex");
    return encryptedMsg;
}

const decrypt = async(data) => {
    const iv = process.env.ENCRYPTION_IV;
    const key = process.env.ENCRYPTION_SECRET;
    // decrypter function
    const decrypter = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decryptedMsg = decrypter.update(data, "hex", "utf8");
    decryptedMsg += decrypter.final("utf8");
    return decryptedMsg;
}

const getAddressFromSignature = async(message, signature) => {
    message = tronWeb.toHex(message);
    const TRX_MESSAGE_HEADER = '\x19TRON Signed Message:\n32';
    message = message.replace(/^0x/, '');
    signature = signature.replace(/^0x/, '');
    const messageBytes = [
        ...toUtf8Bytes(TRX_MESSAGE_HEADER),
        ...code.hexStr2byteArray(message)
    ];

    const messageDigest = keccak256(messageBytes);
    const recovered = recoverAddress(messageDigest, {
        recoveryParam: signature.substring(128, 130) == '1c' ? 1 : 0,
        r: '0x' + signature.substring(0, 64),
        s: '0x' + signature.substring(64, 128)
    });
    const tronAddress = "41" + recovered.substr(2);
    const base58Address = tronWeb.address.fromHex(tronAddress);
    return base58Address;
}



module.exports = {
    createHash,
    encrypt,
    decrypt,
    getAddressFromSignature
}
