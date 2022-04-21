const { Router } = require('express');
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');

const router = Router();

router.get('/signup', authController.signup_get)
router.post('/signup', authController.signup_post)
router.get('/login', authController.login_get)
router.post('/login', authController.login_post)
router.get('/logout', authController.logout_get)
router.get('/forgot-password', passwordResetController.forgot_password_get)
router.post('/forgot-password', passwordResetController.forgot_password_post)
router.post('/reset-password/:token/:userid', passwordResetController.reset_password_post)
router.get('/reset-password/:token/:userid', passwordResetController.reset_password_get)

module.exports = router;