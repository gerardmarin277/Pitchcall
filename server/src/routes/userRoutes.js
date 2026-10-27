const express = require('express');
const router = express.Router();
const { getTeamPlayers } = require('../controllers/userController.js');
const { verifyCoach } = require('../middleware/authMiddleware');


router.get('/players', verifyCoach, getTeamPlayers);


module.exports = router;