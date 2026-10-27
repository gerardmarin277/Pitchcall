import { useState, useEffect } from 'react';
import API from '../services/api';

const Roster = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newPlayer, setNewPlayer] = useState({
    name: '',
    email: '',
    dorsal: '',
    password: 'Password123!'
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
      await API.post('/auth/register', {
        ...newPlayer,
        role: 'player',
        dorsal: newPlayer.dorsal ? Number(newPlayer.dorsal) : undefined
      });
      alert('Jugador registrado e incorporado a la plantilla con éxito');
      setNewPlayer({ name: '', email: '', dorsal: '', password: 'Password123!' });
      setShowAddForm(false);
      
      const res = await API.get('/users/players');
      setPlayers(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar al jugador');
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-slate-700/60 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👥</span> Plantilla de Jugadores
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gestión de miembros y dorsales de tu equipo</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
            Total: {players.length} jugadores
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
          >
            {showAddForm ? 'Cancelar' : '+ Añadir Jugador'}
          </button>
        </div>
      </div>

      {/* Formulario rápido para registrar nuevo jugador */}
      {showAddForm && (
        <form onSubmit={handleAddPlayer} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nombre completo</label>
            <input
              type="text"
              required
              placeholder="Ej. Lucas Vázquez"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="jugador@equipo.com"
              value={newPlayer.email}
              onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Dorsal</label>
            <input
              type="number"
              placeholder="Ej. 10"
              value={newPlayer.dorsal}
              onChange={(e) => setNewPlayer({ ...newPlayer, dorsal: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
            >
              Guardar Jugador
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-slate-400 text-center py-4 text-sm">Cargando plantilla...</p>
      ) : error ? (
        <div className="bg-rose-900/40 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      ) : players.length === 0 ? (
        <p className="text-slate-400 text-center py-6 text-sm italic">
          No hay jugadores registrados en tu equipo todavía. Usa el botón superior para añadir uno.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((player) => (
            <div
              key={player._id}
              className="bg-slate-900/50 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between hover:border-emerald-500/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black flex items-center justify-center text-xs shadow-sm">
                  {player.dorsal ? `#${player.dorsal}` : 'S/N'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{player.name}</h3>
                  <p className="text-xs text-slate-400">{player.email}</p>
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