
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class SellPointCategoryModel extends Model {

        static associate(models) {
            this.belongsTo(models.CategoryModel, {
                foreignKey: 'category_id',
                as: 'category'
            });
            this.belongsTo(models.SellPointModel, {
                foreignKey: 'sell_point_id',
                as: 'sell_point'
            });
        }
    }

    SellPointCategoryModel.init({
        visibility: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        sequelize,
        modelName: 'SellPointCategoryModel',
        tableName: 'sell_point_categories',
        underscored: true
    });
    async function updated(category, options) {
        await sequelize.models.SellPointModel.update({ updated: 0 }, { where: {} });
    }
    
    SellPointCategoryModel.afterBulkUpdate(updated);
    SellPointCategoryModel.afterBulkDestroy(updated);
    SellPointCategoryModel.afterBulkCreate(updated);

    return SellPointCategoryModel;


};
