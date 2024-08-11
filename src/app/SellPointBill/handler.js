const SellPointBill = require("../SellPointBill/Services/sellPointBillService");
const SellPointBillCategory = require("../SellPointBill/Services/sellPointBillCategoryService");

module.exports = {
  getBillCategories: async (req, res) => {
    const { bill_id } = req.params;
    const result = await SellPointBill.getBillCategories(bill_id);
    res.status(result.status).json({
      data: result.data,
    });
  },
  updateBillCategories: async (req, res) => {
    const { bill_category_id } = req.params;
    const data = req.body;
    data.bill_id = bill_category_id;
    const result = await SellPointBillCategory.updateOneSample(data);
    res.status(result.status).json({
      data: result.data,
    });
  },

  deleteBill: async (req, res) => {
    const id = req.params.id;
    const result = await SellPointBill.deleteBill(id);
    res.status(result.status).json({
      data: result.data,
    });
  },

  deleteBillCategory: async (req, res) => {
    const id = req.params.id;
    const result = await SellPointBillCategory.deleteBillCategory(id);
    res.status(result.status).json({
      data: result.data,
    });
  },
};
