const xrpl = require("xrpl");
const TESNET = "wss://s.altnet.rippletest.net:51233";

class Votaciones {
  constructor() {
    this._client = new xrpl.Client(TESNET);
    this._main_wallet = undefined;
    this._candidates = ["Rafael", "Samuel", "Lisset", "Fredy", "Nestor"];
    this._voters = [];
  }

  async connect_client() {
    try {
      await this._client.connect();
    } catch (error) {
      console.log(error);
    }
  }

  async disconnect_client() {
    try {
      await this._client.disconnect();
    } catch (error) {
      console.log(error);
    }
  }

  async #createWallet() {
    try {
      const { wallet } = await this._client.fundWallet();
      return wallet;
    } catch (error) {
      console.log(error);
    }
  }

  async generateVoters() {
    try {
      for (let i = 0; i < 5; i++) {
        this._voters[i] = await this.#createWallet();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async vote(voter, election) {
    try {
      if (!this._main_wallet) {
        this._main_wallet = await this.#createWallet();
      }
      // Enter memo data to insert into a transaction
      const MemoData = xrpl.convertStringToHex(election);
      const MemoType = xrpl.convertStringToHex("Text");
      // MemoFormat values: # MemoFormat values: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
      const MemoFormat = xrpl.convertStringToHex("text/plain");

      // Send AccountSet transaction
      const prepared = await this._client.autofill({
        TransactionType: "Payment",
        Account: voter.address,
        Destination: this._main_wallet.address,
        Amount: "1000000", // Amount in drops, 1 XRP = 1,000,000 drops
        Memos: [
          {
            Memo: {
              MemoType: MemoType,
              MemoData: MemoData,
              MemoFormat: MemoFormat,
            },
          },
        ],
      });

      const signed = voter.sign(prepared);
      const submit_result = await this._client.submitAndWait(signed.tx_blob);

      const tx_MemoData = xrpl.convertHexToString(
        submit_result.result.Memos[0].Memo.MemoData
      );

      //console.log(`\n Encoded Transaction MEMO: ${JSON.stringify({"MemoType": MemoType, "MemoData": MemoData, "MemoFormat": MemoFormat})}`)
      //console.log(` Decoded Transaction MEMO: ${JSON.stringify({"MemoType": tx_MemoType, "MemoData": tx_MemoData, "MemoFormat": tx_MemoFormat})}`);
      console.log(`${voter.address} has voted for ${tx_MemoData}`);
      console.log("Transaction hash:", signed.hash);
      console.log(
        "Submit result:",
        submit_result.result.meta.TransactionResult
      );
      console.log("///////////////////////////////////////////////////");
    } catch (error) {
      console.log(error);
    }
  }

  async winner() {
    try {
      console.log("Results are being processed...");
      const account_data = await this._client.request({
        command: "account_tx",
        account: this._main_wallet.address,
        ledger_index_min: -1,
        ledger_index_max: -1,
        binary: false,
        forward: false,
      });
      const result = {};
      for (let data of account_data.result.transactions) {
        if (data.tx.Memos.length > 0) {
          if (
            result[xrpl.convertHexToString(data.tx.Memos[0].Memo.MemoData)] !=
            null
          ) {
            result[
              xrpl.convertHexToString(data.tx.Memos[0].Memo.MemoData)
            ] += 1;
          } else {
            result[xrpl.convertHexToString(data.tx.Memos[0].Memo.MemoData)] = 1;
          }
        }
      }
      console.log("Results:");
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Votaciones;
