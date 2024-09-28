const router = require('express').Router();
const { create } = require('../controllers/enrollments.controllers');
const { restrict } = require('../middlewares/auth.middlewares');

router.post('/:course_id', restrict, create);

module.exports = router;