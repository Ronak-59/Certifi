# CertiFi - Academic Credentials powered by Blockchain

Academic Credentialing Solution powered by IPFS and Tron Blockchain (Shasta Testnet) developed as part of [Tron Hackathon 2022 Season 2](https://trondao.org/hackathon).

![image](https://user-images.githubusercontent.com/8841124/180887092-984d49f4-4c36-4d9e-94a7-028fa3d373bf.png)


## Links

- Live Demo - [CertiFi](https://getcertifi.app)

- Devpost Submission: [CertiFi](https://devpost.com/software/certifi-lgbd3z)

- Youtube Demo: [CertiFi](https://youtu.be/TJdbc56UnLU)

- TronDao Forum Submission: [Certifi](https://forum.trondao.org/t/certifi-by-team-certifi-academic-credentials-powered-by-blockchain/4435)

## Tech-Stack

- Frontend: React, Tailwind CSS
- Backend: Nodejs, Express
- Database: MongoDB
- File Storage Network: IPFS
- Blockchain: Tron (Shasta Testnet)
- Other Tools/Libraries: TronWeb, Infura, etc.

## Setup

First clone the repo: 

```bash
git clone https://www.github.com/Ronak-59/CertiFi
```

### Backend: 

Run the following commands:

```bash
cd backend
npm install
```
Then copy `.env.example` to `.env` and set/update the values in the file. After setting the environment variables, run the following command to start the server:

```bash
npm run start
```
Now, the backend should be live at `http://localhost:5544`

### Frontend:

Go to the root of the folder and install node modules:

```bash
npm install
```

Now, set the backend API base url i.e. `http://localhost:5544` to `/src/utils/api.js` and then run the following command:

```bash
npm run start
```
Now, the frontend should be live at `http://localhost:3000`

## Requirements:

- TronLink Extension with Tron account enabled on the browser
- TronLink should be on Shasta Testnet and optionally have some test TRX to issue/revoke credentials

## Team

- [Monik Pamecha](https://www.github.com/monikkinom)
- [Ronak Doshi](https://www.github.com/Ronak-59)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
