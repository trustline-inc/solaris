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

```javascript
import * as solaris from "@trustline/solaris"
import { BigNumber } from "ethers"

// ERC20 contract address
const AUREI_ADDRESS = "0x238f76EffC3F3d711847D48682304Bfaee357888"

// Prompt the user for signing
const result = await solaris.transfer({
  network: {
    source: solaris.chains.XRP_LEDGER,
    destination: solaris.chains.SONGBIRD
  },
  amount: {
    value: BigNumber.from("1000000000000000000"),
    currency: AUREI_ADDRESS
  },
  // beneficiary is either an EVM- or XRPL-compatible address format
  beneficiary: "0xffC11262622D5069aBad729efe84a95C169d9c06"
})
```

## Development

Install the node modules with `yarn` or `npm install`. Run a local [Flare](https://gitlab.com/flarenetwork/flare/-/tree/master) node and deploy the Bridge contract with the `deploy:local` script.