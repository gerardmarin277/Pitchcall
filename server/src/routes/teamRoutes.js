const express = require('express')
const router = express.Router();
const { createTeam } = require('../controllers/teamController.js');
const { verifyCoach } = require('../middleware/authMiddleware');

router.post('/', verifyCoach, createTeam);

module.exports = router