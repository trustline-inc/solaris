import { RippleAPI } from "ripple-lib"

const ACCOUNT_ONE = "rrrrrrrrrrrrrrrrrrrrBZbvji";
let LAST_VALIDATED_LEDGER: number;

export default class XRPL {
  private api: any

  constructor(apiUrl: string) {
    this.api = new RippleAPI({ server: apiUrl })
    this.api.on("ledger", async (ledger: any) => {
      LAST_VALIDATED_LEDGER = ledger.ledgerVersion;
    });
  }

  enableRippling = async (account: any)  =>{
    await this.api.connect();
    const prepared = await this.api.prepareSettings(account.address, {
      defaultRipple: true,
    });
    const maxLedgerVersion = prepared.instructions.maxLedgerVersion;
    const response = this.api.sign(prepared.txJSON, account.secret);
    const txID = response.id;
    const txBlob = response.signedTransaction;
    const result = await this.api.submit(txBlob);
    const latestLedgerVersion = await this.api.getLedgerVersion();
    const earliestLedgerVersion = latestLedgerVersion + 1;
    await this.api.disconnect();
    await this.api.disconnect();
    return await this.validateTransaction(
      txID,
      earliestLedgerVersion,
      maxLedgerVersion!
    );
  }

  disableAuthorization = async (account: any) => {
    await this.api.connect();
    const prepared = await this.api.prepareSettings(account.address, {
      requireAuthorization: false,
    });
    const maxLedgerVersion = prepared.instructions.maxLedgerVersion;
    const response = this.api.sign(prepared.txJSON, account.secret);
    const txID = response.id;
    const txBlob = response.signedTransaction;
    const result = await this.api.submit(txBlob);
    const latestLedgerVersion = await this.api.getLedgerVersion();
    const earliestLedgerVersion = latestLedgerVersion + 1;
    await this.api.disconnect();
    await this.api.disconnect();
    return await this.validateTransaction(
      txID,
      earliestLedgerVersion,
      maxLedgerVersion!
    );
  }

  createTrustline = async (to: any, from: any) => {
    await this.api.connect();
    const trustline = {
      currency: "AUR",
      counterparty: to.address,
      limit: "100",
      qualityIn: 1,
      qualityOut: 1,
      ripplingDisabled: false,
      frozen: false,
    };
    const preparedTx = await this.api.prepareTrustline(from.address, trustline);
    const response = this.api.sign(preparedTx.txJSON, from.secret);
    const txID = response.id;
    const txBlob = response.signedTransaction;
    await this.api.submit(txBlob);
    const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion;
    const latestLedgerVersion = await this.api.getLedgerVersion();
    const earliestLedgerVersion = latestLedgerVersion + 1;
    return await this.validateTransaction(
      txID,
      earliestLedgerVersion,
      maxLedgerVersion!
    );
  }

  issueToken = async (issuingAccount: any, receivingAccount: any, amount: number, currencyCode: string) => {
    await this.api.connect();
    const latestLedgerVersion = await this.api.getLedgerVersion();
    const preparedTx = await this.api.prepareTransaction({
      TransactionType: "Payment",
      Account: issuingAccount.address,
      Amount: {
        currency: currencyCode,
        value: amount.toString(),
        issuer: issuingAccount.address,
      },
      Destination: receivingAccount.address,
      LastLedgerSequence: latestLedgerVersion + 15,
    });
    const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion;
    const response = this.api.sign(preparedTx.txJSON, issuingAccount.secret);
    const txID = response.id;
    const txBlob = response.signedTransaction;
    const result = await this.api.submit(txBlob);
    console.log(result)
    const earliestLedgerVersion = latestLedgerVersion + 1;
    await this.api.disconnect();
    await this.api.disconnect();
    return await this.validateTransaction(
      txID,
      earliestLedgerVersion,
      maxLedgerVersion!
    );
  }

  sendAurei = async (
    from: any,
    to: any,
    issuer: any,
    amount: number
  ) => {
    await this.api.connect();
    const latestLedgerVersion = await this.api.getLedgerVersion();
    const preparedTx = await this.api.prepareTransaction({
      TransactionType: "Payment",
      Account: from.address,
      Amount: {
        currency: "AUR",
        value: amount.toString(),
        issuer: issuer.address
      },
      Destination: to.address,
      LastLedgerSequence: latestLedgerVersion + 15,
    });
    const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion;
    const response = this.api.sign(preparedTx.txJSON, from.secret);
    const txID = response.id;
    const txBlob = response.signedTransaction;
    const result = await this.api.submit(txBlob);
    console.log(result);
    const earliestLedgerVersion = latestLedgerVersion + 1;
    await this.api.disconnect();
    await this.api.disconnect();
    return await this.validateTransaction(
      txID,
      earliestLedgerVersion,
      maxLedgerVersion!
    );
  }

  setRegularKey = async (account: any) => {
    await this.api.connect();
    const preparedTx = await this.api.prepareSettings(account.address, {
      regularKey: ACCOUNT_ONE,
      disableMasterKey: true,
      defaultRipple: true,
    });
    const latestLedgerVersion = await this.api.getLedgerVersion();
    const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion;
    const response = this.api.sign(preparedTx.txJSON, account.secret);
    const txID = response.id;
    const txBlob = response.signedTransaction;
    const result = await this.api.submit(txBlob);
    const earliestLedgerVersion = latestLedgerVersion + 1;
    await this.api.disconnect();
    await this.api.disconnect();
    return await this.validateTransaction(
      txID,
      earliestLedgerVersion,
      maxLedgerVersion!
    );
  }

  /**
   * @function validateTransaction
   * Wait for transaction to be validated.
   */
  validateTransaction = async (
    txID: string,
    earliestLedgerVersion: number,
    maxLedgerVersion: number
  ): Promise<string|boolean> => {
    return new Promise(async (resolve, reject) => {
      const checkTransaction = setInterval(async () => {
        try {
          await this.api.connect();
          const tx = await this.api.getTransaction(txID, {
            minLedgerVersion: earliestLedgerVersion,
          });
          await this.api.disconnect();
          await this.api.disconnect();
          clearInterval(checkTransaction);
          if (tx.outcome.result !== "tesSUCCESS") {
            resolve(false);
          }
          resolve(txID);
        } catch (error) {
          const message =
            "Transaction has not been validated yet; try again later";
          if (error.message === message) return;

          // If error is thrown because testnet wallet is empty, catch it and uncomment the line below.
          // console.log("Trustline Testnet Wallet:", JSON.stringify(balances, null, 2));
        }

        if (LAST_VALIDATED_LEDGER > maxLedgerVersion!) {
          clearInterval(checkTransaction);
          resolve(false);
        }
      }, 1000);
    });
  }

}