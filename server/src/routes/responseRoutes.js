const express = require('express');
const router = express.Router();
const { submitResponse, getEventResponse } = require('../controllers/responseController.js');
const { verifyToken } = require('../middleware/authMiddleware');


router.post('/', verifyToken, submitResponse);


router.get('/event/:eventId', verifyToken, getEventResponse);

module.exports = router;