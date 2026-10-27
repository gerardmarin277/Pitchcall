import { useState, useEffect } from 'react';
import API from '../services/api';

const Roster = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newPlayer, setNewPlayer] = useState({
    name: '',
    dorsal: ''
  });

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const res = await API.get('/users/players');
        setPlayers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar la plantilla');
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      const name = newPlayer.name.trim();
      const dorsal = Number(newPlayer.dorsal);
      const credentialBase = `${name}${dorsal}`;

      await API.post('/auth/register', {
        name,
        email: `${credentialBase}-2026`,
        password: credentialBase,
        role: 'player',
        dorsal
      });
      alert('Jugador registrado e incorporado a la plantilla con éxito');
      setNewPlayer({ name: '', dorsal: '' });
      setShowAddForm(false);
      
      // Recargar la lista tras añadir
      const res = await API.get('/users/players');
      setPlayers(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar al jugador');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">👥 Plantilla de Jugadores</h2>
          <p className="text-xs text-slate-500 mt-0.5">Gestión de miembros y dorsales de tu equipo</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            Total: {players.length} jugadores
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            {showAddForm ? 'Cancelar' : '+ Añadir Jugador'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPlayer} className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">Nombre completo</label>
            <input
              type="text"
              required
              placeholder="Ej. Lucas Vázquez"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              className="mt-1 w-full text-sm px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Dorsal</label>
            <input
              type="number"
              required
              min="1"
              placeholder="Ej. 10"
              value={newPlayer.dorsal}
              onChange={(e) => setNewPlayer({ ...newPlayer, dorsal: e.target.value })}
              className="mt-1 w-full text-sm px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Guardar Jugador
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500 text-center py-4 text-sm">Cargando plantilla...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      ) : players.length === 0 ? (
        <p className="text-slate-500 text-center py-6 text-sm">
          No hay jugadores registrados en tu equipo todavía. Usa el botón superior para añadir uno.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((player) => (
            <div
              key={player._id}
              className="border border-slate-200 rounded-lg p-3 flex items-center justify-between hover:border-emerald-300 transition-colors bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                  {player.dorsal ? `#${player.dorsal}` : 'S/N'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{player.name}</h3>
                  <p className="text-xs text-slate-500">{player.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Roster;