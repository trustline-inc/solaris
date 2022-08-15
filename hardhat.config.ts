require("dotenv").config();
import "hardhat-typechain";
import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/config";

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
        "e8eb815fca4f7febe74b9cfb026c640ac6d607b0c6fd65df40b7584e285f19b3",
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
      accounts: [
        "e8eb815fca4f7febe74b9cfb026c640ac6d607b0c6fd65df40b7584e285f19b3"
      ],
      chainId: 4294967295,
    },
  },
  solidity: "0.8.4",
};

export default config;
