const {
  BillModel,
  Sequelize,
  BillCategoryModel,
  SchoolModel,
  CategoryModel,
  PromoterModel,
  SellPointModel,
  DriverModel,
  EnvelopModel,
  InventoryModel,
  SellPointBillModel,
} = require("../../index");
const code = require("../../../../utils/httpStatus");
const sequelize = require("sequelize");
const database = require("../../../../utils/database");
const { Op } = require("sequelize");
const calculateDateRange = require("../../../../helpers/date");
const equalDate = require("../../../../helpers/dateEqual");

class Bill {
  constructor(data) {
    this.sell_point_id = data.sp_id;
    this.date = data.date ?? new Date().toISOString().slice(0, 10);
    this.type = data.type ?? "default";
  }

  async checkExistingBill(transaction) {
    const { start, end } = calculateDateRange(this.date, this.date, this.date);
    const existingBill = await BillModel.findOne({
      where: {
        date: {
          [Sequelize.Op.between]: [start, end],
        },
        sell_point_id: this.sell_point_id,
        type: this.type,
      },
      transaction: transaction,
    });

    return existingBill;
  }

  async createBillItems(body, transaction, billId) {
    return Promise.all(
      body.bills.map(async (order) => {
        const category = await CategoryModel.findByPk(order.category_id, {
          attributes: ["id", "price"],
          transaction: transaction,
        });
        const total_price = category.price * order.amount;
        return {
          total_price,
          category_id: category.id,
          amount: order.amount,
          bill_id: billId,
        };
      })
    );
  }

