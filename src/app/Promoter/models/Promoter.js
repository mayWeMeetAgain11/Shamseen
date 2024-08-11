const { Model } = require("sequelize");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  class PromoterModel extends Model {
    generateToken() {
      const token = jwt.sign({ id: this.id }, process.env.SECRETKEY);
      return token;
    }
    static associate(models) {
      this.hasMany(models.SellPointModel, {
        foreignKey: "promoter_id",
        as: "sell_points",
      });
    }
  }
  PromoterModel.init(
    {
      name_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name_en: {
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
      token: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
    },
    {
      sequelize,
      modelName: "PromoterModel",
      tableName: "promoters",
      underscored: true,
    }
  );
  return PromoterModel;
};
