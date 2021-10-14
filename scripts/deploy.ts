import "@nomiclabs/hardhat-ethers";
import { deployBridgeSystem } from "../lib/deployer";
import * as fs from "fs";

async function main() {
  if (!process.env.FLARE_DIR)
    throw Error("Please set FLARE_DIR to your local Flare directory.");
  const { contracts } = await deployBridgeSystem(process.env.TOKEN_ADDRESS);
  console.info("Contracts deployed!");

  const addresses = [];
  let fileOutput = "";
  for (let contract in contracts) {
    if (process.env.TOKEN_ADDRESS && contract === "erc20") {
      continue
    }
    // Convert contract identifiers from PascalCase to UPPER_CASE
    const contractDisplayName = contract
      .split(/(?=[A-Z])/)
      .join("_")
      .toUpperCase();
    addresses.push({
      Contract: contractDisplayName,
      // @ts-ignore
      Address: contracts[contract].address,
    });
    // @ts-ignore
    fileOutput += `${contractDisplayName}=${contracts[contract].address}\n`;
  }

  fs.writeFileSync(".env", fileOutput);
  console.table(addresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
