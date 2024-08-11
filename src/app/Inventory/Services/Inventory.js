const {
  InventoryModel,
  Sequelize,
  InventoryCategoryModel,
  CategoryModel,
  EnvelopModel,
  SellPointModel,
  PromoterModel,
  DriverModel,
} = require("../../index");
const code = require("../../../../utils/httpStatus");
const calculateDateRange = require("../../../../helpers/date");
const { Op } = require("sequelize");
const database = require("../../../../utils/database");
const {
  checkExistingInventory,
  createInventoryItems,
} = require("../helpers/functions");
const equalDate = require("../../../../helpers/dateEqual");

class Inventory {
  constructor(data) {
    this.sell_point_id = data.sell_point_id;
    this.date = data.date ?? new Date().toISOString().slice(0, 10);
  }

  async addInventory(body) {
    const t = await database.sequelize.transaction();

    try {
      const existingInventory = await checkExistingInventory(
        this.date,
        this.sell_point_id,
        t
      );

      if (existingInventory) {
        await t.rollback();
        return {
          data: "You can't add this Inventory because you have an old Inventory at this date",
          status: code.BAD_REQUEST,
        };
      }

      const inventory = await InventoryModel.create(this, { transaction: t });
      const inventoryItems = await createInventoryItems(body, t, inventory.id);

      await InventoryCategoryModel.bulkCreate(inventoryItems, {
        transaction: t,
      });

      await t.commit();
      return {
        data: "Inventory add successfully",
        status: code.OK,
      };
    } catch (error) {
      console.log("Inventory " + error);
      await t.rollback();
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getInventoryBySpId(data) {
    try {
      const { start, end } = calculateDateRange(
        data.date,
        data.start,
        data.end
      );
      const inventories = await InventoryModel.findAll({
        attributes: ["id", "total_price", "total_amount", "date"],
        where: {
          date: {
            [Sequelize.Op.between]: [start, end],
          },
          sell_point_id: data.id,
        },

        include: [
          {
            model: InventoryCategoryModel,
            as: "inventory_category",
            attributes: ["id", "amount"],
            include: [
              {
                model: CategoryModel,
                as: "category",
                attributes: ["id", "name_ar", "name_en", "price"],
              },
            ],
          },
        ],
      });

      return {
        data: inventories,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getInventories(id, date) {
    try {
      let { start, end } = calculateDateRange(date, date, date);

      const sellPointInvenory = await InventoryModel.findAll({
        where: {
          sell_point_id: id,
          date: {
            [Op.between]: [start, end],
          },
        },
        attributes: ["id", "total_price", "total_amount", "date"],
      });
      return {
        data: sellPointInvenory,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async copyInventories(id) {
    try {
      const sellPointInvenory = await InventoryModel.findAll({
        where: {
          sell_point_id: id,
        },
        attributes: ["total_price", "total_amount", "date", "sell_point_id"],
        order: [["date", "DESC"]],
        limit: 1,
      });
      const newSellPointInventory = sellPointInvenory[0].dataValues;


      const d = new Date();
      const localTime = d.getTime();
      const localOffset = d.getTimezoneOffset() * 60000;

      const utc = localTime + localOffset;
      const offset = 4; // UTC of Dubai is +04.00
      const dubai = utc + 3600000 * offset;

      const dubaiTimeNow = new Date(dubai);
      console.log(newSellPointInventory.date);
      console.log(dubaiTimeNow);
      if (equalDate(newSellPointInventory.date, dubaiTimeNow)) {
        return {
          data: "There is Inventory at this date",
          status: code.BAD_REQUEST,
        };
      }
      newSellPointInventory.date = dubaiTimeNow;
      const createdInventory = await InventoryModel.create(
        newSellPointInventory
      );
      return {
        data: createdInventory,
        status: code.OK,
      };
    } catch (error) {
      console.log(error);
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
  static async getInventoryCategory(id) {
    try {
      const inventoryCategories = await InventoryModel.findOne({
        attributes: ["id", "total_price", "date"],
        where: {
          id: id,
        },
        include: [
          {
            model: InventoryCategoryModel,
            as: "inventory_category",
            attributes: ["id", "amount"],
            include: [
              {
                model: CategoryModel,
                as: "category",
                attributes: ["id", "name_ar", "name_en", "price"],
              },
            ],
          },
        ],
      });

      return {
        data: inventoryCategories,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getAllInventories(data) {
    try {
      const { start, end } = calculateDateRange(
        data.date,
        data.start,
        data.end
      );
      const inventories = await InventoryModel.findAll({
        attributes: ["id", "total_price", "total_amount", "date"],
        where: {
          date: {
            [Sequelize.Op.between]: [start, end],
          },
        },

        include: [
          {
            model: SellPointModel,
            as: "sell_point",
            attributes: ["id", "name"],
            include: [
              {
                model: DriverModel,
                as: "driver",
                attributes: ["id", "name_ar", "name_en", "phone"],
              },
              {
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar", "name_en", "phone"],
              },
            ],
          },

          {
            model: InventoryCategoryModel,
            as: "inventory_category",
            attributes: ["id", "amount"],
            include: [
              {
                model: CategoryModel,
                as: "category",
                attributes: ["id", "name_ar", "name_en", "price"],
              },
            ],
          },
        ],
      });

      return {
        data: inventories,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deleteInventory(id) {
    try {
      await InventoryModel.destroy({
        where: {
          id: id,
        },
      });

      return {
        data: "Inventory deleted successfully",
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

module.exports = Inventory;
