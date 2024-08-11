const {
  PromoterModel,
  SellPointModel,
  BillModel,
  EnvelopModel,
  DriverModel,
  SchoolModel,
  CategoryModel,
  InventoryCategoryModel,
  InventoryModel,
  SellPointBillModel,
} = require("../index");
const httpStatus = require("../../../utils/httpStatus");
const calculateDateRange = require("../../../helpers/date");
const { Op } = require("sequelize");

class Promoter {
  constructor(data) {
    this.name_ar = data.name_ar;
    this.name_en = data.name_en;
    this.user = data.user;
    this.password = data.password;
    this.phone = data.phone;
  }

  static async getAllWithSellPoints() {
    try {
      const promoters = await PromoterModel.findAll({
        include: [
          {
            model: SellPointModel,
            as: "sell_points",
          },
        ],
      });
      return {
        data: promoters,
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.BAD_REQUEST,
      };
    }
  }

  static async delete(data) {
    try {
      const promoter = await PromoterModel.destroy({
        where: {
          id: data.promoter_id,
        },
      });
      if (promoter == 1) {
        return {
          data: "deleted",
          status: httpStatus.OK,
        };
      } else {
        return {
          data: "something wrong happened",
          status: httpStatus.BAD_REQUEST,
        };
      }
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.BAD_REQUEST,
      };
    }
  }

  static async getAllSellPoints(id) {
    try {
      const sps = await SellPointModel.findAll({
        where: {
          promoter_id: id,
        },
        attributes: ["id", "name"],
        include: [
          {
            model: SchoolModel,
            as: "school",
          },
        ],
      });
      return {
        data: sps,
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.BAD_REQUEST,
      };
    }
  }

  static async getAllPromoters() {
    try {
      const promoters = await PromoterModel.findAll({
        attributes: ["id", "name_ar"],
      });
      return {
        data: promoters,
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.BAD_REQUEST,
      };
    }
  }

  async register() {
    try {
      const promoter = await PromoterModel.create(this);
      const generatedToken = await promoter.generateToken();
      promoter.token = generatedToken;
      await promoter.save();
      return {
        data: promoter,
        token: generatedToken,
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async login(user, password) {
    try {
      const promoter = await PromoterModel.findOne({
        where: {
          user: user,
        },
      });
      if (!promoter) {
        return {
          data: "User  Not Found",
          status: httpStatus.NOT_FOUND,
        };
      } else if (password !== promoter.password) {
        return {
          data: "Invalid password",
          status: httpStatus.NOT_FOUND,
        };
      } else {
        const generatedToken = await promoter.generateToken();
        promoter.token = generatedToken;
        await promoter.save();
        return {
          data: promoter,
          token: generatedToken,
          status: httpStatus.OK,
        };
      }
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getSellPointPromoter(id) {
    try {
      const sp = await SellPointModel.findOne({
        where: {
          id: id,
        },
        attributes: ["promoter_id"],
      });
      const promoter = await PromoterModel.findByPk(sp.promoter_id);
      return {
        data: promoter,
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.BAD_REQUEST,
      };
    }
  }

  static async getSellPointInventory(data) {
    try {
      const { start, end } = calculateDateRange(
        data.date,
        data.start,
        data.end
      );

      const result = await SellPointModel.findOne({
        where: {
          id: data.id,
        },
        attributes: ["id", "name"],
        include: [
          {
            model: DriverModel,
            as: "driver",
            attributes: ["id", "name_ar", "name_en"],
          },
          {
            model: EnvelopModel,
            as: "envelops",
            attributes: ["id", "number", "cash"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
            },
          },
          {
            model: InventoryModel,
            as: "inventories",
            attributes: ["id", "total_price", "total_amount"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
            },
            include: [
              {
                model: InventoryCategoryModel,
                as: "inventory_category",
                attributes: ["id", "amount"],
                include: [
                  {
                    model: CategoryModel,
                    as: "category",
                    attributes: ["id", "name_ar", "name_en", "price"],
                  },
                ],
              },
            ],
          },
        ],
      });

      return {
        data: result,
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.BAD_REQUEST,
      };
    }
  }

  static async edit(data) {
    try {
      const promoter = await PromoterModel.findByPk(data.promoter_id);
      promoter.name_ar = data.name_ar || promoter.name_ar;
      promoter.name_en = data.name_en || promoter.name_en;
      promoter.user = data.user || promoter.user;
      promoter.password = data.password || promoter.password;
      promoter.phone = data.phone || promoter.phone;
      await promoter.save();
      return {
        data: "edited",
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.BAD_REQUEST,
      };
    }
  }

  static async getBills(id, date) {
    try {
      let { start, end } = calculateDateRange(date, date, date);

      const sellPointsBills = await BillModel.findAll({
        where: {
          sell_point_id: id,
          date: {
            [Op.between]: [start, end],
          },
        },
        attributes: ["id", "type", "date"],
      });
      return {
        data: sellPointsBills,
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getBillsToSp(id, date) {
    try {
      let { start, end } = calculateDateRange(date, date, date);

      const sellPointsBills = await SellPointBillModel.findAll({
        where: {
          to_sell_point_id: id,
          date: {
            [Op.between]: [start, end],
          },
        },
        include: [
          {
            model: SellPointModel,
            as: "from_sell_point",
            attributes: ["name"],
          },
        ],
        order: [["date", "DESC"]],
        attributes: ["id", "type", "date"],
        raw: "true",
      });
      return {
        data: sellPointsBills,
        status: httpStatus.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: httpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

module.exports = { Promoter };
