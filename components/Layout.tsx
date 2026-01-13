
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Wallet, 
  Settings, 
  Menu, 
  X, 
  Trophy,
  Bell,
  Layers,
  LogOut,
  UserCheck
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { AppNotification, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: '1',
      type: 'RESULT',
      title: 'Resultado Mega-Sena!',
      message: 'O sorteio do concurso 2810 foi realizado. O Bolão da Firma teve 4 acertos!',
      timestamp: 'Há 5 min',
      read: false
    },
    {
      id: '2',
      type: 'DEADLINE',
      title: 'Encerramento Próximo',
      message: 'Apostas para a Lotofácil Especial encerram em 2 horas. Garanta sua cota!',
      timestamp: 'Há 1 hora',
      read: false
    }
  ]);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'my-pools', label: 'Minhas Cotas', icon: UserCheck },
    { id: 'groups', label: 'Grupos', icon: Layers },
    { id: 'pools', label: 'Bolões', icon: Trophy },
    { id: 'participants', label: 'Membros', icon: Users },
    { id: 'tickets', label: 'Comprovantes', icon: Ticket },
    { id: 'financial', label: 'Financeiro', icon: Wallet, adminOnly: true },
  ].filter(item => !item.adminOnly || user.role === 'ADMIN');

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsNotifOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col z-50`}>
        <div className="p-6 flex items-center justify-between overflow-hidden">
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight whitespace-nowrap">LottoPool<span className="text-emerald-500">Master</span></span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-1 hover:bg-slate-800 rounded transition-colors ${!isSidebarOpen && 'mx-auto'}`}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-x-hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={!isSidebarOpen ? item.label : ''}
              className={`w-full flex items-center p-3 rounded-xl transition-all relative group ${
                activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <item.icon size={22} className={`${isSidebarOpen ? 'mr-4' : 'mx-auto'} shrink-0`} />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap overflow-hidden transition-opacity duration-300">{item.label}</span>}
              {!isSidebarOpen && activeTab === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-l-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className={`w-full flex items-center p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors`}>
            <Settings size={22} className={isSidebarOpen ? 'mr-4' : 'mx-auto'} />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Configurações</span>}
          </button>
          <button onClick={onLogout} className={`w-full flex items-center p-3 rounded-xl hover:bg-rose-900/40 text-rose-400 transition-colors`}>
            <LogOut size={22} className={isSidebarOpen ? 'mr-4' : 'mx-auto'} />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Sair</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 h-20">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-800">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{user.role === 'ADMIN' ? 'Modo Administrativo' : 'Área do Participante'}</p>
          </div>
          <div className="flex items-center space-x-6">
             <div className="hidden md:block bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-100">
                Saldo: R$ 2.450,00
             </div>
             
             <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 rounded-xl border transition-all relative ${isNotifOpen ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  <Bell size={20} className="text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <NotificationCenter 
                      notifications={notifications} 
                      onMarkAsRead={handleMarkAsRead}
                      onClearAll={handleClearAll}
                    />
                  </>
                )}
             </div>

             <div className="flex items-center space-x-3 p-1 rounded-xl">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                   <p className="text-[10px] text-slate-400 font-medium capitalize">{user.role.toLowerCase()}</p>
                </div>
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`} className="w-10 h-10 rounded-xl border-2 border-slate-200 shadow-sm" alt="Avatar" />
             </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
