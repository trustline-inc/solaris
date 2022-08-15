import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import "@nomiclabs/hardhat-ethers"
import { ethers } from "hardhat";

// Import contract factory types
import {
  Bridge__factory,
  StateConnector__factory,
  ERC20Token__factory,
} from "../typechain-types";

// Import contract types
import {
  Bridge,
  StateConnector,
  ERC20Token,
} from "../typechain-types";

/**
 * Contracts
 */
interface Contracts {
  bridge?: Bridge;
  stateConnector?: StateConnector;
  erc20?: ERC20Token;
}

const contracts: Contracts = {
  bridge: undefined,
  stateConnector: undefined,
  erc20: undefined,
};

interface Signers {
  owner?: SignerWithAddress;
  alice?: SignerWithAddress;
  bob?: SignerWithAddress;
  charlie?: SignerWithAddress;
  don?: SignerWithAddress;
  lender?: SignerWithAddress;
  borrower?: SignerWithAddress;
  liquidator?: SignerWithAddress;
  addrs?: SignerWithAddress[];
}

const signers: Signers = {
  owner: undefined,
  alice: undefined,
  bob: undefined,
  charlie: undefined,
  don: undefined,
  lender: undefined,
  borrower: undefined,
  liquidator: undefined,
  addrs: undefined,
};

const getSigners = async () => {
  // Set signers
  [
    signers.owner,
    signers.alice,
    signers.bob,
    signers.charlie,
    signers.don,
    signers.lender,
    signers.borrower,
    signers.liquidator,
    ...signers.addrs
  ] = await ethers.getSigners();
  return signers;
};

const deployERC20 = async () => {
  const signers = await getSigners();

  const erc20Factory = (await ethers.getContractFactory(
      "ERC20Token",
      signers.owner
  )) as ERC20Token__factory;
  contracts.erc20 = await erc20Factory.deploy();

  await contracts.erc20.deployed();

  return contracts;
};

const deployBridge = async (erc20Address?: string) => {
  const signers = await getSigners();

  const stateConnectorFactory = (await ethers.getContractFactory(
      "StateConnector",
      signers.owner
  )) as StateConnector__factory;
  contracts.stateConnector = await stateConnectorFactory.deploy();
  await contracts.stateConnector.deployed();

  const bridgeFactory = (await ethers.getContractFactory(
      "Bridge",
      signers.owner
  )) as Bridge__factory;
  contracts.bridge = await bridgeFactory.deploy(
      "USD",
      (erc20Address === null || erc20Address === undefined) ? (
        contracts.erc20?.address ? contracts.erc20?.address : ""
      ) : erc20Address,
      contracts.stateConnector.address
  );
  await contracts.bridge.deployed();

  return contracts;
};

const deployBridgeSystem = async (erc20Address?: string) => {
  // Set signers
  const signers = await getSigners();

  if (erc20Address) {
    await deployBridge(erc20Address);
  } else {
    await deployERC20();
    await deployBridge();
  }

  return { contracts, signers };
};


export { deployBridgeSystem };
