const WalletController = require("../controllers/walletController");
const Router = require("@koa/router");
const router = new Router();

router.get("/create-voters", async (ctx, next) => {
  try {
    const walletController = new WalletController();
    const wallets = await walletController.generateVoters();
    ctx.ok({ wallets });
  } catch (error) {
    if (error.name === "ValidationError") {
      ctx.badRequest({ error: error.message });
    } else {
      ctx.internalServerError({ error: error.message });
    }
  }
});

router.get("/create-wallet", async (ctx, next) => {
  try {
    const walletController = new WalletController();
    const wallet = await walletController.createWallet();
    ctx.ok({ wallet });
  } catch (error) {
    if (error.name === "ValidationError") {
      ctx.badRequest({ error: error.message });
    } else {
      ctx.internalServerError({ error: error.message });
    }
  }
});

module.exports = router.routes();
