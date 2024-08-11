const { sequelize } = require("../utils/database");

async function updated(billCategory, option) {
  try {
    const bill =
      billCategory.length > 0
        ? billCategory[0].sell_point_bill_id
        : billCategory.sell_point_bill_id;

    const totalCategories =
      await sequelize.models.SellPointBillCategoryModel.sum("total_price", {
        where: { sell_point_bill_id: bill },
        transaction: option?.transaction,
      });
    const totalAmount = await sequelize.models.SellPointBillCategoryModel.sum(
      "amount",
      {
        where: { sell_point_bill_id: bill },
        transaction: option?.transaction,
      }
    );

    await sequelize.models.SellPointBillModel.update(
      { total: totalCategories, total_quantity: totalAmount },
      {
        where: { id: bill },
        transaction: option?.transaction,
      }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function deleted(bill) {
  const t = await sequelize.transaction();

  try {
    const totalCategories =
      await sequelize.models.SellPointBillCategoryModel.sum("total_price", {
        where: {
          sell_point_bill_id: bill,
        },
        transaction: t,
      });

    const totalAmount = await sequelize.models.SellPointBillCategoryModel.sum(
      "amount",
      {
        where: { sell_point_bill_id: bill },
        transaction: t,
      }
    );
    if (!totalAmount || !totalCategories) {
      await sequelize.models.SellPointBillModel.destroy({
        where: { id: bill },
        transaction: t,
      });
    } else {
      await sequelize.models.SellPointBillModel.update(
        { total: totalCategories, total_quantity: totalAmount },
        {
          where: { id: bill },
          transaction: t,
        }
      );
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

module.exports = { deleted, updated };
