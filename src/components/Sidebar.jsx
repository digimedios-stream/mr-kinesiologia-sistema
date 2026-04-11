import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Activity, 
  Calendar, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Stethoscope,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false); // Default closed on mobile
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Panel de Control', path: '/' },
    { icon: UserPlus, label: 'Nuevo Paciente', path: '/nuevo-paciente' },
    { icon: Activity, label: 'Sesiones', path: '/sesiones' },
    { icon: Calendar, label: 'Calendario', path: '/calendario' },
    { icon: Users, label: 'Pacientes', path: '/pacientes' },
    { icon: ShieldCheck, label: 'Obras Sociales', path: '/obras-sociales' },
    { icon: BarChart3, label: 'Informes', path: '/reportes' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('mrk_token');
    localStorage.removeItem('mrk_user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Toggle Button - Floating */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-6 left-6 z-[60] lg:hidden p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl text-primary animate-in fade-in zoom-in duration-300"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-50 transition-all duration-500 ease-out flex flex-col shadow-2xl lg:shadow-none",
        isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl kinetic-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Stethoscope size={24} strokeWidth={2.5} />
            </div>
            <div className="animate-in fade-in duration-300">
              <h1 className="text-primary font-manrope font-extrabold text-lg leading-none tracking-tight">MR Kined</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Precisión Clínica</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="px-6 py-2">
          <button 
            onClick={toggleTheme}
            className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center p-1 relative overflow-hidden transition-all duration-500"
          >
            <div className={cn(
              "absolute top-1 bottom-1 w-[46%] rounded-lg bg-white dark:bg-slate-950 shadow-sm transition-all duration-500 z-0",
              isDark ? "left-[52%]" : "left-1"
            )} />
            <div className="flex-1 flex justify-center z-10 text-slate-400 dark:text-slate-500">
              <Sun size={14} className={!isDark ? "text-primary" : ""} />
            </div>
            <div className="flex-1 flex justify-center z-10 text-slate-400 dark:text-slate-500">
              <Moon size={14} className={isDark ? "text-primary" : ""} />
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close on click for mobile
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary-container dark:bg-primary/10 text-primary font-bold shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <item.icon className="shrink-0 w-5 h-5" strokeWidth={2.5} />
              <span className="flex-1 text-sm">{item.label}</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              MR
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Lic. Roman Macarena</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Kinesióloga</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200"
          >
            <LogOut size={20} className="shrink-0" strokeWidth={2.5} />
            <span className="font-bold text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
