const { DriverModel, SellPointModel, BillModel, BillCategoryModel, CategoryModel, SchoolModel } = require('../index');
const httpStatus = require('../../../utils/httpStatus');
const { Op } = require('sequelize');

class Driver {

    constructor(data) {
        this.name_ar = data.name_ar;
        this.name_en = data.name_en;
        this.user = data.user;
        this.password = data.password;
        this.phone = data.phone;
    }

    static async getAllWithSellPoints() {
        try {
            const drivers = await DriverModel.findAll({
                include: [
                    {
                        model: SellPointModel,
                        as: 'sell_points'
                    }
                ]
            });
            return {
                data: drivers,
                status: httpStatus.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            }
        }
    }

    static async getAllSellPoints(id) {
        try {
            const sps = await SellPointModel.findAll({

                where: {
                    driver_id: id
                },
                attributes: ['name'],
                include: [
                    {
                        model: SchoolModel,
                        as: 'school'
                    }
                ]
            });
            return {
                data: sps,
                status: httpStatus.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            }
        }
    }

    static async delete(data) {
        try {
            const driver = await DriverModel.destroy({
                where: {
                    id: data.driver_id
                }
            });
            console.log(driver);
            if (driver == 1) {
                return {
                    data: 'deleted',
                    status: httpStatus.OK,
                };
            }
            else {
                return {
                    data: 'something wrong happened',
                    status: httpStatus.BAD_REQUEST,
                };
            }
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            }
        }
    }

    async register() {
        try {
            const driver = await DriverModel.create(this);
            return {
                data: driver,
                status: httpStatus.CREATED
            };
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async login(user, password) {
        try {
            const driver = await DriverModel.findOne({
                where: {
                    user: user
                }
            });
            if (!driver) {
                return {
                    data: 'User Not Found',
                    status: httpStatus.NOT_FOUND
                }
            } else if (password !== driver.password) {
                return {
                    data: 'Invalid password',
                    status: httpStatus.NOT_FOUND
                }
            } else {
                return {
                    data: driver,
                    token: driver.generateToken(),
                    status: httpStatus.OK
                }
            }
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async getBills(id) {


        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const sellPointsBills = await SellPointModel.findAll({
                where: {
                    driver_id: id
                },
                attributes: ['id', ['name', 'sp_name']],
                include: [
                    {
                        model: SchoolModel,
                        as: 'school',
                        attributes: ['id', 'name_ar', 'name_en', 'region']

                    },
                    {
                        model: BillModel,
                        as: 'bills',
                        attributes: ['id'],
                        where: {
                            created_At: {
                                [Op.gte]: today,
                                [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                            }
                        },
                        include: [
                            {
                                model: BillCategoryModel,
                                as: 'bill_categories',
                                attributes: ['id', 'amount', 'total_price'],
                                include: [
                                    {
                                        model: CategoryModel,
                                        as: 'category',

                                        attributes: ['id', 'name_ar', 'name_en', 'price', 'type', 'source']
                                    }],
                            }],

                    }],
            });
            return {
                data: sellPointsBills,
                status: httpStatus.OK
            };

        } catch (error) {

            return {
                data: error.message,
                status: httpStatus.INTERNAL_SERVER_ERROR
            }

        }

    }

    static async getAllDrivers() {
        try {
          const drivers = await DriverModel.findAll({
            attributes: ["id", "name_ar"],
          });
          return {
            data: drivers,
            status: httpStatus.OK,
          };
        } catch (error) {
          return {
            data: error.message,
            status: httpStatus.BAD_REQUEST,
          };
        }
      }
}

module.exports = { Driver };