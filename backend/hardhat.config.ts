import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import "hardhat-contract-sizer";
import { HardhatUserConfig, vars } from "hardhat/config";

// Ethereum and polygon mainnet RPC_URL
const ETHEREUM_MAINNET_API_KEY = vars.get("ETHEREUM_MAINNET_API_KEY");
const POLYGON_MAINNET_API_KEY = vars.get("POLYGON_MAINNET_API_KEY");

// Etherscan and Polygonscan testnet RPC_URL
const SEPOLIA_API_KEY = vars.get("SEPOLIA_API_KEY");
const MUMBAI_API_KEY = vars.get("MUMBAI_API_KEY");

// Etherscan, Polygonscan and CoinmarketCap API keys
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const POLYGONSCAN_API_KEY = vars.get("POLYGONSCAN_API_KEY");
const COINMARKETCAP_API_KEY = vars.get("COINMARKETCAP_API_KEY");

// Private Key
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",

  solidity: {
    compilers: [{ version: "0.6.12" }, { version: "0.8.22" }],
  },

  networks: {
    // hardhat: {
    //   forking: {
    //     url: `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_API_KEY}`,
    //     blockNumber: 4866600,
    //   },
    //   chainId: 31337,
    // },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_API_KEY}`,
      chainId: 11155111,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_API_KEY}`,
      chainId: 80001,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ETHEREUM_MAINNET_API_KEY}`,
      chainId: 1,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${POLYGON_MAINNET_API_KEY}`,
      chainId: 137,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },

  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
    },
  },

  gasReporter: {
    enabled: false,
    coinmarketcap: COINMARKETCAP_API_KEY,
    currency: "INR",
    token: "ETH",
    // outputFile: "gas-report.txt",
    // noColors: true,
  },

  mocha: {
    timeout: 300000,
  },
};

export default config;
