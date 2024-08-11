const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InventoryModel extends Model {
    static associate(models) {
      this.belongsTo(models.SellPointModel, {
        foreignKey: "sell_point_id",
        as: "sell_point",
      });
      this.hasMany(models.InventoryCategoryModel, {
        foreignKey: "inventory_id",
        as: "inventory_category",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  InventoryModel.init(
    {
      total_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "InventoryModel",
      tableName: "inventories",
      underscored: true,
    }
  );
  return InventoryModel;
};