  async addBill(body) {
    const t = await database.sequelize.transaction();

    try {
      const existingBill = await this.checkExistingBill(t);

      if (existingBill) {
        await t.rollback();
        return {
          data: "You can't add this bill because you have an old bill at this date",
          status: code.BAD_REQUEST,
        };
      }

      const bill = await BillModel.create(this, { transaction: t });
      const billItems = await this.createBillItems(body, t, bill.id);

      await BillCategoryModel.bulkCreate(billItems, {
        transaction: t,
      });

      await t.commit();
      return {
        data: "Bill added successfully",
        status: code.CREATED,
      };
    } catch (error) {
      await t.rollback();
      console.log("BillError " + error);

      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Usage:
  // const result = await addBill(this, body);

  async editDate(id) {
    try {
      const result = await BillModel.update(
        { date: this.date },
        {
          where: {
            id: id,
          },
        }
      );

      return {
        data: result ? "bill date updated successfully" : "bill not found",
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }
  async getAllData(
    queryOptions,
    BaseModel,
    att,
    firstInclude,
    secondInclude,
    ord
  ) {
    try {
      const { start, end } = calculateDateRange(
        queryOptions.date,
        queryOptions.start,
        queryOptions.end
      );

      const result = await BaseModel.findAll({
        attributes: att,
        include: [
          {
            required: true,
            model: SellPointModel,
            as: "sell_points",
            attributes: ["id", "name"],
            include: [
              firstInclude,
              secondInclude,
              {
                required: true,
                model: BillModel,
                as: "bills",
                attributes: ["id", "total", "total_quantity", "date"],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                  type: this.type,
                },
                include: [
                  {
                    model: BillCategoryModel,
                    as: "bill_categories",
                    attributes: ["id", "amount", "total_price"],
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
          },
        ],
        order: [
          ord,
          [
            Sequelize.col("sell_points.bills.bill_categories.category_id"),
            "ASC",
          ],
        ],
      });

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

  async getAllForEachDriver(data) {
    let firstInclude = {
      model: PromoterModel,
      as: "promoter",
      attributes: ["id", "name_ar", "name_en", "phone"],
    };
    let secondInclude = {
      model: SchoolModel,
      as: "school",
      attributes: ["id", "name_ar", "name_en", "region", "type"],
    };
    let attributes = ["id", "name_ar", "name_en", "phone"];

    let ord = [Sequelize.col("id"), "ASC"];

    return await this.getAllData(
      data,
      DriverModel,
      attributes,
      firstInclude,
      secondInclude,
      ord
    );
  }

  async getAllForAllPromoters(data) {
    let firstInclude = {
      model: DriverModel,
      as: "driver",
      attributes: ["id", "name_ar", "name_en", "phone"],
    };
    let secondInclude = {
      model: SchoolModel,
      as: "school",
      attributes: ["id", "name_ar", "name_en", "region", "type"],
    };
    let attributes = ["id", "name_ar", "name_en", "phone"];

    let ord = [Sequelize.col("sell_points.driver.id"), "ASC"];

    return await this.getAllData(
      data,
      PromoterModel,
      attributes,
      firstInclude,
      secondInclude,
      ord
    );
  }

  async getAllForEachSchool(data) {
    let firstInclude = {
      model: DriverModel,
      as: "driver",
      attributes: ["id", "name_ar", "name_en", "phone"],
    };
    let secondInclude = {
      model: PromoterModel,
      as: "promoter",
      attributes: ["id", "name_ar", "name_en", "phone"],
    };
    let attributes = ["id", "name_ar", "name_en", "region", "type"];
    let ord = [Sequelize.col("sell_points.driver.id"), "ASC"];

    return await this.getAllData(
      data,
      SchoolModel,
      attributes,
      firstInclude,
      secondInclude,
      ord
    );
  }

  async getAllWithTotal(date) {
    try {
      const { start, end } = calculateDateRange(date, date, date);

      // Fetch bills
      const bills = await BillModel.findAll({
        where: {
          date: {
            [Op.between]: [start, end],
          },
          type: this.type,
        },
        include: [
          {
            model: BillCategoryModel,
            as: "bill_categories",
            include: [
              {
                model: CategoryModel,
                as: "category",
              },
            ],
          },
          {
            required: false,
            model: SellPointModel,
            as: "sell_point",
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
            ],
          },
        ],
      });

      return {
        data: bills,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getBills(sell_point_id) {
    try {
      const bills = await BillModel.findAll({
        where: {
          sell_point_id: sell_point_id,
          type: this.type,
        },
        order: [["date", "DESC"]],
        limit: 10,
      });
      return {
        data: bills,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.BAD_REQUEST,
      };
    }
  }

  async getTotal(data) {
    try {
      const { start, end } = calculateDateRange(
        data.date,
        data.start,
        data.end
      );

      const bills = await CategoryModel.findAll({
        attributes: [
          "id",
          "name_ar",
          "name_en",
          [
            sequelize.fn("SUM", sequelize.col("bill_categories.amount")),
            "count",
          ],
          [
            sequelize.fn("SUM", sequelize.col("bill_categories.total_price")),
            "total_price",
          ],
        ],
        include: [
          {
            required: true,
            model: BillCategoryModel,
            as: "bill_categories",
            attributes: [],
            include: [
              {
                required: true,
                model: BillModel,
                as: "bill",
                attributes: [],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                  type: this.type,
                },
              },
            ],
          },
        ],
        group: ["id"],
        raw: true,
      });

      return {
        data: bills,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getTotalForOneSellPoint(data) {
    try {
      const { start, end } = calculateDateRange(
        data.date,
        data.start,
        data.end
      );

      // const sps = await SellPointModel.findAll({
      //   where: {
      //     school_id: data.school_id,
      //   },
      //   attributes: ["id"],
      //   raw: true,
      // });
      // const spIds = sps.map((sp) => sp.id);
      // const bills = await CategoryModel.findAll({
      //   attributes: [
      //     "id",
      //     "name_ar",
      //     "name_en",
      //     [
      //       sequelize.fn("SUM", sequelize.col("bill_categories.amount")),
      //       "count",
      //     ],
      //     [
      //       sequelize.fn("SUM", sequelize.col("bill_categories.total_price")),
      //       "category_total_price",
      //     ],
      //   ],
      //   include: [
      //     {
      //       required: true,
      //       model: BillCategoryModel,
      //       as: "bill_categories",
      //       attributes: [],
      //       include: [
      //         {
      //           required: true,
      //           model: BillModel,
      //           as: "bill",
      //           attributes: [],
      //           where: {
      //             date: {
      //               [Op.between]: [start, end],
      //             },
      //             type: this.type,
      //             sell_point_id: {
      //               [Op.in]: spIds,
      //             },
      //           },
      //         },
      //       ],
      //     },
      //   ],
      //   group: ["id"],
      //   // raw: true,
      // });

      const bills = await BillModel.findAll({
        attributes: ["id", "total", "total_quantity", "date", "type"],
        where: {
          date: {
            [Op.between]: [start, end],
          },
          type: this.type,
        },
        include: {
          model: SellPointModel,
          attributes: [],
          as: "sell_point",
          where: {
            school_id: data.school_id,
          },
        },
        order: [["date", "ASC"]],
      });
      return {
        data: bills,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // حركة مادة
  async materialBills(data) {
    try {
      // const { start, end } = calculateDateRange(
      //   data.date,
      //   data.start,
      //   data.end
      // );

      // const result = await SchoolModel.findAll({
      //   attributes: [
      //     "name_ar",
      //     "name_en",
      //     [
      //       sequelize.fn(
      //         "SUM",
      //         sequelize.col("sell_points.bills.bill_categories.amount"),
      //       ),
      //       "count",
      //     ],
      //     [
      //       sequelize.fn(
      //         "SUM",
      //         sequelize.col("sell_points->bills->bill_categories.total_price")
      //       ),
      //       "category_total_price",
      //     ],
      //   ],
      //   include: [
      //     {
      //       required: true,
      //       model: SellPointModel,
      //       as: "sell_points",
      //       include: [
      //         {
      //           required: true,
      //           model: BillModel,
      //           as: "bills",
      //           where: {
      //             date: {
      //               [Op.between]: [start, end],
      //             },
      //             type: this.type,
      //           },
      //           include: [
      //             {
      //               required: true,
      //               model: BillCategoryModel,
      //               as: "bill_categories",
      //               where: {
      //                 category_id: data.category_id,
      //               },
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      //   group: ["id","sell_points.bills.type"],
      //   // raw: true,
      // });
      // let finalBills = [];
      // for (let i = 0; i < result.length; i++) {
      //   const finalBill = {
      //     name_ar: result[i].name_ar,
      //     name_en: result[i].name_en,
      //     count: result[i].getDataValue("count"),
      //     category_total_price: result[i].getDataValue("category_total_price"),
      //   };

      //   finalBills.push(finalBill);
      // }

      let startDate = new Date(data.start);
      startDate.setHours(17, 0, 0, 0);
      let end = new Date(data.end);
      let endDate = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      endDate.setHours(16, 59, 59, 0);

      startDate = startDate.toISOString();
      endDate = endDate.toISOString();
      console.log(startDate);
      const ress = await database.sequelize.query(
        `SELECT schools.id, schools.name_en, schools.name_ar, SUM(bill_categories.amount) as count, SUM(bill_categories.total_price) as category_total_price, bills.type
        FROM schools
        INNER JOIN sell_points ON schools.id = sell_points.school_id
        INNER JOIN bills ON sell_points.id = bills.sell_point_id
        INNER JOIN bill_categories ON bills.id = bill_categories.bill_id
        WHERE bill_categories.category_id = ${data.category_id} AND bills.date BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY schools.id, bills.type
        ORDER BY schools.id;
        `
      );

      const mergedObject = ress[0].reduce((result, obj) => {
        const key = obj.id;
        if (!result[key]) {
          result[key] = obj;
        } else {
          if (obj.type == "expenses") {
            result[key].countExpenses = parseInt(obj.count);
            result[key].category_total_price_expenses = parseInt(
              obj.category_total_price
            );
          } else if (obj.type == "returns") {
            result[key].countReturns = parseInt(obj.count);
            result[key].category_total_price_returns = parseInt(
              obj.category_total_price
            );
          }
        }
        return result;
      }, {});

      return {
        data: mergedObject,
        status: code.OK,
      };
    } catch (error) {
      console.log(error);
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deleteBill(id) {
    try {
      const result = await BillModel.destroy({
        where: {
          id: id,
        },
      });

      return {
        data: result ? "bill deleted successfully" : "bill not found",
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAllWithBalance(data) {
    try {
      const { start, end } = calculateDateRange(
        data.date,
        data.start,
        data.end
      );

      const result = await SchoolModel.findAll({
        attributes: [
          "id",
          "name_ar",
          "name_en",
          "region",
          "type",
          [
            sequelize.literal(
              "SUM(CASE WHEN `sell_points->bills`.`type` = 'expenses' THEN `sell_points->bills`.`total` ELSE 0 END)"
            ),
            "sp_expenses",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `sell_points->bills`.`type` = 'default' THEN `sell_points->bills`.`total` ELSE 0 END)"
            ),
            "totals",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `sell_points->bills`.`type` = 'returns' THEN `sell_points->bills`.`total` ELSE 0 END)"
            ),
            "returns",
          ],
        ],

        include: [
          {
            //required: true,
            model: SellPointModel,
            as: "sell_points",
            attributes: ["id", "name"],
            include: [
              {
                model: DriverModel,
                as: "driver",
                attributes: ["id", "name_ar", "name_en"],
              },
              {
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar", "name_en"],
              },

              {
                required: false,
                model: BillModel,
                as: "bills",
                attributes: ["id", "total", "total_quantity", "type"],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                },
              },
              {
                required: false,
                model: EnvelopModel,
                as: "envelops",
                attributes: ["id", "number", "cash"],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                },
              },
            ],
          },
        ],
        group: ["SchoolModel.id"],
      });

      const envelops = await EnvelopModel.findAll({
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
        attributes: [
          [
            sequelize.fn("COALESCE", sequelize.literal("SUM(`cash`)"), 0),
            "total_cash",
          ],
        ],
        include: {
          model: SellPointModel,
          as: "bill",
          attributes: ["id", "name"],
        },
        group: ["bill.id"],
        raw: true,
      });

      for (const envelop of envelops) {
        for (const res of result) {
          if (res.sell_points[0]?.id === envelop["bill.id"]) {
            res.dataValues.cash = envelop.total_cash;
          }
        }
      }

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

  async getAllDataPDF(queryOptions) {
    try {
      const { start, end } = calculateDateRange(
        queryOptions.date,
        queryOptions.start,
        queryOptions.end
      );

      const result = await BillModel.findAll({
        attributes: ["id", "total", "total_quantity", "date"],
        where: {
          date: {
            [Op.between]: [start, end],
          },
          type: this.type,
        },
        include: [
          {
            required: true,
            model: BillCategoryModel,
            as: "bill_categories",
            attributes: ["id", "amount", "total_price"],
            include: [
              {
                model: CategoryModel,
                as: "category",
                attributes: ["id", "name_ar", "name_en", "price"],
              },
            ],
          },
          {
            required: true,
            model: SellPointModel,
            as: "sell_point",
            attributes: ["id", "name"],
            include: [
              {
                required: true,
                model: SchoolModel,
                as: "school",
                attributes: ["id", "name_ar", "name_en", "type"],
              },
              {
                required: true,
                model: DriverModel,
                as: "driver",
                attributes: ["id", "name_ar", "name_en", "phone"],
              },
              {
                required: true,
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar", "name_en", "phone"],
              },
            ],
          },
        ],
      });

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

  async getAllWithBalance2(data) {
    try {
      let { start, end } = calculateDateRange(data.date, data.start, data.end);

      let startInventory = new Date(start);
      startInventory.setDate(startInventory.getDate() - 8);

      let startLastEnvelop = new Date(start);
      startLastEnvelop.setDate(startLastEnvelop.getDate() - 1);

      let endLastEnvelop = new Date(end);
      endLastEnvelop.setDate(endLastEnvelop.getDate() - 1);

      let lastEnvelop = await EnvelopModel.findAll({
        attributes: ["sell_point_id", "cash"],
        where: {
          date: {
            [Op.between]: [startLastEnvelop, endLastEnvelop],
          },
        },
      });

      // console.log(JSON.stringify(lastEnvelop, null, 2));
      let stores;

      const lastSaturday = new Date(start);
      lastSaturday.setDate(
        lastSaturday.getDate() - ((lastSaturday.getDay() + 1) % 7)
      ); // Go to the previous Saturday
      console.log(lastSaturday);
      const startOfSaturday = new Date(lastSaturday);
      startOfSaturday.setHours(0, 0, 0, 0); // Set time to beginning of Saturday
      let endOfSaturday = new Date(lastSaturday);
      endOfSaturday.setHours(23, 59, 59, 0); // Set time to end of Saturday
      stores = await BillModel.findAll({
        attributes: ["total", "total_quantity", "type", "sell_point_id"],

        where: {
          date: {
            [Op.between]: [startOfSaturday, endOfSaturday],
          },
          type: {
            [Op.eq]: "raw",
          },
        },
      });

      const result = await SchoolModel.findAll({
        attributes: ["id", "name_ar", "region"],

        include: [
          {
            //required: true,
            model: SellPointModel,
            as: "sell_points",
            attributes: ["id", "name"],
            include: [
              {
                required: false,
                model: PromoterModel,
                as: "promoter",
                attributes: ["name_ar"],
              },
              {
                required: false,
                model: DriverModel,
                as: "driver",
                attributes: ["name_ar"],
              },
              {
                required: false,
                model: BillModel,
                as: "bills",
                attributes: ["total", "total_quantity", "type"],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                },
              },
              {
                required: false,
                model: EnvelopModel,
                as: "envelops",
                attributes: ["number", "cash"],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                },
              },
              {
                required: false,
                model: InventoryModel,
                as: "inventories",
                attributes: ["total_price", "total_amount", "date"],
                where: {
                  date: {
                    [Op.between]: [startInventory, end],
                  },
                },
              },
              {
                required: false,
                model: SellPointBillModel,
                as: "sent_sell_point_bills",
                attributes: ["total", "total_quantity", "type"],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                },
              },
              {
                required: false,
                model: SellPointBillModel,
                as: "received_sell_point_bills",
                attributes: ["total", "total_quantity", "type"],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                  type: {
                    [Op.ne]: "raw",
                  },
                },
              },
            ],
          },
        ],
        order: [
          [Sequelize.col("sell_points->promoter.id"), "ASC"],
          [Sequelize.col("sell_points->inventories.id"), "DESC"],
        ],
      });

      let finalResult = result.map((school) => {
        const schoolData = {
          school_name: school?.name_ar || "",
          promoter: school?.sell_points[0]?.promoter?.name_ar || "",
          driver: school?.sell_points[0]?.driver?.name_ar || "",
          cash: school?.sell_points[0]?.envelops[0]?.cash || 0,
          bill: 0,
          expenses: 0,
          expens_doctor: 0,
          expens_manager: 0,
          external: 0,
          returns: 0,
          ex_eco: 0,
          store: 0,
          storeSat: 0,
          previous_inventory_date: "",
          previous_inventory_total: 0,
          current_inventory_date: "",
          current_inventory_total: 0,
          sent_bills: 0,
          received_bills: 0,
          difference: 0,
        };

        let storeFind = stores?.find(
          (e) => e?.sell_point_id === school?.sell_points[0]?.id
        );
        let lastEnv = lastEnvelop?.find(
          (e) => e?.sell_point_id === school?.sell_points[0]?.id
        );
        // console.log("storeSat" + storeFind);
        // console.log("last  "+ lastEnv);

        if (!lastEnv) {
          schoolData.storeSat = storeFind?.total | 0;
        } else {
          schoolData.storeSat = 0;
        }
        if (school?.sell_points[0]?.bills) {
          for (const bill of school.sell_points[0].bills) {
            if (bill) {
              switch (bill.type) {
                case "default":
                  schoolData.bill = bill.total;
                  break;
                case "expenses":
                  schoolData.expenses = bill.total;
                  break;
                case "returns":
                  schoolData.returns = bill.total;
                  break;
                case "expens_doctor":
                  schoolData.expens_doctor = bill.total;
                  break;
                case "expens_manager":
                  schoolData.expens_manager = bill.total;
                  break;
                case "external":
                  schoolData.external = bill.total;
                  break;
                case "raw":
                  schoolData.store = bill.total;
                  break;
                case "expens_eco":
                  schoolData.ex_eco = bill.total;
                  break;
              }
            }
          }
        }

        if (school?.sell_points[0]?.inventories) {
          const inventories = school.sell_points[0].inventories;
          inventories.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
          let curInventory = inventories.find(
            (e) => e.date.getDate() === start.getDate()
          );
          schoolData.current_inventory_date = curInventory?.date || "";
          schoolData.current_inventory_total = curInventory?.total_price || 0;

          let index =1;

          if (inventories[0]?.date.getDate()!==start.getDate())
              index =0;

          schoolData.previous_inventory_date = inventories[index]?.date || "";
          schoolData.previous_inventory_total =
            inventories[index]?.total_price || 0;
        }

        if (school?.sell_points[0]?.sent_sell_point_bills) {
          const sent_bills = school.sell_points[0].sent_sell_point_bills;
          if (sent_bills.length > 0) {
            for (let i = 0; i < sent_bills.length; i++) {
              schoolData.sent_bills += sent_bills[i]?.total || 0;
            }
          }
        }

        if (school?.sell_points[0]?.received_sell_point_bills) {
          const received_bills =
            school.sell_points[0].received_sell_point_bills;
          if (received_bills.length > 0) {
            for (let i = 0; i < received_bills.length; i++) {
              schoolData.received_bills += received_bills[i]?.total || 0;
            }
          }
        }

        schoolData.difference =
          schoolData.cash +
          schoolData.current_inventory_total +
          schoolData.expenses +
          schoolData.expens_doctor +
          schoolData.ex_eco +
          schoolData.expens_manager +
          schoolData.sent_bills +
          schoolData.returns -
          (schoolData.bill +
            schoolData.external +
            schoolData.previous_inventory_total +
            schoolData.received_bills +
            schoolData.storeSat +
            schoolData.store);

        return schoolData;
      });

      return {
        data: finalResult,
        status: code.OK,
      };
    } catch (error) {
      console.log(error);
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAllbetweenDates(data) {
    try {
      let { start, end } = calculateDateRange(data.date, data.start, data.end);

      let schools = await SchoolModel.findAll({
        attributes: ["name_ar"],
        include: [
          {
            //required: true,
            model: SellPointModel,
            as: "sell_points",
            attributes: ["id", "name"],
            include: [
              {
                required: false,
                model: PromoterModel,
                as: "promoter",
                attributes: ["name_ar"],
              },
              {
                required: false,
                model: DriverModel,
                as: "driver",
                attributes: ["name_ar"],
              },
            ],
          },
        ],
      });
      let bills = await BillModel.findAll({
        attributes: [
          "sell_point_id",
          [sequelize.fn("SUM", sequelize.col("total")), "total_bill"],
          "type",
        ],
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
        group: ["sell_point_id", "type"],
      });
      let envelops = await EnvelopModel.findAll({
        attributes: [
          "sell_point_id",
          [sequelize.fn("SUM", sequelize.col("cash")), "total_cash"],
        ],
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
        group: ["sell_point_id"],
      });
      let inventories = await InventoryModel.findAll({
        attributes: [
          "sell_point_id",
          [sequelize.fn("SUM", sequelize.col("total_price")), "total_inv"],
        ],
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
        group: ["sell_point_id"],
      });
      let tosp = await SellPointBillModel.findAll({
        attributes: [
          "to_sell_point_id",
          [sequelize.fn("SUM", sequelize.col("total")), "total_to"],
        ],
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
        group: ["to_sell_point_id"],
      });
      let fromsp = await SellPointBillModel.findAll({
        attributes: [
          "from_sell_point_id",
          [sequelize.fn("SUM", sequelize.col("total")), "total_from"],
        ],
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
        group: ["from_sell_point_id"],
      });

      let finalResult = schools.map((school) => {
        const schoolData = {
          school_name: school?.name_ar || "",
          promoter: school?.sell_points[0]?.promoter?.name_ar || "",
          driver: school?.sell_points[0]?.driver?.name_ar || "",
          bill: 0,
          expenses: 0,
          expens_doctor: 0,
          expens_manager: 0,
          external: 0,
          returns: 0,
          ex_eco: 0,
          store: 0,
          cash: 0,
          storeSat: 0,
          previous_inventory_date: "",
          previous_inventory_total: 0,
          current_inventory_date: "",
          current_inventory_total: 0,
          current_inventory_total: 0,
          sent_bills: 0,
          received_bills: 0,
          difference: 0,
        };
        const billTypesMap = {
          default: "bill",
          expenses: "expenses",
          returns: "returns",
          expens_doctor: "expens_doctor",
          expens_manager: "expens_manager",
          external: "external",
          raw: "store",
          ex_eco: "ex_eco",
        };
        const billTypes = [
          "default",
          "expenses",
          "returns",
          "expens_doctor",
          "expens_manager",
          "external",
          "raw",
          "ex_eco",
        ];
        billTypes.forEach((type) => {
          const billCur = bills.find(
            (ee) =>
              ee.sell_point_id === school?.sell_points[0]?.id &&
              ee.type === type
          );
          //console.log(billCur?.sell_point_id);
          //console.log(JSON.stringify(billCur, null, 2));
          schoolData[billTypesMap[type]] = billCur?.dataValues.total_bill || 0;
        });

        const envelopsp = envelops.find(
          (e) => e.sell_point_id === school?.sell_points[0]?.id
        );

        schoolData.cash = envelopsp?.dataValues.total_cash || 0;
        const inventorysp = inventories.find(
          (e) => e.sell_point_id === school?.sell_points[0]?.id
        );
        schoolData.current_inventory_total =
          inventorysp?.dataValues.total_inv || 0;
        const tossp = tosp.find(
          (e) => e.to_sell_point_id === school?.sell_points[0]?.id
        );
        schoolData.received_bills = tossp?.dataValues.total_to || 0;
        const fromssp = fromsp.find(
          (e) => e.from_sell_point_id === school?.sell_points[0]?.id
        );
        schoolData.sent_bills = fromssp?.dataValues.total_from || 0;

        return schoolData;
      });
      return {
        data: finalResult,
        status: code.OK,
      };
    } catch (error) {
      console.log(error);
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAllWithBalance3(data) {
    try {
      let { start, end } = calculateDateRange(data.date, data.start, data.end);

      const result = await SellPointModel.findOne({
        where: {
          id: data.id,
        },
        attributes: ["id", "name"],

        include: [
          {
            required: true,
            model: PromoterModel,
            as: "promoter",
            attributes: ["name_ar"],
          },
          {
            required: true,
            model: DriverModel,
            as: "driver",
            attributes: ["name_ar"],
          },
          {
            required: false,
            model: BillModel,
            as: "bills",
            attributes: ["total", "total_quantity", "type", "date"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
            },
            order: [["date", "DESC"]],
          },
          {
            required: false,
            model: EnvelopModel,
            as: "envelops",
            attributes: ["number", "cash", "date"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
            },
            order: [["date", "DESC"]],
          },
          {
            required: false,
            model: InventoryModel,
            as: "inventories",
            attributes: ["total_price", "total_amount", "date"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
            },
            order: [["date", "DESC"]],
          },
          {
            required: false,
            model: SellPointBillModel,
            as: "sent_sell_point_bills",
            attributes: ["total", "total_quantity", "type", "date"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
            },
            order: [["date", "DESC"]],
          },
          {
            required: false,
            model: SellPointBillModel,
            as: "received_sell_point_bills",
            attributes: ["total", "total_quantity", "type", "date"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
            },
            order: [["date", "DESC"]],
          },
        ],

        order: [],
      });

      let fres = {
        name: result.name,
        promoterName: result.promoter.name_ar,
        driverName: result.driver.name_ar,
      };
      const finalResult = result.envelops.map((e) => {
        const schoolData = {
          date: 0,
          cash: 0,
          default: 0,
          expenses: 0,
          expens_doctor: 0,
          expens_manager: 0,
          external: 0,
          returns: 0,
          raw: 0,
          inventory_total: 0,
          sent_bills: 0,
          received_bills: 0,
        };
        schoolData.date = e?.date;
        schoolData.cash = e?.cash;
        let sentBills = result.sent_sell_point_bills.find((ee) =>
          equalDate(ee.date, schoolData.date)
        );
        schoolData.sent_bills = sentBills?.total || 0;
        let recBills = result.received_sell_point_bills.find((ee) =>
          equalDate(ee.date, schoolData.date)
        );
        schoolData.received_bills = recBills?.total || 0;
        let invCur = result.inventories.find((ee) =>
          equalDate(ee.date, schoolData.date)
        );
        schoolData.inventory_total = invCur?.total_price || 0;
        const billTypes = [
          "default",
          "expenses",
          "returns",
          "expens_doctor",
          "expens_manager",
          "external",
          "raw",
        ];

        billTypes.forEach((type) => {
          const billCur = result.bills.find(
            (ee) => equalDate(ee.date, schoolData.date) && ee.type === type
          );
          schoolData[type] = billCur?.total || 0;
        });

        return schoolData;
      });

      return {
        data: { fres, finalResult },
        status: code.OK,
      };
    } catch (error) {
      console.log(error);
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getBillCategoriesWithReturs(queryOptions) {
    try {
      const { start, end } = calculateDateRange(
        queryOptions.date,
        queryOptions.start,
        queryOptions.end
      );
      const result = await SellPointModel.findAll({
        attributes: ["id", "name"],

        include: [
          {
            model: PromoterModel,
            as: "promoter",
            attributes: ["name_ar"],
          },
          {
            //required: true,
            model: BillModel,
            as: "bills",
            attributes: ["id", "total", "total_quantity", "type"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
              type: {
                [Op.or]: ["returns", "default"],
              },
            },
            include: [
              {
                model: BillCategoryModel,
                as: "bill_categories",
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
        order: [[Sequelize.col("promoter.id"), "ASC"]],
      });
      const sellPointsWithCategories = [];

      result.forEach((sellPoint) => {
        const sellPointName = sellPoint.name;
        const promoterName = sellPoint.promoter.name_ar;

        const categories = [];

        const bills = sellPoint.bills;
        const returnBillCategories =
          bills.find((bill) => bill.type === "returns")?.bill_categories || [];
        const defaultBillCategories =
          bills.find((bill) => bill.type === "default")?.bill_categories || [];

        returnBillCategories.forEach((returnCategory) => {
          defaultBillCategories.forEach((defaultCategory) => {
            if (
              returnCategory.category.name_ar ===
              defaultCategory.category.name_ar
            ) {
              const categoryNameAr = returnCategory.category.name_ar;
              const categoryData = {
                name_ar: categoryNameAr,
                amount_return: returnCategory.amount,
                amount_default: defaultCategory.amount,
              };
              categories.push(categoryData);
            }
          });
        });

        const sellPointData = {
          sellPointName,
          promoterName,
          categories,
        };

        sellPointsWithCategories.push(sellPointData);
      });

      return {
        data: sellPointsWithCategories,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getReturnsReport(queryOptions) {
    try {
      const { start, end } = calculateDateRange(
        queryOptions.date,
        queryOptions.start,
        queryOptions.end
      );
      const result = await SellPointModel.findAll({
        attributes: ["id", "name"],

        include: [
          {
            model: PromoterModel,
            as: "promoter",
            attributes: ["name_ar"],
          },
          {
            //required: true,
            model: BillModel,
            as: "bills",
            attributes: ["id", "total", "total_quantity", "type"],
            where: {
              date: {
                [Op.between]: [start, end],
              },
              type: {
                [Op.or]: ["returns", "default"],
              },
            },
            include: [
              {
                model: BillCategoryModel,
                as: "bill_categories",
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
        order: [[Sequelize.col("promoter.id"), "ASC"]],
      });
      const sellPointsWithCategories = [];

      result.forEach((sellPoint) => {
        const sellPointName = sellPoint.name;
        const promoterName = sellPoint.promoter.name_ar;

        const categories = [];

        const bills = sellPoint.bills;
        const returnBillCategories =
          bills.find((bill) => bill.type === "returns")?.bill_categories || [];
        const defaultBillCategories =
          bills.find((bill) => bill.type === "default")?.bill_categories || [];

        let totalReturns = 0;
        let totalBills = 0;
        returnBillCategories.forEach((returnCategory) => {
          defaultBillCategories.forEach((defaultCategory) => {
            if (
              returnCategory.category.name_ar ===
              defaultCategory.category.name_ar
            ) {
              totalReturns += returnCategory.amount;
              totalBills += defaultCategory.amount;
            }
          });
        });

        const sellPointData = {
          sellPointName,
          promoterName,
          totalReturns,
          totalBills,
        };

        sellPointsWithCategories.push(sellPointData);
      });

      return {
        data: sellPointsWithCategories,
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getReport(queryOptions) {
    try {
      const { start, end } = calculateDateRange(
        queryOptions.date,
        queryOptions.start,
        queryOptions.end
      );
      const result = await BillModel.findAll({
        attributes: [
          // [
          //   sequelize.literal(
          //     "SUM(`sell_point->envelops`.`cash`)"
          //   ),
          //   "total_cash",
          // ],
          // [
          //   sequelize.fn("SUM", sequelize.col("sell_point.envelops.cash")),
          //   "total_cash",
          // ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'returns' THEN `total` ELSE 0 END)"
            ),
            "total_returns",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expens_manager' THEN `total` ELSE 0 END)"
            ),
            "total_expens_manager",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expens_doctor' THEN `total` ELSE 0 END)"
            ),
            "total_expens_doctor",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'external' THEN `total` ELSE 0 END)"
            ),
            "total_external",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expenses' THEN `total` ELSE 0 END)"
            ),
            "total_expenses",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'default' THEN `total` ELSE 0 END)"
            ),
            "total_default",
          ],

          //[sequelize.fn("SUM", sequelize.col("total")), "total_bill "],
        ],

        where: {
          date: {
            [Op.between]: [start, end],
          },
          "$sell_point.school.type$": {
            [Op.eq]: "school",
          },
        },
        include: [
          {
            required: true,
            model: SellPointModel,
            as: "sell_point",
            attributes: ["id"],
            include: [
              {
                required: true,
                model: SchoolModel,
                as: "school",
                attributes: ["id"],
              },
              {
                required: true,
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar"],
              },
              {
                required: true,
                model: EnvelopModel,
                as: "envelops",
                attributes: [],
                where: {
                  date: {
                    [Op.between]: [start, end],
                  },
                },
              },
            ],
          },
        ],

        group: [Sequelize.col("sell_point.promoter.id")],
      });

      const envelops = await EnvelopModel.findAll({
        attributes: [[sequelize.literal("SUM(`cash`)"), "total_cash"]],
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
        include: [
          {
            required: true,
            model: SellPointModel,
            as: "bill",
            attributes: ["id"],
            include: [
              {
                required: true,
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar"],
              },
            ],
          },
        ],
        group: [Sequelize.col("bill.promoter.id")],
      });
      const totalReport = [];

      result.forEach((bill) => {
        const promoterName = bill.dataValues.sell_point.promoter.name_ar;
        const totalBills = bill.dataValues.total_default;
        const totalExManager = bill.dataValues.total_expens_manager;
        const totalExDoctor = bill.dataValues.total_expens_doctor;
        const totalExpenses = bill.dataValues.total_expenses;
        const totalExternal = bill.dataValues.total_external;
        const totalReturns = bill.dataValues.total_returns;
        const envelop = envelops.find(
          (e) =>
            e.dataValues.bill.promoter.id ===
            bill.dataValues.sell_point.promoter.id
        );
        const totalCash = envelop.dataValues.total_cash;
        const reportData = {
          promoterName,
          totalBills,
          totalExManager,
          totalExDoctor,
          totalExpenses,
          totalExternal,
          totalReturns,
          totalCash,
        };

        totalReport.push(reportData);
      });

      const totalCash = await envelops.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_cash,
        0
      );
      const totalBills = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_default,
        0
      );
      const totalExManager = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expens_manager,
        0
      );
      const totalExDoctor = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expens_doctor,
        0
      );
      const totalReturns = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_returns,
        0
      );
      const totalExpenses = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expenses,
        0
      );
      const totalExternal = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_external,
        0
      );

      return {
        data: {
          totalCash,
          totalBills,
          totalExManager,
          totalExDoctor,
          totalReturns,
          totalExpenses,
          totalExternal,
          totalReport,
        },
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getExReport(queryOptions) {
    try {
      const { start, end } = calculateDateRange(
        queryOptions.date,
        queryOptions.start,
        queryOptions.end
      );
      const result = await BillModel.findAll({
        attributes: [
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expens_manager' THEN `total` ELSE 0 END)"
            ),
            "total_expens_manager",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expens_doctor' THEN `total` ELSE 0 END)"
            ),
            "total_expens_doctor",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expenses' THEN `total` ELSE 0 END)"
            ),
            "total_expenses",
          ],
        ],

        where: {
          date: {
            [Op.between]: [start, end],
          },
          "$sell_point.school.type$": {
            [Op.eq]: "school",
          },
        },
        include: [
          {
            required: true,
            model: SellPointModel,
            as: "sell_point",
            attributes: ["id", "name"],
            include: [
              {
                required: true,
                model: SchoolModel,
                as: "school",
                attributes: ["id"],
              },
              {
                required: true,
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar"],
              },
            ],
          },
        ],

        group: [Sequelize.col("sell_point.id")],
        order: [Sequelize.col("sell_point.promoter.id")],
      });

      const envelops = await EnvelopModel.findAll({
        attributes: [[sequelize.literal("SUM(`cash`)"), "total_cash"]],
        where: {
          date: {
            [Op.between]: [start, end],
          },
        },
        include: [
          {
            required: true,
            model: SellPointModel,
            as: "bill",
            attributes: ["id"],
            include: [
              {
                required: true,
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar"],
              },
            ],
          },
        ],
        group: [Sequelize.col("bill.id")],
      });
      const totalReport = [];

      result.forEach((bill) => {
        const promoterName = bill.dataValues.sell_point.promoter.name_ar;
        const sellPointName = bill.dataValues.sell_point.name;
        const totalExManager = bill.dataValues.total_expens_manager;
        const totalExDoctor = bill.dataValues.total_expens_doctor;
        const totalExpenses = bill.dataValues.total_expenses;
        const envelop = envelops.find(
          (e) => e.dataValues.bill.id === bill.dataValues.sell_point.id
        );

        const totalCash = envelop?.dataValues.total_cash | 0;
        const reportData = {
          sellPointName,
          promoterName,
          totalExManager,
          totalExDoctor,
          totalExpenses,
          totalCash,
        };

        totalReport.push(reportData);
      });

      const totalCash = await envelops.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_cash,
        0
      );
      const totalExManager = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expens_manager,
        0
      );
      const totalExDoctor = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expens_doctor,
        0
      );
      const totalExpenses = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expenses,
        0
      );

      return {
        data: {
          totalCash,
          totalExManager,
          totalExDoctor,
          totalExpenses,
          totalReport,
        },
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getEx2Report(queryOptions) {
    try {
      const { start, end } = calculateDateRange(
        queryOptions.date,
        queryOptions.start,
        queryOptions.end
      );
      const result = await BillModel.findAll({
        attributes: [
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expens_manager' THEN `total` ELSE 0 END)"
            ),
            "total_expens_manager",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expens_doctor' THEN `total` ELSE 0 END)"
            ),
            "total_expens_doctor",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expenses' THEN `total` ELSE 0 END)"
            ),
            "total_expenses",
          ],
        ],

        where: {
          date: {
            [Op.between]: [start, end],
          },
          "$sell_point.school.type$": {
            [Op.eq]: "school",
          },
        },
        include: [
          {
            required: true,
            model: SellPointModel,
            as: "sell_point",
            attributes: ["id", "name"],
            include: [
              {
                required: true,
                model: SchoolModel,
                as: "school",
                attributes: ["id"],
              },
              {
                required: true,
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar"],
              },
            ],
          },
        ],

        group: [Sequelize.col("sell_point.promoter.id")],
        order: [Sequelize.col("sell_point.promoter.id")],
      });

      const schools = await SellPointModel.findAll({
        attributes: [
          [
            sequelize.fn("COUNT", sequelize.col("SellPointModel.id")),
            "sellPointCount",
          ],
        ],
        where: {
          "$school.type$": {
            [Op.eq]: "school",
          },
        },
        include: [
          {
            required: true,
            model: SchoolModel,
            as: "school",
            attributes: ["id", "type"],
          },
          {
            required: true,
            model: PromoterModel,
            as: "promoter",
            attributes: ["id", "name_ar"],
          },
        ],
        group: ["promoter.id"],
        //order: ["promoter.id"],
      });
      console.log(schools[0].dataValues.sellPointCount);

      const totalReport = [];

      result.forEach((bill) => {
        const promoterName = bill.dataValues.sell_point.promoter.name_ar;
        //const sellPointName = bill.dataValues.sell_point.name;
        const totalExManager = bill.dataValues.total_expens_manager;
        const totalExDoctor = bill.dataValues.total_expens_doctor;
        const totalExpenses = bill.dataValues.total_expenses;
        const schoolC = schools.find(
          (e) =>
            e.dataValues.promoter.id === bill.dataValues.sell_point.promoter.id
        );
        const totalSchools = schoolC.dataValues.sellPointCount;

        const reportData = {
          promoterName,
          totalExManager,
          totalExDoctor,
          totalExpenses,
          totalSchools,
        };

        totalReport.push(reportData);
      });

      const totalExManager = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expens_manager,
        0
      );
      const totalExDoctor = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expens_doctor,
        0
      );
      const totalExpenses = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expenses,
        0
      );

      return {
        data: {
          totalExManager,
          totalExDoctor,
          totalExpenses,
          totalReport,
        },
        status: code.OK,
      };
    } catch (error) {
      return {
        data: error.message,
        status: code.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getEx3Report(queryOptions) {
    try {
      const { start, end } = calculateDateRange(
        queryOptions.date,
        queryOptions.start,
        queryOptions.end
      );
      const modifiedStart = new Date(start);
      const modifiedEnd = new Date(end);

      modifiedStart.setDate(modifiedStart.getDate() - 1);
      modifiedEnd.setDate(modifiedEnd.getDate() - 1);

      const result = await BillModel.findAll({
        attributes: [
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expens_manager' THEN `total` ELSE 0 END)"
            ),
            "total_expens_manager",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expens_doctor' THEN `total` ELSE 0 END)"
            ),
            "total_expens_doctor",
          ],
          [
            sequelize.literal(
              "SUM(CASE WHEN `BillModel`.`type` = 'expenses' THEN `total` ELSE 0 END)"
            ),
            "total_expenses",
          ],
        ],

        where: {
          date: {
            [Op.between]: [start, end],
          },
          "$sell_point.school.type$": {
            [Op.eq]: "school",
          },
        },
        include: [
          {
            required: true,
            model: SellPointModel,
            as: "sell_point",
            attributes: ["id", "name"],
            include: [
              {
                required: true,
                model: SchoolModel,
                as: "school",
                attributes: ["id"],
              },
              {
                required: true,
                model: PromoterModel,
                as: "promoter",
                attributes: ["id", "name_ar"],
              },
            ],
          },
        ],

        group: [Sequelize.col("sell_point.promoter.id")],
        order: [Sequelize.col("sell_point.promoter.id")],
      });

      const schools = await SellPointModel.findAll({
        attributes: [
          [
            sequelize.fn("COUNT", sequelize.col("SellPointModel.id")),
            "sellPointCount",
          ],
        ],
        where: {
          "$school.type$": {
            [Op.eq]: "school",
          },
        },
        include: [
          {
            required: true,
            model: SchoolModel,
            as: "school",
            attributes: ["id", "type"],
          },
          {
            required: true,
            model: PromoterModel,
            as: "promoter",
            attributes: ["id", "name_ar"],
          },
        ],
        group: ["promoter.id"],
        //order: ["promoter.id"],
      });

      const totalReport = [];

      result.forEach((bill) => {
        const promoterName = bill.dataValues.sell_point.promoter.name_ar;
        //const sellPointName = bill.dataValues.sell_point.name;
        const totalExManager = bill.dataValues.total_expens_manager;
        const totalExDoctor = bill.dataValues.total_expens_doctor;
        const totalExpenses = bill.dataValues.total_expenses;
        const totalExToday = totalExManager + totalExDoctor + totalExpenses;
        const totalExYes = 0;

        const schoolC = schools.find(
          (e) =>
            e.dataValues.promoter.id === bill.dataValues.sell_point.promoter.id
        );
        const totalSchools = schoolC.dataValues.sellPointCount;

        const reportData = {
          promoterName,
          totalExManager,
          totalExDoctor,
          totalExpenses,
          totalSchools,
          totalExToday,
        };

        totalReport.push(reportData);
      });

      const totalExManager = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expens_manager,
        0
      );
      const totalExDoctor = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expens_doctor,
        0
      );
      const totalExpenses = await result.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.dataValues.total_expenses,
        0
      );

      return {
        data: {
          totalExManager,
          totalExDoctor,
          totalExpenses,
          totalReport,
        },
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

module.exports = Bill;
