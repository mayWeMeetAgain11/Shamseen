const SellPoint = require("./service");
const { database, EnvelopModel } = require("../");
const Bill = require("../Bill/Services/BillService");
const SellPointBill = require("../SellPointBill/Services/sellPointBillService");
const SellPointBillCategory = require("../SellPointBill/Services/sellPointBillCategoryService");
const BillCategory = require("../Bill/Services/BillCategoryService");
const Student = require("../Student/Services/StudentService");
const OrderTransform = require("../Bill/helpers/Type/AddToOrder");
const StudentOrder = require("../Student/Services/StudentOrderService");
const Category = require("../Category/services/CategoryService");
const Inventory = require("../Inventory/Services/Inventory");
const code = require("../../../utils/httpStatus");
const calculateDateRange = require("../../../helpers/date");

module.exports = {
  register: async (req, res) => {
    const result = await new SellPoint(req.body).register();
    res.status(result.status).json({
      data: result.data,
    });
  },

  login: async (req, res) => {
    if (req.body.user && req.body.password) {
      const result = await SellPoint.login(req.body.user, req.body.password);
      res.status(result.status).json({
        data: result.data,
      });
    } else {
      res
        .status(code.BAD_REQUEST)
        .json({ message: "user and password are required" });
    }
  },

  getActiveCategory: async (req, res) => {
    const result = await Category.getActiveCategory(req.user.id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  check: async (req, res) => {
    const result = await SellPoint.checkUpdate(req.user.id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getBills: async (req, res) => {
    const data = {};
    data.type = "default";
    const result1 = await new Bill(data).getBills(req.user.id);
    if (result1.status !== 200) {
      return res.status(result1.status).json({ data: result1.data });
    }
    const result2 = await SellPointBill.getBills(req.user.id);
    if (result2.status !== 200) {
      return res.status(result2.status).json({ data: result2.data });
    }
    res.status(code.OK).json({
      data: {
        bills_to_factory: result1.data,
        bills_to_sell_point: result2.data,
      },
    });
  },

  linkPromoter: async (req, res) => {
    const { promoter_id, sp_id } = req.body;
    console.log(req.body);
    const result = await SellPoint.linkPromoter(sp_id, promoter_id);
    res.status(result.status).json({
      data: result.data,
    });
  },
  getBillFactory: async (req, res) => {
    const result = await BillCategory.getBill(req.params.id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getBillSellPoint: async (req, res) => {
    const result = await SellPointBillCategory.getBill(req.params.id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  storeBillToFactory: async (req, res) => {
    const { id } = req.user;
    const data = req.body;
    data.sp_id = id;
    const result = await new Bill(data).addBill(req.body);
    res.status(result.status).json({
      data: result.data,
    });
  },

  storeBillToSellPoint: async (req, res) => {
    const result = await new SellPointBill(req.params.id, req.user.id,req.body.date).add(
      req.body
    );
    res.status(result.status).json({
      data: result.data,
    });
  },

  storeInventory: async (req, res) => {
    const data={};
    data.sell_point_id = req.user.id;
    data.date = req.body.date;
    const result = await new Inventory(data).addInventory(req.body);
    
    res.status(result.status).json({
      data: result.data,
    });
  },

  storeOrder: async (req, res) => {
    const canBuy = await Student.rightToPurchase(
      req.body.student_id,
      req.body.total_price
    );
    if (canBuy.data) {
      const orders = await new OrderTransform().transformData(
        req.body,
        req.body.student_id
      );
      const result = await new StudentOrder(orders).add();
      res.status(result.status).json({
        data: result.data,
      });
    } else {
      res.status(canBuy.status).json({
        data: canBuy.message,
      });
    }
  },

  getStudent: async (req, res) => {
    try {
      const result = await Student.getOne(req.params.id);
      res.status(result.status).json({
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  getStudents: async (req, res) => {
    try {
      const result = await Student.getAll(req.user.id);
      res.status(result.status).json({
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  getBillsToSellPoint: async (req, res) => {
    try {
      const result = await SellPointBill.getBillToSellPoint(req.user.id);
      res.status(result.status).json({
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  },

  getAllSellPoint: async (req, res) => {
    const result = await SellPoint.getAllToOrderBill(req.user.id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getAllSp: async (req, res) => {
    const result = await SellPoint.getAllSp();
    res.status(result.status).json({
      data: result.data,
    });
  },

  endDay: async (req, res) => {
    const result = await StudentOrder.endDayOffline(
      req.body.orders,
      req.body.students
    );
    res.status(result.status).json({
      data: result.data,
    });
    
  },

  updateStudentsOffline: async (req, res) => {
    const result = await Student.updateStudentsForSellPoint(req.body.students);
    res.status(result.status).json({
      data: result.data,
    });
  },

  addStudentOrderOffline: async (req, res) => {
    const result = await new StudentOrder(req.body.orders).add();
    res.status(result.status).json({
      data: result.data,
    });
  },

  getAllSellPointForOneDriver: async (req, res) => {
    const { driver_id } = req.params;
    const result = await SellPoint.getAllForOneDriver(driver_id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getAllSellPointForOnePromoter: async (req, res) => {
    const { promoter_id } = req.params;
    const result = await SellPoint.getAllForOnePromoter(promoter_id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  storeEnvelop: async (req, res) => {
    const { sp_id } = req.params;
    const { data } = req.body;

    data.sp_id = sp_id;
    const result = await SellPoint.storeEnvelop(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  updateEnvelop: async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const result = await SellPoint.updateEnvelop(data, id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  deleteEnvelop: async (req, res) => {
    const { id } = req.params;
    const result = await SellPoint.deleteEnvelop(id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getEnvelopsbySpId: async (req, res) => {
    const { sp_id } = req.params;
    const result = await SellPoint.getEnvelopsbySpId(sp_id);
    res.status(result.status).json({
      data: result.data,
    });
  },
};
