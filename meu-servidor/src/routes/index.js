const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const userRoutes = require('./userRoutes');
router.use('/users', userRoutes);
// Rota para a página inicial
router.get('/', homeController.getHomePage);



module.exports = router;