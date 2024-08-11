const { School } = require('./service');


module.exports = {

    getAllschooolsWithInfo: async (req, res) => {
        const result = await School.getAllWithSellPoints();
        res.status(result.status).send({
            data: result.data,
        });
    },

    getAllschooolsWithJustSpecificProperties: async (req, res) => {
        const result = await School.getAll();
        res.status(result.status).send({
            data: result.data,
        });
    },

    addSchool: async (req, res) => {
        const data = req.body;
        const result = await new School(data).add();
        res.status(result.status).send({
            data: result.data,
        });
    },

    editSchool: async (req, res) => {
        const data = req.body;
        data.school_id = req.params.school_id;
        const result = await School.edit(data);
        res.status(result.status).send({
            data: result.data,
        });
    },

    getSchoolPromoter: async (req, res) => {
        const { school_id } = req.params;
        const result = await School.getPromoter(school_id);
        res.status(result.status).send({
            data: result.data,
        });
    },

    getSchoolBills: async (req, res) => {
        const { school_id } = req.params;
        const { date } = req.body;
        const result = await School.getSchoolBills(school_id, date);
        res.status(result.status).send({
            data: result.data,
        });
    },

}