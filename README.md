# Solaris SDK

![Solaris](./solaris.png)

> SDK for digital asset transfers between Flare and the XRPL

[![Build](https://github.com/trustline-inc/bridge/actions/workflows/build.yml/badge.svg)](https://github.com/trustline-inc/bridge/actions/workflows/build.yml)
[![Release](https://github.com/trustline-inc/bridge/actions/workflows/release.yml/badge.svg)](https://github.com/trustline-inc/bridge/actions/workflows/release.yml)

You can view the bridge contract code in the [`contracts`](./contracts) folder. We will add a full API reference soon. You can find everything else in the [documentation&nbsp;📖 ](https://trustline.co)

## Table of Contents

<!--ts-->
- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
<!--te-->

## Introduction

This SDK prepares bridge-related transactions for signing.

## Installation

Install the Node.js package using `npm` or `yarn`.

Using `npm`:

```
npm install --save @trustline-inc/solaris
```

Using `yarn`:

```
yarn add @trustline-inc/solaris
```

## Usage

**Songbird to XRP Ledger Mainnet**

```javascript
import * as solaris from "@trustline-inc/solaris"
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
const receipt = await this.signer.sendTransaction(tx)
const result = await receipt.wait()

// Create accounts
const issuer = api.generateXAddress({ includeClassicAddress: true });
const receiver = api.generateXAddress({ includeClassicAddress: true });

// Fund accounts
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

// Initiate the transfer
const issuer = "r4KrvxM7dA5gj9THgg7T3DKPETTghC1dqW"
tx = await transfer.initiate(issuer)
const receipt = await this.signer.sendTransaction(tx)
const result = await receipt.wait()

// Statuses.PENDING === 1
let status = await solaris.getIssuerStatus(issuer.address);

// [Omitted] Issue tokens on the XRPL

// Verify the issuance
tx = await transfer.verifyIssuance()
await tx.wait()

// Statuses.COMPLETED === 3
status = await solaris.getIssuerStatus(issuer.address);
```

## Development

Install the node modules with `yarn` or `npm install`. Run a local [Flare](https://gitlab.com/flarenetwork/flare/-/tree/master) node and deploy the Bridge contract with the `deploy:local` script.

To deploy a local bridge, pass the ERC20 token address like this:

```
FLARE_DIR=~/Desktop/flare TOKEN_ADDRESS=<address> yarn run deploy:local
```

## Publishing

Update version in package.json and commit the change

Create a tag that matches version for the commit and run git push --tags

Create a new release for the tagged version
