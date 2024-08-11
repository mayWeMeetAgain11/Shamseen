const Transform = require('../TransformClass');

class OrderTransform extends Transform {
    constructor() {
        super('student_id');
    }
}

module.exports = OrderTransform;