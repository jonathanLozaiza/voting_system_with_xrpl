const VoteController = require("../controllers/voteController");
const Router = require("@koa/router");
const router = new Router();

router.post("/", async (ctx, next) => {
  try {
    const voteController = new VoteController();
    const tx_hash = await voteController.vote(ctx.request.body);
    ctx.ok({ tx_hash });
  } catch (error) {
    if (error.name === "ValidationError") {
      ctx.badRequest({ error: error.message });
    } else {
      ctx.internalServerError({ error: error.message });
    }
  }
});

router.get("/get-winner", async (ctx, next) => {
  try {
    const voteController = new VoteController();
    const results = await voteController.winner(ctx.query.seed);
    ctx.ok({ results });
  } catch (error) {
    if (error.name === "ValidationError") {
      ctx.badRequest({ error: error.message });
    } else {
      ctx.internalServerError({ error: error.message });
    }
  }
});

module.exports = router.routes();
