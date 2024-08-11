const {
  getAllPromoters,
  deletePromoter,
  register,
  login,
  getBills,
  getSellPoints,
  getSellPointPromoter,
  getSellPointInventory,
  storeBillToSellPoint,
  editPromoter,
  getAll,
  getBillsToSellPoint,
  storeInventory
} = require("./handler");
const router = require("express").Router();
const isAuth = require("../../../utils/auth/jwtMiddleware");

router.get("/", getAllPromoters);
router.get("/all", getAll);

router.post("/register", register);

router.post("/login", login);

router.delete("/:promoter_id", deletePromoter);

router.put("/:promoter_id", editPromoter);

router.get("/sellpoints", isAuth, getSellPoints);

router.get("/get/bills/:sp_id", isAuth, getBills);

router.post("/get/bills/to-sp/:sp_id", isAuth, getBillsToSellPoint);

router.get("/sellpoint/:sp_id", getSellPointPromoter);

router.get("/sellpoint/inventory/:sp_id", getSellPointInventory);

router.post("/bills/sell-point/:id", storeBillToSellPoint);

router.post("/sell-point/:sell_point_id/inventory", storeInventory);

module.exports = router;
