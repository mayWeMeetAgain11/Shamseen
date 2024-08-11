const Transform = require('../TransformClass');

class FactoryTransform extends Transform {
    constructor() {
        super('bill_id');
    }
}

module.exports = FactoryTransform;