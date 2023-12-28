# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

```ts
import { ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";

const BASE_FEE = ethers.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying mock contract with the account:", deployer.address);

  if (developmentChains.includes(network.name)) {
    console.log("Deploying VRFCoordinatorV2Mock...");
    const vrfCoordinatorV2Mock = await ethers.deployContract("VRFCoordinatorV2Mock", [
      BASE_FEE,
      GAS_PRICE_LINK,
    ]);
    await vrfCoordinatorV2Mock.waitForDeployment();
    console.log("VRFCoordinatorV2Mock successfully deployed");

    const vrfCoordinatorV2MockAddress = await vrfCoordinatorV2Mock.getAddress();
    console.log("VRFCoordinatorV2Mock contract address:", vrfCoordinatorV2MockAddress);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```
