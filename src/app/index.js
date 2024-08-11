const fs = require('fs');
const path = require('path');
const { sequelize, Sequelize } = require('../../utils/database');
const basename = path.basename(__filename);
const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) !== '.js');
  })
  .forEach(file1 => {
    fs.readdirSync(path.join(__dirname, file1, 'models'))
      .filter(file2 => {
        return (file2.indexOf('.') !== 0) && (file2 !== basename) && (file2.slice(-3) === '.js');
      })
      .forEach(file3 => {
        const model = require(path.join(__dirname, file1, 'models', file3))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
      });
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.database = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

