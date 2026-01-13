
import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Wallet, ExternalLink, Edit2, MessageSquare, Share2, X, Loader2, Check } from 'lucide-react';
import { PoolGroup } from '../types';
import { db } from '../services/db';

interface GroupsManagementProps {
  isAdmin?: boolean;
}

const GroupsManagement: React.FC<GroupsManagementProps> = ({ isAdmin = false }) => {
  const [groups, setGroups] = useState<PoolGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    notifActive: true
  });

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const list = await db.groups.getList();
      setGroups(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadGroups(); }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', notifActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: PoolGroup) => {
    setEditingId(group.id);
    setFormData({ name: group.name, notifActive: !!group.notifActive });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      setIsSaving(true);
      if (editingId) {
        await db.groups.update(editingId, formData);
        setGroups(prev => prev.map(g => g.id === editingId ? { ...g, ...formData } : g));
      } else {
        const result = await db.groups.create({ ...formData, balance: 0, participants: [] });
        setGroups(prev => [result, ...prev]);
      }
      setIsModalOpen(false);
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = (group: PoolGroup) => {
    // Usando HASH (#) em vez de QUERY (?) para evitar 404 no servidor
    const baseUrl = window.location.origin + window.location.pathname;
    const inviteLink = `${baseUrl}#invite=${group.id}`;
    
    const text = encodeURIComponent(`Olá! Te convidei para participar do meu grupo de bolão "${group.name}" no LottoPool Master. Clique no link para entrar: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar grupo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-64 outline-none focus:border-emerald-500 transition-all font-medium"
          />
        </div>
        {isAdmin && (
          <button onClick={handleOpenCreate} className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg font-bold">
            <Plus size={20} /> <span>Novo Grupo</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 hover:shadow-xl transition-all group border-b-4 border-b-emerald-500 relative flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                <Users size={28} />
              </div>
              {isAdmin && (
                <button onClick={() => handleOpenEdit(group)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-emerald-600 transition-colors">
                  <Edit2 size={20}/>
                </button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-1">{group.name}</h3>
              <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-wider">{group.participants?.length || 0} Membros</p>
              <div className="bg-slate-50 rounded-2xl p-5 mb-8 flex justify-between items-center border border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-500">Saldo</span>
                <span className="text-lg font-black text-emerald-600">R$ {group.balance?.toFixed(2) || "0,00"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 text-xs font-black uppercase tracking-widest text-slate-600 border-2 border-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all">Abrir</button>
              <button onClick={() => handleShare(group)} className="py-3 text-xs font-black uppercase tracking-widest text-emerald-700 border-2 border-emerald-100 bg-emerald-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">Convidar</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <h2 className="text-2xl font-bold mb-8 text-slate-800">{editingId ? 'Editar Grupo' : 'Novo Grupo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nome do Grupo *</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div className="flex items-center space-x-3 p-5 bg-emerald-50/50 rounded-2xl border-2 border-emerald-100 cursor-pointer" onClick={() => setFormData({...formData, notifActive: !formData.notifActive})}>
                <MessageSquare className="text-emerald-600" size={24} />
                <span className="flex-1 font-bold text-emerald-800 text-sm">Notificações WhatsApp</span>
                <input type="checkbox" checked={formData.notifActive} readOnly className="w-6 h-6 accent-emerald-600" />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-500">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Check size={20} className="mr-2" />} {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;
