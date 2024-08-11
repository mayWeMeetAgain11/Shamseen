const { Model } = require("sequelize");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  class SellPointModel extends Model {
    generateToken() {
      const token = jwt.sign(
        { id: this.id, user: this.user, type: "sell-point" },
        process.env.SECRETKEY
      );
      return token;
    }
    static associate(models) {
      this.belongsTo(models.SchoolModel, {
        foreignKey: "school_id",
        as: "school",
      });
      this.belongsTo(models.DriverModel, {
        foreignKey: "driver_id",
        as: "driver",
      });
      this.belongsTo(models.ManagerModel, {
        foreignKey: "manager_id",
        as: "manager",
      });
      this.hasMany(models.InventoryModel, {
        foreignKey: "sell_point_id",
        as: "inventories",
      });
      this.hasMany(models.BillModel, {
        foreignKey: "sell_point_id",
        as: "bills",
      });
      this.hasMany(models.SellPointBillModel, {
        foreignKey: "from_sell_point_id",
        as: "sent_sell_point_bills",
      });
      this.hasMany(models.SellPointBillModel, {
        foreignKey: "to_sell_point_id",
        as: "received_sell_point_bills",
      });
      this.belongsTo(models.PromoterModel, {
        foreignKey: "promoter_id",
        as: "promoter",
      });
      this.hasMany(models.SellPointCategoryModel, {
        foreignKey: "sell_point_id",
        as: "sell_point_categories",
      });
      this.hasMany(models.EnvelopModel, {
        foreignKey: "sell_point_id",
        as: "envelops",
      });
    }
  }
  SellPointModel.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      updated: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      token: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "SellPointModel",
      tableName: "sell_points",
      underscored: true,
    }
  );
  return SellPointModel;
};
