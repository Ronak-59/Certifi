pragma solidity >=0.7.0 <0.9.0;

contract CredentialStore {

    enum State {not_issued, valid, revoked}

    struct Credential {
        address issuer;
        address recipient;
        State status;
    }

    address internal owner;

    mapping(string => Credential) public hashes;

    // events for EVM logging and indexing
    event CredentialIssued(string indexed _hash, address indexed issuer, address indexed recipient);

    event CredentialRevoked(string indexed _hash);

    constructor() {
        owner = msg.sender;
    }

    // Issue a new credential
    function issue_credential(string memory _hash, address recipient) public {
        require(recipient != address(0), "Kindly provide a valid recipient address");
        hashes[_hash].issuer = msg.sender;
        hashes[_hash].recipient = recipient;
        hashes[_hash].status = State.valid;
        emit CredentialIssued(_hash, msg.sender, recipient);
    }

    //Revoke an existing credential
    function revoke_credential(string memory _hash) public {
        Credential memory cred = hashes[_hash];
        require(msg.sender == cred.issuer);
        cred.status = State.revoked;
        hashes[_hash] = cred;
        emit CredentialRevoked(_hash);
    }
}
