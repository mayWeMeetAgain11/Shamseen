const { CardChargeModel, database, StudentModel } = require('../');
const code = require('../../../utils/httpStatus');

class CardCharge {

    constructor(data) {
        this.amount = data.amount;
        this.student_id = data.student_id;
    }

    async add() {
        let transaction;
        try {
            transaction = await database.transaction();
            const cardCharge = await CardChargeModel.create(this, { transaction });
            const student  = await StudentModel.findByPk(this.student_id, { transaction });
            student.balance += this.amount;
            await student.save({ transaction });
            await transaction.commit();
            return {
                data: "process completed successfully",
                status: code.OK
            }
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }
}

module.exports = CardCharge;