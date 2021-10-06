import { Contract, providers, Wallet } from "ethers";
import axios from "axios"
import { RippleAPI } from "ripple-lib"
import * as solaris from "../src/index"
import BridgeABI from "../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20ABI from "../artifacts/contracts/test/IERC20.sol/IERC20.json"
import StateConnectorABI from "../artifacts/contracts/test/StateConnector.sol/StateConnector.json"

jest.setTimeout(45000)

const api = new RippleAPI({ server: "wss://s.altnet.rippletest.net" })

test('test issuance', async () => {

  const ERC20_ADDRESS = "0xc665530C8C4e37D9e980AF454d5CF8F63f300FAb"
  const BRIDGE_ADDRESS = "0x977F4CC7f10637171c68E1E33F76080b95EE21E8"
  const STATE_CONNECTOR_ADDRESS = "0x8b145721fbf7B6cf2f36e29C4Dfb6eD6012007c6"

  const wallet = new Wallet(
    '44b8de040dec19cf810efe64919b481e05e2ba643efe003223662f1626b114f0',
    new providers.JsonRpcProvider('http://127.0.0.1:9650/ext/bc/C/rpc')
  )

  const stateConnector = new Contract(STATE_CONNECTOR_ADDRESS, StateConnectorABI.abi, wallet)
  const bridge = new Contract(BRIDGE_ADDRESS, BridgeABI.abi, wallet)
  const erc20Token = new Contract(ERC20_ADDRESS, ERC20ABI.abi, wallet)
  const balance = await erc20Token.connect(wallet).balanceOf(wallet.address)
  if (balance.toString === "0") {
    await erc20Token.connect(wallet).mint(wallet.address, 10000)
    expect(balance.toString()).toBe("10000")
  }

  const transfer = new solaris.Transfer({
    direction: {
      source: "LOCAL",
      destination: "XRPL_TESTNET"
    },
    amount: 100,
    token: ERC20_ADDRESS,
    signer: wallet
  })

  await stateConnector.setFinality(true);

  let tx = await transfer.approve()
  let result = await tx.wait()
  expect(result.status).toBe(1)

  const issuer = api.generateXAddress({ includeClassicAddress: true });
  await axios({
    url: "https://faucet.altnet.rippletest.net/accounts",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      destination: issuer.address,
      amount: 1000
    }
  })

  const receiver = {
    address: "rDkNWp5gYs4mSt8pXYD6GVF85YK9XxmRKW",
    secret: "sptH3HxFUVghwQJHWnADnQwPY457o"
  }

  tx = await transfer.initiate(issuer.address)
  await tx.wait()
  let status = await bridge.getIssuerStatus(issuer.address);
  expect(status).toBe(1); // Statuses.PENDING === 1

  await transfer.issueTokens("XRPL_TESTNET", issuer, receiver)
  tx = await transfer.verifyIssuance()
  await tx.wait()
  status = await bridge.getIssuerStatus(issuer.address);
  expect(status).toBe(3); // Statuses.COMPLETED === 3
});

test('test redemption', async () => {

});
