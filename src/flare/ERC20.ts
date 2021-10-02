import Flare from './flare'
const { ethers } = require('ethers');
const bridgeAbi = require('../../bin/contracts/Bridge.json')
const erc20Abi = require('../../bin/contracts/ERC20Token.json')

class ERC20 extends Flare {
    private assetContract: any;
    private userWallet: any;

    constructor(bridgeAddress: string, assetAddress: string, userWallet: any) {
        const bridgeContract = new ethers.Contract(bridgeAddress, bridgeAbi.abi, userWallet)
        super(bridgeContract)

        this.assetContract = new ethers.Contract(assetAddress, erc20Abi.abi, userWallet)
    }

    checkAssetBalance() {
        return this.assetContract.balanceOf(this.userWallet)
    }

    giveBridgePermissionToAsset(amount: string) {
        return this.assetContract.approve(this.bridge.address, amount)
    }

    checkIfBridgeHasPermissionToAsset() {
        return this.assetContract.allowance(this.bridge.address, this.userWallet.address)
    }
}

export default ERC20

