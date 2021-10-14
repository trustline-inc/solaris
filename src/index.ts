import { BigNumber, Contract, utils } from "ethers"
import BridgeABI from "../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20ABI from "../artifacts/contracts/interfaces/IERC20.sol/IERC20.json"
import XRPL from "./xrpl"

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

export class Transfer {
  private direction: Direction
  private amount: BigNumber
  private token: string
  private bridge: string
  private issuer: string
  private signer: any
  private txID: string|boolean

  constructor(options?: any) {
    if (options === undefined) throw new Error("Missing required inputs")
    this.direction = options.direction
    this.token = options.token
    this.bridge = options.bridge
    this.amount = options.amount
    this.signer = options.signer
  }

  /**
   * @function approve
   * Requests user approval to transfer the ERC20 token
   */
  approve = async () => {
    const erc20Token = new Contract(this.token, ERC20ABI.abi, this.signer)
    return await erc20Token.approve(this.bridge, this.amount)
  }

  /**
   * @function initiate
   * @param issuer The address of the issuing account
   * Initiates a transfer between networks
   */
  initiate = async (issuer?: string) => {
    if (["LOCAL", "SONGBIRD", "FLARE"].includes(this.direction.source)) {
      this.issuer = issuer
      const bridge = new Contract(this.bridge, BridgeABI.abi, this.signer)
      const result = await bridge.createIssuer(this.issuer, this.amount, { gasLimit: 300000 })
      return result
    } else {
      // TODO: Originating from XRPL, call `redeemptionAttempt`
    }
  }

  /**
   * @function issueTokens
   * @param network
   * @param issuingAccount
   * @param receivingAddress
   */
  issueTokens = async (network: string, issuingAccount: any, receivingAccount: any) => {
    const xrpl = new XRPL(networks[network].url)
    await xrpl.enableRippling(issuingAccount)
    await xrpl.createTrustline(issuingAccount, receivingAccount)
    this.txID = await xrpl.issueToken(issuingAccount, receivingAccount, this.amount.div("1000000000000000000").toNumber(), "PHI");
    await xrpl.setRegularKey(issuingAccount);
  }

  /**
   * @function verifyIssuance
   * Called after initiating a transfer from Flare
   */
  verifyIssuance = async () => {
    const bridge = new Contract(this.bridge, BridgeABI.abi, this.signer)
    return await bridge.completeIssuance(
      utils.id(String(this.txID)),
      "source",
      this.issuer,
      0,
      this.amount,
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
}