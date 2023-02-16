const xrpl = require("xrpl");
const Joi = require("joi");
const TESNET = "wss://s.altnet.rippletest.net:51233";

class VoteController {
  constructor() {
    this._client = new xrpl.Client(TESNET);
  }

  async vote(params) {
    try {
      const schema = Joi.object({
        wallet: Joi.object().required(),
        election: Joi.string().required(),
        program: Joi.object().required(),
      });
      const {
        wallet: voter,
        election,
        program,
      } = await schema.validateAsync(params);
      await this._client.connect();
      //retrieve wallets
      const user_wallet = xrpl.Wallet.fromSeed(voter.seed);
      const program_wallet = xrpl.Wallet.fromSeed(program.seed);
      // Enter memo data to insert into a transaction
      const MemoData = xrpl.convertStringToHex(election);
      const MemoType = xrpl.convertStringToHex("Text");
      // MemoFormat values: # MemoFormat values: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
      const MemoFormat = xrpl.convertStringToHex("text/plain");

      // Send AccountSet transaction
      const prepared = await this._client.autofill({
        TransactionType: "Payment",
        Account: user_wallet.address,
        Destination: program_wallet.address,
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

      const signed = user_wallet.sign(prepared);
      const submit_result = await this._client.submitAndWait(signed.tx_blob);

      const tx_MemoData = xrpl.convertHexToString(
        submit_result.result.Memos[0].Memo.MemoData
      );

      //console.log(`\n Encoded Transaction MEMO: ${JSON.stringify({"MemoType": MemoType, "MemoData": MemoData, "MemoFormat": MemoFormat})}`)
      //console.log(` Decoded Transaction MEMO: ${JSON.stringify({"MemoType": tx_MemoType, "MemoData": tx_MemoData, "MemoFormat": tx_MemoFormat})}`);
      console.log(`${user_wallet.address} has voted for ${tx_MemoData}`);
      console.log("Transaction hash:", signed.hash);
      console.log(
        "Submit result:",
        submit_result.result.meta.TransactionResult
      );
      console.log("///////////////////////////////////////////////////");
      await this._client.disconnect();
      return signed.hash;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async winner(seed) {
    try {
      const schema = Joi.object({
        seed: Joi.string().required(),
      });
      await schema.validateAsync({ seed });
      await this._client.connect();
      console.log("Results are being processed...");
      const program_wallet = xrpl.Wallet.fromSeed(seed);
      const account_data = await this._client.request({
        command: "account_tx",
        account: program_wallet.address,
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
      console.log("Results: ", result);
      await this._client.disconnect();
      return Object.keys(result).map((key) => {
        return {
          name: key,
          quantity: result[key],
        };
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = VoteController;
