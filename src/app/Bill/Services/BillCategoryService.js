const { BillCategoryModel, CategoryModel, BillModel } = require("../../index");
const code = require("../../../../utils/httpStatus");
const { sequelize } = require("../../../../utils/database");
const { Op } = require("sequelize");
const { deleted } = require("../helpers/functions/hooks");

class BillCategory {
  constructor(data) {
    this.bills = data;
  }

  async add() {
    try {
      const bills = await BillCategoryModel.bulkCreate(this.bills);
      return {
        data: "bill add successfully",
        status: code.CREATED,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getBill(bill_id) {
    try {
      const bills = await BillCategoryModel.findAll({
        where: {
          bill_id: bill_id,
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

  static async update(bill_id, newBillCategories) {
    try {
      const result = await sequelize.transaction(async (t) => {
         await BillCategoryModel.destroy(
          {
            where: {
              bill_id: bill_id,
            },
          },
          { transaction: t }
        );
        const billCategories = await BillCategoryModel.bulkCreate(
          newBillCategories,
          { transaction: t }
        );
        return billCategories;
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

  static async updateOneSample(data) {
    try {
      const billCategory = await BillCategoryModel.findByPk(
        data.bill_category_id
      );
      if (billCategory.amount !== 0) {
        
        billCategory.total_price =
          (billCategory.total_price * data.amount) / billCategory.amount;
      } else {
        const category = await CategoryModel.findByPk(
          billCategory.category_id,
          {
            attributes: ["id", "price"],
          }
        );
        billCategory.total_price = category.price * data.amount;
      }
      
      billCategory.amount = data.amount;
      billCategory.save();
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

  static async deleteManySample(bill_category_ids) {
    try {
      const bill = await BillCategoryModel.findByPk(bill_category_ids[0], {
        attributes: ["bill_id"],
      });
      const billCategory = await BillCategoryModel.destroy({
        where: {
          id: {
            [Op.in]: bill_category_ids,
          },
        },
      });
      await deleted(bill.bill_id);
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
      console.log(error);

      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getBillCategories(id) {
    try {
      const result = await BillCategoryModel.findAll({
        where: {
          bill_id: id,
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

  // async relateCategory(data) {
  //     try {
  //         const newBillCategory = await BillCategoryModel.create({
  //             amount: data.amount,
  //             total_price: data.total_price,
  //             category_id: data.category_id,
  //             bill_id: data.bill_id,

  //         });
  //         return {
  //             data: 'added sucessfully',
  //             status: code.OK
  //         };
  //     } catch (error) {
  //         return {
  //             data: error.message,
  //             status: code.INTERNAL_SERVER_ERROR
  //         }
  //     }
  // }
}

module.exports = BillCategory;
