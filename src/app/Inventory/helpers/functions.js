const { InventoryModel, Sequelize, CategoryModel } = require("../../index");
const calculateDateRange = require("../../../../helpers/date");

module.exports = {
  async checkExistingInventory(date, sell_point_id, transaction) {
    const { start, end } = calculateDateRange(date, date, date);
    const existingInventory = await InventoryModel.findOne({
      where: {
        date: {
          [Sequelize.Op.between]: [start, end],
        },
        sell_point_id: sell_point_id,
      },
      attributes: ["id"],
      transaction: transaction,
    });

    return existingInventory;
  },

  async createInventoryItems(body, t, InventoryId) {
    return Promise.all(
      body.bills.map(async (order) => {
        const category = await CategoryModel.findByPk(order.category_id, {
          attributes: ["id"],
          transaction: t,
        });
        return {
          category_id: category.id,
          amount: order.amount,
          inventory_id: InventoryId,
        };
      })
    );
  },
};
