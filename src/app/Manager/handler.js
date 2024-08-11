const Manager = require('./service');
const code = require('../../../utils/httpStatus');
const SellPoint = require('../SellPoint/service');
const { School } = require('../School/service');
const Category = require('../Category/services/CategoryService');
// const School = require('../School/models/School');


module.exports = {

    register: async (req, res) => {
        const result = await new Manager(req.body).register();
        res.status(result.status).json({
            data: result.data,
        });
    },

    login: async (req, res) => {
        if (req.body.user && req.body.password) {
            const result = await Manager.login(req.body.user, req.body.password);
            res.status(result.status).json({
                data: result.data,
            });
        } else {
            res.status(code.BAD_REQUEST).json({ message: 'user and password are required' });
        }
    },

    addSellPoints: async (req, res) => {
        const data = req.body;
        const result = await SellPoint.UpdateDrivers(data);
        res.status(result.status).json({
            data: result.data,
        });
    },

    getAllSellPoints: async (req, res) => {
        const result = await SellPoint.getAll();
        res.status(result.status).json({
            data: result.data,
        });
    },

    updateSellPoint: async (req, res) => {
        const data = req.body;
        const result = await SellPoint.update(data);
        res.status(result.status).json({
            data: result.data,
        });
    },

    addCategory: async (req, res) => {
        const photo = req.file;
        let data = req.body;
        data.photo = photo;
        const result = await new Category(data).add();
        res.status(result.status).json({
            data: result.data,
        });
    },

    updateCategory: async (req, res) => {
        const { category_id } = req.params;
        const photo = req.file;
        let data = req.body;
        data.photo = photo;
        data.category_id = category_id;
        const result = await Category.update(data);
        res.status(result.status).json({
            data: result.data,
        });
    },

    deleteCategory: async (req, res) => {
        const { category_id } = req.params;
        const result = await Category.delete(category_id);
        res.status(result.status).json({
            data: result.data,
        });
    },

    getAllCategories: async (req, res) => {
        const result = await Category.getAllCategories();
        res.status(result.status).json({
            data: result.data,
        });
    },
    
    deleteSchool: async (req, res) => {
        const { school_id } = req.params;
        const result = await School.delete(school_id);
        res.status(result.status).json({
            data: result.data,
        });
    },
    
    deleteSellPoint: async (req, res) => {
        const { sell_point_id } = req.params;
        const result = await SellPoint.delete(sell_point_id);
        res.status(result.status).json({
            data: result.data,
        });
    },
    

}
