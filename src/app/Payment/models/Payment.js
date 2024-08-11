const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentModel extends Model {
    static associate(models) {
      this.belongsTo(models.StudentModel, {
        foreignKey: "student_id",
        as: "student",
      });
    }
  }
  PaymentModel.init(
    {
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      successInd: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PaymentModel",
      tableName: "payments",
      underscored: true,
    }
  );
  return PaymentModel;
};
