import Solaris from '../app'
import { ethers } from 'ethers'
import * as dotenv from "dotenv";
dotenv.config();

const flareProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:9650/ext/bc/C/rpc')

const solarisOptions = {
    xrpUrl: 'wss://s.altnet.rippletest.net:51233',
    bridgeAddress: process.env.BRIDGE,
    assetAddress: process.env.ERC20,
    wallet: new ethers.Wallet('44b8de040dec19cf810efe64919b481e05e2ba643efe003223662f1626b114f0', flareProvider)
}

const solaris = new Solaris(solarisOptions)

async function main() {
    // await solaris.issuance('rMyPuAVhs7ZvjEqVkyjBZ3MMQTZUBxN91w', ethers.BigNumber.from(1e18))
}

// 'shSLDxB3aYz44gDnFTMV3SkzB1hcg'

main()