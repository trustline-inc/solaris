require("dotenv").config();
import { existsSync } from "fs";
import "hardhat-typechain";
import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/config";

// Add Flare local accounts from Flare config
const flareLocalAccounts = [];
const flareConfPath = `${process.env.FLARE_DIR}/src/stateco/client/config.json`;
if (existsSync(flareConfPath)) {
  const flareConf = require(flareConfPath);
  flareLocalAccounts.push(flareConf.accounts[0].privateKey);
  flareLocalAccounts.push(flareConf.accounts[1].privateKey);
}

const config: HardhatUserConfig = {
  defaultNetwork: "coston",
  networks: {
    internal: {
      url: "https://coston.trustline.co/ext/bc/C/rpc",
      accounts: [],
      chainId: 16,
    },
    coston: {
      url: "https://coston-api.flare.network/ext/bc/C/rpc",
      accounts: [
        "9f05cbe65ef2defab75440cb91ca1de405233a9f6c3d16bc1a5433edc28f20b4",
      ],
      chainId: 16,
    },
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
    },
    local: {
      url: "http://127.0.0.1:9650/ext/bc/C/rpc",
      accounts: flareLocalAccounts,
      chainId: 16,
    },
  },
  solidity: "0.8.4",
};

export default config;
