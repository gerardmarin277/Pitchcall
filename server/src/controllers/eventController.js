const Event = require('../models/Event.js');
const Team = require('../models/Team.js');

const createEvent = async (req, res) => {
    try {
        const { teamId, type, eventType, date, location, deadline, rival, title } = req.body;
        const userId = req.user.userId || req.user.id;

        let team = null;
        if (teamId) {
            team = await Team.findById(teamId);
        } else {
            team = await Team.findOne({ coach: userId });
        }

        if (!team) {
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        if (team.coach.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para crear eventos en este equipo.' });
        }

        const eventTypeField = type || eventType || 'training';

        const newEvent = new Event({
            team: team._id,
            title: title || (eventTypeField === 'match' ? `Partido vs ${rival || 'Rival'}` : 'Entrenamiento'),
            type: eventTypeField,
            date,
            location,
            deadline: deadline || date,
            rival: eventTypeField === 'match' ? rival : undefined
        });

        await newEvent.save();
        res.status(201).json({ message: 'Evento creado con éxito', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el evento', error: error.message });
    }
};

const getEvents = async (req, res) => {
    try {
        const teamId = req.params.teamId || req.query.teamId;
        const query = teamId ? { team: teamId } : {};
        const events = await Event.find(query).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los eventos', error: error.message });
    }
};

module.exports = { 
    createEvent, 
    getEvents, 
    getTeamEvents: getEvents 
};