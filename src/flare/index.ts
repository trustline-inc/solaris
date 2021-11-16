import { Contract } from "@ethersproject/contracts";
import Token from "../token"

// This is an abstract class to ensure all inheriting class implement the necessary functions
class Flare extends Token {
  protected bridge: Contract;

  // @todo remove these when the bridge contract has been upgraded to latest interface
  private SOURCE = "SOURCE address";
  private DESTINATION_TAG = 0;

  constructor(bridge: Contract) {
    super()
    this.bridge = bridge
  }

  checkAssetBalance() {
    throw new Error('The class inheriting the base Flare class needs to implement this function')
  }

  giveBridgePermissionToAsset(amount: string) {
    throw new Error('The class inheriting the base Flare class needs to implement this function')
  }

  checkIfBridgeHasPermissionToAsset() {
    throw new Error('The class inheriting the base Flare class needs to implement this function')
  }

  getVerifiedList() {
    return this.bridge.getVerifiedIssuerList();
  }

  createIssuer(issuer: string, amount: number) {
    return this.bridge.createIssuer(issuer, amount)
  }

  cancelIssuer(issuer: string) {
      return this.bridge.cancelIssuer(issuer)
  }

  completeIssuance(txHash: string, destinationHash: string, amount: number) {
    return this.bridge.completeIssuance(txHash, this.SOURCE, destinationHash, this.DESTINATION_TAG, amount)
  }

  proveIssuingAccountSettingsCompliance() {
    return this.bridge.proveIssuingAccountSettingsCompliance()
  }

  proveFraud(txHash: string, destinationHash: string, amount: number) {
    return this.bridge.proveFraud(txHash, this.SOURCE, destinationHash, this.DESTINATION_TAG, amount)
  }

  createRedemptionReservation(source: string, issuer: string, destinationTag: 0) {
    return this.bridge.createRedemptionReservation(source, issuer, destinationTag)
  }

  completeRedemption(txHash: string, destinationHash: string, amount: number, destAddress: string) {
    return this.bridge.completeRedemption(txHash, this.SOURCE, destinationHash, this.DESTINATION_TAG, amount, destAddress)
  }

}

export default Flare