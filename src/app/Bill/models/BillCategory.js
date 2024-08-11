
const { Model } = require('sequelize');
const { updated, deleted } = require('../helpers/functions/hooks');

module.exports = (sequelize, DataTypes) => {
    class BillCategoryModel extends Model {
        static associate(models) {
            this.belongsTo(models.BillModel, {
                foreignKey: 'bill_id',
                as: 'bill'
            });
            this.belongsTo(models.CategoryModel, {
                foreignKey: 'category_id',
                as: 'category'
            });
        }
    }
    BillCategoryModel.init({
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
        total_price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'BillCategoryModel',
        tableName: 'bill_categories',
        underscored: true
    });


    
    BillCategoryModel.afterCreate(updated);
    BillCategoryModel.afterBulkCreate(updated);
    BillCategoryModel.afterBulkUpdate(updated);
    BillCategoryModel.afterUpdate(updated);
   

    return BillCategoryModel;
};