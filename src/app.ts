import { RippleAPI } from "ripple-lib";

import ERC20Bridge from './flare/ERC20'

const assetClassMapping: any= {
    erc20: ERC20Bridge
}

class Solaris {
    private xrpl: any;
    private flare: any;

    constructor(options? : any, assetType: string = "erc20") {
        // check and sanitize inputs
        if (options === undefined) {
            throw new Error("missing required inputs")
        }

        if (assetClassMapping[assetType] === undefined) {
            throw new Error("Asset Type not supported for bridging Flare to XRPL")
        }

        this.xrpl = new RippleAPI({
            server: options.xrpUrl
        })

        const AssetClass = assetClassMapping[assetType]
        this.flare = new AssetClass(options.bridgeAddress, options.assetAddress, options.wallet)
    }

    async getVerifiedIssuer() {
    }

    async flareCreateIssuer() {
    }

    async signAndSubmit(preparedTx: any) {
        const response = this.xrpl.sign(preparedTx.txJSON, 'shSLDxB3aYz44gDnFTMV3SkzB1hcg');
        const txBlob = response.signedTransaction;
        return await this.xrpl.submit(txBlob);
    }

    async issuance(issuer: string, amount: any) {
        await this.xrpl.connect();
        // create issuer account on xrp (Just check if this account has enough balance)
        // move 20+ xrp as reserve and money to issue and create settings
        let res = await this.xrpl.getBalances(
            issuer,
        );
        console.log(res)

        const preparedTx = await this.xrpl.prepareSettings(issuer, {
            defaultRipple: true,
        });

        // await this.signAndSubmit(preparedTx)

        // will throw "Account not Found" Error if account has no settings/balances
        res = await this.xrpl.getSettings(
            issuer,
        );


        console.log(res)

        res = await this.xrpl.getBalanceSheet(
            issuer,
        );


        console.log(res)

        // set default Ripple enabled on issuer account
        // allow bridge contract to transfer X amount from user
        // const result = await this.bridgeContract.createIssuer(issuer, amount)
        // console.log(result)

        // call createIssuer with issuer Account and X amount

        // create a trustline from receiver account to issuer account

        // issue X amount of IC from issuer account to receiver account

        // wait until stateConnector picks it up

        // set Reglar key to ACCOUNT_ONE

        // black hole the Account

        // wait until stateConnector picks it up

        // submit completeIssuance on flare bridge contract

        // submit verify issuer on flare bridge contract

        await this.xrpl.disconnect()
    }

    async redemption() {
        // create a redemption reservation from flare account

        // within 1 hour, send IC back to the intended issuer

        // wait until stateConnector picks it up

        // send completeRedemption to flare bridge contract
    }
}

export default Solaris