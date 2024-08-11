
const { Model } = require('sequelize');
const { updated } = require('../../../../helpers/inventoryHooks');

module.exports = (sequelize, DataTypes) => {
    class InventoryCategoryModel extends Model {
        static associate(models) {
            this.belongsTo(models.InventoryModel, {
                foreignKey: 'inventory_id',
                as : 'inventory'
            });
            this.belongsTo(models.CategoryModel, {
                foreignKey: 'category_id',
                as : 'category',
            });
        }
    }
    InventoryCategoryModel.init({
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
    }, {
        sequelize,
        modelName: 'InventoryCategoryModel',
        tableName: 'inventory_categories',
        underscored: true
    });

    InventoryCategoryModel.afterCreate(updated);
    InventoryCategoryModel.afterBulkCreate(updated);
    InventoryCategoryModel.afterBulkUpdate(updated);
    InventoryCategoryModel.afterUpdate(updated);
    return InventoryCategoryModel;
};