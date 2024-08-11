require("dotenv").config();
const { Op } = require("sequelize");
const {
  StudentModel,
  StudentOrderModel,
  SchoolModel,
  SellPointModel,
  CategoryModel,
  Sequelize,
} = require("../..");
const calculateDateRange = require("../../../../helpers/date");
const code = require("../../../../utils/httpStatus");
const {
  generateVerificationToken,
} = require("../../../../utils/email/template");
const transporter = require("../../../../utils/email/nodemailer");

class Student {
  constructor(data) {
    this.email = data.email;
    this.first_name = data.first_name;
    this.mid_name = data.mid_name;
    this.last_name = data.last_name;
    this.password = data.password;
    this.phone = data.phone;
    this.type = data.type;
    this.gender = data.gender;
    this.school_id = data.school_id;
    this.threshold = data.threshold;
    this.balance = data.balance;
  }

  static async getOne(student_id) {
    try {
      const student = await StudentModel.findByPk(student_id);
      return {
        data: student,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getAll(sell_point_id) {
    const today = new Date().setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    try {
      const students = await StudentModel.findAll({
        attributes: {
          include: [
            [
              Sequelize.fn(
                "COALESCE",
                Sequelize.fn(
                  "SUM",
                  Sequelize.col("student_orders.total_price")
                ),
                0
              ),
              "total_price",
            ],
            // [Sequelize.fn('SUM', Sequelize.col('student_orders.total_price')), 'total_price'],
          ],
        },
        include: [
          {
            required: true,
            model: SchoolModel,
            as: "school",
            attributes: [],
            include: [
              {
                model: SellPointModel,
                as: "sell_points",
                attributes: [],
                where: {
                  id: sell_point_id,
                },
              },
            ],
          },
          {
            required: false,
            model: StudentOrderModel,
            as: "student_orders",
            attributes: [],
            where: {
              date: {
                [Sequelize.Op.between]: [today, tomorrow],
              },
            },
          },
        ],
        group: ["StudentModel.id"],
      });
      return {
        data: students,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async subtract(totalPrice, student_id) {
    try {
      const student = await StudentModel.findByPk(student_id);
      student.balance -= totalPrice;
      await student.save();
      return {
        data: true,
        status: code.OK,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async rightToPurchase(student_id, price) {
    const today = new Date().setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    try {
      const student = await StudentModel.findOne({
        attributes: {
          include: [
            [
              Sequelize.fn("SUM", Sequelize.col("student_orders.total_price")),
              "total_price",
            ],
          ],
        },
        include: [
          {
            required: false,
            model: StudentOrderModel,
            as: "student_orders",
            attributes: [],
            where: {
              date: {
                [Sequelize.Op.between]: [today, tomorrow],
              },
            },
          },
        ],
        where: {
          id: student_id,
        },
        group: ["StudentModel.id"],
      });
      console.log(student.getDataValue("total_price"));
      console.log(student.limit - student.getDataValue("total_price"));
      console.log(price);
      console.log(student.balance);
      if (
        student.threshold - student.getDataValue("total_price") >= price &&
        student.balance >= price
      ) {
        const result = await this.subtract(price, student_id);
        return {
          data: true,
          status: code.OK,
        };
      } else {
        return {
          data: false,
          message: `you reached the limit you can buy ${
            student.threshold - student.getDataValue("total_price")
          }`,
          status: code.VALIDATION_ERROR,
        };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateStudentsForSellPoint(students) {
    try {
      for (const student of students) {
        const result = await StudentModel.update(
          {
            balance: student.balance,
          },
          {
            where: {
              id: student.id,
            },
          }
        );
      }
      return {
        data: "students updated successfully",
        status: code.UPDATED,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
  async sendEmailVerfication(email) {
    try {
      const _token = generateVerificationToken();
      await StudentModel.update(
        { token: _token },
        {
          where: {
            email: email,
          },
        }
      );

      const mailOptions = {
        from: "cosmatest@timeengcom.com",
        to: email,
        subject: "Email Verification",
        text: `Click the following link to verify your email: ${process.env.HOST}/student/verify/email?token=${_token}`,
      };

      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      return {
        data: "Email send successfully",
        code: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        code: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async register() {
    try {
      const result = await StudentModel.create(this);
      await this.sendEmailVerfication(result.email);
      return {
        data: "Email verfication send succussfully",
        code: code.CREATED,
      };
    } catch (error) {
      return {
        data: error.message,
        code: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async verifyEmail(_token) {
    try {
      const student = await StudentModel.findOne({
        where: {
          token: _token,
        },
      });
      if (student !== null) {
        student.verifyTime = new Date();
        student.token = null;
        await student.save();
        return {
          data: "Email verified successfully please login now",
          code: code.OK,
        };
      } else {
        return {
          data: "Invalid verification token",
          code: code.UNAUTHORIZED,
        };
      }
    } catch (error) {
      return {
        data: error.message,
        code: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async signIn(email, password) {
    try {
      const result = await StudentModel.findOne({
        where: {
          email: email,
        },
      });
      if (result.verifyTime === null) {
        return {
          data: "You Must Verify your email before login to app",
          code: code.BAD_REQUEST,
        };
      }
      if (result && password === result.password) {
        const token = await result.generateToken();
        return {
          data: "success",
          token: token,
          code: code.OK,
        };
      } else {
        return {
          data: "username or password is not correct",
          code: code.BAD_REQUEST,
        };
      }
    } catch (error) {
      if (error.message.includes("email"))
        return {
          data: "email is invalid, please try again",
          code: code.UNAUTHORIZED,
        };
      else
        return {
          data: error.message,
          code: code.INTERNAL_SERVER_ERROR,
        };
    }
  }

  static async getDetails(id) {
    try {
      const result = await StudentModel.findByPk(id, {
        attributes: {
          exclude: ["created_At", "school_id"],
        },
        include: {
          model: SchoolModel,
          as: "school",
          attributes: ["id", "name_ar", "name_en", "region"],
        },
      });

      return {
        data: result,
        code: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        code: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getOrders(data) {
    try {
      const { start, end } = calculateDateRange(
        data.date,
        data.start,
        data.end
      );
      const result = await StudentOrderModel.findAll({
        where: {
          student_id: data.id,
          date: {
            [Op.between]: [start, end],
          },
        },
        include: {
          model: CategoryModel,
          as: "category",
          attributes: ["id", "name_ar", "name_en", "price"],
        },
      });

      return {
        data: result,
        code: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        code: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async updateDetails(id) {
    try {
      const result = await StudentModel.update(this, {
        where: {
          id: id,
        },
      });

      return {
        data:
          result == 1 ? "student updated successfully" : "student not found",
        code: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        code: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

module.exports = Student;
