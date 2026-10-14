const Event = require('../models/Event.js');
const Team = require('../models/Team.js');

const createEvent = async (req, res) => {
    try{
        const { teamId, type, date, location, deadline, rival } = req.body;

        const team = await Team.findById(teamId);

        if(!team){
            return res.status(404).json({ message: 'Equipo no encontrado.' });
        }

        if(team.coach.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'No tienes permiso para crear eventos en este equipo.' });
        }


        const newEvent = new Event({
            team: teamId,
            type,
            date,
            location,
            deadline,
            rival: type === 'match' ? rival : undefined
        });

        await newEvent.save();
        res.status(201).json({ message: 'Evento creado con éxito', event: newEvent });
    } catch(error){
        res.status(500).json({ message: 'Error al crear el evento', error: error.message });
    }
}



const getTeamEvents = async (req, res) => {
    try {
        const {teamId } = req.params;
        const events = await Event.find({team: teamId}).sort({date: 1});
        res.json(events);
    } catch(error){
        res.status(500).json({ message: 'Error al obtener los eventos', error: error.message });
    }
};


module.exports = { createEvent, getTeamEvents };