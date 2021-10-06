import { BigNumber, Contract, utils } from "ethers"
import BridgeABI from "../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20ABI from "../artifacts/contracts/interfaces/IERC20.sol/IERC20.json"

/**
 * List of supported networks
 */
export const networks = {
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
    url: "https://xrplcluster.com"
  },
  XRPL_TESTNET: {
    url: "https://s.altnet.rippletest.net:51234"
  },
}

type ContractAddressList = {
  [key: string]: {
    [key: string]: string
  }
}

/**
 * Contract addresses.
 * TODO: Access local deployment contracts from environment variables.
 */
const CONTRACTS: ContractAddressList = {
  BRIDGE: {
    LOCAL: "0x977F4CC7f10637171c68E1E33F76080b95EE21E8",
    COSTON: "",
    SONGBIRD: "",
    FLARE: ""
  },
  ERC20: {
    LOCAL: "0xc665530C8C4e37D9e980AF454d5CF8F63f300FAb",
    COSTON: "",
    SONGBIRD: "",
    FLARE: ""
  },
  STATE_CONNECTOR: {
    LOCAL: "0x8b145721fbf7B6cf2f36e29C4Dfb6eD6012007c6",
    COSTON: "",
    SONGBIRD: "",
    FLARE: ""
  }
}

type Network = {
  source: string;
  destination: string;
}

export class Transfer {
  private network: Network
  private amount: BigNumber
  private token: string
  private beneficiary: string
  private issuer: string
  private signer: any

  constructor(options?: any) {
    if (options === undefined) throw new Error("Missing required inputs")
    this.network = options.network
    this.token = options.token
    this.amount = options.amount
    this.signer = options.signer
  }

  /**
   * @function approve
   * Requests user approval to transfer the ERC20 token
   */
  approve = async () => {
    const erc20Token = new Contract(this.token, ERC20ABI.abi, this.signer)
    return await erc20Token.approve(CONTRACTS.BRIDGE[this.network.source], this.amount)
  }

  /**
   * @function initiate
   * @param issuer The address of the issuing account
   * Initiates a transfer between networks
   */
  initiate = async (issuer?: string) => {
    if (["LOCAL", "SONGBIRD", "FLARE"].includes(this.network.source)) {
      this.issuer = issuer
      const bridge = new Contract(CONTRACTS.BRIDGE[this.network.source], BridgeABI.abi, this.signer)
      return await bridge.createIssuer(this.issuer, this.amount, { gasLimit: 300000 })
    } else {
      // TODO: Originating from XRPL, call `redeemptionAttempt`
    }
  }

  /**
   * @function verifyIssuance
   * Called after initiating a transfer to from Flare
   */
  verifyIssuance = () => {}

  /**
   * @function redeemTokens
   * Called after initiating a transfer to Flare
   */
  redeemTokens = () => {}
}