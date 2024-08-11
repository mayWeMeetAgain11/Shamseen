const BillCategory = require("./Services/InventoryCategory");
const Inventory = require("./Services/Inventory");

module.exports = {
  /*this function update one category details in inventory */
  updateInventoryCategory: async (req, res) => {
    const result = await new BillCategory(req.body).updateInventoryCategory(
      req.params.id
    );
    res.status(result.status).send({
      data: result.data,
    });
  },

  /*this function delete one category in inventory */
  deleteInventoryCategory: async (req, res) => {
    const result = await BillCategory.deleteInventoryCategory(req.params.id);
    res.status(result.status).send({
      data: result.data,
    });
  },

  /*this function delete inventory */
  deleteInventory: async (req, res) => {
    const result = await Inventory.deleteInventory(req.params.id);
    res.status(result.status).send({
      data: result.data,
    });
  },

  /*
  this function accept sell point id and date and return all inventories 
  in this date for this sell point
  */
  getInventoryBySpId: async (req, res) => {
    const data = req.body;
    data.id = req.params.id;
    const result = await Inventory.getInventoryBySpId(data);
    res.status(result.status).send({
      data: result.data,
    });
  },

  /*
  this function accept date and return all inventories in this date
  with sell points details
  */
  getAllInventories: async (req, res) => {
    const data = req.body;
    const result = await Inventory.getAllInventories(data);
    res.status(result.status).send({
      data: result.data,
    });
  },

  /*this function accept date and sell point id and return inventory for this seel point
  without details 
  */
  getInventory: async (req, res) => {
    const { date } = req.body;
    const result = await Inventory.getInventories(req.params.sp_id, date);
    res.status(result.status).send({
      data: result.data,
    });
  },

  copyInventory: async (req, res) => {
    const { sp_id } = req.params;
    const result = await Inventory.copyInventories(sp_id);
    res.status(result.status).send({
      data: result.data,
    });
  },

  /*this function take id of inventory and return details for this  inventory*/
  getInventoryCategory: async (req, res) => {
    const result = await Inventory.getInventoryCategory(
      req.params.inventory_id
    );
    res.status(result.status).send({
      data: result.data,
    });
  },

  addInventoryCategory: async (req, res) => {
    const data = req.body;
    const { inventory_id } = req.params;
    data.inventory_id = inventory_id;
    const result = await BillCategory.addInventoryCategory(data);
    res.status(result.status).send({
      data: result.data,
    });
  },
};
