import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Roster from '../components/Roster';

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
  const [selectedEventForReason, setSelectedEventForReason] = useState(null);
  const [absenceReason, setAbsenceReason] = useState('');

  const [eventResponses, setEventResponses] = useState({});
  const [loadingResponses, setLoadingResponses] = useState({});

  const [newEvent, setNewEvent] = useState({
    title: '',
    eventType: 'training',
    rival: '',
    date: '',
    location: ''
  });

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        setError('');
        const res = await API.get('/events');
        if (!isMounted) return;
        setEvents(res.data);

        if (user?.role === 'player' && res.data.length > 0) {
          const responsesMap = {};

          await Promise.all(
            res.data.map(async (ev) => {
              try {
                const resResp = await API.get(`/responses/event/${ev._id}`);
                const myResp = resResp.data.find(
                  (r) => (r.user?._id || r.user) === user.id || (r.user?._id || r.user) === user._id
                );
                if (myResp) {
                  responsesMap[ev._id] = myResp.status;
                }
              } catch (e) {
                console.error(e);
              }
            })
          );
          if (isMounted) {
            setMyResponses(responsesMap);
          }
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
  }, [user]);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los eventos');
    }
  };

  const fetchEventResponses = async (eventId) => {
    if (eventResponses[eventId]) {
      setEventResponses((prev) => ({ ...prev, [eventId]: null }));
      return;
    }

    try {
      setLoadingResponses((prev) => ({ ...prev, [eventId]: true }));
      const res = await API.get(`/responses/event/${eventId}`);
      setEventResponses((prev) => ({ ...prev, [eventId]: res.data }));
    } catch (err) {
      console.error('Error al cargar respuestas del evento', err);
    } finally {
      setLoadingResponses((prev) => ({ ...prev, [eventId]: false }));
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

  const handleResponse = async (eventId, status, customReason = null) => {
    try {
      await API.post('/responses', {
        eventId,
        status,
        reason: status === 'absent' ? (customReason || absenceReason || undefined) : undefined
      });

      setMyResponses((prev) => ({ ...prev, [eventId]: status }));
      setSelectedEventForReason(null);
      setAbsenceReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar respuesta');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Encabezado Principal */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-xl text-lg font-bold">⚽</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                PitchCall
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Bienvenido, <span className="font-semibold text-emerald-400">{user.name}</span>{' '}
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 ml-1">
                {user.role === 'coach' ? 'Entrenador' : `Jugador #${user.dorsal || 'S/N'}`}
              </span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {error && (
          <div className="bg-rose-900/40 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Sección de Plantilla solo visible para Entrenador */}
        {user.role === 'coach' && <Roster />}

        {/* Formulario para Crear Eventos (Solo Entrenador) */}
        {user.role === 'coach' && (
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-slate-700/60 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📅</span> Programar Nuevo Evento
            </h2>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Entrenamiento Táctico"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Evento</label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                >
                  <option value="training" className="bg-slate-900">Entrenamiento</option>
                  <option value="match" className="bg-slate-900">Partido</option>
                </select>
              </div>

              {newEvent.eventType === 'match' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Rival</label>
                  <input
                    type="text"
                    placeholder="Ej. C.F. Rival"
                    value={newEvent.rival}
                    onChange={(e) => setNewEvent({ ...newEvent, rival: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ubicación</label>
                <input
                  type="text"
                  placeholder="Ej. Campo Municipal"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition duration-200 shadow-lg shadow-emerald-900/30"
                >
                  {loading ? 'Creando...' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Eventos */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-slate-700/60 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span> {user.role === 'coach' ? 'Eventos Programados' : 'Próximas Convocatorias'}
          </h2>

          {events.length === 0 ? (
            <p className="text-slate-400 text-center py-6 text-sm">No hay eventos programados actualmente.</p>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="bg-slate-900/50 border border-slate-700/80 rounded-xl p-4 flex flex-col gap-4 hover:border-emerald-500/50 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                            ev.type === 'match' || ev.eventType === 'match'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {(ev.type || ev.eventType) === 'match' ? 'Partido' : 'Entrenamiento'}
                        </span>
                        <h3 className="font-bold text-white text-base">
                          {ev.title || (ev.type === 'match' ? `vs ${ev.rival}` : 'Entrenamiento')}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-300 flex items-center gap-1.5">
                        <span>📅</span> {new Date(ev.date).toLocaleString()} {ev.location && `| 📍 ${ev.location}`}
                      </p>
                      {ev.rival && (
                        <p className="text-xs text-emerald-400 font-semibold">🆚 vs {ev.rival}</p>
                      )}
                    </div>

                    {/* Botones de respuesta para Jugador */}
                    {user.role === 'player' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResponse(ev._id, 'attending')}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            myResponses[ev._id] === 'attending'
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50'
                              : 'bg-slate-800 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/20'
                          }`}
                        >
                          ✓ Asistiré
                        </button>

                        <button
                          onClick={() => {
                            if (selectedEventForReason === ev._id) {
                              setSelectedEventForReason(null);
                            } else {
                              setSelectedEventForReason(ev._id);
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            myResponses[ev._id] === 'absent'
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 ring-2 ring-rose-400/50'
                              : 'bg-slate-800 text-rose-400 hover:bg-rose-600/20 border border-rose-500/20'
                          }`}
                        >
                          ✗ Ausente
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Campo de Motivo de Ausencia (Jugador) */}
                  {user.role === 'player' && selectedEventForReason === ev._id && (
                    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Motivo de la ausencia (opcional)..."
                        value={absenceReason}
                        onChange={(e) => setAbsenceReason(e.target.value)}
                        className="w-full sm:flex-1 text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleResponse(ev._id, 'absent')}
                        className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-200"
                      >
                        Confirmar Ausencia
                      </button>
                    </div>
                  )}

                  {/* Panel de Control de Asistencia (Entrenador) */}
                  {user.role === 'coach' && (
                    <div className="pt-3 border-t border-slate-800">
                      <button
                        onClick={() => fetchEventResponses(ev._id)}
                        className="text-xs font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600/20 border border-emerald-500/20 px-3.5 py-2 rounded-xl transition-all"
                      >
                        {loadingResponses[ev._id]
                          ? 'Cargando...'
                          : eventResponses[ev._id]
                          ? 'Ocultar Control de Asistencia'
                          : '📊 Ver Control de Asistencia'}
                      </button>

                      {eventResponses[ev._id] && (
                        <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm space-y-3">
                          <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Estado de la Convocatoria</h4>

                          {eventResponses[ev._id].length === 0 ? (
                            <p className="text-slate-500 text-xs italic">
                              Ningún jugador ha respondido todavía.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {eventResponses[ev._id].map((resp) => (
                                <div
                                  key={resp._id}
                                  className={`p-3 rounded-xl border flex flex-col justify-between ${
                                    resp.status === 'attending'
                                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                                      : resp.status === 'absent'
                                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                                      : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-xs">
                                      {resp.user?.name || 'Jugador'}{' '}
                                      {resp.user?.dorsal ? `(#${resp.user.dorsal})` : ''}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/60">
                                      {resp.status === 'attending'
                                        ? 'Asiste'
                                        : resp.status === 'absent'
                                        ? 'Ausente'
                                        : 'Pendiente'}
                                    </span>
                                  </div>
                                  {resp.reason && (
                                    <p className="text-[11px] mt-1.5 text-slate-400 italic bg-slate-900/40 p-1.5 rounded-lg border border-slate-800">
                                      Motivo: "{resp.reason}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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