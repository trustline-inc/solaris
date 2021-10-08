# Solaris

> Non-custodial network transfers for digital assets between Flare and the XRP Ledger

[![Build](https://github.com/trustline-inc/solaris/actions/workflows/build.yml/badge.svg)](https://github.com/trustline-inc/solaris/actions/workflows/build.yml)


You can view the contract code in the [`contracts`](./contracts) folder. We will add a full API reference soon. You can find everything else in the [documentation&nbsp;📖 ](https://trustline.co)

## Table of Contents

<!--ts-->

- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
<!--te-->

## Installation

Install the Node.js package using `npm` or `yarn`.

Using `npm`:

```
npm install --save @trustline/solaris
```

Using `yarn`:

```
yarn add @trustline/solaris
```

## Usage

**Songbird to XRP Ledger Mainnet**

```javascript
import * as solaris from "@trustline/solaris"
import { BigNumber } from "ethers"

const wallet = new Wallet(
  '44b8de040dec19cf810efe64919b481e05e2ba643efe003223662f1626b114f0',
  new providers.JsonRpcProvider('http://127.0.0.1:9650/ext/bc/C/rpc')
)

// Create a transfer instance
const transfer = new solaris.Transfer({
  direction: {
    source: "LOCAL",
    destination: "XRPL_TESTNET"
  },
  amount: 100,
  token: "0x5406E1418060BA73820992F8Be98e4879Ce87925",
  signer: wallet
})

let tx, result

// Allow Solaris to transfer your tokens
tx = await transfer.approve()
result = await tx.wait()

// Initiate the transfer
const issuer = "r4KrvxM7dA5gj9THgg7T3DKPETTghC1dqW"
tx = await transfer.initiate(issuer)
result = await tx.wait()

// Issue the tokens
const receiver = "<address>"
const txJSON = await transfer.issueCurrency(receiver)

// Sign and submit the txJSON on the XRPL (not shown)

// Verify the issuance
tx = await transfer.verifyIssuance(transferDetails)
result = await tx.wait()
```

## Development

Install the node modules with `yarn` or `npm install`. Run a local [Flare](https://gitlab.com/flarenetwork/flare/-/tree/master) node and deploy the Bridge contract with the `deploy:local` script.

## Publishing

Update version in package.json and commit the change

Create a tag that matches version for the commit and run git push --tags

Create a new release for the tagged version