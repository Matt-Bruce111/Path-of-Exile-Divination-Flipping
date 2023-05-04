// Import Modules
const express = require('express');
const { homeView } = require('../controllers/PageController');
const router = express.Router();

router.get('/', homeView);

module.exports = router;