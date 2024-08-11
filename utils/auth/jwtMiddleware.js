
require('dotenv').config()

const jwt = require('jsonwebtoken');
const httpStatus = require('../httpStatus');


const jwtMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (typeof authHeader !== 'undefined') {
        const [, token] = authHeader.split(' ');

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if (err) {
                res.status(httpStatus.FORBIDDEN).send({
                    error: err,
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        res.status(httpStatus.UNAUTHORIZED).send({
            data: 'UNAUTHORIZED',
        });
    }
};

module.exports = jwtMiddleware;