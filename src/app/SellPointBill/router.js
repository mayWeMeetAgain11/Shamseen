const express = require("express");
const Router = express.Router();
const isAuth = require("../../../utils/auth/jwtMiddleware");
const {
  getBillCategories,
  updateBillCategories,
  deleteBill,
  deleteBillCategory,
} = require("./handler");

Router.get("/categories/:bill_id", getBillCategories);

Router.put("/category/:bill_category_id", updateBillCategories);

Router.delete("/delete/:id", deleteBill);

Router.delete("/category/delete/:id", deleteBillCategory);

module.exports = Router;
