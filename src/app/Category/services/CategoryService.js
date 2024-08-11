const { CategoryModel, SellPointModel, SellPointCategoryModel } = require('../../index');
const code = require('../../../../utils/httpStatus');
const fs = require('fs');

class Category {

    constructor(data) {
        this.name_ar = data.name_ar;
        this.name_en = data.name_en;
        this.price = data.price;
        this.type = data.type;
        this.school_type = data.school_type;
        this.source = data.source;
        this.visibility = data.visibility;
        this.photo = data.photo.path;
    }

    static async updated() {
        try {
            await SellPointModel.update({ updated: 1 });

        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }
    async add() {
        try {
            const category = await CategoryModel.create(this);
            return {
                data: category,
                status: code.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async getActiveCategory(sell_point_id) {
        try {
            const category = await CategoryModel.findAll({
                where: {
                    visibility: true
                }
                // include: [
                //     {
                //         required: true,
                //         model: SellPointCategoryModel,
                //         as: 'sell_point_categories',
                //         where: {
                //             visibility: true,
                //             sell_point_id: sell_point_id
                //         },
                //         attributes: []
                //     }
                // ],
            });
            const sellPoint = await SellPointModel.update({
                updated: true
            },
                {
                    where: {
                        id: sell_point_id
                    }
                });
            return {
                data: category,
                status: code.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async getAllCategories() {
        try {
            const categories = await CategoryModel.findAll();
            return {
                data: categories,
                status: code.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async getAllVisible() {
        try {
            const categories = await CategoryModel.findAll({
                attributes: [
                    'id',
                    'name_ar',
                    'name_en',
                ],
                where: {
                    visibility: true
                }
            });
            return {
                data: categories,
                status: code.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async getAllSpecificProperties(type) {
        try {
            const categories = await CategoryModel.findAll({
                attributes: [
                    'id',
                    'name_ar',
                    'name_en',
                ],
                where: {
                    type: type,
                }
            });
            return {
                data: categories,
                status: code.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async getOne(id) {
        try {
            const category = await CategoryModel.findByPk(id);
            return {
                data: category,
                status: code.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async updateActive(category_id, active) {
        try {
            await CategoryModel.update({ visibility: active }, {
                where: {
                    id: category_id,
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

    static async update(data) {
        try {

            const category = await CategoryModel.findByPk(data.category_id);
            category.name_ar = data.name_ar || category.name_ar;
            category.name_en = data.name_en || category.name_en;
            category.price = data.price || category.price;
            category.type = data.type || category.type;
            category.school_type = data.school_type || category.school_type;
            category.source = data.source || category.source;
            category.visibility = data.visibility || category.visibility;

            category.save();

            if (data.photo) {
                fs.unlinkSync(category.photo);
                category.photo = data.photo.path;
                category.save();
            }
            return {
                data: "updated",
                status: code.OK
            };

        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async delete(category_id) {
        try {

            const deletedCategory = await CategoryModel.destroy({
                where: {
                    id: category_id
                }
            });


            return {
                data: deletedCategory ? "Deleted" : "Not Found category",
                status: code.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }
}

module.exports = Category;