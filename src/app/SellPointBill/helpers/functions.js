const { CategoryModel } = require("../../index");

module.exports = {
  async createBillItems(body, transaction, billId) {
    return Promise.all(
      body.bills.map(async (order) => {
        const category = await CategoryModel.findByPk(order.category_id, {
          attributes: ["id", "price"],
          transaction: transaction,
        });
        const total_price = category.price * order.amount;
        return {
          total_price,
          category_id: category.id,
          amount: order.amount,
          unit_price: category.price,
          sell_point_bill_id: billId,
        };
      })
    );
  },
};
