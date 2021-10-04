import { BigNumber } from "ethers"

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

export const transfer = ({ network, amount }: Transfer) => {
  console.log("Not implemented");
  return true
}