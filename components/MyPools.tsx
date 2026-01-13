
import React, { useState } from 'react';
import { Trophy, Calendar, Hash, CheckCircle2, Clock, AlertCircle, ChevronRight, Eye } from 'lucide-react';
import { LOTTERY_CONFIGS, Pool, LotteryType } from '../types';

const MOCK_MY_POOLS = [
  {
    id: 'p1',
    name: 'Mega da Virada - Grupo Firma',
    type: 'MEGA_SENA',
    drawNumber: '2810',
    drawDate: '31/12/2024',
    status: 'OPEN',
    myShares: 2,
    paid: true,
    totalShares: 10,
    costPerShare: 25.00
  },
  {
    id: 'p2',
    name: 'Lotofácil da Independência',
    type: 'LOTOFACIL',
    drawNumber: '3150',
    drawDate: '07/09/2024',
    status: 'FINISHED',
    myShares: 1,
    paid: true,
    totalShares: 20,
    costPerShare: 15.00,
    prize: 150.40
  },
  {
    id: 'p3',
    name: 'Quina de São João',
    type: 'QUINA',
    drawNumber: '6450',
    drawDate: '24/06/2024',
    status: 'CLOSED',
    myShares: 5,
    paid: false,
    totalShares: 50,
    costPerShare: 10.00
  }
];

const MyPools: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'FINISHED'>('ALL');

  const filteredPools = MOCK_MY_POOLS.filter(p => 
    filter === 'ALL' || p.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 uppercase tracking-wider">Aberto</span>;
      case 'CLOSED':
        return <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 uppercase tracking-wider">Fechado</span>;
      case 'FINISHED':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 uppercase tracking-wider">Encerrado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Minhas Participações</h2>
          <p className="text-sm text-slate-500">Acompanhe seus jogos e prêmios</p>
        </div>
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          {(['ALL', 'OPEN', 'FINISHED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === 'ALL' ? 'Todos' : f === 'OPEN' ? 'Ativos' : 'Passados'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPools.map((pool) => {
          const config = LOTTERY_CONFIGS[pool.type as LotteryType];
          return (
            <div key={pool.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row">
                <div className={`md:w-2 border-l-4 ${config.color.replace('bg-', 'border-')}`}></div>
                
                <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${config.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                      <Trophy size={24} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-slate-800">{pool.name}</h3>
                        {getStatusBadge(pool.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center"><Calendar size={12} className="mr-1" /> {pool.drawDate}</span>
                        <span className="flex items-center"><Hash size={12} className="mr-1" /> Conc. {pool.drawNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Cotas</p>
                      <p className="font-bold text-slate-800">{pool.myShares} <span className="text-slate-400 font-normal">/ {pool.totalShares}</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Pagamento</p>
                      {pool.paid ? (
                        <div className="flex items-center text-emerald-600 font-bold text-sm">
                          <CheckCircle2 size={14} className="mr-1" /> Pago
                        </div>
                      ) : (
                        <div className="flex items-center text-rose-500 font-bold text-sm animate-pulse">
                          <AlertCircle size={14} className="mr-1" /> Pendente
                        </div>
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                        {pool.status === 'FINISHED' ? 'Prêmio Recebido' : 'Investimento'}
                      </p>
                      <p className={`font-bold ${pool.status === 'FINISHED' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        R$ {pool.status === 'FINISHED' ? pool.prize?.toFixed(2) : (pool.myShares * pool.costPerShare).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                      <Eye size={16} />
                      <span>Ver Jogos</span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPools.length === 0 && (
          <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nenhum bolão encontrado</h3>
            <p className="text-slate-500 text-sm">Você ainda não tem participações nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPools;
