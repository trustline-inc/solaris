import { BigNumber, Contract, utils } from "ethers"
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

type CycleType = string
type StepIndex = number
type Step = {
  title: string;
  chain: string;
  method: (index: StepIndex) => {}
}

export class Transfer {
  private flare: Flare
  private direction: Direction
  private amount: BigNumber
  private tokenAddress: string
  private bridgeAddress: string
  private issuer: string
  private currency: string
  private signer: any
  private txID: string|boolean
  private index: StepIndex = 0
  private provider: any

  constructor(options?: any, tokenType: string = "ERC20") {
    if (options === undefined) throw new Error("Missing required inputs")
    if (tokenClassMapping[tokenType] === undefined) {
      throw new Error("Asset type not supported")
    }
    const Token = tokenClassMapping[tokenType]
    this.flare = new Token(options.bridgeAddress, options.tokenAddress, options.wallet)
    this.direction = options.direction
    this.amount = options.amount
    this.signer = options.wallet
    this.tokenAddress = options.tokenAddress
    this.bridgeAddress = options.bridgeAddress
    this.provider = options.provider
  }

  /**
   * @function initiateIssuance
   * Initiates a transfer from Flare
   */
  initiateIssuance = async () => {
    let result = await this.TRANSFER_STEPS.getStep("ISSUANCE", 0).method.call(this)
    console.log(result)

    result = await this.TRANSFER_STEPS.getStep("ISSUANCE", 1).method.call(this, "r4KrvxM7dA5gj9THgg7T3DKPETTghC1dqW")
    console.log(result)
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
   * @function issueTokens
   * @param network
   * @param issuingAccount
   * @param receivingAddress
   */
  issueTokens = async (network: string, issuingAccount: any, receivingAccount: any) => {
    const xrpl = new XRPL(networks[network].url)
    // TODO: Make sure that the amount is 6 decimal places max
    this.txID = await xrpl.issueToken(issuingAccount, receivingAccount, this.amount.div("1000000000000000000").toString(), this.currency);
  }

  /**
   * @function configureIssuerSettings
   * @param network
   * @param issuingAccount
   */
  configureIssuerSettings = async (network: string, issuingAccount: any) => {
    const xrpl = new XRPL(networks[network].url)
    await xrpl.configureIssuerSettings(issuingAccount);
  }

  /**
   * @function createReceiverTrustLine
   * @param network
   * @param issuingAccount
   * @param receivingAddress
   */
  createReceiverTrustLine = async (network: string, issuingAccount: any, receivingAccount: any) => {
    const xrpl = new XRPL(networks[network].url)
    await xrpl.createTrustline(receivingAccount, issuingAccount, this.currency)
  }

  /**
   * @function verifyIssuance
   * Called after initiating a transfer from Flare
   */
  verifyIssuance = async () => {
    const bridge = new Contract(this.bridgeAddress, BridgeABI.abi, this.signer)
    return await bridge.completeIssuance(
      utils.id(String(this.txID)),
      "source",
      this.issuer,
      0,
      this.amount.div("1000000000000000000"),
      { gasLimit: 300000 }
    )
  }

  /**
   * @function redeemTokens
   * Called after initiating a transfer to Flare
   */
  redeemTokens = () => {
    // TODO
  }

  // Each step involves preparing a transaction for signing.
  TRANSFER_STEPS: {
    [key: string]: any;
    getStep(cycleType: CycleType, index: StepIndex): Step;
  } = {
    getStep: (cycleType: CycleType, index: StepIndex): Step => {
      return this.TRANSFER_STEPS[cycleType][index]
    },
    ISSUANCE: [
      {
        title: "APPROVE",
        chain: "FLARE",
        method: this.approve
      },
      {
        title: "CREATE_ISSUER",
        chain: "FLARE",
        method: this.createIssuer
      },
      {
        title: "CREATE_RECEIVER_TRUST_LINE",
        chain: "XRPL",
        method: this.createReceiverTrustLine
      },
      {
        title: "ISSUE_TOKENS",
        chain: "XRPL",
        method: this.issueTokens
      },
      {
        title: "CONFIGURE_ISSUER_SETTINGS",
        chain: "XRPL",
        method: this.configureIssuerSettings
      },
      {
        title: "VERIFY_ISSUANCE",
        chain: "FLARE",
        method: this.verifyIssuance
      }
    ],
    REDEMPTION: []
  }
}