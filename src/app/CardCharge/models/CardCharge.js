
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CardChargeModel extends Model {
        static associate(models) {
            this.belongsTo(models.StudentModel, {
                foreignKey: 'student_id',
                as: 'student'
            });
        }
    }
    CardChargeModel.init({
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'CardChargeModel',
        tableName: 'card_charges',
        underscored: true
    });
    return CardChargeModel;
};