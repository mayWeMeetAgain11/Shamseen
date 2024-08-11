const express = require('express');
const Router = express.Router();
const { register, login, addSellPoints, updateSellPoint, addCategory, updateCategory, deleteCategory, getAllCategories, getAllSellPoints, deleteSchool, deleteSellPoint } = require('./handler')
const  {upload} = require('../../../utils/multer/uplaodFiles');
const isAuth = require('../../../utils/auth/jwtMiddleware');

Router.post('/', register);

Router.post('/login', login);

// Router.use(isAuth);

Router.put('/drivers/add-sell-points', addSellPoints);

Router.put('/sell-points/update', updateSellPoint);

Router.get('/sell-points/get-all', getAllSellPoints);

Router.post('/category/add', upload.single('photo'), addCategory);

Router.put('/category/update/:category_id', upload.single('photo'), updateCategory);

Router.delete('/category/delete/:category_id', deleteCategory);

Router.get('/category/get-all', getAllCategories);

Router.delete('/school/delete/:school_id', deleteSchool);

Router.delete('/sell-points/delete/:sell_point_id', deleteSellPoint);

module.exports = Router;