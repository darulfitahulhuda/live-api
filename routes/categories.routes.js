const router = require('express').Router();
const {getAllCategories, getCategoriesDetail} = require('../controllers/categories.controllers');

router.get('/', getAllCategories);
router.get('/detail/:id', getCategoriesDetail);

module.exports = router;