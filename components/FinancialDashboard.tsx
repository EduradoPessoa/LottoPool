
import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Download, Filter, ChevronDown } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const financialData = [
  { month: 'Jan', revenue: 400, expense: 200 },
  { month: 'Fev', revenue: 600, expense: 400 },
  { month: 'Mar', revenue: 500, expense: 300 },
  { month: 'Abr', revenue: 900, expense: 450 },
  { month: 'Mai', revenue: 1100, expense: 600 },
  { month: 'Jun', revenue: 800, expense: 400 },
];

const FinancialDashboard: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState('all');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-slate-500">Filtrar por Grupo:</span>
            <div className="relative">
               <select 
                 className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                 value={selectedGroupId}
                 onChange={(e) => setSelectedGroupId(e.target.value)}
               >
                 <option value="all">Todos os Grupos</option>
                 <option value="g1">Bolão da Firma</option>
                 <option value="g2">Família Sorte</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
         </div>
         <button className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
            <Download size={18} />
            <span>Relatório Consolidado</span>
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Wallet size={120} />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Saldo do Grupo</p>
          <h2 className="text-3xl font-bold mb-4">R$ {selectedGroupId === 'g1' ? '1.250,00' : selectedGroupId === 'g2' ? '450,00' : '2.450,00'}</h2>
          <div className="flex space-x-4">
             <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded-xl text-sm font-bold transition-colors">Aportar</button>
             <button className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-sm font-bold transition-colors">Retirar</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Prêmios Recebidos</p>
            <h2 className="text-3xl font-bold text-slate-800">R$ 15.240,00</h2>
          </div>
          <div className="flex items-center text-emerald-600 text-sm font-bold">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+24% vs mês passado</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Gastos com Apostas</p>
            <h2 className="text-3xl font-bold text-slate-800">R$ 3.840,00</h2>
          </div>
          <div className="flex items-center text-rose-600 text-sm font-bold">
            <ArrowDownRight size={16} className="mr-1" />
            <span>-5% vs mês passado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg">Histórico de Fluxo</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Extrato do Grupo</h3>
          <div className="space-y-4">
            {[
              { label: 'Cota: João Silva (Mega Jan)', value: '+ R$ 50,00', color: 'text-emerald-600' },
              { label: 'Aposta: Bolão de Reis', value: '- R$ 120,00', color: 'text-rose-600' },
              { label: 'Prêmio: Lotofácil Conc. 3020', value: '+ R$ 2.450,00', color: 'text-emerald-600' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0">
                 <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.label}</p>
                    <p className="text-xs text-slate-400">Ontem</p>
                 </div>
                 <span className={`text-sm font-bold whitespace-nowrap ${t.color}`}>{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
