import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

// Import contract factory types
import {
  BridgeFactory,
  StateConnectorFactory,
  Erc20TokenFactory,
} from "../typechain";

// Import contract types
import {
  Bridge,
  StateConnector,
  Erc20Token,
} from "../typechain";

/**
 * Contracts
 */
interface Contracts {
  bridge: Bridge;
  stateConnector: StateConnector;
  erc20: Erc20Token;
}

const contracts: Contracts = {
  bridge: null,
  stateConnector: null,
  erc20: null,
};

interface Signers {
  owner: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  charlie: SignerWithAddress;
  don: SignerWithAddress;
  lender: SignerWithAddress;
  borrower: SignerWithAddress;
  liquidator: SignerWithAddress;
  addrs: SignerWithAddress[];
}

const signers: Signers = {
  owner: null,
  alice: null,
  bob: null,
  charlie: null,
  don: null,
  lender: null,
  borrower: null,
  liquidator: null,
  addrs: null,
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
  )) as Erc20TokenFactory;
  contracts.erc20 = await erc20Factory.deploy();

  await contracts.erc20.deployed();

  return contracts;
};

const deployBridge = async () => {
  const signers = await getSigners();

  const stateConnectorFactory = (await ethers.getContractFactory(
      "StateConnector",
      signers.owner
  )) as StateConnectorFactory;
  contracts.stateConnector = await stateConnectorFactory.deploy();
  await contracts.stateConnector.deployed();

  const bridgeFactory = (await ethers.getContractFactory(
      "Bridge",
      signers.owner
  )) as BridgeFactory;
  contracts.bridge = await bridgeFactory.deploy(
      "AUR",
      contracts.erc20.address,
      contracts.stateConnector.address
  );
  await contracts.bridge.deployed();

  return contracts;
};

const deployBridgeSystem = async () => {
  // Set signers
  const signers = await getSigners();
  await deployERC20();
  await deployBridge();

  return { contracts, signers };
};


export { deployBridgeSystem };
