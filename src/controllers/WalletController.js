const xrpl = require("xrpl");
const TESNET = "wss://s.altnet.rippletest.net:51233";

class WalletController {
  constructor() {
    this._client = new xrpl.Client(TESNET);
  }

  async createWallet() {
    try {
      await this._client.connect();
      const { wallet } = await this._client.fundWallet();
      await this._client.disconnect();
      return wallet;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async generateVoters() {
    try {
      const voters = [];
      for (let i = 0; i < 5; i++) {
        voters[i] = await this.createWallet();
      }
      return voters;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = WalletController;
