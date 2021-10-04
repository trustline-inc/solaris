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

// ERC20 contract address
const AUREI_ADDRESS = "0x238f76EffC3F3d711847D48682304Bfaee357888"

// Define the transfer object
const transferDetails = {
  network: {
    source: solaris.chains.XRP_LEDGER,
    destination: solaris.chains.SONGBIRD
  },
  amount: {
    value: BigNumber.from("1000000000000000000"),
    currency: AUREI_ADDRESS
  },
  beneficiary: "rf1VoGSXN5khRsZwt6kaSpYwiT2UfT3oSs"
}

// Allow Solaris to transfer your tokens
await solaris.approve(transferDetails)

// Initiate the transfer
const result = await solaris.initiateTransfer(transferDetails)

// Issue the tokens
const txJSON = await solaris.issueCurrency(transferDetails)

// Sign and submit the txJSON on the XRPL (not shown)

// Verify the issuance
await solaris.verifyIssuance(transferDetails)
```

**XRP Ledger Mainnet to Songbird**

```javascript
import * as solaris from "@trustline/solaris"
import { BigNumber } from "ethers"

// ERC20 contract address
const AUREI_ADDRESS = "0x238f76EffC3F3d711847D48682304Bfaee357888"

// Define the transfer object
const transferDetails = {
  network: {
    source: solaris.chains.SONGBIRD,
    destination: solaris.chains.XRP_LEDGER
  },
  amount: {
    value: BigNumber.from("1000000000000000000"),
    currency: AUREI_ADDRESS
  },
  beneficiary: "0xffC11262622D5069aBad729efe84a95C169d9c06"
}

// Initiate the transfer
const txJSON = await solaris.initiateTransfer(transferDetails)

// Sign and submit the txJSON on the XRPL (not shown)

// Redeem the tokens
await solaris.redeemTokens(transferDetails)
```

## Development

Install the node modules with `yarn` or `npm install`. Run a local [Flare](https://gitlab.com/flarenetwork/flare/-/tree/master) node and deploy the Bridge contract with the `deploy:local` script.