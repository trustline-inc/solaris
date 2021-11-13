import { BigNumber, Contract, utils, Signer } from "ethers"
import BridgeABI from "../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20ABI from "../artifacts/contracts/interfaces/IERC20.sol/IERC20.json"
import XRPL from "./xrpl"
import ERC20Bridge from "./flare/ERC20"
import Flare from "./flare"

type tokenClassMapping = {
  [key: string]: any;
}

const tokenClassMapping: tokenClassMapping = {
  ERC20: ERC20Bridge
}

/**
 * List of supported networks
 */
export const networks: NetworkDict = {
  LOCAL: {
    url: "http://127.0.0.1:9650/ext/bc/C/rpc"
  },
  COSTON: {
    url: "https://coston.trustline.co/ext/bc/C/rpc"
  },
  FLARE: {
    url: ""
  },
  SONGBIRD: {
    url: "https://songbird.towolabs.com/rpc"
  },
  XRPL_MAINNET: {
    url: "wss://xrplcluster.com"
  },
  XRPL_TESTNET: {
    url: "wss://s.altnet.rippletest.net"
  },
}

type NetworkDict = {
  [key: string]: {
    [key: string]: string
  }
}

type Direction = {
  source: string;
  destination: string;
}

export interface TransferOptions {
  direction: Direction;
  amount: BigNumber;
  signer: Signer;
  tokenAddress: string;
  bridgeAddress: string;
  provider: any; // TODO: add explicit type
}

export class Transfer {
  private readonly options: TransferOptions
  private flare: Flare
  private direction: Direction
  private amount: BigNumber
  private tokenAddress: string
  private bridgeAddress: string
  private issuer: string
  private currency: string
  private signer: Signer
  private txID: string
  private provider: any

  constructor(options?: TransferOptions, tokenType: string = "ERC20") {
    this.options = options
    if (options === undefined) throw new Error("Missing required inputs")
    if (tokenClassMapping[tokenType] === undefined) {
      throw new Error("Asset type not supported")
    }
    const Token = tokenClassMapping[tokenType]
    this.flare = new Token(options.bridgeAddress, options.tokenAddress, options.signer)
    this.direction = options.direction
    this.amount = options.amount
    this.signer = options.signer
    this.tokenAddress = options.tokenAddress
    this.bridgeAddress = options.bridgeAddress
    this.provider = options.provider
  }

  /**
   * @function approve
   * Requests user approval to transfer the ERC20 token
   */
  approve = async () => {
    const erc20Token = new Contract(this.tokenAddress, ERC20ABI.abi, this.provider)
    this.currency = await erc20Token.symbol()
    return erc20Token.interface.encodeFunctionData("approve", [this.bridgeAddress, this.amount])
  }

  /**
   * @function createIssuer
   * @param issuer The address of the issuing account
   * Initiates a transfer between networks
   */
  createIssuer = async (issuer?: string) => {
    this.issuer = issuer
    const bridge = new Contract(this.bridgeAddress, BridgeABI.abi, this.provider)
    return bridge.interface.encodeFunctionData("createIssuer", [this.issuer, this.amount])
  }

  /**
   * @function checkIssuerSettings
   * @param network
   * @param issuingAccount
   */
  checkIssuerSettings = async (network: string, issuingAccount: any) => {
    const xrpl = new XRPL(networks[network].url)
    // TODO
  }

  /**
   * @function checkReceiverTrustLine
   * @param network
   * @param issuingAccount
   * @param receivingAddress
   */
  checkReceiverTrustLine = async (network: string, issuingAccount: any, receivingAccount: any) => {
    const xrpl = new XRPL(networks[network].url)
    // TODO
  }

  /**
   * @function verifyIssuance
   * Called after initiating a transfer from Flare. The amount is converted from a BN to an integer.
   */
  verifyIssuance = async (txID: string, issuerAddress: string) => {
    this.txID = txID
    const bridge = new Contract(this.bridgeAddress, BridgeABI.abi, this.signer)
    return bridge.interface.encodeFunctionData(
      "completeIssuance",
      [
        utils.id(txID),
        "source",
        issuerAddress,
        0,
        Number(this.amount.div("1000000000000000000")) // TODO: Confirm the expected precision.
      ]
    )
  }

/**
 * @function createRedemptionReservation
 * @param {string} redeemerAddress The address of the redeemer
 * @param {string} issuerAddress The address of the issuer
 * Creates a window for the initiator to prove a redemption transaction
 */
  createRedemptionReservation = async (redeemerAddress: string, issuerAddress: string) => {
    const bridge = new Contract(this.bridgeAddress, BridgeABI.abi, this.signer)
    return bridge.interface.encodeFunctionData(
      "createRedemptionReservation",
      [
        redeemerAddress,
        issuerAddress,
        null
      ]
    )
  }
}