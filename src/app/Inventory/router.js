const router = require("express").Router();
const isAuth = require("../../../utils/auth/jwtMiddleware");
const {
  updateInventoryCategory,
  getInventoryBySpId,
  getAllInventories,
  getInventory,
  getInventoryCategory,
  deleteInventoryCategory,
  deleteInventory,
  addInventoryCategory,
  copyInventory,
} = require("./handler");

router.put("/update/:id", updateInventoryCategory);

router.delete("/delete/category/:id", deleteInventoryCategory);

router.delete("/delete/:id", deleteInventory);

router.post("/by/:id", getInventoryBySpId);

router.post("/add/category/:inventory_id", addInventoryCategory);

router.post("/all", getAllInventories);

router.get("/copy/:sp_id", copyInventory);

router.post("/by-date/:sp_id", getInventory);

router.get("/category/:inventory_id", getInventoryCategory);

module.exports = router;
