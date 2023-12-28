import { expect } from "chai";
import { ethers, network } from "hardhat";
import { chainId, developmentChains, networkConfig } from "../../helper-hardhat-config";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// const transactionResponse = await raffle.performUpkeep("0x");
// const transactionReceipt = await transactionResponse.wait();
// // const requestId = transactionReceipt?.logs[0].topics[0];
// // console.log(transactionReceipt?.logs[0].topics[0]);
// await vrfCoordinatorV2Mock.fulfillRandomWords(1n, raffleAddress)

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Staging Tests", function () {
      describe("fulfillRandomWords", function () {
        it("Should get a random winner with live Chainlink Automation and VRF", async function () {
          const [deployer] = await ethers.getSigners();
          const raffleAddress = "0x02b440dcc53c80b855d5d32481310787961A33Da";
          const raffle = await ethers.getContractAt("Raffle", raffleAddress);
          const raffleEntranceFee = await raffle.getEntranceFee();
          const startingTimeStamp = await raffle.getLastTimeStamp();

          await new Promise<void>(async (resolve, reject) => {
            raffle.once(raffle.getEvent("WinnerPicked"), async function () {
              console.log("WinnerPicked event fired!");

              try {
                const winnerEndingBalance = await ethers.provider.getBalance(deployer.address);

                expect(await raffle.getRecentWinner()).to.equal(deployer.address);
                expect(await raffle.getNumberOfPlayers()).to.equal(0);
                expect(await raffle.getRaffleState()).to.equal(0);
                expect(await raffle.getLastTimeStamp()).to.be.gt(startingTimeStamp);
                expect(winnerEndingBalance).to.equal(winnerStartingBalance + raffleEntranceFee);

                resolve();
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });

            console.log("Entering Raffle...");
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
            await tx.wait();
            console.log("Waiting for the WinnerPicked event to fire...");
            const winnerStartingBalance = await ethers.provider.getBalance(deployer.address);
          });
        });
      });
    });
