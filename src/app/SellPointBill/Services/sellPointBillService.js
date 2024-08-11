const {
  SellPointBillModel,
  CategoryModel,
  SellPointBillCategoryModel,
  SellPointModel,
} = require("../../index");
const code = require("../../../../utils/httpStatus");
const database = require("../../../../utils/database");
const { createBillItems } = require("../helpers/functions");

class SellPointBill {
  constructor(from_sell_point_id, to_sell_point_id, date) {
    this.from_sell_point_id = from_sell_point_id;
    this.to_sell_point_id = to_sell_point_id;
    this.date = date;
  }

  async add(body) {
    const t = await database.sequelize.transaction();

    try {
      const bill = await SellPointBillModel.create(this, { transaction: t });
      const billItems = await createBillItems(body, t, bill.id);

      await SellPointBillCategoryModel.bulkCreate(billItems, {
        transaction: t,
      });
      await t.commit();

      return {
        data: "seel point bill add successfully",
        status: code.OK,
      };
    } catch (error) {
      console.log("SellBillError " + error);
      await t.rollback();

      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getBills(sell_point_id) {
    try {
      const bills = await SellPointBillModel.findAll({
        where: {
          to_sell_point_id: sell_point_id,
        },
        include: [
          {
            model: SellPointModel,
            as: "from_sell_point",
          },
        ],
        order: [["date", "DESC"]],
        limit: 10,
      });
      return {
        data: bills,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getBillToSellPoint(sell_point_id) {
    try {
      const bills = await SellPointBillModel.findAll({
        where: {
          from_sell_point_id: sell_point_id,
        },
        include: [
          {
            model: SellPointModel,
            as: "to_sell_point",
          },
        ],
        order: [["date", "DESC"]],
      });
      return {
        data: bills,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getBillCategories(id) {
    try {
      const result = await SellPointBillCategoryModel.findAll({
        where: {
          sell_point_bill_id: id,
        },
        attributes: ["id", "amount", "total_price"],
        include: [
          {
            model: CategoryModel,
            as: "category",
            attributes: ["id", "name_ar", "name_en", "price"],
          },
        ],
      });

      return {
        data: result,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deleteBill(id) {
    try {
      const result = await SellPointBillModel.destroy({
        where: {
          id: id,
        },
      });

      return {
        data: result ? "bill deleted successfully" : "bill not found",
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

module.exports = SellPointBill;
