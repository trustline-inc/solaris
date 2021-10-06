import { BigNumber, Contract, utils } from "ethers"
import BridgeABI from "../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20ABI from "../artifacts/contracts/interfaces/IERC20.sol/IERC20.json"

/**
 * Canonical list of supported networks
 */
enum Network {
  Local,
  Songbird,
  XRPL_Mainnet,
  XRPL_Testnet
}

exports.networks = {
  LOCAL: Network.Local,
  SONGBIRD: Network.Songbird,
  XRPL_MAINNET: Network.XRPL_Mainnet,
  XRPL_TESTNET: Network.XRPL_Testnet
}

type Transfer = {
  network: {
    source: Network;
    destination: Network;
  };
  amount: {
    value: BigNumber;
    currency: string;
  };
  issuer: string;
  beneficiary: string;
}

/**
 * Contract addresses.
 * TODO: Access local deployment contracts from environment variables.
 */
const CONTRACTS = {
  BRIDGE: {
    [Network.Local]: "0x0bdf455E317e93CB742d2EB4c392cb1f9B9550ce",
    [Network.Songbird]: ""
  },
  STATE_CONNECTOR: {
    [Network.Local]: "0xe417C2514D7755Bf604e7Aa3cA9EE21F075D57A6",
    [Network.Songbird]: ""
  }
}

/**
 * @function approve
 * @param erc20Token The address of the ERC20 token contract
 * @param signer The signer of the transaction
 * Requests user approval to transfer the ERC20 token
 */
export const approve = async (erc20Token: string, signer: any) => {
  const contract = new Contract(erc20Token, ERC20ABI.abi, signer)
  await contract.approve()
}

/**
 * @function initiateTransfer
 * @param transferDetails An object containing transfer details
 * Initiates a transfer between networks
 */
export const initiateTransfer = async ({ network, amount, issuer, beneficiary }: Transfer) => {
  if (network.source in [Network.Local, Network.Songbird]) {
    const bridge = new Contract(CONTRACTS.BRIDGE[Network.Local], BridgeABI.abi)
    await bridge.createIssuer(issuer, utils.parseEther(amount.toString()))
  } else {
    // TODO: Originating from XRPL, call `redeemptionAttempt`
  }
}

/**
 * @function verifyIssuance
 * Called after initiating a transfer to from Flare
 */
export const verifyIssuance = () => {}

/**
 * @function redeemTokens
 * Called after initiating a transfer to Flare
 */
export const redeemTokens = () => {}