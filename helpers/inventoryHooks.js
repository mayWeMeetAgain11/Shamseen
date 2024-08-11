const { sequelize } = require("../utils/database");

async function updated(inventoryCategory, option) {
  try {
    let id =
      inventoryCategory.length > 0
        ? inventoryCategory[0].inventory_id
        : inventoryCategory.inventory_id;

    if (!id) {
      const invC = await sequelize.models.InventoryCategoryModel.findByPk(
        inventoryCategory.where.id,
        { transaction: option?.transaction }
      );
      id = invC.inventory_id;
    }
    const totalAmount = await sequelize.models.InventoryCategoryModel.sum(
      "amount",
      {
        where: { inventory_id: id },
        transaction: option?.transaction,
      }
    );

    const totalPrice = await sequelize.query(
      `
            SELECT SUM(amount * price) AS total_price
            FROM inventory_categories AS icm
            INNER JOIN categories AS cm ON icm.category_id = cm.id
            WHERE icm.inventory_id = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
        transaction: option?.transaction,
      }
    );

    await sequelize.models.InventoryModel.update(
      {
        total_amount: totalAmount,
        total_price: totalPrice[0].total_price,
      },
      {
        where: { id: id },
        transaction: option?.transaction,
      }
    );
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}

async function deleted(id) {
  const t = await sequelize.transaction();

  try {
    const totalPrice = await sequelize.query(
      `
            SELECT SUM(amount * price) AS total_price
            FROM inventory_categories AS icm
            INNER JOIN categories AS cm ON icm.category_id = cm.id
            WHERE icm.inventory_id = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    const totalAmount = await sequelize.models.InventoryCategoryModel.sum(
      "amount",
      {
        where: { inventory_id: id },
        transaction: t,
      }
    );

    await sequelize.models.InventoryModel.update(
      { total_price: totalPrice[0].total_price, total_amount: totalAmount },
      {
        where: { id: id },
        transaction: t,
      }
    );
    await t.commit();
  } catch (error) {
    await t.rollback();
    console.log(error);
    throw error;
  }
}

module.exports = { deleted, updated };
