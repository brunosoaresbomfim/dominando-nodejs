import "dotenv/config";

import express from "express";
import "express-async-errors";
import * as Sentry from "@sentry/node";
import routes from "./routes";
import Youch from "youch";

import sentryConfig from "./config/sentry";

import "./database";

class App {
  constructor() {
    this.server = express();
    Sentry.init(sentryConfig);
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(express.urlencoded({extended: false}));
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler(){
    this.server.use(async (err, req, res, next) => {
      if(process.env.NODE_ENV === "development") {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: "Internal server error" });
    });
  }
}

export default new App().server;
