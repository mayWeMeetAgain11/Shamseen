const Transform = require('../TransformClass');

class InventoryTransform extends Transform {
    constructor() {
        super('inventory_id', true);
    }
}

module.exports = InventoryTransform;
