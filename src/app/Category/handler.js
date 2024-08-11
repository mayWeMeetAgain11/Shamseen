const code = require('../../../utils/httpStatus');
const Category = require('./services/CategoryService');
const SellPointCategory = require('./services/SellPointCategoryService')

module.exports = {

    getAll: async (req, res) => {
        const result = await Category.getAllCategories();
        res.status(result.status).json({
            data: result.data
        });
    },

    getAllVisibleCategory: async (req, res) => {
        const result = await Category.getAllVisible();
        res.status(result.status).json({
            data: result.data
        });
    },

    getAllWithSpeceficProperties: async (req, res) => {
        const { type } = req.query;
        const result = await Category.getAllSpecificProperties(type);
        res.status(result.status).json({
            data: result.data
        });
    },

    updateActive: async (req, res) => {
        const id = req.params.id;
        const { active } = req.query;
        const result = await Category.updateActive(id, active);
        res.status(result.status).json({
            data: result.data
        });
    },

    updateActiveForsellPoint: async (req, res) => {
        const { sell_point_id } = req.params;
        const { active, category_id } = req.body;
        const result = await SellPointCategory.updateActive(sell_point_id, category_id, active);
        res.status(result.status).json({
            data: result.data
        });
    },

    setNewActiveCollectionForsellPoint: async (req, res) => {
        const { sell_point_id } = req.params;
        const { categories } = req.body;
        const result = await SellPointCategory.setActiveForAll(sell_point_id, categories);
        res.status(result.status).json({
            data: result.data
        });
    }
}