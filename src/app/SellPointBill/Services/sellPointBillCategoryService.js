const { SellPointBillCategoryModel,CategoryModel } = require("../../index");
const code = require("../../../../utils/httpStatus");
const database = require("../../../../utils/database");
const { Op } = require("sequelize");
const { deleted } = require("../../../../helpers/hooksSellpoitIll");

class SellPointBillCategory {
  constructor(data) {
    this.bills = data;
  }

  async add() {
    try {
      const sellbills = await SellPointBillCategoryModel.bulkCreate(this.bills);
      return {
        data: "bill add successfully",
        status: code.CREATED,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getBill(sell_point_bill_id) {
    try {
      const bills = await SellPointBillCategoryModel.findAll({
        where: {
          sell_point_bill_id: sell_point_bill_id,
        },
        include: ["category"],
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

  static async updateOneSample(data) {
    const t = await database.sequelize.transaction();
    try {
      const billCategory = await SellPointBillCategoryModel.findByPk(
        data.bill_id,
        { transaction: t }
      );
    
      if (billCategory.amount !== 0) {
        billCategory.total_price =
          (billCategory.total_price * data.amount) / billCategory.amount;
      } else {
        const category = await CategoryModel.findByPk(
          billCategory.category_id,
          {
            attributes: ["id", "price"],
            transaction: t,
          }
        );
        billCategory.total_price = category.price * data.amount;
      }
      billCategory.amount = data.amount;
      await billCategory.save({ transaction: t });

      (await t).commit();
      return {
        data: billCategory,
        status: code.OK,
      };
    } catch (error) {
      console.log(error);
      (await t).rollback();
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deleteBillCategory(id) {
    try {
      const bill = await SellPointBillCategoryModel.findByPk(id, {
        attributes: ["sell_point_bill_id"],
      });
      const billCategory = await SellPointBillCategoryModel.destroy({
        where: {
          id: id,
        },
      });
      await deleted(bill.sell_point_bill_id);
      if (billCategory > 0) {
        return {
          data: "deleted",
          status: code.OK,
        };
      } else {
        return {
          data: "something went wrong",
          status: code.BAD_REQUEST,
        };
      }
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

module.exports = SellPointBillCategory;
