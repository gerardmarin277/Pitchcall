const User = require('../models/User.js');
const Team = require('../models/Team.js');

// Obtener los jugadores del equipo del entrenador
const getTeamPlayers = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Buscar el equipo gestionado por el entrenador
    const team = await Team.findOne({ coach: userId });

    if (!team) {
      const players = await User.find({ role: 'player' }).select('-password').sort({ dorsal: 1, name: 1 });
      return res.json(players);
    }

    // Buscar jugadores vinculados al equipo o en members
    let players = await User.find({
      role: 'player',
      $or: [
        { team: team._id },
        { _id: { $in: team.members || [] } }
      ]
    })
    .select('-password')
    .sort({ dorsal: 1, name: 1 });

    // Si por alguna razón el equipo existe pero no tiene jugadores enlazados todavía, 
    // devolvemos todos los jugadores registrados para facilitar la gestión inicial.
    if (players.length === 0) {
      players = await User.find({ role: 'player' }).select('-password').sort({ dorsal: 1, name: 1 });
    }

    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la plantilla', error: error.message });
  }
};

module.exports = { getTeamPlayers };