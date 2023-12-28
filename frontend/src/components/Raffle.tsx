"use client";

import { abi, contractAddresses } from "@/constants";
import { useMetaMask } from "@/hooks/useMetaMask";
import type { BaseContract, ContractTransactionResponse } from "ethers";
import { ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatAddress } from "@/utils";
import enterToWin from "/public/enter-to-win.png";

import shapes2 from "/public/shapes2.png";
import Account from "./Account";
import Header from "./Header";
import Notification from "./Notification";

interface contractAddressesInterface {
  [key: string]: string[];
}

export interface Raffle extends BaseContract {
  enterRaffle: (entranceFee: any) => Promise<ContractTransactionResponse>;
  getEntranceFee: () => Promise<bigint>;
  getInterval: () => Promise<bigint>;
  getNumberOfPlayers: () => Promise<bigint>;
  getRecentWinner: () => Promise<string>;
}

export default function Raffle() {
  const {
    wallet,
    hasProvider,
    isMetaMask,
    isConnecting,
    connectMetaMask,
    setErrorMessage,
  } = useMetaMask();

  const [entranceFee, setEntranceFee] = useState(""); // ✅
  const [numPlayers, setNumPlayers] = useState(0);
  const [recentWinner, setRecentWinner] = useState(""); // ✅
  const [networkName, setNetworkName] = useState("");
  const [transaction, setTransaction] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearTransaction = () => setTransaction("");
  const chainId = parseInt(wallet.chainId);
  const addresses: contractAddressesInterface = contractAddresses;
  let raffleAddress: string;
  if (chainId in addresses) {
    raffleAddress = addresses[chainId][0];
  }

  async function updateUI() {
    if (hasProvider) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const raffle = new ethers.BaseContract(
        raffleAddress,
        abi,
        signer,
      ) as Raffle;
      const _networkName = signer.provider._network.name;
      const _entranceFee = await raffle.getEntranceFee();
      const _numPlayers = await raffle.getNumberOfPlayers();
      const _recentWinner = await raffle.getRecentWinner();

      setNetworkName(_networkName);
      setEntranceFee(ethers.formatEther(_entranceFee));
      setNumPlayers(Number(_numPlayers));
      setRecentWinner(_recentWinner);

      console.log("UI Updated");
    }
  }

  async function enterRaffle() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const raffle = new ethers.BaseContract(
      raffleAddress,
      abi,
      signer,
    ) as Raffle;
    setIsLoading(true);
    try {
      const transactionResponse: ContractTransactionResponse =
        await raffle.enterRaffle({
          value: ethers.parseEther(entranceFee),
        });
      const transactionReceipt = await transactionResponse.wait();
      if (transactionReceipt !== null) {
        setTransaction(transactionReceipt.hash);
        console.log(transaction);
      }
      setNumPlayers(Number(await raffle.getNumberOfPlayers()));
      setIsLoading(false);
      await listenForEvent(raffle, "WinnerPicked");
    } catch (error: any) {
      if (error.info.error.code === 4001) {
        setErrorMessage("Transaction Rejected.");
      } else {
        console.log(error.message);
      }
      setIsLoading(false);
    }
  }

  useEffect(() => {
    updateUI();
  }, [wallet]);

  function listenForEvent(raffle: Raffle, event: string) {
    console.log(`Waiting for the ${event} event to fire...`);
    return new Promise<void>(async (resolve, reject) => {
      try {
        await raffle.once(raffle.getEvent(event), async () => {
          console.log(`${event} event fired!`);
          setRecentWinner(await raffle.getRecentWinner());
          setNumPlayers(Number(await raffle.getNumberOfPlayers()));
          resolve();
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-16 pb-24 pt-10">
      <Header />

      <div className="flex flex-col items-center justify-center gap-10">
        {!hasProvider && (
          <a
            className="button mt-14"
            href="https://metamask.io"
            target="_blank"
          >
            Install MetaMask
          </a>
        )}
        {isMetaMask && wallet.accounts.length < 1 && (
          <button
            className="button mt-14"
            disabled={isConnecting}
            onClick={connectMetaMask}
          >
            {isConnecting ? (
              <>
                <span className="mr-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></span>
                Connecting...
              </>
            ) : (
              "Connect MetaMask"
            )}
          </button>
        )}
        {hasProvider && wallet.accounts.length > 0 && (
          <div className="relative mt-20 flex flex-col items-center justify-between gap-20">
            <div className=" flex flex-col items-center justify-center gap-3">
              <Image
                src={enterToWin}
                alt="raffle logo"
                className="-z-50 w-28"
              ></Image>

              <button
                className="button"
                onClick={enterRaffle}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></span>
                    Transaction in progress...
                  </>
                ) : (
                  "Enter Raffle"
                )}
              </button>

              <div className="absolute left-3 top-32 -z-50 flex justify-center">
                <div className="flex-none">
                  <Image
                    src={shapes2}
                    alt="shapes"
                    className="w-[80rem]"
                  ></Image>
                </div>
              </div>

              {/* Raffle Details */}
              <div className="mt-5 flex flex-col items-center justify-center gap-y-1 text-center text-lg/8 text-gray-300">
                <p>
                  <span className="opacity-80">Entrance Fee:</span>{" "}
                  {entranceFee} ETH
                </p>

                <p>
                  <span className="opacity-80">Current Number of Players:</span>{" "}
                  {numPlayers}
                </p>

                <a
                  href={`https://sepolia.etherscan.io/address/${wallet.accounts[0]}`}
                  target="_blank"
                  data-tooltip="Open in Block Explorer"
                >
                  <span className="opacity-80"> Most Recent Winner:</span>{" "}
                  <span className="inline-flex items-center justify-center gap-x-1">
                    {formatAddress(recentWinner)}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 opacity-70"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </a>
              </div>
            </div>

            {/* Metamask Account Details */}
            <Account
              account={wallet.accounts[0]}
              balance={wallet.balance}
              chainId={wallet.chainId}
              networkName={networkName}
            />
          </div>
        )}
        <Notification
          message={transaction}
          clearTransaction={clearTransaction}
        />
      </div>
    </div>
  );
}
