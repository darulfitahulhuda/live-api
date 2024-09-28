const router = require('express').Router();
const {updateProfile, updatePassword, payment_history, notification} = require('../controllers/accounts.controllers');
const {image} = require('../libs/multer');
const {restrict} = require('../middlewares/auth.middlewares');

router.put('/updateprofile', image.single('image'), restrict, updateProfile);
router.put('/updatepassword', restrict, updatePassword);
router.get('/paymenthistory', restrict, payment_history);
router.get('/notification', restrict, notification);

module.exports = router;