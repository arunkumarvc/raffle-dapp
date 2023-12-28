import { ethers } from "hardhat";
import { chainId } from "../helper-hardhat-config";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function mockKeepers() {
  const raffle = await ethers.getContractAt("Raffle", "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
  const checkData = ethers.keccak256(ethers.toUtf8Bytes(""));
  const interval = await raffle.getInterval();
  await time.increase(Number(interval) + 1);
  const { upkeepNeeded } = await raffle.checkUpkeep.staticCall(checkData);
  if (upkeepNeeded) {
    const tx = await raffle.performUpkeep(checkData);
    await tx.wait();
    if (chainId === 31337) {
      console.log("Running VRF Mock");
      const vrfCoordinatorV2Mock = await ethers.getContractAt(
        "VRFCoordinatorV2Mock",
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      );
      const tx = await vrfCoordinatorV2Mock.fulfillRandomWords(1, await raffle.getAddress());
      await tx.wait();
      console.log("RandomWords Fulfilled!");
      const recentWinner = await raffle.getRecentWinner();
      console.log(`The winner is: ${recentWinner}`);
    }
  } else {
    console.log("No upkeep needed!");
  }
}

mockKeepers().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
