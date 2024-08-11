const express = require('express');
const router = express.Router();
const { getAll, updateActive, updateActiveForsellPoint, setNewActiveCollectionForsellPoint, getAllVisibleCategory, getAllWithSpeceficProperties } = require('./handler')

router.get('/',getAll);
router.get('/get-all-visible',getAllVisibleCategory);
router.get('/get-all-with-specific-properties',getAllWithSpeceficProperties);
router.put('/update/:id', updateActive);
router.put('/sell-point/update/:sell_point_id', updateActiveForsellPoint);
router.put('/sell-point/activate-new-collection/:sell_point_id', setNewActiveCollectionForsellPoint);

module.exports = router;