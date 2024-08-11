const { Promoter } = require("./service");
const SellPointBill = require("../SellPointBill/Services/sellPointBillService");
const Inventory = require("../Inventory/Services/Inventory");
const code = require("../../../utils/httpStatus");

module.exports = {
  //get all promoter with thier Sell Points info
  getAllPromoters: async (req, res) => {
    const result = await Promoter.getAllWithSellPoints();
    res.status(result.status).send({
      data: result.data,
    });
  },

  //get all promoters with (just id and name_ar)
  getAll: async (req, res) => {
    const result = await Promoter.getAllPromoters();
    res.status(result.status).send({
      data: result.data,
    });
  },

  //delete promoter
  deletePromoter: async (req, res) => {
    const data = req.params;
    const result = await Promoter.delete(data);
    res.status(result.status).send({
      data: result.data,
    });
  },

  //register new promoter
  register: async (req, res) => {
    const data = req.body;
    const result = await new Promoter(data).register();
    res.status(result.status).json({
      data: result.data,
      token: result.token,
    });
  },

  //login promoter
  login: async (req, res) => {
    if (req.body.user && req.body.password) {
      const result = await Promoter.login(req.body.user, req.body.password);
      res.status(result.status).json({
        data: result.data,
        token: result.token,
      });
    } else {
      res
        .status(code.BAD_REQUEST)
        .json({ message: "user and password are required" });
    }
  },

  //get all Bills for sell point wihout BillsCategory
  getBills: async (req, res) => {
    const sp_id = req.params.sp_id;
    const { date } = req.body;
    const result = await Promoter.getBills(sp_id, date);
    res.status(result.status).json({
      data: result.data,
    });
  },

  //get all Bills for sell point (Transaction)
  getBillsToSellPoint: async (req, res) => {
    const sp_id = req.params.sp_id;
    const { date } = req.body;

    const result = await Promoter.getBillsToSp(sp_id, date);
    res.status(result.status).json({
      data: result.data,
    });
  },

  //edit promoter details
  editPromoter: async (req, res) => {
    const data = req.body;
    data.promoter_id = req.params.promoter_id;
    const result = await Promoter.edit(data);
    res.status(result.status).send({
      data: result.data,
    });
  },

  //get all Sell Points for promoter with school details
  getSellPoints: async (req, res) => {
    const result = await Promoter.getAllSellPoints(req.user.id);
    res.status(result.status).send({
      data: result.data,
    });
  },

  //get promoter of Sell Point
  getSellPointPromoter: async (req, res) => {
    const id = req.params.sp_id;
    const result = await Promoter.getSellPointPromoter(id);
    res.status(result.status).send({
      data: result.data,
    });
  },

  //get sell point inventory with all details
  getSellPointInventory: async (req, res) => {
    const id = req.params.sp_id;
    const data = req.body;
    data.id = id;
    const result = await Promoter.getSellPointInventory(data);
    res.status(result.status).send({
      data: result.data,
    });
  },

  //store  Transaction Bill to sell point
  storeBillToSellPoint: async (req, res) => {
    const result = await new SellPointBill(
      req.body.sell_point_id,
      req.params.id,
      req.body.date
    ).add(req.body);
    res.status(result.status).json({
      data: result.data,
    });
  },

  //store Inventory for sell point
  storeInventory: async (req, res) => {
    const { sell_point_id } = req.params;
    const data = req.body;
    data.sell_point_id = sell_point_id;
    const result = await new Inventory(data).addInventory(req.body);
    res.status(result.status).json({
      data: result.data,
    });
  },
};
