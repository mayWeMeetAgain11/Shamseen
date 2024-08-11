const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StudentOrderModel extends Model {
    static associate(models) {
      this.belongsTo(models.StudentModel, {
        foreignKey: "student_id",
        as: "student",
      });
      this.belongsTo(models.CategoryModel, {
        foreignKey: "category_id",
        as: "category",
      });
    }
  }
  StudentOrderModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      unit_price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      sequelize,
      modelName: "StudentOrderModel",
      tableName: "student_orders",
      underscored: true,
    }
  );
  return StudentOrderModel;
};
