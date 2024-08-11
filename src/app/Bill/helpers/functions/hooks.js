const { sequelize } = require("../../../../../utils/database");

async function updated(billCategory, option) {
  const bill =
    billCategory.length > 0 ? billCategory[0].bill_id : billCategory.bill_id;

  try {
    const totalCategories = await sequelize.models.BillCategoryModel.sum(
      "total_price",
      {
        where: { bill_id: bill },
        transaction: option.transaction,
      }
    );

    const totalAmount = await sequelize.models.BillCategoryModel.sum("amount", {
      where: { bill_id: bill },
      transaction: option.transaction,
    });

    await sequelize.models.BillModel.update(
      { total: totalCategories, total_quantity: totalAmount },
      {
        where: { id: bill },
        transaction: option.transaction,
      }
    );
  } catch (error) {
    console.log("Error:", error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}

async function deleted(bill) {
  const t = await sequelize.transaction();

  try {
    const totalCategories = await sequelize.models.BillCategoryModel.sum(
      "total_price",
      {
        where: {
          bill_id: bill,
        },
        transaction: t,
      }
    );
  
    const totalAmount = await sequelize.models.BillCategoryModel.sum("amount", {
      where: { bill_id: bill },
      transaction: t,
    });
  
    if (!totalAmount || !totalCategories) {
      await sequelize.models.BillModel.destroy({
        where: { id: bill },
        transaction: t,
      });
    } else {
      await sequelize.models.BillModel.update(
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
