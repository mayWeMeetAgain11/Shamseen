const CardCharge = require('./service');

module.exports = {
    add: async (req, res) => {
        const result = await new CardCharge(req.body).add();
        res.status(result.status).json({
            data: result.data
        });
    }
}