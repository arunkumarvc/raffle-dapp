# Raffle Dapp: Enter to Win with Transparent Randomness

![Image](/frontend/public/site-preview.png)

## A Fair and Secure Raffle Experience on the Blockchain

Welcome to the Raffle Dapp, where you can participate in exciting raffles and win ETH prizes! Built on the Ethereum Sepolia Testnet, this Dapp ensures fairness and transparency in every raffle through the integration of Chainlink VRF v2 for verifiable randomness.

## Overview

This decentralized application (Dapp) allows users to participate in raffles and win ETH. It leverages Chainlink VRF to ensure transparent and verifiable randomness in winner selection.The raffle contract is written in Solidity and deployed on Ethereum Sepolia Testnet.

## Key Features

- **Uncompromising Fairness:** Chainlink VRF guarantees tamper-proof randomness in winner selection, eliminating any possibility of bias or manipulation.

- **Automated Upkeep:** Chainlink Automation streamlines raffle cycles (every 30 seconds), automating winner selection, prize distribution, and contract maintenance for a seamless experience.

- **Complete Transparency:** All raffle actions are immutably recorded on the blockchain, allowing for public scrutiny and ensuring accountability.

- **User-Friendly Interface:** Interact with the Dapp effortlessly through a simple and intuitive interface, designed for both novice and experienced users.

## Get Started in Minutes

### Prerequisites:

- Node.js and npm (or yarn) installed on your system.
- An Ethereum MetaMask wallet
- Testnet ETH or LINK for deployment and testing.

### Installation:

Clone the repository:

```Bash
git clone https://github.com/arunkumarvc/raffle-dapp.git

cd raffle-dapp

yarn install
```

## Usage

1. Install and Set Up MetaMask:

- Visit the official [MetaMask](https://metamask.io/) website.
- Download and install the MetaMask extension for your web browser.
- Create a new wallet or import an existing one using a secure seed phrase.
- Choose a strong password and never share it with anyone.

2. Access the Raffle Dapp:

- `cd frontend`
- `yarn dev`
- Open the Raffle Dapp's web interface in your browser(http://localhost:3000/).

3. Connect MetaMask:

- Click the "Connect MetaMask" to initiate the connection process.
- A MetaMask pop-up will appear, asking you to select the account you want to connect.
- Click the "Enter Raffle" to enter the raffle.

## License

This project is licensed under the MIT License.
