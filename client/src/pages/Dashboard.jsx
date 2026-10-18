import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-200">
        
        {/* Cabecera del Dashboard */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              PitchCall Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Bienvenido de nuevo, <span className="font-bold text-emerald-600">{user.name}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Panel condicional según el Rol */}
        {user.role === 'coach' ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6">
            <h2 className="text-xl font-bold text-emerald-950 mb-2">
              ⚽ Panel de Entrenador
            </h2>
            <p className="text-emerald-900 text-sm leading-relaxed">
              Aquí podrás gestionar tus equipos, programar entrenamientos y partidos, y revisar las convocatorias en tiempo real.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-300 rounded-xl p-6">
            <h2 className="text-xl font-bold text-blue-950 mb-2">
              🏃 Panel de Jugador {user.dorsal ? `(Dorsal #${user.dorsal})` : ''}
            </h2>
            <p className="text-blue-900 text-sm leading-relaxed">
              Aquí podrás consultar los próximos eventos del equipo y confirmar tu asistencia o ausencia con un solo clic.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;