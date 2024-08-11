const express = require("express");
const { storePayment, doPayment } = require("./handler");
const Router = express.Router();
const isAuth = require("../../../utils/auth/jwtMiddleware");

Router.post("/do", isAuth, doPayment);

module.exports = Router;
