const express = require("express");
const {
  storeBill,
  getAllBillForEachDriver,
  updateBillCategories,
  getAllBillsForEachSchool,
  getAllBillsWithTotal,
  getAllBillForAllPromoters,
  getTotals,
  updateOneBillCategory,
  deleteBillCategories,
  storeBillCategories,
  deleteBill,
  getBillCategories,
  getTotalsForOneSellPoint,
  getAllBillsForOneCategory,
  getAllBillsWithBalance,
  getAllBillsPDF,
  updateBillDate,
  getAllBillsWithBalanceCheck,
  getBillCategoriesWithReturns,
  getReport,
  getReturnsReport,
  getExReport,
  getEx2Report,
  getEx3Report,
  getAllBillsWithBalanceCheckId,
} = require("./handler");
const router = express.Router();
const isAuth = require("../../../utils/auth/jwtMiddleware");

router.post("/add/:sp_id", isAuth, storeBill);

router.post("/drivers/get-all", getAllBillForEachDriver);

router.post("/get-all", getAllBillsWithTotal);

router.post("/get-all/returns", getBillCategoriesWithReturns);

router.post("/balance/get-all", getAllBillsWithBalance);

router.post("/balance/check", getAllBillsWithBalanceCheck);
router.get("/balance/checkk/:id", getAllBillsWithBalanceCheckId);

router.post("/get-all/category/:category_id", getAllBillsForOneCategory);

router.post("/category/update/:bill_category_id", updateOneBillCategory);

router.post("/categories/add/:bill_id", storeBillCategories);

router.delete("/category/delete", deleteBillCategories);

router.post("/promoters/get-all", getAllBillForAllPromoters);

router.put("/categories/edit/:bill_id", updateBillCategories);

router.put("/update-date/:bill_id", updateBillDate);

router.post("/schools/get-all", getAllBillsForEachSchool);

router.post("/get-all/pdf", getAllBillsPDF);

router.post("/total/get-all", getTotals);
router.post("/report", getReport);
router.post("/return/report", getReturnsReport);
router.post("/ex/report", getExReport);
router.post("/ex2/report", getEx2Report);
router.post("/ex3/report", getEx3Report);

router.post("/total/get-all/:school_id", getTotalsForOneSellPoint);

router.delete("/delete/:id", deleteBill);

router.get("/categories/:bill_id", isAuth, getBillCategories);

module.exports = router;
