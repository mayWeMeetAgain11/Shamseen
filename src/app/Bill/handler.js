const Bill = require("./Services/BillService");
const BillCategory = require("./Services/BillCategoryService");
const FactoryTransform = require("./helpers/Type/AddToFactory");

module.exports = {
  //Store new bill from anywhere
  storeBill: async (req, res) => {
    const { sp_id } = req.params;
    const data = req.body;
    data.sp_id = sp_id;
    const result = await new Bill(data).addBill(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  storeBillCategories: async (req, res) => {
    const { bill_id } = req.params;
    const data = req.body;
    const bills = await new FactoryTransform().transformData(data, bill_id);
    const result = await new BillCategory(bills).add();
    res.status(result.status).json({
      data: result.data,
    });
  },

  //get all bills for each driver
  getAllBillForEachDriver: async (req, res) => {
    const data = req.body;
    const result = await new Bill(data).getAllForEachDriver(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  //get all bills with total
  getAllBillsWithTotal: async (req, res) => {
    const { date } = req.body;
    const result = await new Bill(data).getAllWithTotal(date);
    res.status(result.status).json({
      data: result.data,
    });
  },

  //get all bills for each promoter
  getAllBillForAllPromoters: async (req, res) => {
    const data = req.body;
    const result = await new Bill(data).getAllForAllPromoters(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  updateBillCategories: async (req, res) => {
    const { bill_id } = req.params;
    const { newBillCategories } = req.body;
    const result = await BillCategory.update(bill_id, newBillCategories);
    res.status(result.status).json({
      data: result.data,
    });
  },

  updateOneBillCategory: async (req, res) => {
    const { bill_category_id } = req.params;
    let data = req.body;
    data.bill_category_id = bill_category_id;
    const result = await BillCategory.updateOneSample(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  deleteBillCategories: async (req, res) => {
    const { bill_category_ids } = req.body;
    const result = await BillCategory.deleteManySample(bill_category_ids);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getAllBillsForEachSchool: async (req, res) => {
    const data = req.body;
    const result = await new Bill(data).getAllForEachSchool(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getAllBillsPDF: async (req, res) => {
    const data = req.body;
    const result = await new Bill(data).getAllDataPDF(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  deleteBill: async (req, res) => {
    const id = req.params.id;
    const result = await Bill.deleteBill(id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  updateBillDate: async (req, res) => {
    const id = req.params.bill_id;
    const data = req.body;
    const result = await new Bill(data).editDate(id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getTotals: async (req, res) => {
    const data = req.body;
    const result = await new Bill(data).getTotal(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  // تقرير النسب
  getAllBillsWithBalance: async (req, res) => {
    const data = req.body;
    const result = await new Bill(data).getAllWithBalance(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getAllBillsWithBalanceCheck: async (req, res) => {
    const data = req.body;
    let result = {};
    if (data.start) {
      result = await new Bill(data).getAllbetweenDates(data);
    } else {
      result = await new Bill(data).getAllWithBalance2(data);
    }
    res.status(result.status).json({
      data: result.data,
    });
  },

  getAllBillsWithBalanceCheckId: async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    data.id = id;
    const result = await new Bill(data).getAllWithBalance3(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getAllBillsForOneCategory: async (req, res) => {
    let data = req.body;
    data.category_id = req.params.category_id;
    const result = await new Bill(data).materialBills(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getTotalsForOneSellPoint: async (req, res) => {
    let data = req.body;
    data.school_id = req.params.school_id;
    const result = await new Bill(data).getTotalForOneSellPoint(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getBillCategories: async (req, res) => {
    const { bill_id } = req.params;
    const result = await BillCategory.getBillCategories(bill_id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getBillCategoriesWithReturns: async (req, res) => {
    const data = req.body;
    const result = await Bill.getBillCategoriesWithReturs(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getReport: async (req, res) => {
    const data = req.body;
    const result = await Bill.getReport(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getExReport: async (req, res) => {
    const data = req.body;
    const result = await Bill.getExReport(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getEx2Report: async (req, res) => {
    const data = req.body;
    const result = await Bill.getEx2Report(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getEx3Report: async (req, res) => {
    const data = req.body;
    const result = await Bill.getEx3Report(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  getReturnsReport: async (req, res) => {
    const data = req.body;
    const result = await Bill.getReturnsReport(data);
    res.status(result.status).json({
      data: result.data,
    });
  },
};
