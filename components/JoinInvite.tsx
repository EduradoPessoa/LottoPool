
import React, { useState, useEffect } from 'react';
import { User, Phone, Check, Loader2, Trophy, ArrowRight } from 'lucide-react';
import { db } from '../services/db';
import { PoolGroup, User as UserType } from '../types';

interface JoinInviteProps {
  groupId: string;
  onSuccess: (user: UserType) => void;
}

const JoinInvite: React.FC<JoinInviteProps> = ({ groupId, onSuccess }) => {
  const [group, setGroup] = useState<PoolGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    const fetchGroup = async () => {
      const data = await db.groups.getOne(groupId);
      setGroup(data);
      setLoading(false);
    };
    fetchGroup();
  }, [groupId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsJoining(true);
      // 1. Cria o participante
      const newParticipant = await db.participants.create(formData);
      // 2. Vincula ao grupo
      await db.groups.addParticipant(groupId, newParticipant.id);
      
      // 3. Prepara objeto de usuário para login automático
      const userSession: UserType = {
        id: newParticipant.id,
        name: newParticipant.name,
        email: newParticipant.email,
        role: 'PARTICIPANT'
      };

      alert(`Bem-vindo ao grupo ${group?.name}!`);
      onSuccess(userSession);
    } catch (e) {
      alert("Erro ao entrar no grupo.");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  if (!group) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-6 text-center">
      <div>
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-500">
          <Trophy size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Convite Inválido</h1>
        <p className="text-slate-400">Este grupo não existe ou o link expirou.</p>
        <button onClick={() => window.location.href = window.location.origin} className="mt-6 text-emerald-500 font-bold hover:underline">Voltar ao Início</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trophy size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Você foi convidado!</h1>
          <p className="text-slate-500 mt-2">Para participar do grupo <span className="font-bold text-emerald-600">{group.name}</span>, preencha seus dados abaixo.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Como quer ser chamado?"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" required value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail (Para resultados)</label>
            <input 
              type="email" required value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="seu@email.com"
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <button 
            type="submit" 
            disabled={isJoining}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
          >
            {isJoining ? <Loader2 className="animate-spin" /> : (
              <>
                <span className="text-lg">Entrar no Grupo</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
          LottoPool Master &copy; 2024 - Gestão Segura
        </p>
      </div>
    </div>
  );
};

export default JoinInvite;
