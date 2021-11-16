import Flare from './index'
import { Contract, ethers } from 'ethers';
import BridgeABI from "../../artifacts/contracts/Bridge.sol/Bridge.json"
import ERC20TokenABI from "../../artifacts/contracts/test/ERC20Token.sol/ERC20Token.json";

class ERC20 extends Flare {
  private contract: Contract;
  private wallet: any;

  constructor(bridgeAddress: string, erc20TokenAddress: string, wallet: any) {
    const bridge = new ethers.Contract(bridgeAddress, BridgeABI.abi, wallet)
    super(bridge)
    this.contract = new ethers.Contract(erc20TokenAddress, ERC20TokenABI.abi, wallet)
  }

  getBalance() {
    return this.contract.balanceOf(this.wallet)
  }

  permitBridgeContract(amount: string) {
    return this.contract.approve(this.bridge.address, amount)
  }

  getBridgeAllowance() {
    return this.contract.allowance(this.bridge.address, this.wallet.address)
  }
}

export default ERC20