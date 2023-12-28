import { readFileSync, writeFileSync } from "fs";
import { vars } from "hardhat/config";
import { chainId, frontEndAbiFile, frontEndContractsFile } from "../helper-hardhat-config";
import { Raffle } from "../typechain-types";

async function updateUI(raffle: Raffle, raffleAddress: string) {
  if (vars.get("UPDATE_FRONT_END") === "true") {
    console.log("Writing to frontend...");

    const contractAddresses = JSON.parse(readFileSync(frontEndContractsFile, "utf8"));
    if (chainId in contractAddresses) {
      if (!contractAddresses[chainId].includes(raffleAddress)) {
        contractAddresses[chainId].push(raffleAddress);
      }
    } else {
      contractAddresses[chainId] = [raffleAddress];
    }

    writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
    writeFileSync(frontEndAbiFile, raffle.interface.formatJson());
    console.log("Front end written!");
  }
}

export default updateUI;
