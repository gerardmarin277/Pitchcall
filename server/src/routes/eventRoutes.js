const express = require('express')
const router = express.Router();
const { createEvent, getTeamEvents } = require('../controllers/eventController.js');
const { verifyCoach, verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyCoach, createEvent);

// Ruta para obtener todos los eventos o filtrados
router.get('/', verifyToken, getTeamEvents);

// Ruta para obtener los eventos de un equipo específico
router.get('/team/:teamId', verifyToken, getTeamEvents);

module.exports = router;