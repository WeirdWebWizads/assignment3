const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.index);
router.get('/login', homeController.login);
router.get('/register', homeController.register);
router.get('/logout', homeController.logout);

module.exports = router;
