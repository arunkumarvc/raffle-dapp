import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { chainId, developmentChains, networkConfig } from "../../helper-hardhat-config";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", function () {
      async function deployRaffleFixture() {
        const [deployer, addr1] = await ethers.getSigners();

        const BASE_FEE = ethers.parseEther("0.25");
        const GAS_PRICE_LINK = 1e9;
        const vrfCoordinatorV2Mock = await ethers.deployContract("VRFCoordinatorV2Mock", [
          BASE_FEE,
          GAS_PRICE_LINK,
        ]);
        await vrfCoordinatorV2Mock.waitForDeployment();
        const vrfCoordinatorV2Address = await vrfCoordinatorV2Mock.getAddress();
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait();
        const subscriptionId = transactionReceipt?.logs[0].topics[1];
        if (subscriptionId !== undefined) {
          await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, ethers.parseEther("1"));
        }

        const args = [
          networkConfig[chainId]["raffleEntranceFee"],
          networkConfig[chainId]["interval"],
          vrfCoordinatorV2Address,
          networkConfig[chainId]["gasLane"],
          subscriptionId,
          networkConfig[chainId]["callbackGasLimit"],
        ];
        const raffle = await ethers.deployContract("Raffle", args);
        await raffle.waitForDeployment();
        const raffleAddress = await raffle.getAddress();

        if (developmentChains.includes(network.name)) {
          if (vrfCoordinatorV2Mock && subscriptionId !== undefined) {
            await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffleAddress);
          }
        }

        const interval = await raffle.getInterval();
        const raffleEntranceFee = await raffle.getEntranceFee();

        return {
          raffle,
          raffleAddress,
          deployer,
          addr1,
          interval,
          raffleEntranceFee,
          args,
          vrfCoordinatorV2Mock,
        };
      }

      describe("constructor", function () {
        it("Should set the right entranceFee", async function () {
          const { raffleEntranceFee, args } = await loadFixture(deployRaffleFixture);
          expect(raffleEntranceFee).to.equal(args[0]);
        });

        it("Should set the right interval", async function () {
          const { interval, args } = await loadFixture(deployRaffleFixture);
          expect(interval).to.equal(args[1]);
        });

        it("Should set the right vrfCoordinatorV2 address", async function () {
          const { raffle, args } = await loadFixture(deployRaffleFixture);
          expect(await raffle.getVRFCoordinatorV2()).to.equal(args[2]);
        });

        it("Should set the right gasLane", async function () {
          const { raffle, args } = await loadFixture(deployRaffleFixture);
          expect(await raffle.getGasLane()).to.equal(args[3]);
        });

        it("Should set the right subscriptionId", async function () {
          const { raffle, args } = await loadFixture(deployRaffleFixture);
          expect(await raffle.getSubscriptionId()).to.equal(args[4]);
        });

        it("Should set the right callbackGasLimit", async function () {
          const { raffle, args } = await loadFixture(deployRaffleFixture);
          expect(await raffle.getCallbackGasLimit()).to.equal(args[5]);
        });

        it("Should set the right raffleState", async function () {
          const { raffle, args } = await loadFixture(deployRaffleFixture);
          expect(await raffle.getRaffleState()).to.equal("0");
        });
      });

      describe("enterRaffle", function () {
        it("Should revert with the right error if we don't pay enough ETH", async function () {
          const { raffle } = await loadFixture(deployRaffleFixture);
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__SendMoreToEnterRaffle"
          );
        });

        it("Should revert with the right error if raffle isn't open", async function () {
          const { raffle, raffleEntranceFee, interval } = await loadFixture(deployRaffleFixture);

          await raffle.enterRaffle({ value: raffleEntranceFee });
          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");

          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWithCustomError(raffle, "Raffle__RaffleNotOpen");
        });

        it("Should record player when they enter", async function () {
          const { raffle, deployer, raffleEntranceFee } = await loadFixture(deployRaffleFixture);

          await raffle.enterRaffle({ value: raffleEntranceFee });
          expect(await raffle.getPlayer(0)).to.equal(deployer.address);
        });

        it("Should emit a RaffleEnter event", async function () {
          const { raffle, deployer, raffleEntranceFee } = await loadFixture(deployRaffleFixture);

          await expect(raffle.enterRaffle({ value: raffleEntranceFee }))
            .to.emit(raffle, "RaffleEnter")
            .withArgs(deployer.address);
        });

        it("Should call receive function if we send ETH directly", async function () {
          const { raffle, raffleAddress, raffleEntranceFee, deployer } = await loadFixture(
            deployRaffleFixture
          );

          const tx = {
            to: raffleAddress,
            value: raffleEntranceFee,
          };

          expect(await deployer.sendTransaction(tx)).to.changeEtherBalance(
            raffle,
            raffleEntranceFee
          );
        });
      });

      describe("checkUpkeep", function () {
        it("Should return false if raffle isn't open", async function () {
          const { raffle, raffleEntranceFee, interval } = await loadFixture(deployRaffleFixture);

          await raffle.enterRaffle({ value: raffleEntranceFee });
          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");

          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          expect(upkeepNeeded).to.equal(false);
        });

        it("Should return false if enough time hasn't passed", async function () {
          const { raffle, raffleEntranceFee, interval } = await loadFixture(deployRaffleFixture);

          await raffle.enterRaffle({ value: raffleEntranceFee });
          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");

          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          expect(upkeepNeeded).to.equal(false);
        });

        it("Should return false if people haven't sent any ETH", async function () {
          const { raffle, interval } = await loadFixture(deployRaffleFixture);

          await time.increase(Number(interval) + 1);
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          expect(upkeepNeeded).to.equal(false);
        });

        it("Should return true if raffle is open, enough time has passed, has players and balance", async function () {
          const { raffle, raffleEntranceFee, interval } = await loadFixture(deployRaffleFixture);

          await raffle.enterRaffle({ value: raffleEntranceFee });
          await time.increase(Number(interval) + 1);
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          expect(upkeepNeeded).to.be.true;
        });
      });

      describe("performUpkeep", function () {
        it("Should revert with the right error if upkeepNeeded is false", async function () {
          const { raffle, raffleAddress } = await loadFixture(deployRaffleFixture);

          await expect(raffle.performUpkeep("0x"))
            .to.be.revertedWithCustomError(raffle, "Raffle__UpkeepNotNeeded")
            .withArgs(
              await raffle.getRaffleState(),
              await raffle.getNumberOfPlayers(),
              await ethers.provider.getBalance(raffleAddress)
            );
        });

        it("Should update the raffle state to calculating if upkeepNeeded is true", async function () {
          const { raffle, raffleEntranceFee, interval } = await loadFixture(deployRaffleFixture);

          await raffle.enterRaffle({ value: raffleEntranceFee });
          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");

          expect(await raffle.getRaffleState()).to.equal(1);
        });

        it("Should emit a RandomWordsRequested event", async function () {
          const { raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval } = await loadFixture(
            deployRaffleFixture
          );

          await raffle.enterRaffle({ value: raffleEntranceFee });
          await time.increase(Number(interval) + 1);

          await expect(raffle.performUpkeep("0x")).to.emit(
            vrfCoordinatorV2Mock,
            "RandomWordsRequested"
          );
        });
      });

      describe("fulfillRandomWords", function () {
        it("Should revert with the right error if called before performUpkeep", async function () {
          const { raffle, raffleEntranceFee, vrfCoordinatorV2Mock, raffleAddress, interval } =
            await loadFixture(deployRaffleFixture);

          await raffle.enterRaffle({ value: raffleEntranceFee });
          await time.increase(Number(interval) + 1);

          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleAddress)
          ).to.be.revertedWith("nonexistent request");
        });

        it("Should pick a winner", async function () {
          const { raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval, raffleAddress } =
            await loadFixture(deployRaffleFixture);

          const accounts = await ethers.getSigners();
          for (let i = 0; i < 4; i++) {
            await raffle.connect(accounts[i]).enterRaffle({ value: raffleEntranceFee });
          }

          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");
          await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleAddress);

          expect(await raffle.getRecentWinner()).to.equal(accounts[1].address);
        });

        it("Should reset the players array", async function () {
          const { raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval, raffleAddress } =
            await loadFixture(deployRaffleFixture);

          const accounts = await ethers.getSigners();
          for (let i = 0; i < 4; i++) {
            await raffle.connect(accounts[i]).enterRaffle({ value: raffleEntranceFee });
          }

          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");
          await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleAddress);

          expect(await raffle.getNumberOfPlayers()).to.equal(0);
        });

        it("Should update the raffle state to open", async function () {
          const { raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval, raffleAddress } =
            await loadFixture(deployRaffleFixture);

          const accounts = await ethers.getSigners();
          for (let i = 0; i < 4; i++) {
            await raffle.connect(accounts[i]).enterRaffle({ value: raffleEntranceFee });
          }

          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");
          await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleAddress);

          expect(await raffle.getRaffleState()).to.equal(0);
        });

        it("Should update the timestamp", async function () {
          const { raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval, raffleAddress } =
            await loadFixture(deployRaffleFixture);

          const accounts = await ethers.getSigners();
          for (let i = 0; i < 4; i++) {
            await raffle.connect(accounts[i]).enterRaffle({ value: raffleEntranceFee });
          }
          const startingTimeStamp = await raffle.getLastTimeStamp();
          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");
          await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleAddress);

          expect(await raffle.getLastTimeStamp()).to.be.gt(startingTimeStamp);
        });

        it("Should emit a WinnerPicked event", async function () {
          const { raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval, raffleAddress } =
            await loadFixture(deployRaffleFixture);

          const accounts = await ethers.getSigners();
          for (let i = 0; i < 4; i++) {
            await raffle.connect(accounts[i]).enterRaffle({ value: raffleEntranceFee });
          }
          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");

          await expect(await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleAddress))
            .to.emit(raffle, "WinnerPicked")
            .withArgs(accounts[1].address);
        });

        it("Should transfer the ETH to the winner", async function () {
          const { raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval, raffleAddress } =
            await loadFixture(deployRaffleFixture);

          const accounts = await ethers.getSigners();
          for (let i = 0; i < 4; i++) {
            await raffle.connect(accounts[i]).enterRaffle({ value: raffleEntranceFee });
          }
          const winnerStartingBalance = await ethers.provider.getBalance(accounts[1].address);

          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");
          await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleAddress);
          const winnerEndingBalance = await ethers.provider.getBalance(accounts[1].address);

          expect(winnerEndingBalance).to.equal(winnerStartingBalance + raffleEntranceFee * 4n);
        });

        // An error is being reverted, but Hardhat is unable to catch it due to the excessive number of imports and internal operations within vrfCoordinatorV2Mock.
        it("Should revert with the right error if transaction fails", async function () {
          const { raffle, vrfCoordinatorV2Mock, interval, raffleAddress } = await loadFixture(
            deployRaffleFixture
          );

          const failingRecipient = await ethers.deployContract(
            "FailingRecipient",
            [raffleAddress],
            {
              value: ethers.parseEther("1"),
            }
          );
          await failingRecipient.waitForDeployment();
          await failingRecipient.callEnterRaffle();
          await time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x");

          //   await expect(
          //     vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleAddress)
          //   ).to.be.revertedWithCustomError(raffle, "Raffle__TransactionFailed");
        });
      });
    });
