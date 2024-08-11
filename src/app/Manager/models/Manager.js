
const { Model } = require('sequelize');
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    class ManagerModel extends Model {
        generateToken(){
            const token = jwt.sign({ id: this.id, user : this.user }, process.env.SECRETKEY);
            return token;
        }
        static associate(models) {
            this.hasMany(models.SellPointModel, {
                foreignKey: 'Manager_id',
                as: 'sell_points'
            });
        }
    }
    ManagerModel.init({
        name_ar: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name_en: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'ManagerModel',
        tableName: 'managers',
        underscored: true
    });
    return ManagerModel;
};