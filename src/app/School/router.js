const { getAllschooolsWithInfo, addSchool, getSchoolPromoter,  getSchoolBills, getAllschooolsWithJustSpecificProperties, editSchool } = require('./handler');

const router = require('express').Router();

router.get('/', getAllschooolsWithInfo);

router.get('/get-all', getAllschooolsWithJustSpecificProperties);

router.post('/', addSchool);

router.put('/edit/:school_id', editSchool);

router.get('/promoter/:school_id', getSchoolPromoter);

router.post('/bills/:school_id', getSchoolBills);



module.exports = router;