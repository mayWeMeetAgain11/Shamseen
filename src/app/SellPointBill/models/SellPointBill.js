const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SellPointBillModel extends Model {
    static associate(models) {
      this.belongsTo(models.SellPointModel, {
        foreignKey: "from_sell_point_id",
        as: "from_sell_point",
      });
      this.belongsTo(models.SellPointModel, {
        foreignKey: "to_sell_point_id",
        as: "to_sell_point_to",
        
      });
      this.hasMany(models.SellPointBillCategoryModel, {
        foreignKey: "sell_point_bill_id",
        as: "sell_point_bill_categories",
      });
    }
  }
  SellPointBillModel.init(
    {
      total: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      total_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["raw", "default"],
        allowNull: false,
        defaultValue: "default",
      },
      from_sell_point_id: {
        type: DataTypes.INTEGER,
      },
      to_sell_point_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "SellPointBillModel",
      tableName: "sell_point_bills",
      underscored: true,
    }
  );
  return SellPointBillModel;
};
