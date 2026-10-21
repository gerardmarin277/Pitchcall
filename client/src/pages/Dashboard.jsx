import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      navigate('/login');
      return null;
    }
    return JSON.parse(storedUser);
  });

  const [events, setEvents] = useState([]);
  const [myResponses, setMyResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    eventType: 'training',
    rival: '',
    date: '',
    location: ''
  });

  // Cargar eventos al montar el componente
  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        setError('');
        const res = await API.get('/events');
        if (isMounted) {
          setEvents(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Error al cargar los eventos');
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los eventos');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/events', newEvent);
      setNewEvent({ title: '', eventType: 'training', rival: '', date: '', location: '' });
      await fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear evento');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (eventId, status) => {
    const reason = status === 'absent' ? prompt('Motivo de la ausencia (opcional):') : '';
    try {
      await API.post('/responses', {
        event: eventId,
        status,
        reason: reason || undefined
      });
      setMyResponses((prev) => ({ ...prev, [eventId]: status }));
      alert('Respuesta registrada correctamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar respuesta');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              PitchCall
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Bienvenido, <span className="font-bold text-emerald-600">{user.name}</span>{' '}
              {user.role === 'coach' ? '(Entrenador)' : `(Jugador #${user.dorsal || 'S/N'})`}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {user.role === 'coach' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📅 Programar Nuevo Evento</h2>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Entrenamiento Táctico"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Tipo de Evento</label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="training">Entrenamiento</option>
                  <option value="match">Partido</option>
                </select>
              </div>

              {newEvent.eventType === 'match' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Rival</label>
                  <input
                    type="text"
                    placeholder="Ej. C.F. Rival"
                    value={newEvent.rival}
                    onChange={(e) => setNewEvent({ ...newEvent, rival: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Ubicación</label>
                <input
                  type="text"
                  placeholder="Ej. Campo Municipal"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
                >
                  {loading ? 'Creando...' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {user.role === 'coach' ? '📋 Eventos Programados' : '⚽ Próximas Convocatorias'}
          </h2>

          {events.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No hay eventos programados actualmente.</p>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          ev.eventType === 'match'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ev.eventType === 'match' ? 'PARTIDO' : 'ENTRENAMIENTO'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-lg">{ev.title}</h3>
                    </div>

                    <p className="text-sm text-slate-600 mt-1">
                      📅 {new Date(ev.date).toLocaleString()} {ev.location && `| 📍 ${ev.location}`}
                    </p>
                    {ev.rival && (
                      <p className="text-sm text-slate-700 font-semibold mt-1">🆚 vs {ev.rival}</p>
                    )}
                  </div>

                  {user.role === 'player' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResponse(ev._id, 'attending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          myResponses[ev._id] === 'attending'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-600'
                            : 'bg-slate-100 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        ✓ Asistiré
                      </button>

                      <button
                        onClick={() => handleResponse(ev._id, 'late')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          myResponses[ev._id] === 'late'
                            ? 'bg-amber-500 text-white ring-2 ring-amber-500'
                            : 'bg-slate-100 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        ⏱ Llego tarde
                      </button>

                      <button
                        onClick={() => handleResponse(ev._id, 'absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          myResponses[ev._id] === 'absent'
                            ? 'bg-red-600 text-white ring-2 ring-red-600'
                            : 'bg-slate-100 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        ✗ Ausente
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;