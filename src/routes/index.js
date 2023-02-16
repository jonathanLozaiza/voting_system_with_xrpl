// Routes
const wallet = require("./walletRouter");
const vote = require("./VoteRouter");

module.exports = (router) => {
  router.use("/wallet", wallet);
  router.use("/vote", vote);
};
