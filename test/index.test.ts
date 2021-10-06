import { Contract, providers, Wallet } from "ethers";
import * as solaris from "../src/index"
import BridgeABI from "../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20ABI from "../artifacts/contracts/test/IERC20.sol/IERC20.json"

jest.setTimeout(12000)

test('basic test', async () => {

  const ERC20_ADDRESS = "0xc665530C8C4e37D9e980AF454d5CF8F63f300FAb"
  const BRIDGE_ADDRESS = "0x977F4CC7f10637171c68E1E33F76080b95EE21E8"

  const wallet = new Wallet(
    '44b8de040dec19cf810efe64919b481e05e2ba643efe003223662f1626b114f0',
    new providers.JsonRpcProvider('http://127.0.0.1:9650/ext/bc/C/rpc')
  )

  const bridge = new Contract(BRIDGE_ADDRESS, BridgeABI.abi, wallet)
  const erc20Token = new Contract(ERC20_ADDRESS, ERC20ABI.abi, wallet)
  const balance = await erc20Token.connect(wallet).balanceOf(wallet.address)
  if (balance.toString === "0") {
    await erc20Token.connect(wallet).mint(wallet.address, 10000)
    expect(balance.toString()).toBe("10000")
  }

  const transfer = new solaris.Transfer({
    network: {
      source: "LOCAL",
      destination: "XRPL_TESTNET"
    },
    amount: 100,
    token: ERC20_ADDRESS,
    signer: wallet
  })

  let tx = await transfer.approve()
  let result = await tx.wait()
  expect(result.status).toBe(1)

  // TODO: Generate a new XRPL account
  const issuer = "r4KrvxM7dA5gj9THgg7T3DKPETTghC1dqW"

  tx = await transfer.initiate(issuer)
  let status = await bridge.getIssuerStatus(issuer);
  expect(status).toBe(1); // Statuses.PENDING === 1

  // TODO: Issue currency

});
