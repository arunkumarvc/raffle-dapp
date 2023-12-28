import { ethers, network } from "hardhat";
import { vars } from "hardhat/config";
import { chainId, developmentChains, networkConfig } from "../helper-hardhat-config";
import { VRFCoordinatorV2Mock } from "../typechain-types";
import updateUI from "../utils/updateFrontend";
import verify from "../utils/verify";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  let vrfCoordinatorV2Address: string | undefined;
  let subscriptionId: string | undefined;
  let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock | undefined;

  if (developmentChains.includes(network.name)) {
    const BASE_FEE = ethers.parseEther("0.25");
    const GAS_PRICE_LINK = 1e9;

    console.log("Deploying VRFCoordinatorV2Mock...");
    vrfCoordinatorV2Mock = await ethers.deployContract("VRFCoordinatorV2Mock", [
      BASE_FEE,
      GAS_PRICE_LINK,
    ]);
    await vrfCoordinatorV2Mock.waitForDeployment();
    console.log("VRFCoordinatorV2Mock successfully deployed");

    vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress();
    console.log("VRFCoordinatorV2Mock contract address:", vrfCoordinatorV2Address);

    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt?.logs[0].topics[1];
    if (subscriptionId !== undefined) {
      await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, ethers.parseEther("1"));
    }
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  const args = [
    networkConfig[chainId]["raffleEntranceFee"],
    networkConfig[chainId]["interval"],
    vrfCoordinatorV2Address,
    networkConfig[chainId]["gasLane"],
    subscriptionId,
    networkConfig[chainId]["callbackGasLimit"],
  ];

  console.log("Deploying Raffle...");
  const raffle = await ethers.deployContract("Raffle", args);
  await raffle.waitForDeployment();
  !developmentChains.includes(network.name) && (await raffle.deploymentTransaction()?.wait(6));
  console.log("Raffle successfully deployed");

  const raffleAddress = await raffle.getAddress();
  console.log("Raffle contract address:", raffleAddress);

  if (developmentChains.includes(network.name)) {
    if (vrfCoordinatorV2Mock && subscriptionId !== undefined) {
      await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffleAddress);
    }
  }

  if (!developmentChains.includes(network.name) && vars.get("ETHERSCAN_API_KEY")) {
    await verify(raffleAddress, args);
  }

  await updateUI(raffle, raffleAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
