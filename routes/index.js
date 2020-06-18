const path = require('path');
const express = require('express');
const controller = require('../controllers/search');
const router = express.Router();
const http = require('http');

router.get('/', controller.getIndex);
router.get('/search', controller.getSearch);



module.exports = router;