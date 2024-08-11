const { Driver } = require('./service');


module.exports = {

    getAllDrivers: async (req, res) => {
        const result = await Driver.getAllWithSellPoints();
        res.status(result.status).send({
            data: result.data,
        });
    },
    getDrivers: async (req, res) => {
        const result = await Driver.getAllDrivers();
        res.status(result.status).send({
            data: result.data,
        });
    },
    
    getSellPoints: async (req, res) => {
        const result = await Driver.getAllSellPoints(req.user.id);
        res.status(result.status).send({
            data: result.data,
        });
    },

    deleteDriver: async (req, res) => {
        const data = req.params;
        const result = await Driver.delete(data);
        res.status(result.status).send({
            data: result.data,
        });
    },

    register: async (req, res) => {
        const result = await new Driver(req.body).register();
        res.status(result.status).json({
            data: result.data,
        });
    },

    login: async (req, res) => {
        if (req.body.user && req.body.password) {
            const result = await Driver.login(req.body.user, req.body.password);
            res.status(result.status).json({
                data: result.data,
                token: result.token
            });
        } else {
            res.status(code.BAD_REQUEST).json({ message: 'user and password are required' });
        }
    },
    getBills: async (req, res) => {
        const driver_id = req.user.id;
        const result = await Driver.getBills(driver_id);
        res.status(result.status).json({
            data: result.data,
        });

    },

}