import { deployBridgeSystem } from "../lib/deployer"
import axios from "axios"
import { BigNumber } from "@ethersproject/bignumber"
import { RippleAPI } from "ripple-lib"
import * as solaris from "../src/index"
import { Bridge, StateConnector, Erc20Token } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as chai from "chai";
import hre from "hardhat"
const expect = chai.expect;

const api = new RippleAPI({ server: "wss://s.altnet.rippletest.net" })

// Contracts
let bridge: Bridge;
let stateConnector: StateConnector;
let erc20Token: Erc20Token;

// Wallets
let owner: SignerWithAddress;

const WAD = BigNumber.from("1000000000000000000")

describe("Solaris", function () {
  beforeEach(async function () {
    const { contracts, signers } = await deployBridgeSystem();

    // Set contracts
    bridge = contracts.bridge;
    stateConnector = contracts.stateConnector;
    erc20Token = contracts.erc20;

    // Set wallets
    owner = signers.owner

    await erc20Token.mint(signers.owner.address, BigNumber.from(10000).mul(WAD));
    await erc20Token.approve(bridge.address, BigNumber.from(10000).mul(WAD));
    await stateConnector.setFinality(true);
  });

  describe("unit test", async function () {
    this.timeout(30000);

    it("throws for unsupported asset", async () => {
      const createTransfer = function() {
        new solaris.Transfer({
          direction: {
            source: "LOCAL",
            destination: "XRPL_TESTNET"
          },
          amount: BigNumber.from(100).mul(WAD),
          tokenAddress: erc20Token.address,
          bridgeAddress: bridge.address,
          wallet: owner,
          provider: hre.ethers.provider
        }, "ERC721")
      };
      expect(createTransfer).to.throw(Error, "Asset type not supported")
    })

    it("issues tokens", async () => {
      const amount = BigNumber.from(100).mul(WAD)
      const transfer = new solaris.Transfer({
        direction: {
          source: "LOCAL",
          destination: "XRPL_TESTNET"
        },
        amount,
        tokenAddress: erc20Token.address,
        bridgeAddress: bridge.address,
        wallet: owner,
        provider: hre.ethers.provider
      })
      let data = await transfer.approve()
      let transactionResponse = await erc20Token.approve(bridge.address, amount);
      expect(data).to.equal(transactionResponse.data)

      // Create new issuing account
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

      data = await transfer.createIssuer(issuer.address)
      transactionResponse = await bridge.createIssuer(issuer.address, amount);
      expect(data).to.equal(transactionResponse.data)

      let status = await bridge.getIssuerStatus(issuer.address);
      expect(status).to.equal(1); // Statuses.PENDING === 1

      // const receiver = {
      //   address: "rDkNWp5gYs4mSt8pXYD6GVF85YK9XxmRKW",
      //   secret: "sptH3HxFUVghwQJHWnADnQwPY457o"
      // }

      // /**
      //  * TODO: We may be able to stub the XRPL issuance to make the test faster
      //  */
      // // sinon.stub(transfer, "issueTokens").returns(
      // //   new Promise((resolve) => { resolve() })
      // // );

      // await transfer.issueTokens("XRPL_TESTNET", issuer, receiver)
      // tx = await transfer.verifyIssuance()
      // await tx.wait()

      // status = await bridge.getIssuerStatus(issuer.address);
      // expect(status).to.equal(3); // Statuses.COMPLETED === 3
    });

    it("redeems tokens", async () => {});
  })
})