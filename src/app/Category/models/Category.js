
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class CategoryModel extends Model {

        static associate(models) {
            this.hasMany(models.InventoryCategoryModel, {
                foreignKey: 'category_id',
            });
            this.hasMany(models.BillCategoryModel, {
                foreignKey: 'category_id',
                as: 'bill_categories',
                onDelete: 'CASCADE',
                onUpdate:'CASCADE',
            });
            this.hasMany(models.SellPointBillCategoryModel, {
                foreignKey: 'category_id',
                as: 'sell_point_bill_categories',
            });
            this.hasMany(models.StudentOrderModel, {
                foreignKey: "category_id",
            });
            this.hasMany(models.SellPointCategoryModel, {
                foreignKey: 'category_id',
                as: 'sell_point_categories',
                onDelete: 'CASCADE',
                onUpdate:'CASCADE',
            });
        }
    }

    CategoryModel.init({
        name_ar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name_en: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue :0
        },
        photo: {
            type: DataTypes.STRING,
            defaultValue: "default"
        },
        source: {
            type: DataTypes.ENUM,
            values: ["internal", "external"],
            defaultValue : "internal",
        },
        type: {
            type: DataTypes.ENUM,
            values: ['store', 'damage'],
            allowNull: false,
            defaultValue :'store'
        },
        school_type: {
            type: DataTypes.ENUM,
            values: ["school", "kindergarten"],
            defaultValue : "school",
        },

        visibility: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

    }, {
        sequelize,
        paranoid : true,
        modelName: 'CategoryModel',
        tableName: 'categories',
        underscored: true
    });
    async function updated(category, options) {
        await sequelize.models.SellPointModel.update({ updated: 0 }, { where: {} });
    }

    async function autoAddToSellPointCategory(category, options) {
        await sequelize.transaction(async (transaction) => {
            const sell_points = await sequelize.models.SellPointModel.findAll({
                attributes: ['id'],
            }, { transaction });
            let sellPointsCategoryRecords = [];
            for (const sell_point of sell_points) {
                sellPointsCategoryRecords.push({
                    sell_point_id: sell_point.id,
                    category_id: category.id,
                    visibility: true,
                });
            }
            await sequelize.models.SellPointModel.update({ updated: 0 }, { where: {} }, { transaction });
            await sequelize.models.SellPointCategoryModel.bulkCreate(sellPointsCategoryRecords);

            return sell_points;
        });
    }
    CategoryModel.afterCreate(autoAddToSellPointCategory);

    CategoryModel.afterBulkUpdate(updated);
    CategoryModel.afterBulkDestroy(updated);

    CategoryModel.prototype.toJSON = function () {
        let category = Object.assign({}, this.get());
       
        delete category.deletedAt;

        return category;
    };

    return CategoryModel;


};
