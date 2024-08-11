const { SellPointCategoryModel } = require('../../index');
const code = require('../../../../utils/httpStatus');
const {Op} = require('sequelize');

class SellPointCategory {

    constructor(data) {
        this.visibility = data.visibility;
        this.category_id = data.category_id;
        this.sell_point_id = data.sell_point_id;
    }


    static async updateActive(sell_point_id, category_id, active) {
        try {
            await SellPointCategoryModel.update({ visibility: active }, {
                where: {
                    [Op.and]: [
                        {category_id: category_id},
                        {sell_point_id: sell_point_id},
                    ]
                }
            });

            return {
                data: `Category ${active == 1 ? "set" : "remove"} visible success`,
                status: code.OK,
            };
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async setActiveForAll(sell_point_id, categories) {
        try {

            await SellPointCategoryModel.update({ visibility: false }, {
                where: {
                    sell_point_id: sell_point_id,
                }
            });

            await SellPointCategoryModel.update({ visibility: true }, {
                where: {
                    [Op.and]: [
                        { 
                            category_id: { 
                                [Op.in]: categories 
                            }
                        },
                        {sell_point_id: sell_point_id},
                    ]
                }
            });

            return {
                data: `updated successfully`,
                status: code.OK,
            };
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

}

module.exports = SellPointCategory;