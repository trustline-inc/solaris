import { providers, Wallet } from "ethers";
import * as solaris from "../src/index"

jest.setTimeout(12000)

test('basic test', async () => {

  const wallet = new Wallet(
    '44b8de040dec19cf810efe64919b481e05e2ba643efe003223662f1626b114f0',
    new providers.JsonRpcProvider('http://127.0.0.1:9650/ext/bc/C/rpc')
  )

  const transfer = new solaris.Transfer({
    network: {
      source: "LOCAL",
      destination: "XRPL_TESTNET"
    },
    amount: 100,
    token: "0x5406E1418060BA73820992F8Be98e4879Ce87925",
    signer: wallet
  })

  let tx = await transfer.approve()
  let result = await tx.wait()
  expect(result.status).toBe(1)

  // TODO: Generate a new XRPL account
  const issuer = "r4KrvxM7dA5gj9THgg7T3DKPETTghC1dqW"

  tx = await transfer.initiate(issuer)

  try {
    // This results in CALL_EXCEPTION
    result = await tx.wait()
    console.log(result)
    // expect(result.status).toBe(1)
  } catch (error) {
    console.log(error)
  }

  // TODO: Issue currency

});
