const { StudentOrderModel, StudentModel, database } = require('../../index');
const code = require('../../../../utils/httpStatus');

class StudentOrder {
    constructor(data) {
        this.orders = data;
    }

    async add() {
        try {
            const result = await StudentOrderModel.bulkCreate(this.orders);
            return {
                data: "orders add successfully",
                status: code.CREATED
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async getBill(bill_id) {
        try {
            const bills = await BillCategoryModel.findAll({
                where: {
                    bill_id: bill_id
                },
                include: ['category']
            });
            return {
                data: bills,
                status: code.OK
            }
        } catch (error) {
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            }
        }
    }

    static async endDayOffline(orders, students) {
        let transaction;
        try {
            transaction = await database.transaction();

            await StudentOrderModel.bulkCreate(orders, { transaction });

            for (const student of students) {
                await StudentModel.update(
                    {
                        balance: student.balance
                    },
                    {
                        where: {
                            id: student.id
                        },
                        transaction
                    }
                );
            }

            await transaction.commit();

            return {
                data: "process completed successfully",
                status: code.OK
            };
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return {
                data: error.message,
                status: code.INTERNAL_SERVER_ERROR
            };
        }
    }

}

module.exports = StudentOrder