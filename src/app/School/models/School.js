
const { Model } = require('sequelize');
const { type } = require('./enum.json')

module.exports = (sequelize, DataTypes) => {
    class SchoolModel extends Model {
        static associate(models) {
            this.hasMany(models.SellPointModel, {
                foreignKey: 'school_id',
                as: 'sell_points',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            });
            this.hasMany(models.StudentModel, {
                foreignKey: 'school_id',
                as: 'students',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            });
        }
    }
    SchoolModel.init({
        name_ar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name_en: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        region: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM,
            values: type,
            allowNull: false,
            defaultValue : "school"
        },
    }, {
        sequelize,
        modelName: 'SchoolModel',
        tableName: 'schools',
        underscored: true
    });
    return SchoolModel;
};