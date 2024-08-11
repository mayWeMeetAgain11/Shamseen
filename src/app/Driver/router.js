const {
	getAllDrivers,
    register,
    deleteDriver,
    login,
    getBills,
    getSellPoints,
    getDrivers,
} = require('./handler');
const isAuth = require('../../../utils/auth/jwtMiddleware');
const router = require('express').Router();

router.get('/', getAllDrivers);


router.get('/all', getDrivers);

router.delete('/:driver_id', deleteDriver);

router.post('/register', register);

router.post('/login', login);

router.get('/get/bills',isAuth, getBills);

router.get('/sellpoints',isAuth, getSellPoints);

module.exports = router;