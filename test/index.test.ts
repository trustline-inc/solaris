import { utils } from "ethers"
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

// Flare wallets
let owner: SignerWithAddress;

// XRPL wallets
const issuer = api.generateXAddress({ includeClassicAddress: true });
const receiver = api.generateXAddress({ includeClassicAddress: true });

// Transfers
let inboundTransfer: any;
let outboundTransfer: any;

// Constants
const WAD = BigNumber.from("1000000000000000000")

describe("Solaris", function () {
  before(async () => {
    // Fund XRPL accounts
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
    await axios({
      url: "https://faucet.altnet.rippletest.net/accounts",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        destination: receiver.address,
        amount: 1000
      }
    })
  })

  before(async function () {
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

  describe("Flare to XRPL Transfers", async function () {
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
          signer: owner,
          provider: hre.ethers.provider
        }, "ERC721")
      };
      expect(createTransfer).to.throw(Error, "Asset type not supported")
    })

    it("stores the amount as a BigNumber", async () => {
      const amount = BigNumber.from(100).mul(WAD)
      const transfer = new solaris.Transfer({
        direction: {
          source: "LOCAL",
          destination: "XRPL_TESTNET"
        },
        amount,
        tokenAddress: erc20Token.address,
        bridgeAddress: bridge.address,
        signer: owner,
        provider: hre.ethers.provider
      })
      expect(transfer.amount).to.equal(amount)
      expect(transfer.amount.toString()).to.equal("100000000000000000000")
    })

    describe("Issuance", () => {
      before(async () => {
        const amount = BigNumber.from(100).mul(WAD)
        outboundTransfer = new solaris.Transfer({
          direction: {
            source: "LOCAL",
            destination: "XRPL_TESTNET"
          },
          amount,
          tokenAddress: erc20Token.address,
          bridgeAddress: bridge.address,
          signer: owner,
          provider: hre.ethers.provider
        })
      })

      it("completes issuance", async () => {
        let data = await outboundTransfer.approve()
        let transactionResponse = await erc20Token.approve(bridge.address, outboundTransfer.amount);
        expect(data).to.equal(transactionResponse.data)
        data = await outboundTransfer.createIssuer(issuer.address)
        transactionResponse = await bridge.createIssuer(issuer.address, outboundTransfer.amount);
        expect(data).to.equal(transactionResponse.data)
  
        let status = await bridge.getIssuerStatus(issuer.address);
        expect(status).to.equal(1); // Statuses.PENDING === 1
  
        // Create trust line from receiver to issuer
        let tx = {
          currency: "AUR",
          counterparty: issuer.address,
          limit: "999999999",
          qualityIn: 1,
          qualityOut: 1,
          ripplingDisabled: false,
          frozen: false,
          memos: [
            {
              type: "test",
              format: "text/plain",
              data: "Trustline App"
            }
          ]
        }
  
        await api.connect()
        const prepared = await api.prepareTrustline(receiver.address, tx)
        const signed = api.sign(prepared.txJSON, receiver.secret).signedTransaction
        await api.submit(signed)
  
        setTimeout(() => { return }, 3000)
  
        // Issue tokens to receiver
        let latestLedgerVersion = await api.getLedgerVersion()
        const preparedTx = await api.prepareTransaction({
          TransactionType: "Payment",
          Account: issuer.address,
          Amount: {
            currency: "AUR",
            value: api.xrpToDrops(outboundTransfer.amount.div(WAD).toString()),
            issuer: issuer.address
          },
          Destination: receiver.address,
          LastLedgerSequence: latestLedgerVersion + 15
        })
        const response = api.sign(preparedTx.txJSON, issuer.secret)
        const txID = response.id
        const txBlob = response.signedTransaction
        latestLedgerVersion = await api.getLedgerVersion()
        await api.submit(txBlob)
  
        setTimeout(() => { return }, 3000)
  
        data = await outboundTransfer.verifyIssuance(txID, issuer.address)
  
        // TODO: Review conversion of `amount` from ether to wei
        transactionResponse = await bridge.completeIssuance(
          utils.id(txID),
          "source",
          issuer.address,
          0,
          outboundTransfer.amount.div(WAD)
        )
        expect(data).to.equal(transactionResponse.data)
  
        status = await bridge.getIssuerStatus(issuer.address);
        expect(status).to.equal(3); // Statuses.COMPLETED === 3
  
        await api.disconnect()
        await api.disconnect()
      });

      it("gets verified issuers", async () => {
        const verifiedIssuers = await bridge.getVerifiedIssuers()
        expect(verifiedIssuers).to.eql([issuer.address])
      })

    })

    describe("Redemption", () => {
      before(async () => {
        inboundTransfer = new solaris.Transfer({
          direction: {
            source: "XRPL_TESTNET",
            destination: "LOCAL"
          },
          tokenAddress: erc20Token.address,
          bridgeAddress: bridge.address,
          signer: owner,
          provider: hre.ethers.provider
        })
      })

      it("creates a redemption reservation", async () => {
        let data = await inboundTransfer.createRedemptionReservation(receiver.address, issuer.address);
        let transactionResponse = await bridge.createRedemptionReservation(receiver.address, issuer.address);
        expect(data).to.equal(transactionResponse.data)
        expect(inboundTransfer.reservation).to.not.equal(undefined)
      });

      it("cancels a redemption reservation", async () => {
        let data = await inboundTransfer.cancelRedemptionReservation(receiver.address, issuer.address);
        let transactionResponse = await bridge.cancelRedemptionReservation(receiver.address, issuer.address);
        expect(data).to.equal(transactionResponse.data)
        expect(inboundTransfer.reservation).to.equal(undefined)
      });

    })

  })
})