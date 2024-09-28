const router = require('express').Router();
const { register, verify, newOTP, login, forgotPassword, resetPassword, getMe  } = require('../controllers/auth.controllers');
const {restrict} = require('../middlewares/auth.middlewares');

router.post('/forget-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.post('/register', register);
// router.post('/verify', verify);
router.put('/verify/newOtp', newOTP);
router.post('/login', login);
router.get('/me', restrict, getMe);

module.exports = router;