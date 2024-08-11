const { Model } = require("sequelize");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  class StudentModel extends Model {
    generateToken() {
      const token = jwt.sign(
        { id: this.id, user: this.email, type: "student" },
        process.env.SECRETKEY
      );
      return token;
    }
    static associate(models) {
      this.hasMany(models.StudentOrderModel, {
        foreignKey: "student_id",
        as: "student_orders",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      this.belongsTo(models.SchoolModel, {
        foreignKey: "school_id",
      });
      this.hasMany(models.CardChargeModel, {
        foreignKey: "student_id",
        as: "card_charges",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      this.belongsTo(models.SchoolModel, {
        foreignKey: "school_id",
        as: "school",
      });
    }
  }
  StudentModel.init(
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mid_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        validate: {
          len: {
            args: [8],
            msg: "Password should be at least 8 characters long",
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM,
        values: ["male", "female"],
        defaultValue: "male",
      },
      balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      threshold: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verifyTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "StudentModel",
      tableName: "students",
      underscored: true,
    }
  );
  return StudentModel;
};
