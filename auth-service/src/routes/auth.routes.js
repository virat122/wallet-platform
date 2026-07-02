const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/authenticate');
const requestValidate = require('../middlewares/requestValidate');
const {
  registerSchema,
  loginSchema,
  refreshSchema
} = require('../validators/auth.validator');


const router = express.Router();

router.post('/register',  requestValidate (registerSchema),authController.register);
router.post('/login', requestValidate (loginSchema), authController.login);
router.post('/refresh', requestValidate (refreshSchema), authController.refresh);
router.post('/logout', requestValidate (refreshSchema), authController.logout);

// Protected — requires a valid access token
router.get('/me', authenticate, authController.me);

module.exports = router;
