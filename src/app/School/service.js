const { SchoolModel, SellPointModel, DriverModel, ManagerModel, PromoterModel,
    BillModel, BillCategoryModel, CategoryModel } = require('../index');
const httpStatus = require('../../../utils/httpStatus');
const { Op } = require('sequelize');
const calculateDateRange = require('../../../helpers/date');

class School {

    constructor(data) {
        this.name_ar = data.name_ar;
        this.name_en = data.name_en;
        this.type = data.type;
        this.region = data.region;
        this.promoter_id = data.promoter_id;
    }

    async add() {
        try {
            const school = await SchoolModel.create(this);
            return {
                data: school,
                status: httpStatus.OK
            };
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            };
        }
    }

    static async edit(data) {
        try {
            const school = await SchoolModel.findByPk(data.school_id);
            school.name_ar = data.name_ar || school.name_ar;
            school.name_en = data.name_en || school.name_en;
            school.type = data.type || school.type;
            school.region = data.region || school.region;

            await school.save();
            return {
                data: 'updated',
                status: httpStatus.OK
            };
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            };
        }
    }

    static async getAllWithSellPoints() {
        try {
            const schools = await SchoolModel.findAll({
                include: [
                    {
                        model: SellPointModel,
                        as: 'sell_points',
                        include: [
                            {
                                model: ManagerModel,
                                as: 'manager'
                            },
                            {
                                model: DriverModel,
                                as: 'driver'
                            },
                        ]
                    }
                ]
            });
            return {
                data: schools,
                status: httpStatus.OK
            };
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            }
        }
    }

    static async getAll() {
        try {
            const schools = await SchoolModel.findAll({
                attributes: [
                    'id',
                    'name_ar',
                    'name_en'
                ]
            });
            return {
                data: schools,
                status: httpStatus.OK
            };
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            }
        }
    }

    static async getPromoter(id) {
        try {
            const sell_point = await SellPointModel.findOne({
                where: {
                    school_id: id,
                },
                attributes: ['promoter_id'],
            });
            const promoter = await PromoterModel.findByPk(sell_point.promoter_id, {
                attributes: ['id', 'name_ar', 'name_en', 'phone'],
            });
            return {
                data: promoter,
                status: httpStatus.OK
            };
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            };
        }
    }


    static async delete(school_id) {
        try {
            const school = await SchoolModel.destroy({
                where: {
                    id: school_id
                }
            });
            if (school == 1) {
                return {
                    data: "deleted",
                    status: httpStatus.OK
                }
            } else {
                return {
                    data: "some thing went wrong",
                    status: httpStatus.BAD_REQUEST
                }
            }
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }


    static async getSchoolBills(id, date) {
        try {
            const { start, end } = calculateDateRange(date, date, date);

            const result = await SellPointModel.findAll({
                where: {
                    school_id: id,
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
                        where: {
                            created_at: {
                                [Op.between]: [start, end],
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
                data: result,
                status: httpStatus.OK
            };
        } catch (error) {
            return {
                data: error.message,
                status: httpStatus.BAD_REQUEST
            };
        }
    }



}

module.exports = { School };