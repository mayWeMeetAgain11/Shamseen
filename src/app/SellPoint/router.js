const express = require("express");
const Router = express.Router();
const isAuth = require("../../../utils/auth/jwtMiddleware");
const {
  register,
  login,
  getActiveCategory,
  check,
  storeBillToFactory,
  getBills,
  linkPromoter,
  getBillFactory,
  getBillSellPoint,
  storeBillToSellPoint,
  getStudent,
  getStudents,
  getBillsToSellPoint,
  storeInventory,
  storeOrder,
  getAllSellPoint,
  updateStudentsOffline,
  addStudentOrderOffline,
  getAllSellPointForOneDriver,
  getAllSellPointForOnePromoter,
  endDay,
  storeEnvelop,
  updateEnvelop,
  deleteEnvelop,
  getEnvelopsbySpId,
  getAllSp,
} = require("./handler");

Router.post("/", register);

Router.post("/login", login);

Router.get("/get-all-for-promoter/:promoter_id", getAllSellPointForOnePromoter);

Router.get("/get-all-for-driver/:driver_id", getAllSellPointForOneDriver);

Router.get("/all", getAllSp);

Router.use(isAuth);

Router.get("/category", getActiveCategory);

Router.get("/check-update", check);

Router.post("/bills/factory", storeBillToFactory);

Router.get("/bills", getBills);

Router.get("/bill-factory/:id", getBillFactory);

Router.get("/bill-sell-point/:id", getBillSellPoint);

Router.post("/bills/sell-point/:id", storeBillToSellPoint);

Router.post("/bills/inventory", storeInventory);

Router.post("/order", storeOrder);

Router.get("/student/:id", getStudent);

Router.get("/students", getStudents);

Router.put("/link/promoter", linkPromoter);

Router.get("/bill-to-sell-point", getBillsToSellPoint);

Router.get("/", getAllSellPoint);


Router.patch("/student/update/offline", updateStudentsOffline);

Router.post("/order/offline", addStudentOrderOffline);

Router.post("/end-day", endDay);

Router.post("/envelop/add/:sp_id", isAuth, storeEnvelop);

Router.put("/envelop/update/:id", isAuth, updateEnvelop);

Router.delete("/envelop/delete/:id", isAuth, deleteEnvelop);

Router.get("/envelop/:sp_id", isAuth, getEnvelopsbySpId);

module.exports = Router;
