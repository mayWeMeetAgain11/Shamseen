require("dotenv").config();
const {
  SellPointModel,
  PromoterModel,
  EnvelopModel,
  DriverModel,
  SchoolModel,
  BillModel,
} = require("../index");
const code = require("../../../utils/httpStatus");
const { Op } = require("sequelize");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const calculateDateRange = require("../../../helpers/date");

class SellPoint {
  constructor(data) {
    this.name = data.name;
    this.user = data.user;
    this.password = data.password;
    this.school_id = data.school_id;
    this.driver_id = data.driver_id;
    this.manager_id = data.manager_id;
    this.promoter_id = data.promoter_id;
  }

  async register() {
    try {
      const sellPoint = await SellPointModel.create(this);
      return {
        data: sellPoint,
        status: code.CREATED,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async login(user, password) {
    try {
      const sellPoint = await SellPointModel.findOne({
        where: {
          user: user,
        },
      });
      if (!sellPoint) {
        return {
          data: "User Not Found",
          status: code.NOT_FOUND,
        };
      } else if (password !== sellPoint.password) {
        return {
          data: "Invalid password",
          status: code.NOT_FOUND,
        };
      } else {
        const generatedToken = await sellPoint.generateToken();
        sellPoint.token = generatedToken;
        await sellPoint.save();
        return {
          data: {
            token: generatedToken,
            data: sellPoint,
          },
          status: code.OK,
        };
      }
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async checkUpdate(id) {
    try {
      const sellPoint = await SellPointModel.findOne({
        where: {
          id: id,
        },
      });
      if (sellPoint.updated === true) {
        return {
          data: true,
          status: code.OK,
        };
      } else {
        return {
          data: false,
          status: code.OK,
        };
      }
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
  static async linkPromoter(spId, promoterId) {
    try {
      const result = await SellPointModel.update(
        { promoter_id: promoterId },
        {
          where: {
            id: spId,
          },
        }
      );
      return {
        data: result,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async UpdateDrivers(data) {
    try {
      const sellPoints = await SellPointModel.update(
        {
          driver_id: data.driver_id,
        },
        {
          where: {
            id: {
              [Op.in]: data.ids,
            },
          },
        }
      );
      return {
        data: "updated",
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async update(data) {
    try {
      const sellPoint = await SellPointModel.findByPk(data.sell_point_id);
      sellPoint.name = data.name || sellPoint.name;
      sellPoint.user = data.user || sellPoint.user;
      sellPoint.password = data.password || sellPoint.password;
      sellPoint.school_id = data.school_id || sellPoint.school_id;
      sellPoint.driver_id = data.driver_id || sellPoint.driver_id;
      sellPoint.manager_id = data.manager_id || sellPoint.manager_id;
      sellPoint.promoter_id = data.promoter_id || sellPoint.promoter_id;

      await sellPoint.save();

      return {
        data: "updated",
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getAll() {
    try {
      const sellPoints = await SellPointModel.findAll({
        include: [
          {
            model: SchoolModel,
            as: "school",
          },
          {
            model: DriverModel,
            as: "driver",
          },
          {
            model: PromoterModel,
            as: "promoter",
          },
          {
            model: BillModel,
            as: "bills",
            attributes: ["id"],
          },
        ],
      });

      return {
        data: sellPoints,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getAllSp() {
    try {
      const sellPoints = await SellPointModel.findAll({
        attributes: ["id", "name"],
      });
      return {
        data: sellPoints,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getAllToOrderBill(sell_point_id) {
    try {
      const sellPoints = await SellPointModel.findAll({
        where: {
          id: {
            [Op.ne]: sell_point_id,
          },
        },
      });
      return {
        data: sellPoints,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async delete(sell_point_id) {
    try {
      const sellPoint = await SellPointModel.destroy({
        where: {
          id: sell_point_id,
        },
      });
      if (sellPoint == 1) {
        return {
          data: "deleted",
          status: code.OK,
        };
      } else {
        return {
          data: "some thing went wrong",
          status: code.BAD_REQUEST,
        };
      }
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getAllForOneDriver(driver_id) {
    try {
      const sellPoints = await SellPointModel.findAll({
        where: {
          driver_id: driver_id,
        },
        include: [
          {
            model: SchoolModel,
            as: "school",
          },
          {
            model: PromoterModel,
            as: "promoter",
          },
        ],
      });
      return {
        data: sellPoints,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getAllForOnePromoter(promoter_id) {
    try {
      const sellPoints = await SellPointModel.findAll({
        where: {
          promoter_id: promoter_id,
        },
        include: [
          {
            model: SchoolModel,
            as: "school",
          },
          {
            model: DriverModel,
            as: "driver",
          },
        ],
      });
      return {
        data: sellPoints,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async storeEnvelop(data) {
    try {
      const { start, end } = calculateDateRange(data.date, Date(), Date());
      const oldEnvelop = await EnvelopModel.findOne({
        where: {
          date: {
            [Op.between]: [start, end],
          },
          sell_point_id: data.sp_id,
        },
      });
      if (oldEnvelop) await oldEnvelop.destroy();
      const envelop = await EnvelopModel.create({
        number: data.number,
        cash: data.cash,
        date: data.date,
        sell_point_id: data.sp_id,
      });
      return {
        data: envelop,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async updateEnvelop(data, id) {
    try {
      const envelop = await EnvelopModel.update(
        {
          cash: data.cash,
          sp_expenses: data.sp_expenses,
        },
        {
          where: {
            id: id,
          },
        }
      );
      return {
        data:
          envelop == 1 ? "envelop updated successfully" : "envelop not found",
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deleteEnvelop(id) {
    try {
      const envelop = await EnvelopModel.destroy({
        where: {
          id: id,
        },
      });
      return {
        data:
          envelop == 1 ? "envelop deleted successfully" : "envelop not found",
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getEnvelopsbySpId(id) {
    try {
      const envelops = await EnvelopModel.findAll({
        where: {
          sell_point_id: id,
        },
        order: [["date", "DESC"]],
        //limit: 10,
      });
      return {
        data: envelops,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

module.exports = SellPoint;
