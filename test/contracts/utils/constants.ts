const errorTypes = {
  ISSUER_EXISTS: "An issuer already exists with this address.",
  ISSUER_NON_EXISTENT: "The issuer does not exist.",
  ISSUER_NOT_PENDING: "The issuer is not in the PENDING state.",
  ONLY_ORIGINAL_SENDER: "Only the originating account can cancel this issuer.",
  NON_ZERO_AMOUNT: "Amount must be greater than zero.",
  AUR_NO_BALANCE: "ERC20: transfer amount exceeds balance",
  TX_ID_ALREADY_PROVEN: "The provided transaction has already been proved.",
  TX_ID_ALREADY_REDEEMED:
    "This transaction ID has already been used to redeem tokens.",
  TWO_HOURS_NOT_PASSED:
    "The previous redemption reservation for these params was submitted less than 2 hours ago.",
  NON_ZERO_DESTINATION_ADDRESS:
    "Destination address cannot be the zero address.",
  ONLY_REDEEMER:
    "Only the reservation holder can submit a redemption transaction.",
  PAYMENT_NOT_PROVEN: "The state connector did not prove this transaction.",
};
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
const BYTES32_ZERO =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export { errorTypes, ADDRESS_ZERO, BYTES32_ZERO };
