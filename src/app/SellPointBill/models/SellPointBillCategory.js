
const { Model } = require('sequelize');
const { updated } = require('../../../../helpers/hooksSellpoitIll');

module.exports = (sequelize, DataTypes) => {
    class SellPointBillCategoryModel extends Model {
        static associate(models) {
            this.belongsTo(models.SellPointBillModel, {
                foreignKey: 'sell_point_bill_id',
                as: 'sell_point_bill'
            });
            this.belongsTo(models.CategoryModel, {
                foreignKey: 'category_id',
                as: 'category'
            });
        }
    }
    SellPointBillCategoryModel.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        total_price: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'SellPointBillCategoryModel',
        tableName: 'sell_point_bill_categories',
        underscored: true
    });

    SellPointBillCategoryModel.afterCreate(updated);
    SellPointBillCategoryModel.afterBulkCreate(updated);
    SellPointBillCategoryModel.afterBulkUpdate(updated);
    SellPointBillCategoryModel.afterUpdate(updated);

    return SellPointBillCategoryModel;
};