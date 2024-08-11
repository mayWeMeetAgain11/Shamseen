const express = require('express');
const router = express.Router();
const { add } = require('./handler');
const isAuth = require('../../../utils/auth/jwtMiddleware');

router.post('/', isAuth, add);


module.exports = router;