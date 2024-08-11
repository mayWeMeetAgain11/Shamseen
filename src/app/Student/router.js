const express = require("express");
const Router = express.Router();
const isAuth = require("../../../utils/auth/jwtMiddleware");
const {
  register,
  signIn,
  updateStudentDetails,
  getStudentDetails,
  getStudentOrders,
  verifyEmail,
  sendEmailVerfication,
} = require("./handler");

Router.post("/register", register);
Router.post("/login", signIn);
Router.get("/:id", getStudentDetails);
Router.put("/:id", updateStudentDetails);
Router.post("/orders/:id", getStudentOrders);
Router.get("/verify/email", verifyEmail);
Router.post("/resend/email/", sendEmailVerfication);

module.exports = Router;
