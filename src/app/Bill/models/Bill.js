const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BillModel extends Model {
    static associate(models) {
      this.belongsTo(models.SellPointModel, {
        foreignKey: "sell_point_id",
        as: "sell_point",
      });
      this.hasMany(models.BillCategoryModel, {
        foreignKey: "bill_id",
        as: "bill_categories",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  BillModel.init(
    {
      total_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      type: {
        type: DataTypes.ENUM,
        values: [
          "raw",
          "default",
          "returns",
          "expens_doctor",
          "expens_manager",
          "expens_eco",
          "expenses",
          "external",
        ],
        defaultValue: "default",
      },
    },
    {
      sequelize,
      modelName: "BillModel",
      tableName: "bills",
      underscored: true,
    }
  );
  return BillModel;
};
