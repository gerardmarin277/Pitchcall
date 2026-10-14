const express = require('express')
const router = express.Router();
const { createEvent, getTeamEvents } = require('../controllers/eventController.js');
const { verifyCoach, verifyToken } = require('../middleware/authMiddleware');


router.post('/', verifyCoach, createEvent);

router.get('/team/:teamId', verifyToken, getTeamEvents);


module.exports = router;