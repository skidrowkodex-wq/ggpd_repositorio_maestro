import React, { useState } from 'react';
import { 
  Zap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Key, 
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginProps {
  usersList: UserProfile[];
  onLoginSuccess: (profile: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ usersList, onLoginSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(usersList[0]?.id || '');
  const [usernameInput, setUsernameInput] = useState<string>(usersList[0]?.username || '');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'credentials' | 'quick'>('credentials');

  // Handle user select from dropdown or quick cards
  const handleSelectUser = (user: UserProfile) => {
    setSelectedUserId(user.id);
    setUsernameInput(user.username);
    setPasswordInput(''); // Do not auto-fill password so user enters it manually
    setErrorMsg(null);
  };

const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL || 'https://wxkeqf37.ap-southeast.insforge.app';
const INSFORGE_API_KEY = import.meta.env.VITE_INSFORGE_API_KEY || '***REMOVED***';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanUser = usernameInput.trim().toLowerCase();

    // 1. Intentar validar en tiempo real contra InsForge IAM
    try {
      const url = `${INSFORGE_URL}/rest/v1/mae_usuarios_sistema?or=(username.eq.${cleanUser},email.eq.${cleanUser})&limit=1`;
      const res = await fetch(url, {
        headers: {
          'apikey': INSFORGE_API_KEY,
          'Authorization': `Bearer ${INSFORGE_API_KEY}`
        }
      });
      if (res.ok) {
        const records: any = await res.json();
        if (Array.isArray(records) && records.length > 0) {
          const u = records[0];
          if (u.status === 'SUSPENDIDO') {
            setErrorMsg('Cuenta SUSPENDIDA en InsForge por directiva de seguridad.');
            return;
          }
          if (!u.permiso_scmtp && u.role_code !== 'ADMINISTRADOR' && u.role_code !== 'GERENCIA') {
            setErrorMsg('No posee autorización de acceso para SCMTP V2.0 (Gestor de Minutas y Tareas).');
            return;
          }
          if (u.password_hash === passwordInput) {
            const insProfile: UserProfile = {
              id: u.id,
              username: u.username,
              nombre: u.full_name,
              cargo: u.cargo || 'Especialista Institucional',
              rol: u.role_code === 'ADMINISTRADOR' ? 'DIRECTOR' : u.role_code === 'GERENCIA' ? 'GERENTE' : 'ANALISTA',
              dependencia: u.unidad_organizativa || 'Gerencia General de Planificación de Distribución (GGPD)',
              activo: true,
              password: passwordInput,
              lastLogin: new Date().toISOString(),
            };
            onLoginSuccess(insProfile);
            return;
          } else {
            setErrorMsg('Contraseña incorrecta. Por favor verifique sus datos.');
            return;
          }
        }
      }
    } catch (insErr) {
      console.warn('⚠️ Fallback local en SCMTP Login:', insErr);
    }

    // 2. Fallback de usuarios locales en memoria
    const foundUser = usersList.find(
      u => u.username.trim().toLowerCase() === cleanUser
    );

    if (!foundUser) {
      setErrorMsg('El usuario ingresado no existe en el sistema CORPOELEC.');
      return;
    }

    if (!foundUser.activo) {
      setErrorMsg('Este usuario se encuentra inactivo. Contacte al Administrador de la GGPD.');
      return;
    }

    if (foundUser.password && passwordInput !== foundUser.password) {
      setErrorMsg('Contraseña incorrecta. Por favor verifique sus datos.');
      return;
    }

    const updatedUser = {
      ...foundUser,
      lastLogin: new Date().toISOString(),
    };

    onLoginSuccess(updatedUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001729] via-[#002B49] to-[#001220] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-100 relative overflow-hidden">
      
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center space-x-3 bg-slate-900/90 border border-emerald-500/30 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/30">
              <FileText className="w-6 h-6 fill-current animate-pulse text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-xl tracking-wider text-white">CORPOELEC</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  GGPD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Gerencia General de Gestión de Planificación
              </p>
            </div>
          </div>

          <div className="inline-block mt-2">
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase bg-emerald-950/70 px-3 py-0.5 rounded-full border border-emerald-500/40">
              PROCESO GGPD-PLA-02 • GOBERNANZA & MINUTAS
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
            SCMTP V2.0 — Seguimiento y Control de Minutas y Tareas
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Plataforma institucional de gestión de compromisos operativos y auditoría COBIT 2019
          </p>

          {/* ISO Compliance Badge */}
          <div className="inline-flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-3 py-1 rounded-full text-[11px] font-bold shadow-md mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acceso Seguro Certificado ISO 27001 / ISO 8000</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-900/95 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6 relative overflow-hidden">
          {/* Banda Técnica de Proceso Esmeralda Auditoría (4px) */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 absolute top-0 left-0 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                 {/* Mode Selector Tabs */}
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLoginMode('credentials')}
              className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                loginMode === 'credentials'
                  ? 'bg-[#002B49] text-white shadow-md border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Ingreso con Credenciales</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('quick')}
              className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                loginMode === 'quick'
                  ? 'bg-[#002B49] text-white shadow-md border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Selección de Perfil</span>
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="bg-red-950/80 border border-red-700/80 text-red-200 p-3.5 rounded-2xl text-xs flex items-start space-x-3 shadow-md animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Error de autenticación:</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Credentials Form */}
          {loginMode === 'credentials' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* User Selector Dropdown */}
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Seleccionar Usuario Registrado
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      const u = usersList.find(usr => usr.id === e.target.value);
                      if (u) handleSelectUser(u);
                    }}
                    className="w-full bg-slate-950 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 text-xs font-semibold appearance-none cursor-pointer"
                  >
                    {usersList.map((usr) => (
                      <option key={usr.id} value={usr.id}>
                        {usr.name} (@{usr.username}) — [{usr.role.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Usuario Institucional (SCTAP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500 font-mono text-xs font-bold">@</span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="ej. w_prato"
                    className="w-full bg-slate-950 text-white pl-9 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 text-xs font-mono font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    Contraseña
                  </label>
                  {usersList.find(u => u.username === usernameInput)?.password && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = usersList.find(u => u.username === usernameInput);
                        if (target?.password) setPasswordInput(target.password);
                      }}
                      className="text-[10px] text-cyan-400 hover:underline font-bold cursor-pointer"
                    >
                      Usar Contraseña de Prueba Registrada
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Ingrese su contraseña"
                    className="w-full bg-slate-950 text-white pl-10 pr-10 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 text-xs font-mono font-semibold"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#E30613] to-red-700 hover:from-red-600 hover:to-red-800 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 group ring-2 ring-red-500/20"
              >
                <span>Iniciar Sesión en el Sistema</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

            </form>
          ) : (
            /* Quick Profile Select Mode */
            <div className="space-y-4">
              <p className="text-xs text-slate-300 font-medium bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                Selecciona tu usuario de la lista a continuación para ingresar con tu contraseña asignada:
              </p>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {usersList.map((user) => {
                  const isAdmin = user.role === 'admin';
                  const isSupervisor = user.role === 'supervisor';

                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        handleSelectUser(user);
                        setLoginMode('credentials');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedUserId === user.id
                          ? 'bg-[#002B49] border-cyan-400 text-white shadow-md'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isAdmin ? 'bg-amber-500/20 text-amber-300' : isSupervisor ? 'bg-blue-500/20 text-cyan-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs text-white truncate">{user.name}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : isSupervisor ? 'bg-blue-500/20 text-cyan-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            @{user.username} • {user.cargo}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectUser(user);
                          setLoginMode('credentials');
                        }}
                        className="px-3 py-1.5 bg-[#002B49] hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] rounded-lg transition-colors shrink-0 ml-2 shadow-xs cursor-pointer flex items-center space-x-1"
                      >
                        <Key className="w-3 h-3" />
                        <span>Ingresar Clave</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLoginMode('credentials')}
                  className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Ir a Ingreso con Credenciales
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-slate-500 text-[11px]">
          <p>© 2026 CORPOELEC • Gerencia General de Gestión de Planificación de Distribución</p>
        </div>

      </div>
    </div>
  );
};
