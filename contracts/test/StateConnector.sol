pragma solidity ^0.8.0;

contract StateConnector {
  bool finalityToReturn;

  function setFinality(bool newFinality) public {
    finalityToReturn = newFinality;
  }

  function getPaymentFinality(
    uint32 chainId,
    bytes32 txId,
    bytes32 destinationHash,
    uint256 amount,
    bytes32 currencyHash
  )
    external view
    returns (
      uint64 ledger,
      uint64 indexSearchRegion,
      bool finality
    )
  {
    return (uint64(0), uint64(0), finalityToReturn);
  }
}
