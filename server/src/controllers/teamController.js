const Team = require('../models/Team.js');

const createTeam = async (req, res) => {
    try {
        const { name } = req.body;

        const newTeam = new Team({
            name,
            coach: req.user.userId,
            members: [req.user.userId]
        });

        await newTeam.save()
        res.status(201).json({ message: 'Equipo creado con éxito', team: newTeam });

    } catch(error){
        res.status(500).json({ message: 'Error al crear el equipo', error: error.message });
    }
}


module.exports = { createTeam };