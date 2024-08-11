
const { Model } = require('sequelize');
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    class DriverModel extends Model {
        generateToken(){
            const token = jwt.sign({ id: this.id, user : this.user }, process.env.SECRETKEY);
            return token;
        }
        static associate(models) {
            this.hasMany(models.SellPointModel, {
                foreignKey: 'driver_id',
                as: 'sell_points'
            }); 
        }
    }
    DriverModel.init({
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
        }
    }, {
        sequelize,
        modelName: 'DriverModel',
        tableName: 'drivers',
        underscored: true
    });
    return DriverModel;
};