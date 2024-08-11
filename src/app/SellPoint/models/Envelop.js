
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EnvelopModel extends Model {
        static associate(models) {
            this.belongsTo(models.SellPointModel, {
                foreignKey: 'sell_point_id',
                as: 'bill'
            });
        }
    }
    EnvelopModel.init({
        number: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        },
        cash: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue : DataTypes.NOW
        },
    }, {
        sequelize,
        modelName: 'EnvelopModel',
        tableName: 'envelops',
        underscored: true,
        timestamps: false
    });
    return EnvelopModel;
};