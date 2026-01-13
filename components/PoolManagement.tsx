
import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Hash, Sparkles, Trophy, ChevronRight, LayoutGrid, AlertCircle, X, Share2, Check, Users, UserPlus, Loader2 } from 'lucide-react';
import { LOTTERY_CONFIGS, Pool, LotteryType, PoolGroup, Participant } from '../types';
import { getLuckyNumbers } from '../services/geminiService';
import { db } from '../services/db';
import LotteryGrid from './LotteryGrid';

interface PoolManagementProps {
  isAdmin?: boolean;
}

const PoolManagement: React.FC<PoolManagementProps> = ({ isAdmin = false }) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [newPool, setNewPool] = useState<Partial<Pool>>({
    name: '',
    drawNumber: '',
    type: 'MEGA_SENA',
    groupId: 'g1',
    status: 'OPEN',
    tickets: [],
    participants: []
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [poolList, participantList] = await Promise.all([
        db.pools.getList(),
        db.participants.getList()
      ]);
      setPools(poolList);
      setAvailableParticipants(participantList);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    db.pools.subscribe(() => loadData());
    return () => { db.client.collection('pools').unsubscribe(); };
  }, []);

  const toggleNumber = (num: number) => {
    const config = LOTTERY_CONFIGS[newPool.type as LotteryType];
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < config.maxNumbers) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const addTicketToPool = () => {
    const config = LOTTERY_CONFIGS[newPool.type as LotteryType];
    if (selectedNumbers.length < config.minNumbers) {
      alert(`Selecione pelo menos ${config.minNumbers} números.`);
      return;
    }

    const newTicket = {
      id: Math.random().toString(36).substr(2, 9),
      numbers: [...selectedNumbers],
      cost: config.priceBase,
      status: 'PENDING' as const
    };

    setNewPool(prev => ({
      ...prev,
      tickets: [...(prev.tickets || []), newTicket]
    }));
    setSelectedNumbers([]);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!newPool.name || !newPool.drawNumber) {
        setFormError("Nome e Concurso são obrigatórios.");
        return;
      }
      setFormError(null);
      setStep(2);
    } else if (step === 2) {
      if (!newPool.tickets || newPool.tickets.length === 0) {
        setFormError("Adicione pelo menos um jogo ao bolão.");
        return;
      }
      setFormError(null);
      setStep(3);
    }
  };

  const toggleParticipant = (pId: string) => {
    const isSelected = newPool.participants?.find(p => p.participantId === pId);
    if (isSelected) {
      setNewPool(prev => ({
        ...prev,
        participants: prev.participants?.filter(p => p.participantId !== pId)
      }));
    } else {
      setNewPool(prev => ({
        ...prev,
        participants: [...(prev.participants || []), { participantId: pId, shares: 1, paid: false }]
      }));
    }
  };

  const updateShares = (pId: string, shares: number) => {
    setNewPool(prev => ({
      ...prev,
      participants: prev.participants?.map(p => 
        p.participantId === pId ? { ...p, shares: Math.max(1, shares) } : p
      )
    }));
  };

  const handleSaveFinalPool = async () => {
    if (!newPool.participants || newPool.participants.length === 0) {
      alert("Selecione pelo menos um participante.");
      return;
    }

    try {
      setIsSaving(true);
      const finalData: Partial<Pool> = {
        ...newPool,
        drawDate: new Date().toLocaleDateString('pt-BR'),
        totalPrize: 0,
        status: 'OPEN'
      };

      console.log("Iniciando gravação do bolão...", finalData);
      const result = await db.pools.create(finalData);
      console.log("Bolão gravado!", result);
      
      // Atualiza a lista local imediatamente
      setPools(prev => [result, ...prev]);

      // Resetar estados
      setIsCreating(false);
      setStep(1);
      setNewPool({
        name: '',
        drawNumber: '',
        type: 'MEGA_SENA',
        groupId: 'g1',
        status: 'OPEN',
        tickets: [],
        participants: []
      });
      
      alert("Bolão gravado com sucesso!");
    } catch (err) {
      console.error("Erro crítico ao gravar bolão:", err);
      alert("Houve um erro ao tentar gravar o bolão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-500" />
        <p className="font-bold">Carregando seus Bolões...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Gestão de Bolões</h2>
        {isAdmin && !isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} />
            <span>Criar Novo Bolão</span>
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-5xl mx-auto overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center space-x-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>
                    {step > s ? <Check size={14} /> : s}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${step === s ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {s === 1 ? 'Básico' : s === 2 ? 'Jogos' : 'Membros'}
                  </span>
                  {s < 3 && <ChevronRight size={14} className="text-slate-300" />}
                </div>
              ))}
            </div>
            <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
          </div>

          <div className="p-10">
            {formError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center text-rose-600 text-sm font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="mr-3" /> {formError}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nome do Bolão *</label>
                    <input 
                      type="text" 
                      value={newPool.name}
                      onChange={e => setNewPool({...newPool, name: e.target.value})}
                      placeholder="Ex: Bolão de Natal"
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all text-slate-900 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Loteria</label>
                      <select 
                        value={newPool.type}
                        onChange={e => setNewPool({...newPool, type: e.target.value as LotteryType})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium"
                      >
                        {Object.entries(LOTTERY_CONFIGS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Concurso *</label>
                      <input 
                        type="text" 
                        value={newPool.drawNumber}
                        onChange={e => setNewPool({...newPool, drawNumber: e.target.value})}
                        placeholder="0000"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <button onClick={handleNextStep} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-xl active:scale-95">
                    <span>Continuar</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="hidden md:block text-center">
                  <Trophy size={160} className="mx-auto text-emerald-100" />
                  <p className="mt-4 text-slate-400 font-medium">Configure as informações básicas para começar.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Escolha os Números</h3>
                    <button 
                      onClick={async () => {
                        setLoadingAI(true);
                        const res = await getLuckyNumbers(newPool.type!, 1);
                        if (res?.games?.[0]?.numbers) setSelectedNumbers(res.games[0].numbers);
                        setLoadingAI(false);
                      }}
                      className="text-purple-600 bg-purple-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 hover:bg-purple-100 transition-colors"
                    >
                      <Sparkles size={14} />
                      <span>{loadingAI ? 'Analisando...' : 'IA Sugere'}</span>
                    </button>
                  </div>
                  <LotteryGrid 
                    type={newPool.type as LotteryType}
                    selectedNumbers={selectedNumbers}
                    onToggleNumber={toggleNumber}
                  />
                  <button 
                    onClick={addTicketToPool}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 flex items-center justify-center space-x-2 active:scale-95 transition-all"
                  >
                    <Plus size={20} />
                    <span>Adicionar este Jogo</span>
                  </button>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white h-fit sticky top-4 border border-white/5 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center"><Hash size={20} className="mr-2 text-emerald-400" /> Jogos do Bolão</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                    {newPool.tickets?.map((t) => (
                      <div key={t.id} className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-white/5 animate-in slide-in-from-right-2">
                        <div className="flex flex-wrap gap-1.5">
                          {t.numbers.map(n => <span key={n} className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-500/30">{n.toString().padStart(2, '0')}</span>)}
                        </div>
                        <button onClick={() => setNewPool(prev => ({ ...prev, tickets: prev.tickets?.filter(tk => tk.id !== t.id) }))} className="text-rose-400 p-2 hover:bg-rose-500/20 rounded-xl transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    {(!newPool.tickets || newPool.tickets.length === 0) && (
                      <div className="py-16 text-center text-slate-500 border border-dashed border-slate-700 rounded-3xl">
                        Nenhum volante adicionado.
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-3 pt-6 border-t border-white/10">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-all border border-white/10">Voltar</button>
                    <button onClick={handleNextStep} disabled={!newPool.tickets?.length} className="flex-[2] py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50">Próximo: Participantes</button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">Quem participa?</h3>
                    <p className="text-sm text-slate-500">Defina os membros e o número de cotas de cada um.</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-sm font-bold border border-emerald-100 shadow-sm">
                    Cotas Totais: {newPool.participants?.reduce((acc, p) => acc + p.shares, 0) || 0}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableParticipants.map(p => {
                    const poolPart = newPool.participants?.find(pp => pp.participantId === p.id);
                    return (
                      <div 
                        key={p.id}
                        onClick={() => !poolPart && toggleParticipant(p.id)}
                        className={`p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer flex items-center justify-between ${poolPart ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${poolPart ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.email}</p>
                          </div>
                        </div>
                        {poolPart ? (
                          <div className="flex items-center space-x-3 bg-white p-2 rounded-xl shadow-sm border border-emerald-100" onClick={e => e.stopPropagation()}>
                            <button onClick={() => updateShares(p.id, poolPart.shares - 1)} className="w-8 h-8 rounded-lg hover:bg-slate-100 font-bold text-slate-500">-</button>
                            <span className="font-bold text-slate-800 min-w-[30px] text-center">{poolPart.shares}</span>
                            <button onClick={() => updateShares(p.id, poolPart.shares + 1)} className="w-8 h-8 rounded-lg hover:bg-slate-100 font-bold text-slate-500">+</button>
                            <button onClick={() => toggleParticipant(p.id)} className="ml-3 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><X size={18}/></button>
                          </div>
                        ) : (
                          <UserPlus size={20} className="text-slate-300 mr-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end space-x-4 pt-10 border-t border-slate-100">
                  <button onClick={() => setStep(2)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Voltar</button>
                  <button 
                    onClick={handleSaveFinalPool} 
                    disabled={isSaving}
                    className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 flex items-center space-x-3 shadow-2xl active:scale-95 transition-all disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                    <span className="text-lg">{isSaving ? 'Salvando...' : 'Gravar Bolão Definitivo'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map(pool => {
            const config = LOTTERY_CONFIGS[pool.type];
            const totalCost = pool.tickets.reduce((acc, t) => acc + t.cost, 0);
            return (
              <div key={pool.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-xl transition-all group animate-in slide-in-from-bottom-2">
                <div className={`${config.color} p-6 text-white relative`}>
                   <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold truncate pr-4">{pool.name}</h3>
                        <p className="text-xs opacity-90 uppercase font-black tracking-widest">{config.name}</p>
                      </div>
                      <Trophy size={20} className="opacity-40 flex-shrink-0" />
                   </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center"><Calendar size={14} className="mr-1.5 text-slate-300" /> {pool.drawDate}</span>
                    <span className="flex items-center"><Hash size={14} className="mr-1.5 text-slate-300" /> Conc. {pool.drawNumber}</span>
                  </div>
                  <div className="pt-5 border-t border-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Valor Total</p>
                      <p className="font-black text-emerald-600 text-lg">R$ {totalCost.toFixed(2)}</p>
                    </div>
                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95">Visualizar</button>
                  </div>
                </div>
              </div>
            );
          })}
          {pools.length === 0 && (
            <div className="col-span-full py-28 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                <LayoutGrid size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Ainda não há bolões</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Clique no botão verde no topo para criar seu primeiro bolão e começar a gerenciar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PoolManagement;
