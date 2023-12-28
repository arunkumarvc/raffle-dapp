import { ethers, network } from "hardhat";

export interface networkConfigItem {
  name: string;
  raffleEntranceFee: bigint;
  interval: string;
  vrfCoordinatorV2?: string;
  gasLane: string;
  subscriptionId?: string;
  callbackGasLimit: string;
}

export interface networkConfigInfo {
  [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  31337: {
    name: "localhost",
    raffleEntranceFee: ethers.parseEther("0.01"),
    interval: "30",
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000",
  },
  11155111: {
    name: "sepolia",
    raffleEntranceFee: ethers.parseEther("0.01"),
    interval: "30",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    subscriptionId: "2369",
    callbackGasLimit: "500000",
  },
  80001: {
    name: "mumbai",
    raffleEntranceFee: ethers.parseEther("0.01"),
    interval: "30",
    vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    subscriptionId: "2369",
    callbackGasLimit: "500000",
  },
};

export const chainId = network.config.chainId!;
export const developmentChains = ["hardhat", "localhost"];

export const frontEndContractsFile = "../frontend/src/constants/contractAddresses.json";
export const frontEndAbiFile = "../frontend/src/constants/abi.json";
