const { InventoryCategoryModel } = require("../../index");
const code = require("../../../../utils/httpStatus");
const { deleted } = require("../../../../helpers/inventoryHooks");
const { createInventoryItems } = require("../helpers/functions");
const database = require("../../../../utils/database");

class BillCategory {
  constructor(data) {
    this.bills = data;
    this.amount = data.amount;
  }

  async add() {
    try {
      await InventoryCategoryModel.bulkCreate(this.bills);
      return {
        data: "inventory add successfully",
        status: code.CREATED,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateInventoryCategory(_id) {
    try {
      await InventoryCategoryModel.update(this, {
        where: {
          id: _id,
        },
      });
      return {
        data: "inventory updated successfully",
        status: code.CREATED,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deleteInventoryCategory(_id) {
    try {
      const inventoryCategory = await InventoryCategoryModel.findByPk(_id, {
        attributes: ["inventory_id"],
      });

      await InventoryCategoryModel.destroy({
        where: {
          id: _id,
        },
      });
      await deleted(inventoryCategory.inventory_id);
      return {
        data: "inventory category deleted successfully",
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async addInventoryCategory(data) {
    const t = await database.sequelize.transaction();

    try {
      const inventoryItems = await createInventoryItems(
        data,
        t,
        data.inventory_id
      );
      await InventoryCategoryModel.bulkCreate(inventoryItems, {
        transaction: t,
      });

      await t.commit();
      return {
        data: "categories add successfully",
        status: code.OK,
      };
    } catch (error) {
      await t.rollback();
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

module.exports = BillCategory;
