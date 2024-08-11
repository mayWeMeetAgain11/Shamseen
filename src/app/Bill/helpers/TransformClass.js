const Category = require("../../Category/services/CategoryService");

class Transform {
  constructor(propertyName, propertyValue) {
    this.propertyName = propertyName;
    this.inventory = propertyValue || false;
  }
  async transformData(data, id) {
    try {
      let arr = [];
      for (const order of data.bills) {
        let obj = {};
        const category = await Category.getOne(order.category_id);
        obj.category_id = category.data.id;
        obj.amount = order.amount;

        if (!this.inventory) {
          obj.total_price = category.data.price * order.amount;
          obj.unit_price = category.data.price;
        }
        obj[this.propertyName] = id;
        arr.push(obj);
      }
      return arr;
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = Transform;
