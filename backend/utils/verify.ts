import { run } from "hardhat";

async function verify(contractAddress: string, args: any[]) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.toLowerCase().includes("already verified")) {
        console.log("Already verified!");
      } else {
        console.error(err);
      }
    }
  }
}

export default verify;
