import { BigNumber } from "@ethersproject/bignumber";
import { transfer } from "../src/index"

const AUREI_ADDRESS = "0x238f76EffC3F3d711847D48682304Bfaee357888"

test('basic test', () => {
  const result = transfer({
    network: {
      source: 0,
      destination: 1
    },
    amount: {
      value: BigNumber.from("1000000000000000000"),
      currency: AUREI_ADDRESS
    },
    beneficiary: "0xffC11262622D5069aBad729efe84a95C169d9c06"
  })
  expect(result).toBe(true);
});