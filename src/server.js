// Koa: HTTP middleware framework
const Koa = require("koa");

// Router middleware for Koa
// API reference: https://github.com/koajs/router/blob/master/API.md
const Router = require("@koa/router");

// Cross-Origin Resource Sharing for Koa
const cors = require("@koa/cors");

// Body parser for Koa
const bodyParser = require("koa-bodyparser");

// Logger middleware for Koa
const logger = require("koa-logger");

// Security middleware for Koa https://github.com/venables/koa-helmet
const helmet = require("koa-helmet");

// Middleware that adds useful methods to context
// https://github.com/jeffijoe/koa-respond#available-methods
const respond = require("koa-respond");

const app = new Koa();
const router = new Router();
require("koa-qs")(app);

app.use(helmet());
app.use(logger());

app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser());
app.use(respond());

// API routes
require("./routes")(router);
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
