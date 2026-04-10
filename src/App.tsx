/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { GoogleGenAI } from "@google/genai"; // removed - kept import for type compat
import { 
  Power, 
  Settings, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity,
  Shield,
  Smartphone,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  Cpu,
  Zap,
  Bell,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  Globe,
  BarChart3,
  Copy,
  Check,
  X,
  Menu,
  ArrowRight,
  Headphones,
  ExternalLink,
  DollarSign,
  Bitcoin,
  Droplets,
  Building2,
  FileText,
  Brain,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { UserProfile, TradingConfig, TradingStats, UserRole, UserStatus, AccountType, GlobalConfig, DepositRequest, BacktestResult, WithdrawRequest } from './types';
import { supabase } from './lib/supabase';

// --- Utilities ---
const getTimeframeSeconds = (tf: string) => {
  switch (tf) {
    case 'S30': return 30;
    case 'M1': return 60;
    case 'M2': return 120;
    case 'M5': return 300;
    case 'M10': return 600;
    case 'M15': return 900;
    case 'M30': return 1800;
    case 'H1': return 3600;
    default: return 60;
  }
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const DepositModal = ({ isOpen, onClose, onDeposit, globalConfig, isCreating, selectedAmount, setSelectedAmount }: any) => {
  const [step, setStep] = useState<'select' | 'pix'>('select');
  const amounts = [
    globalConfig.plan1_amount || 2500,
    globalConfig.plan2_amount || 5000,
    globalConfig.plan3_amount || 10000,
    globalConfig.plan4_amount || 20000
  ];

  const handleSelectAmount = (amount: number) => {
    onDeposit(amount);
    setStep('pix');
  };

  const getPixData = () => {
    if (selectedAmount === globalConfig.plan1_amount) return { copy: globalConfig.plan1_pix };
    if (selectedAmount === globalConfig.plan2_amount) return { copy: globalConfig.plan2_pix };
    if (selectedAmount === globalConfig.plan3_amount) return { copy: globalConfig.plan3_pix };
    if (selectedAmount === globalConfig.plan4_amount) return { copy: globalConfig.plan4_pix };
    return { copy: '' };
  };

  const pixData = getPixData();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-[2.5rem] border-white/10 p-8 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter">Depósito de Margem</h2>
                <p className="text-gray-400 text-sm mt-2">Selecione o valor que deseja depositar em sua banca.</p>
              </div>

              {step === 'select' ? (
                <div className="grid grid-cols-2 gap-4">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleSelectAmount(amount)}
                      disabled={isCreating}
                      className="group relative p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/50 transition-all text-left"
                    >
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Valor do Depósito</p>
                      <p className="text-2xl font-black text-white tracking-tighter">R$ {amount.toLocaleString('pt-BR')}</p>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 text-center">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Valor Selecionado</p>
                    <p className="text-3xl font-black text-white tracking-tighter">R$ {selectedAmount?.toLocaleString('pt-BR')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-3xl mx-auto w-48 h-48 flex items-center justify-center overflow-hidden">
                      {pixData.copy ? (
                        <QRCodeSVG value={pixData.copy} size={160} />
                      ) : (
                        <div className="text-gray-900 text-[10px] font-bold text-center">Chave PIX não configurada</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">PIX Copia e Cola</label>
                      <div className="relative">
                        <input
                          readOnly
                          value={pixData.copy || 'Link não configurado'}
                          className="w-full glass-input rounded-2xl py-4 pl-4 pr-12 text-[10px] text-white font-mono overflow-hidden text-ellipsis"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pixData.copy || '');
                            alert('Copiado para a área de transferência!');
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('select')}
                    className="w-full py-4 text-gray-400 font-bold text-sm hover:text-white transition-colors"
                  >
                    Voltar para seleção de valores
                  </button>
                </div>
              )}

              <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-400/80 leading-relaxed font-medium">
                  Após realizar o pagamento, sua margem será atualizada automaticamente em até 15 minutos. Caso ocorra algum atraso, entre em contato com o suporte.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ResultModal = ({ isOpen, type, onClose, stats, config }: any) => {
  const isProfit = type === 'profit';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-[2.5rem] border shadow-[0_0_50px_-12px] transition-all",
              isProfit 
                ? "bg-emerald-950/40 border-emerald-500/30 shadow-emerald-500/20" 
                : "bg-red-950/40 border-red-500/30 shadow-red-500/20"
            )}
          >
            {/* Background Effects */}
            <div className={cn(
              "absolute inset-0 opacity-20",
              isProfit ? "bg-gradient-to-b from-emerald-500/20 to-transparent" : "bg-gradient-to-b from-red-500/20 to-transparent"
            )} />
            
            <div className="relative p-8 text-center space-y-6">
              {/* Icon Animation */}
              <motion.div 
                initial={{ rotate: -10, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className={cn(
                  "w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 shadow-xl",
                  isProfit 
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20" 
                    : "bg-red-500/20 border-red-500/50 text-red-400 shadow-red-500/20"
                )}
              >
                {isProfit ? <Trophy className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
              </motion.div>

              <div className="space-y-2">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl font-black text-white tracking-tighter"
                >
                  {isProfit ? 'META ATINGIDA!' : 'STOP ATINGIDO!'}
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 text-sm font-medium px-4"
                >
                  {isProfit 
                    ? 'Parabéns! Você alcançou sua meta de lucro diária com sucesso. Gestão impecável!' 
                    : 'Atenção. Seu limite de perda diária foi atingido. O robô parou para preservar seu capital.'}
                </motion.p>
              </div>

              {/* Stats Summary Area */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-black/40 rounded-3xl p-6 border border-white/5 flex justify-between items-center"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Resultado de Hoje</p>
                  <p className={cn(
                    "text-2xl font-black tracking-tighter",
                    isProfit ? "text-emerald-400" : "text-red-400"
                  )}>
                    R$ {stats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Trades</p>
                  <p className="text-xl font-bold text-white tracking-tight">
                    {stats.wins}W - {stats.losses}L
                  </p>
                </div>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={onClose}
                className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95",
                  isProfit 
                    ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/25" 
                    : "bg-red-500 hover:bg-red-400 text-red-950 shadow-lg shadow-red-500/25"
                )}
              >
                Entendido, Fechar Painel
              </motion.button>
              
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest uppercase">
                Gestão Profitus Pro • {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const WithdrawModal = ({ isOpen, onClose, onWithdraw, isCreating }: any) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'pix' | 'crypto' | 'bank'>('pix');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    let details = '';
    if (method === 'pix') {
      details = `Nome: ${firstName} ${lastName}\nCPF: ${cpf}\nChave PIX: ${pixKey}`;
    } else if (method === 'crypto') {
      details = `Endereço da Carteira: ${walletAddress}`;
    } else if (method === 'bank') {
      details = `Nome: ${firstName} ${lastName}\nCPF: ${cpf}\nBanco: ${bankName}\nAgência: ${bankAgency}\nConta: ${bankAccount}`;
    }

    onWithdraw(Number(amount), method, details);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-[2.5rem] border-white/10 p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter">Solicitar Saque</h2>
                <p className="text-gray-400 text-sm mt-2">Retire seus lucros com segurança e rapidez.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valor do Saque (R$)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full glass-input rounded-2xl py-4 px-6 text-white font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Método de Recebimento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['pix', 'crypto', 'bank'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          method === m 
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                        )}
                      >
                        {m === 'pix' ? 'PIX' : m === 'crypto' ? 'Cripto' : 'Banco'}
                      </button>
                    ))}
                  </div>
                </div>

                {method !== 'crypto' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full glass-input rounded-2xl py-3 px-6 text-white text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sobrenome</label>
                      <input
                        type="text"
                        required
                        placeholder="Sobrenome"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full glass-input rounded-2xl py-3 px-6 text-white text-sm"
                      />
                    </div>
                  </div>
                )}

                {method !== 'crypto' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">CPF</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full glass-input rounded-2xl py-3 px-6 text-white text-sm"
                    />
                  </div>
                )}

                {method === 'pix' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Chave PIX</label>
                    <input
                      type="text"
                      required
                      placeholder="Sua chave PIX"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="w-full glass-input rounded-2xl py-3 px-6 text-white text-sm"
                    />
                  </div>
                )}

                {method === 'crypto' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Endereço da Carteira (BTC/USDT)</label>
                    <input
                      type="text"
                      required
                      placeholder="Endereço da carteira"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full glass-input rounded-2xl py-3 px-6 text-white text-sm"
                    />
                  </div>
                )}

                {method === 'bank' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome do Banco</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Nubank, Itaú..."
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full glass-input rounded-2xl py-3 px-6 text-white text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Agência</label>
                        <input
                          type="text"
                          required
                          placeholder="0001"
                          value={bankAgency}
                          onChange={(e) => setBankAgency(e.target.value)}
                          className="w-full glass-input rounded-2xl py-3 px-6 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Conta</label>
                        <input
                          type="text"
                          required
                          placeholder="00000-0"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="w-full glass-input rounded-2xl py-3 px-6 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isCreating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Solicitar Saque Agora
                </button>
              </form>

              <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-400/80 leading-relaxed font-medium">
                  O prazo para processamento de saques é de até 48 horas úteis. Certifique-se de que os dados informados estão corretos para evitar atrasos.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const EditCredentialsModal = ({ isOpen, onClose, onUpdate, userToEdit }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setPassword('');
    }
  }, [userToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(userToEdit.uid, { username, password });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card rounded-[2.5rem] border-white/10 p-8 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter">Editar Credenciais</h2>
                <p className="text-gray-400 text-sm mt-2">Altere o usuário e senha do cliente.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Novo Nome de Usuário</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full glass-input rounded-2xl py-4 px-6 text-white font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Deixe em branco para não alterar"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input rounded-2xl py-4 px-6 text-white font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  Salvar Alterações
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Card = ({ children, className, title, subtitle, icon: Icon, badge, badgeColor }: any) => (
  <div className={cn("glass-card rounded-2xl p-6 relative overflow-hidden group", className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="flex items-center justify-between mb-6 relative z-10">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-white font-bold text-lg tracking-tight">{title}</h3>
          {badge && (
            <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-widest", badgeColor || 'bg-emerald-500')}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
          <Icon className="text-emerald-400 w-5 h-5" />
        </div>
      )}
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="flex items-center justify-between relative z-10">
      <div className={cn("p-2.5 rounded-xl shadow-lg", color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      {trend !== undefined && (
        <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg shadow-sm", trend >= 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20")}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black mb-1 opacity-60 group-hover:opacity-100 transition-opacity">{title}</p>
      <h4 className="text-white text-xl sm:text-2xl font-black tracking-tighter group-hover:scale-105 origin-left transition-transform duration-300">{value}</h4>
    </div>
    {/* Subtle background glow */}
    <div className={cn("absolute -right-6 -bottom-6 w-16 h-16 blur-3xl opacity-20 rounded-full transition-all duration-500 group-hover:scale-150 group-hover:opacity-30", color)} />
  </div>
);

const Input = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />}
      <input 
        {...props}
        className={cn(
          "w-full glass-input rounded-xl py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          Icon ? "pl-11 pr-4" : "px-4"
        )}
      />
    </div>
  </div>
);

const Button = ({ children, className, variant = 'primary', loading, ...props }: any) => {
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20",
    secondary: "bg-white/5 hover:bg-white/10 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "hover:bg-white/5 text-gray-400 hover:text-white"
  };

  return (
    <button 
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant as keyof typeof variants],
        className
      )}
    >
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const setUser = (u: UserProfile | null | ((prev: UserProfile | null) => UserProfile | null)) => {
    if (typeof u === 'function') {
      setUserState(prev => {
        const next = u(prev);
        if (next) localStorage.setItem('profitus_user', JSON.stringify(next));
        else localStorage.removeItem('profitus_user');
        return next;
      });
    } else {
      setUserState(u);
      if (u) localStorage.setItem('profitus_user', JSON.stringify(u));
      else localStorage.removeItem('profitus_user');
    }
  };
  const [config, setConfig] = useState<TradingConfig | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [botError, setBotError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'admin' | 'backtest'>('dashboard');
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>({ pixKey: '' });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(50);

  const allAssetCategories = useMemo(() => [
    { id: 'forex', name: 'Moedas', icon: DollarSign, assets: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'EUR/GBP', 'USD/CAD', 'NZD/USD', 'USD/CHF'] },
    { id: 'crypto', name: 'Criptomoedas', icon: Bitcoin, assets: ['BTC/USD', 'ETH/USD', 'LTC/USD', 'XRP/USD', 'SOL/USD', 'ADA/USD', 'DOT/USD'] },
    { id: 'commodities', name: 'Commodities', icon: Droplets, assets: ['GOLD', 'SILVER', 'OIL', 'BRENT', 'GAS', 'COPPER'] },
    { id: 'stocks', name: 'Ações', icon: FileText, assets: ['APPLE', 'GOOGLE', 'FACEBOOK', 'AMAZON', 'TESLA', 'MICROSOFT', 'NETFLIX'] },
    { id: 'indices', name: 'Índices', icon: TrendingUp, assets: ['S&P500', 'NASDAQ', 'DOWJONES', 'DAX', 'FTSE100', 'CAC40'] },
  ], []);

  const assetCategories = useMemo(() => {
    const disabled = (globalConfig as any).disabled_niches || [];
    return allAssetCategories.filter(cat => !disabled.includes(cat.id));
  }, [allAssetCategories, globalConfig.disabled_niches]);

  const [selectedAssetCategory, setSelectedAssetCategory] = useState('forex');
  
  // Auto-reset selected category if it gets disabled by admin
  useEffect(() => {
    const activeIds = assetCategories.map(c => c.id);
    if (!activeIds.includes(selectedAssetCategory) && activeIds.length > 0) {
      setSelectedAssetCategory(activeIds[0]);
    }
  }, [assetCategories, selectedAssetCategory]);

  // Bot accuracy from global config (set by admin, default 80%)
  const botAccuracy = (globalConfig as any).bot_accuracy ?? 80;

  // Robot Dashboard State
  const [botStatus, setBotStatus] = useState<'idle' | 'analyzing' | 'trading' | 'win' | 'loss' | 'waiting'>('idle');
  const [currentTrade, setCurrentTrade] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [aiSignal, setAiSignal] = useState<string | null>(null);

  const [preAlert, setPreAlert] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState<{show: boolean, type: 'profit' | 'loss' | null}>({show: false, type: null});

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = history.filter(h => h.exitTime?.split('T')[0] === today);
    
    const wins = todayTrades.filter(h => h.result === 'win').length;
    const losses = todayTrades.filter(h => h.result === 'loss').length;
    const profit = todayTrades.reduce((acc, h) => acc + (h.value || 0), 0);
    
    // Margin is now equal to user.balance (which is updated in real-time)
    const margin = (user?.balance || 0);

    return { wins, losses, profit, margin };
  }, [history, isConnected, user]);

  // ---- LOCAL BOT ENGINE (replaces Gemini AI) ----
  const generateBotSignal = (pair: string, timeframe: string): string => {
    console.log(`Bot Engine: Analisando ${pair} (${timeframe})...`);

    // Simulated technical indicators
    const trend = Math.random() > 0.5 ? 'Alta' : 'Baixa';
    const rsi = trend === 'Alta' ? Math.floor(Math.random() * 15) + 52 : Math.floor(Math.random() * 15) + 33;
    const viPlus = trend === 'Alta' ? (1.1 + Math.random() * 0.2) : (0.8 + Math.random() * 0.1);
    const viMinus = trend === 'Alta' ? (0.8 + Math.random() * 0.1) : (1.1 + Math.random() * 0.2);
    const ema9AboveEma50 = trend === 'Alta';
    const priceNearEma = Math.random() > 0.3; // 70% chance price is near EMA (good entry)
    const lowVolatility = Math.random() < 0.15; // 15% chance of low volatility (skip)
    const rsiNeutral = rsi >= 48 && rsi <= 52; // RSI neutral zone = skip

    // Filtros de bloqueio de entrada (15% das vezes o bot aguarda)
    if (lowVolatility || rsiNeutral || !priceNearEma) {
      console.log('Bot Engine: Filtros ativados. Sem entrada.');
      return 'SEM ENTRADA NO MOMENTO';
    }

    const direction = trend === 'Alta' ? 'CALL' : 'PUT';
    const confidence = rsi > 60 || rsi < 40 ? 'Alta' : 'Média';

    const now = new Date();
    const nextCandle = new Date(now.getTime() + 60000);
    nextCandle.setSeconds(0);
    nextCandle.setMilliseconds(0);
    const horario = nextCandle.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const justificativas: Record<string, string[]> = {
      CALL: [
        `Tendência de alta confirmada. VI+ (${viPlus.toFixed(2)}) > VI- (${viMinus.toFixed(2)}). RSI em ${rsi} com momento ascendente. Preço tocando EMA 9 após pullback.`,
        `EMA 9 acima da EMA 50. RSI ${rsi} com viés comprador. Vortex abrindo para cima. Vela de rejeição identificada.`,
        `Confluência de sinais: Tendência alta, RSI ${rsi}, VI+ dominante. Entrada na correção da EMA 9.`,
      ],
      PUT: [
        `Tendência de baixa confirmada. VI- (${viMinus.toFixed(2)}) > VI+ (${viPlus.toFixed(2)}). RSI em ${rsi} com pressão vendedora. Preço rejeitando EMA 50.`,
        `EMA 9 abaixo da EMA 50. RSI ${rsi} em zona de venda. Vortex abrindo para baixo. Vela de força baixista.`,
        `Sinal técnico: Tendência baixa, VI- superior, RSI ${rsi}. Entrada no teste da EMA 9.`,
      ]
    };
    const justs = justificativas[direction];
    const just = justs[Math.floor(Math.random() * justs.length)];

    return `SINAL: ${direction}
TIMEFRAME: ${timeframe}
EXPIRAÇÃO: 1 vela
CONFIANÇA: ${confidence}
JUSTIFICATIVA: ${just}
PRE_ALERTA: ATIVO ${pair} SINAL ${direction === 'CALL' ? 'COMPRA' : 'VENDA'} PARA PRÓXIMA VELA, HORARIO DA COMPRA ${horario} E TEMPO EXPIRAÇAO ${timeframe}`;
  };

  useEffect(() => {
    if (config?.isBotActive && botStatus === 'idle' && user) {
      console.log("Bot: Ativação detectada no carregamento/mudança de config.");
      startBotCycle();
    } else if (!config?.isBotActive) {
      setBotStatus('idle');
    }
  }, [config?.isBotActive, user?.uid, botStatus]);

  const runBacktest = () => {
    setIsBacktesting(true);
    // Simulate backtest
    setTimeout(() => {
      const assets = [
        { name: 'EUR/USD', isOTC: false },
        { name: 'GBP/USD', isOTC: false },
        { name: 'USD/JPY', isOTC: false },
        { name: 'AUD/CAD', isOTC: true },
        { name: 'EUR/GBP', isOTC: true },
        { name: 'USD/CHF', isOTC: false },
        { name: 'NZD/USD', isOTC: true },
        { name: 'BTC/USD', isOTC: false },
        { name: 'ETH/USD', isOTC: false },
        { name: 'XAU/USD', isOTC: false },
      ];

      const strategies = ['SCALPING_PRO'];
      const timeframes = ['S30', 'M1', 'M2', 'M5', 'M10', 'M15', 'M30', 'H1'];

      const newResults = assets.map(asset => ({
        asset: asset.name,
        isOTC: asset.isOTC,
        payout: Math.floor(Math.random() * (98 - 82 + 1)) + 82,
        strategies: strategies.flatMap(s => {
          return timeframes.map(tf => {
            const wins = Math.floor(Math.random() * 10) + 90;
            const losses = Math.floor(Math.random() * 5) + 5;
            return {
              name: s,
              timeframe: tf,
              wins,
              losses,
              winRate: (wins / (wins + losses)) * 100
            };
          });
        }).sort((a, b) => b.winRate - a.winRate)
      })).filter(r => r.payout >= 82);

      setBacktestResults(newResults);
      setIsBacktesting(false);
    }, 2000);
  };

  useEffect(() => {
    runBacktest();
  }, []);

  const startBotCycle = () => {
    console.log("Bot: startBotCycle chamado. Status atual:", botStatus);
    if (!user) {
      console.log("Bot: Usuário não encontrado, abortando.");
      return;
    }

    const currentMargin = (user.balance || 0) + history.reduce((acc, h) => acc + (h.value || 0), 0);
    console.log(`Bot: Margem atual: ${currentMargin}, Dias: ${user.availableDays}`);

    if (user.availableDays <= 0 || currentMargin <= 0) {
      console.log("Bot: Condições de operação não atendidas (dias ou saldo).");
      if (config?.isBotActive) {
        setBotError(user.availableDays <= 0 ? "Robô pausado: Dias expirados." : "Robô pausado: Sem saldo (margem).");
        setTimeout(() => setBotError(''), 5000);
        toggleBot();
      }
      return;
    }

    // Check Risk Management
    if (config?.dailyProfitTarget && stats.profit >= config.dailyProfitTarget) {
      setShowResultModal({ show: true, type: 'profit' });
      if (config.isBotActive) toggleBot();
      return;
    }

    if (config?.dailyStopLoss && stats.profit <= -config.dailyStopLoss) {
      setShowResultModal({ show: true, type: 'loss' });
      if (config.isBotActive) toggleBot();
      return;
    }

    setAiSignal(null);
    setPreAlert(null);

    const runCycle = async () => {
      console.log("Bot: Iniciando ciclo de análise...");
      setBotStatus('analyzing');
      const pair = (config?.pairs && config.pairs.length > 0) 
        ? config.pairs[Math.floor(Math.random() * config.pairs.length)] 
        : 'EUR/USD';
      const isOTC = Math.random() > 0.5;
      
      // Determine strategy and timeframe
      let activeStrategy = 'SCALPING_PRO';
      let activeTimeframe = config?.timeframe || 'M1';

      if (activeTimeframe === 'AUTO') {
        let bestTimeframe = 'M1';
        let maxWinRate = -1;

        if (backtestResults.length > 0) {
          backtestResults.forEach(res => {
            res.strategies.forEach(s => {
              if (s.name === 'SCALPING_PRO' && (activeTimeframe === 'AUTO' || s.timeframe === activeTimeframe)) {
                if (s.winRate > maxWinRate) {
                  maxWinRate = s.winRate;
                  bestTimeframe = s.timeframe as any;
                }
              }
            });
          });
        } else {
          const timeframes = ['S30', 'M1', 'M2', 'M5', 'M10', 'M15', 'M30', 'H1'];
          bestTimeframe = timeframes[Math.floor(Math.random() * timeframes.length)] as any;
        }
        
        activeTimeframe = bestTimeframe;
      }

      let direction: 'CALL' | 'PUT' | null = Math.random() > 0.5 ? 'CALL' : 'PUT';
      let signalText = "";
      let extractedPreAlert = "";

      if (activeStrategy === 'SCALPING_PRO') {
        // Use local bot engine instead of Gemini AI
        const botRes = generateBotSignal(pair, activeTimeframe);
        setAiSignal(botRes);
        
        // Extract PRE_ALERTA if present
        const preAlertMatch = botRes.match(/PRE_ALERTA:\s*(.*)/);
        if (preAlertMatch) {
          extractedPreAlert = preAlertMatch[1];
          setPreAlert(extractedPreAlert);
          // Wait 3 seconds to show the pre-alert before starting the trade
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        if (botRes.includes('SEM ENTRADA')) {
          direction = null;
        } else {
          direction = botRes.includes('CALL') ? 'CALL' : 'PUT';
          signalText = botRes;
          
          setCurrentTrade({
            pair,
            direction,
            isOTC,
            payout: config?.minPayout || 80,
            amount: config?.investmentAmount || 5,
            strategy: activeStrategy,
            timeframe: activeTimeframe,
            signalText,
            preAlertText: extractedPreAlert || preAlert
          });
        }
      }

      if (!direction) {
        console.log("Bot: Nenhuma entrada encontrada pela IA. Aguardando...");
        setBotStatus('waiting'); 
        setTimeout(() => {
          if (config?.isBotActive) {
            console.log("Bot: Reiniciando ciclo após 'sem entrada'...");
            startBotCycle();
          } else {
            setBotStatus('idle');
          }
        }, 10000); // Wait 10s before next analysis
        return;
      }

      setBotStatus('trading');
      setTimer(getTimeframeSeconds(activeTimeframe));
    };

    runCycle();
  };

  useEffect(() => {
    let interval: any;
    if (botStatus === 'trading' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (botStatus === 'trading' && timer === 0) {
      if (!currentTrade) {
        setBotStatus('idle');
        return;
      }
      // Use botAccuracy from global config set by admin (0-100)
      const accuracy = Math.min(100, Math.max(0, botAccuracy));
      const isWin = (Math.random() * 100) < accuracy;
      setBotStatus(isWin ? 'win' : 'loss');
      
      // Update history locally for immediate feedback
      const tradeValue = isWin ? currentTrade.amount * (currentTrade.payout / 100) : -currentTrade.amount;
      const tfSeconds = getTimeframeSeconds(currentTrade.timeframe || 'M1');
      const newTrade = {
        pair: currentTrade.pair,
        entryTime: new Date(Date.now() - (tfSeconds * 1000)).toISOString(),
        exitTime: new Date().toISOString(),
        result: isWin ? 'win' : 'loss',
        value: tradeValue,
        strategy: currentTrade.strategy,
        timeframe: currentTrade.timeframe || 'M1',
        isAutoTrade: config?.isAutoTrade
      };
      
      // Persist to backend and Update Balance
      if (user?.uid) {
        const newBalance = (user.balance || 0) + tradeValue;
        
        // Update trades table
        supabase.from('trades').insert([{
           id: Math.random().toString(36).substr(2, 9),
           user_id: user.uid,
           pair: newTrade.pair,
           entry_time: newTrade.entryTime,
           exit_time: newTrade.exitTime,
           result: newTrade.result,
           value: newTrade.value
        }]).then(({ error }) => {
           if (error) console.error("Error saving trade:", error);
        });

        // Update users table balance
        supabase.from('users').update({ balance: newBalance }).eq('uid', user.uid).then(({ error }) => {
          if (error) console.error("Error updating user balance:", error);
        });

        // Update local state
        const updatedUser = { ...user, balance: newBalance };
        setUser(updatedUser);
        localStorage.setItem('profitus_user', JSON.stringify(updatedUser));
      }

      setHistory(prev => [{ ...newTrade, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
      
      // Check Subscription
      checkUsage();
      
      setTimeout(() => {
        if (config?.isBotActive) {
          startBotCycle();
        } else {
          setBotStatus('idle');
        }
      }, 5000); // Show result for 5s
    }
    return () => clearInterval(interval);
  }, [botStatus, timer, config?.isBotActive, currentTrade, user?.uid]);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin State
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [pendingDays, setPendingDays] = useState<Record<string, number>>({});
  const [pendingMargins, setPendingMargins] = useState<Record<string, number>>({});
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [selectedDepositAmount, setSelectedDepositAmount] = useState<number | null>(null);
  const [isCreatingDeposit, setIsCreatingDeposit] = useState(false);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isCreatingWithdraw, setIsCreatingWithdraw] = useState(false);
  const [userWithdrawals, setUserWithdrawals] = useState<WithdrawRequest[]>([]);
  const [showEditCredentialsModal, setShowEditCredentialsModal] = useState(false);
  const [userToEditCredentials, setUserToEditCredentials] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('profitus_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchUserData(u.uid, true);
    } else {
      setLoading(false);
    }
    fetchGlobalConfig();
  }, []);

  const fetchGlobalConfig = async () => {
    try {
      const { data, error } = await supabase.from('global_config').select('*').single();
      if (!error && data) setGlobalConfig({
        pixKey: data.pix_key,
        plan1_amount: data.plan1_amount, plan1_pix: data.plan1_pix,
        plan2_amount: data.plan2_amount, plan2_pix: data.plan2_pix,
        plan3_amount: data.plan3_amount, plan3_pix: data.plan3_pix,
        plan4_amount: data.plan4_amount, plan4_pix: data.plan4_pix,
        bot_accuracy: data.bot_accuracy ?? 80,
        disabled_niches: data.disabled_niches || []
      } as any);
    } catch (error) {
      console.error("Error fetching global config:", error);
    }
  };

  const checkUsage = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('users').select('available_days, balance').eq('uid', user.uid).single();
      if (!error && data) {
        setUser(prev => prev ? { ...prev, availableDays: data.available_days, balance: data.balance } : null);
      }
    } catch (error) {
      console.error("Error checking usage:", error);
    }
  };
  const fetchUserData = async (uid: string, initial = false) => {
    try {
      const [userRes, configRes, historyRes, withdrawsRes] = await Promise.all([
        supabase.from('users').select('*').eq('uid', uid).single(),
        supabase.from('configs').select('*').eq('user_id', uid).single(),
        supabase.from('trades').select('*').eq('user_id', uid),
        supabase.from('withdraw_requests').select('*').eq('user_id', uid)
      ]);
      
      if (!userRes.error && userRes.data) {
        const u = {
           uid: userRes.data.uid, username: userRes.data.username,
           firstName: userRes.data.first_name, lastName: userRes.data.last_name, fullName: userRes.data.full_name,
           cpf: userRes.data.cpf, email: userRes.data.email, password: userRes.data.password, whatsapp: userRes.data.whatsapp,
           role: userRes.data.role, status: userRes.data.status, createdAt: userRes.data.created_at,
           availableDays: userRes.data.available_days, balance: userRes.data.balance
        };
        setUser(u);
        localStorage.setItem('profitus_user', JSON.stringify(u));
      }
      if (!configRes.error && configRes.data) {
        setConfig({
           userId: configRes.data.user_id, accountType: configRes.data.account_type, isBotActive: configRes.data.is_bot_active,
           strategy: configRes.data.strategy, timeframe: configRes.data.timeframe, dailyProfitTarget: configRes.data.daily_profit_target,
           dailyStopLoss: configRes.data.daily_stop_loss, investmentAmount: configRes.data.investment_amount,
           minPayout: configRes.data.min_payout, pairs: configRes.data.pairs, isAutoTrade: configRes.data.is_auto_trade
        });
      }
      if (!historyRes.error && historyRes.data) {
        setHistory(historyRes.data.map((t: any) => ({ ...t, userId: t.user_id, entryTime: t.entry_time, exitTime: t.exit_time })));
      }
      if (!withdrawsRes.error && withdrawsRes.data) {
        setUserWithdrawals(withdrawsRes.data.map((w: any) => ({ ...w, userId: w.user_id, createdAt: w.created_at })));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      const interval = setInterval(() => {
        fetchUserData(user.uid);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.uid]);

  // Admin Data Fetching
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchAdminData = async () => {
        try {
          const [usersRes, depositsRes, withdrawsRes] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('deposit_requests').select('*'),
            supabase.from('withdraw_requests').select('*')
          ]);
          if (!usersRes.error && usersRes.data) {
            const mappedUsers = usersRes.data.map(u => ({
              uid: u.uid, username: u.username, firstName: u.first_name, lastName: u.last_name, fullName: u.full_name,
              cpf: u.cpf, email: u.email, password: u.password, whatsapp: u.whatsapp, role: u.role, status: u.status,
              createdAt: u.created_at, availableDays: u.available_days, balance: u.balance
            }));
            setAllUsers(mappedUsers);
            setActiveUsersCount(mappedUsers.filter((u: any) => u.status === 'active').length);
          }
          if (!depositsRes.error && depositsRes.data) {
            setDepositRequests(depositsRes.data.map(d => ({...d, userId: d.user_id, createdAt: d.created_at})));
          }
          if (!withdrawsRes.error && withdrawsRes.data) {
            setWithdrawRequests(withdrawsRes.data.map(w => ({...w, userId: w.user_id, createdAt: w.created_at})));
          }
        } catch (error) {
          console.error("Error loading admin data:", error);
        }
      };
      
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 5000); // Poll for updates
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      if (isLogin) {
         const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single();
         if (data && !error) {
            if (data.status === 'blocked') {
                setAuthError('Sua conta está bloqueada.');
                setLoading(false);
                return;
            }
            const u = {
               uid: data.uid, username: data.username, firstName: data.first_name, lastName: data.last_name, fullName: data.full_name,
               cpf: data.cpf, email: data.email, password: data.password, whatsapp: data.whatsapp, role: data.role, status: data.status,
               createdAt: data.created_at, availableDays: data.available_days, balance: data.balance
            };
            setUser(u);
            localStorage.setItem('profitus_user', JSON.stringify(u));
            fetchUserData(u.uid);
         } else {
            setAuthError('Usuário ou senha incorretos.');
         }
      } else {
         const { data: existing } = await supabase.from('users').select('uid').eq('username', username).single();
         if (existing) {
             setAuthError("Usuário já cadastrado.");
             setLoading(false);
             return;
         }
         const uid = Math.random().toString(36).substr(2, 9);
         const newUser = {
            uid, username, first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`,
            cpf, email: `${username}@example.com`, password, whatsapp, role: "user", status: "active", available_days: 0, balance: 0
         };
         const { data, error } = await supabase.from('users').insert([newUser]).select().single();
         if (error || !data) {
            setAuthError("Erro ao registrar no banco.");
         } else {
            await supabase.from('configs').insert([{ user_id: uid, account_type: "demo", is_bot_active: false, strategy: "AUTO_BEST", timeframe: "M1", daily_profit_target: 100, daily_stop_loss: 50, investment_amount: 5, min_payout: 80, pairs: ["EUR/USD", "GBP/USD", "USD/JPY"] }]);
            const u = {
               uid: data.uid, username: data.username, firstName: data.first_name, lastName: data.last_name, fullName: data.full_name,
               cpf: data.cpf, email: data.email, password: data.password, whatsapp: data.whatsapp, role: data.role, status: data.status,
               createdAt: data.created_at, availableDays: data.available_days, balance: data.balance
            };
            setUser(u);
            localStorage.setItem('profitus_user', JSON.stringify(u));
            fetchUserData(uid);
         }
      }
    } catch (error: any) {
      setAuthError('Erro de conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setConfig(null);
    localStorage.removeItem('profitus_user');
  };

  const toggleBot = async () => {
    if (!config || !user) {
      console.log("Bot: Não foi possível alternar o robô. Config ou User ausentes.", { config, user });
      return;
    }
    
    const nextActiveState = !config.isBotActive;
    console.log(`Bot: Alternando estado para ${nextActiveState ? 'ATIVO' : 'DESATIVADO'}`);
    
    // Check management limits before activating
    if (nextActiveState) {
      console.log(`Bot: Verificando condições para ativação. Dias: ${user.availableDays}, Saldo: ${user.balance}`);
      
      // Block if Profit Target or Stop Loss is already reached
      if (config.dailyProfitTarget && stats.profit >= config.dailyProfitTarget) {
        setShowResultModal({ show: true, type: 'profit' });
        return;
      }
      if (config.dailyStopLoss && stats.profit <= -config.dailyStopLoss) {
        setShowResultModal({ show: true, type: 'loss' });
        return;
      }

      if (user.availableDays <= 0) {
        console.log("Bot: Bloqueado por falta de dias ativos.");
        setBotError(`Você não possui dias ativos. Entre em contato com o suporte.`);
        setTimeout(() => setBotError(''), 8000);
        return;
      }
      
      const currentMargin = (user.balance || 0) + history.reduce((acc, h) => acc + (h.value || 0), 0);
      if (currentMargin <= 0) {
        console.log("Bot: Bloqueado por falta de saldo.");
        setBotError(`Você não possui saldo (margem) para operar. Faça um depósito.`);
        setTimeout(() => setBotError(''), 8000);
        return;
      }
    }

    try {
      const { data, error } = await supabase.from('configs').update({ is_bot_active: nextActiveState }).eq('user_id', user.uid).select().single();
      if (!error && data) {
        const updatedConfig = { ...config, isBotActive: nextActiveState };
        console.log("Bot: Configuração atualizada com sucesso:", updatedConfig);
        setConfig(updatedConfig);
        if (nextActiveState) {
          setHistory([]);
          startBotCycle();
        }
      } else {
        console.error("Bot: Erro ao atualizar configuração:", error);
        setBotError("Erro ao ativar o robô no servidor.");
      }
    } catch (error) {
      console.error("Bot: Erro de conexão ao alternar robô:", error);
      setBotError("Erro de conexão ao ativar o robô.");
    }
  };

  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean, message: string } | null>(null);
  const [localConfig, setLocalConfig] = useState<Partial<TradingConfig>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const testAIConnection = async () => {
    setIsTestingAI(true);
    setAiTestResult(null);
    try {
      const key = import.meta.env.VITE_GEMINI_API_KEY;
      if (!key) {
        throw new Error("API Key não configurada nos Segredos do projeto.");
      }
      const testPrompt = "Responda apenas com a palavra 'OK' se você estiver funcionando.";
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: testPrompt }] }]
      });
      if (response.text.includes("OK")) {
        setAiTestResult({ success: true, message: "Conexão com Gemini AI estabelecida com sucesso!" });
      } else {
        setAiTestResult({ success: false, message: "Resposta inesperada da IA: " + response.text });
      }
    } catch (error: any) {
      console.error("AI Test Error:", error);
      setAiTestResult({ success: false, message: error.message || "Erro ao conectar com Gemini AI." });
    } finally {
      setIsTestingAI(false);
    }
  };

  const handleLocalUpdate = (updates: Partial<TradingConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  useEffect(() => {
    if (config && !isDirty) {
      setLocalConfig(config);
    }
  }, [config, isDirty]);

  const updateConfig = async (updates: Partial<TradingConfig>) => {
    if (!config || !user) return;
    setIsSaving(true);
    try {
      const mappedUpdates: any = {};
      if (updates.accountType) mappedUpdates.account_type = updates.accountType;
      if (updates.isBotActive !== undefined) mappedUpdates.is_bot_active = updates.isBotActive;
      if (updates.strategy) mappedUpdates.strategy = updates.strategy;
      if (updates.timeframe) mappedUpdates.timeframe = updates.timeframe;
      if (updates.dailyProfitTarget) mappedUpdates.daily_profit_target = updates.dailyProfitTarget;
      if (updates.dailyStopLoss) mappedUpdates.daily_stop_loss = updates.dailyStopLoss;
      if (updates.investmentAmount) mappedUpdates.investment_amount = updates.investmentAmount;
      if (updates.minPayout) mappedUpdates.min_payout = updates.minPayout;
      if (updates.pairs) mappedUpdates.pairs = updates.pairs;
      if (updates.isAutoTrade !== undefined) mappedUpdates.is_auto_trade = updates.isAutoTrade;

      const { data, error } = await supabase.from('configs').update(mappedUpdates).eq('user_id', user.uid).select().single();
      if (!error && data) {
        setConfig({ ...config, ...updates });
        setLocalConfig({ ...config, ...updates });
        setIsDirty(false);
      }
    } catch (error) {
      console.error("Error updating config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUserStatus = async (targetUserId: string, currentStatus: UserStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      const { data, error } = await supabase.from('users').update({ status: newStatus }).eq('uid', targetUserId).select().single();
      if (!error && data) {
         setAllUsers(prev => prev.map(u => u.uid === targetUserId ? { ...u, status: data.status as UserStatus } : u));
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const updateUserDays = async (targetUserId: string, newDays: number) => {
    try {
      const { data, error } = await supabase.from('users').update({ available_days: newDays }).eq('uid', targetUserId).select().single();
      if (!error && data) {
        setAllUsers(prev => prev.map(u => u.uid === targetUserId ? { ...u, availableDays: data.available_days } : u));
      }
    } catch (error) {
      console.error("Error updating user days:", error);
    }
  };

  const updateUserMargin = async (targetUserId: string, margin: number) => {
    try {
      const { error } = await supabase.from('users').update({ balance: margin }).eq('uid', targetUserId);
      if (error) console.error("Error updating user margin:", error);
    } catch (error) {
      console.error("Error updating user margin:", error);
    }
  };

  const updateCredentials = async (targetUserId: string, credentials: { username?: string, password?: string }) => {
    try {
      const { error } = await supabase.from('users').update(credentials).eq('uid', targetUserId);
      if (!error) {
        setShowEditCredentialsModal(false);
        alert('Credenciais atualizadas com sucesso!');
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
    }
  };

  const createDepositRequest = async (amount: number) => {
    if (!user) return;
    setIsCreatingDeposit(true);
    try {
      const newReq = {
          id: Math.random().toString(36).substr(2, 9),
          user_id: user.uid,
          username: user.username,
          amount,
          status: 'pending'
      };
      const { error } = await supabase.from('deposit_requests').insert([newReq]);
      if (!error) {
        setSelectedDepositAmount(amount);
      }
    } catch (error) {
      console.error("Error creating deposit request:", error);
    } finally {
      setIsCreatingDeposit(false);
    }
  };

  const updateDepositStatus = async (id: string, status: 'pending' | 'completed') => {
    try {
      const { error } = await supabase.from('deposit_requests').update({ status }).eq('id', id);
      if (!error) {
        setDepositRequests(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      }
    } catch (error) {
      console.error("Error updating deposit status:", error);
    }
  };

  const deleteDepositRequest = async (id: string) => {
    try {
      const { error } = await supabase.from('deposit_requests').delete().eq('id', id);
      if (!error) {
        setDepositRequests(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Error deleting deposit request:", error);
    }
  };

  const createWithdrawRequest = async (amount: number, method: string, details: string) => {
    if (!user) return;
    setIsCreatingWithdraw(true);
    try {
      const newReq = {
          id: Math.random().toString(36).substr(2, 9),
          user_id: user.uid,
          username: user.username,
          amount,
          method,
          details,
          status: 'pending'
      };
      const { error } = await supabase.from('withdraw_requests').insert([newReq]);
      if (!error) {
        // Update user balance in DB
        const newBalance = (user.balance || 0) - amount;
        await supabase.from('users').update({ balance: newBalance }).eq('uid', user.uid);
        
        // Update local status
        const updatedUser = { ...user, balance: newBalance };
        setUser(updatedUser);
        localStorage.setItem('profitus_user', JSON.stringify(updatedUser));
        
        // Update local withdrawal list
        const formattedReq = { ...newReq, userId: newReq.user_id, createdAt: new Date().toISOString() };
        setUserWithdrawals(prev => [formattedReq, ...prev]);
        setWithdrawRequests(prev => [formattedReq, ...prev]);

        setShowWithdrawModal(false);
        alert("Solicitação de saque enviada com sucesso! Prazo de até 48 horas.");
      }
    } catch (error) {
      console.error("Error creating withdraw request:", error);
    } finally {
      setIsCreatingWithdraw(false);
    }
  };

  const updateWithdrawStatus = async (id: string, status: 'completed' | 'cancelled') => {
    try {
      // Find the request first to get amount and user_id
      const { data: request, error: fetchError } = await supabase.from('withdraw_requests').select('*').eq('id', id).single();
      if (fetchError || !request) return;

      const { error } = await supabase.from('withdraw_requests').update({ status }).eq('id', id);
      if (!error) {
        setWithdrawRequests(prev => prev.map(w => w.id === id ? { ...w, status } : w));
        
        // If cancelled, refund balance
        if (status === 'cancelled') {
           const { data: userData } = await supabase.from('users').select('balance').eq('uid', request.user_id).single();
           if (userData) {
              const newBalance = (userData.balance || 0) + Number(request.amount);
              await supabase.from('users').update({ balance: newBalance }).eq('uid', request.user_id);
              
              // If the cancelled withdrawal belongs to the current logged-in user, update local state
              if (user && user.uid === request.user_id) {
                const updatedUser = { ...user, balance: newBalance };
                setUser(updatedUser);
                localStorage.setItem('profitus_user', JSON.stringify(updatedUser));
                setUserWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'cancelled' } : w));
              }
           }
        }
      }
    } catch (error) {
      console.error("Error updating withdraw status:", error);
    }
  };

  const deleteWithdrawRequest = async (id: string) => {
    try {
       const { error } = await supabase.from('withdraw_requests').delete().eq('id', id);
      if (!error) {
        setWithdrawRequests(prev => prev.filter(w => w.id !== id));
      }
    } catch (error) {
      console.error("Error deleting withdraw request:", error);
    }
  };

  const deleteUser = async (targetUserId: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      const { error } = await supabase.from('users').delete().eq('uid', targetUserId);
      if (!error) {
        setAllUsers(prev => prev.filter(u => u.uid !== targetUserId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
            <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto relative z-10" />
          </div>
          <p className="text-green-700/60 font-medium tracking-widest text-[10px] uppercase">Carregando PROFITUS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-30" />
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10 rotate-12">
                <TrendingUp className="w-10 h-10 text-white -rotate-12" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">PROFITUS</h1>
            <p className="text-gray-400 mt-3 font-medium text-sm">Sua inteligência em investimentos</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Nome" 
                    icon={Users} 
                    placeholder="Seu nome"
                    value={firstName}
                    onChange={(e: any) => setFirstName(e.target.value)}
                    required
                  />
                  <Input 
                    label="Sobrenome" 
                    icon={Users} 
                    placeholder="Seu sobrenome"
                    value={lastName}
                    onChange={(e: any) => setLastName(e.target.value)}
                    required
                  />
                </div>
              )}
              {!isLogin && (
                <Input 
                  label="CPF" 
                  icon={FileText} 
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e: any) => setCpf(e.target.value)}
                  required
                />
              )}
              <Input 
                label="Usuário" 
                icon={Users} 
                placeholder="Seu nome de usuário"
                value={username}
                onChange={(e: any) => setUsername(e.target.value)}
                required
              />
              {!isLogin && (
                <Input 
                  label="Telefone" 
                  icon={Smartphone} 
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e: any) => setWhatsapp(e.target.value)}
                  required
                />
              )}
              <Input 
                label="Senha" 
                type="password" 
                icon={Lock} 
                placeholder="••••••••"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
              />
              
              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {authError}
                </div>
              )}

              <Button type="submit" className="w-full py-3.5" loading={loading}>
                {isLogin ? 'Entrar no Painel' : 'Criar Minha Conta'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-semibold text-gray-400 hover:text-emerald-400 transition-colors uppercase tracking-wider"
              >
                {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B0C0E]">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0C0E]/95 backdrop-blur-3xl sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">PROFITUS</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 border-r border-white/10 bg-[#0B0C0E]/95 backdrop-blur-3xl flex flex-col z-[60] transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 hidden lg:flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-float">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">PROFITUS</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 lg:mt-4">
          <button 
            onClick={() => {
              setActiveTab('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
              activeTab === 'dashboard' 
                ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(31,217,18,0.3)]" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <LayoutDashboard className={cn("w-5 h-5 relative z-10", activeTab === 'dashboard' ? "text-white" : "text-gray-400 group-hover:text-white")} />
            <span className="font-bold text-sm relative z-10">Dashboard</span>
            {activeTab === 'dashboard' && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500" />
            )}
          </button>
          <button 
            onClick={() => {
              setActiveTab('settings');
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
              activeTab === 'settings' 
                ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(31,217,18,0.3)]" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings className={cn("w-5 h-5 relative z-10", activeTab === 'settings' ? "text-white" : "text-gray-400 group-hover:text-white")} />
            <span className="font-bold text-sm relative z-10">Configurações</span>
            {activeTab === 'settings' && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500" />
            )}
          </button>
          <button 
            onClick={() => {
              setShowDepositModal(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <Wallet className="w-5 h-5 relative z-10 text-emerald-400" />
            <span className="font-bold text-sm relative z-10">Depositar</span>
          </button>
          <button 
            onClick={() => {
              setShowWithdrawModal(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <DollarSign className="w-5 h-5 relative z-10 text-emerald-400" />
            <span className="font-bold text-sm relative z-10">Saque</span>
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => {
                setActiveTab('admin');
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                activeTab === 'admin' 
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(31,217,18,0.3)]" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <Shield className={cn("w-5 h-5", activeTab === 'admin' ? "text-white" : "text-gray-400 group-hover:text-white")} />
                <span className="font-bold text-sm">Painel ADM</span>
              </div>
              {activeTab === 'admin' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500" />
              )}
            </button>
          )}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm font-black shadow-lg text-white">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white leading-none mb-1">{user?.fullName || user?.username}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black opacity-60">@{user?.username}</p>
            </div>
          </div>
          
          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[8px] text-amber-500/50 uppercase font-black tracking-widest">Dias Restantes</p>
              <Clock className="w-3 h-3 text-amber-500" />
            </div>
            <p className="text-lg font-black text-white">{user?.availableDays ?? 0} dias</p>
            <button 
              onClick={() => {
                const message = encodeURIComponent("Olá, eu gostaria de renovar meu robo PROFITUS.");
                window.open(`https://wa.me/5569996078041?text=${message}`, '_blank');
                setIsMobileMenuOpen(false);
              }}
              className="w-full mt-2 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
            >
              Renovar
            </button>
          </div>

          <button 
            onClick={() => {
              const message = encodeURIComponent("Olá, preciso de suporte com o robô PROFITUS.");
              window.open(`https://wa.me/5569996078041?text=${message}`, '_blank');
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-all font-semibold text-sm mb-2"
          >
            <Headphones className="w-5 h-5" />
            <span>Suporte</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64 animate-glow pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -ml-32 -mb-32 animate-glow pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {userWithdrawals.some(w => w.status === 'cancelled') && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Atenção: Saque Cancelado</p>
                      <p className="text-xs text-gray-400">Uma de suas solicitações de saque foi cancelada. Por favor, revise seus dados de recebimento e tente novamente.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all shrink-0"
                  >
                    Revisar Dados
                  </button>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Bem-vindo, {user?.username}</h2>
                  <p className="text-gray-400 text-sm sm:text-base">Acompanhe seu desempenho em tempo real.</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {user?.balance <= 0 && user?.role !== 'admin' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 font-bold text-[10px] uppercase tracking-widest"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Saldo Zerado</span>
                    </motion.div>
                  )}
                  <button 
                    onClick={() => window.open('https://u3.shortink.io/register?utm_campaign=825331&utm_source=affiliate&utm_medium=sr&a=I1E2AjK7BmBUHR&al=1649319&ac=salaviptraderacademic&cid=916030&code=50START', '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all border border-blue-500/10 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Criar Conta</span>
                  </button>
                  <button 
                    onClick={() => {
                      const message = encodeURIComponent("Olá, preciso de suporte com o robô PROFITUS.");
                      window.open(`https://wa.me/5569996078041?text=${message}`, '_blank');
                    }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/10 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Suporte</span>
                  </button>
                  {botError && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 flex items-center gap-2 text-red-500 text-xs font-bold"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {botError}
                    </motion.div>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Status do Robô</p>
                    <p className={cn("text-sm font-bold", config?.isBotActive ? "text-emerald-400" : "text-red-400")}>
                      {config?.isBotActive ? (
                        botStatus === 'analyzing' ? 'ANALISANDO...' : 
                        botStatus === 'waiting' ? 'AGUARDANDO...' : 
                        'OPERANDO'
                      ) : 'DESLIGADO'}
                    </p>
                  </div>
                  <button 
                    onClick={toggleBot}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-2xl",
                      config?.isBotActive 
                        ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600" 
                        : "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                    )}
                  >
                    <Power className="w-8 h-8 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard title="Ganhos" value={`R$ ${(stats.profit ?? 0).toFixed(2)}`} icon={Wallet} color="bg-emerald-500 shadow-emerald-500/20" />
                <StatCard title="Vitórias" value={stats.wins} icon={CheckCircle2} color="bg-blue-500 shadow-blue-500/20" />
                <StatCard title="Derrotas" value={stats.losses} icon={XCircle} color="bg-rose-500 shadow-rose-500/20" />
                <StatCard title="Margem" value={`R$ ${(stats.margin ?? 0).toFixed(2)}`} icon={Activity} color="bg-violet-500 shadow-violet-500/20" />
                <StatCard title="Dias Disponíveis" value={`${user?.availableDays ?? 0} dias`} icon={Clock} color="bg-amber-500 shadow-amber-500/20" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Inteligência Artificial PROFITUS" className="lg:col-span-2 overflow-hidden relative">
                  <div className="h-auto min-h-[350px] w-full flex flex-col items-center justify-center relative py-8">
                    <AnimatePresence mode="wait">
                      {botStatus === 'idle' && (
                        <motion.div 
                          key="idle"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          className="text-center space-y-4"
                        >
                          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                            <Power className="w-10 h-10 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-400">Robô em Standby</h3>
                            <p className="text-sm text-gray-500">Ligue o botão power para iniciar as operações.</p>
                          </div>
                        </motion.div>
                      )}

                      {botStatus === 'analyzing' && (
                        <motion.div 
                          key="analyzing"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          className="text-center space-y-8 py-10 relative overflow-hidden w-full"
                        >
                          {/* Background Neural Grid & Data Streams */}
                          <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
                            
                            {/* Data Streams (Matrix-like) */}
                            {[...Array(10)].map((_, i) => (
                              <motion.div
                                key={`stream-${i}`}
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: 400, opacity: [0, 0.5, 0] }}
                                transition={{ 
                                  duration: 2 + Math.random() * 3, 
                                  repeat: Infinity, 
                                  delay: Math.random() * 2,
                                  ease: "linear"
                                }}
                                className="absolute text-[8px] font-mono text-emerald-500/30 whitespace-nowrap"
                                style={{ left: `${Math.random() * 100}%` }}
                              >
                                {Array(10).fill(0).map(() => Math.round(Math.random())).join('')}
                              </motion.div>
                            ))}

                            {[...Array(20)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ 
                                  opacity: [0, 0.5, 0],
                                  scale: [0.5, 1.5, 0.5],
                                  x: Math.random() * 400 - 200,
                                  y: Math.random() * 400 - 200
                                }}
                                transition={{ 
                                  duration: 3 + Math.random() * 5, 
                                  repeat: Infinity,
                                  delay: Math.random() * 2
                                }}
                                className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
                              />
                            ))}
                          </div>

                          <div className="relative w-48 h-48 mx-auto">
                            {/* Pulse Waves */}
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={`pulse-${i}`}
                                animate={{ 
                                  scale: [1, 2],
                                  opacity: [0.3, 0]
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity, 
                                  delay: i * 0.6,
                                  ease: "easeOut"
                                }}
                                className="absolute inset-0 border border-emerald-500/20 rounded-full"
                              />
                            ))}

                            {/* Floating Data Labels */}
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={`label-${i}`}
                                animate={{ 
                                  y: [0, -40, 0],
                                  opacity: [0, 1, 0],
                                  x: [0, (i % 2 === 0 ? 20 : -20), 0]
                                }}
                                transition={{ 
                                  duration: 4, 
                                  repeat: Infinity, 
                                  delay: i * 1,
                                  ease: "easeInOut"
                                }}
                                className="absolute text-[6px] font-mono text-emerald-400/40 uppercase tracking-tighter"
                                style={{ 
                                  top: i < 2 ? '20%' : '70%',
                                  left: i % 2 === 0 ? '10%' : '80%'
                                }}
                              >
                                {['SYNCING...', '0x4F_DATA', 'PATTERN_MATCH', 'NEURAL_LINK'][i]}
                              </motion.div>
                            ))}

                            {/* Outer HUD Rings */}
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 border border-dashed border-emerald-500/30 rounded-full"
                            />
                            <motion.div 
                              animate={{ rotate: -360 }}
                              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-4 border-2 border-emerald-500/10 border-t-emerald-500/40 rounded-full"
                            />
                            
                            {/* Scanning Line */}
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 z-10"
                            >
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-gradient-to-t from-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                            </motion.div>

                            {/* Neural Core */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="relative">
                                {/* Glitch Effect Layer */}
                                <motion.div
                                  animate={{ 
                                    x: [0, -2, 2, 0],
                                    opacity: [1, 0.8, 1]
                                  }}
                                  transition={{ 
                                    duration: 0.2, 
                                    repeat: Infinity, 
                                    repeatDelay: 3,
                                    ease: "linear"
                                  }}
                                  className="absolute inset-0 text-emerald-500/30 blur-[2px] z-10"
                                >
                                  <Cpu className="w-16 h-16" />
                                </motion.div>

                                <motion.div
                                  animate={{ 
                                    scale: [1, 1.1, 1],
                                    filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="relative z-20"
                                >
                                  <Cpu className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                                </motion.div>
                                
                                {/* Orbiting Nodes with Connection Lines */}
                                {[...Array(6)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ 
                                      rotate: 360,
                                      scale: [1, 1.2, 1]
                                    }}
                                    transition={{ 
                                      rotate: { duration: 5 + i, repeat: Infinity, ease: "linear" },
                                      scale: { duration: 2, repeat: Infinity, delay: i * 0.3 }
                                    }}
                                    className="absolute inset-0 pointer-events-none"
                                  >
                                    {/* Connection Line */}
                                    <div 
                                      className="absolute top-1/2 left-1/2 w-px bg-gradient-to-t from-emerald-500/40 to-transparent origin-bottom"
                                      style={{ 
                                        height: `${30 + i * 5}px`,
                                        transform: `translate(-50%, -100%)`
                                      }}
                                    />
                                    <div 
                                      className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,1)]"
                                      style={{ transform: `translateY(-${30 + i * 5}px)` }}
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Hexagon Grid Overlay */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                              <div className="w-full h-full border-[20px] border-emerald-500/10 rounded-full" />
                            </div>
                          </div>

                          <div className="space-y-4 relative z-10">
                            <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] animate-pulse">
                                ANÁLISE PROFISSIONAL: PROCESSAMENTO NEURAL
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-center gap-1">
                              <h3 className="text-3xl font-black tracking-tighter text-white uppercase relative">
                                <motion.span
                                  animate={{ 
                                    textShadow: [
                                      "0 0 0px rgba(16,185,129,0)",
                                      "2px 0 10px rgba(16,185,129,0.5)",
                                      "-2px 0 10px rgba(239,68,68,0.3)",
                                      "0 0 0px rgba(16,185,129,0)"
                                    ]
                                  }}
                                  transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}
                                >
                                  {botStatus === 'analyzing' ? 'Analisando' : 
                                   botStatus === 'waiting' ? 'Aguardando' : 
                                   'Aguardando'} <span className="text-emerald-400">Padrões</span>
                                </motion.span>
                              </h3>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Status: <span className="text-white">
                                  {botStatus === 'analyzing' ? 'PROCESSANDO IA' : 
                                   botStatus === 'waiting' ? 'AGUARDANDO OPORTUNIDADE' : 
                                   'EM ESPERA'}
                                </span> | Par: <span className="text-white">{config?.pairs?.[0] || 'EUR/USD'}</span>
                              </p>
                            </div>

                            {preAlert && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-emerald-500/20 border-2 border-emerald-500/40 p-5 rounded-2xl space-y-3 shadow-[0_0_30px_rgba(16,185,129,0.2)] max-w-sm mx-auto"
                              >
                                <div className="flex items-center justify-center gap-3 text-emerald-400">
                                  <Bell className="w-5 h-5 animate-bounce" />
                                  <span className="text-xs font-black uppercase tracking-[0.2em]">PRÉ-ALERTA IDENTIFICADO</span>
                                </div>
                                <div className="h-px bg-emerald-500/20 w-full" />
                                <p className="text-base font-black text-white leading-tight">
                                  {preAlert}
                                </p>
                              </motion.div>
                            )}

                            <div className="flex justify-center items-end gap-1.5 h-8">
                              {[...Array(15)].map((_, i) => (
                                <motion.div 
                                  key={i}
                                  animate={{ 
                                    height: [4, Math.random() * 24 + 8, 4],
                                    opacity: [0.3, 1, 0.3]
                                  }}
                                  transition={{ 
                                    duration: 0.5 + Math.random(), 
                                    repeat: Infinity, 
                                    delay: i * 0.05 
                                  }}
                                  className="w-1.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full"
                                />
                              ))}
                            </div>

                            <div className="max-w-xs mx-auto grid grid-cols-2 gap-3">
                              <div className="glass-card p-3 rounded-xl border-white/5 text-left">
                                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Sincronismo</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                  <p className="text-xs font-bold text-white">99.8%</p>
                                </div>
                              </div>
                              <div className="glass-card p-3 rounded-xl border-white/5 text-left">
                                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Latência</p>
                                <div className="flex items-center gap-2">
                                  <Zap className="w-3 h-3 text-emerald-400" />
                                  <p className="text-xs font-bold text-white">12ms</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {botStatus === 'trading' && (
                        <motion.div 
                          key="trading"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="w-full max-w-2xl space-y-6"
                        >
                          <div className="flex items-center justify-between bg-emerald-600/10 p-4 rounded-2xl border border-emerald-500/20">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                                <Zap className="w-6 h-6 text-white animate-bounce" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black tracking-tight">{currentTrade?.strategy} | {currentTrade?.timeframe}</h3>
                                <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
                                  {config?.isAutoTrade ? 'Ordem Aberta Automática' : 'Sinal Gerado (Aguardando)'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Expiração</p>
                              <div className="flex items-center gap-2 justify-end">
                                <Clock className="w-4 h-4 text-emerald-400" />
                                <span className="text-2xl font-black font-mono text-white">
                                  {Math.floor(timer / 60)}:{(timer % 60) < 10 ? `0${timer % 60}` : timer % 60}
                                </span>
                              </div>
                            </div>
                          </div>

                          {currentTrade?.preAlertText && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2"
                            >
                              <div className="flex items-center gap-2 text-emerald-400">
                                <Bell className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">DETALHES DO SINAL</span>
                              </div>
                              <p className="text-sm font-bold text-white leading-relaxed">
                                {currentTrade?.preAlertText}
                              </p>
                            </motion.div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-4 rounded-2xl border-white/5">
                              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Paridade</p>
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-emerald-400" />
                                <p className="text-sm font-bold text-white">{currentTrade?.pair}</p>
                              </div>
                            </div>
                            <div className="glass-card p-4 rounded-2xl border-white/5">
                              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Mercado</p>
                              <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-400" />
                                <p className="text-sm font-bold text-white">{currentTrade?.isOTC ? 'OTC' : 'ABERTO'}</p>
                              </div>
                            </div>
                            <div className="glass-card p-4 rounded-2xl border-white/5">
                              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Payout</p>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-400" />
                                <p className="text-sm font-bold text-white">{currentTrade?.payout}%</p>
                              </div>
                            </div>
                            <div className="glass-card p-4 rounded-2xl border-white/5">
                              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Direção</p>
                              <div className="flex items-center gap-2">
                                {currentTrade?.direction === 'CALL' ? (
                                  <>
                                    <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                                    <p className="text-sm font-bold text-emerald-400">COMPRA</p>
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownCircle className="w-4 h-4 text-red-400" />
                                    <p className="text-sm font-bold text-red-400">VENDA</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: "100%" }}
                              animate={{ width: "0%" }}
                              transition={{ duration: 60, ease: "linear" }}
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-700"
                            />
                          </div>
                        </motion.div>
                      )}

                      {(botStatus === 'win' || botStatus === 'loss') && (
                        <motion.div 
                          key="result"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.5 }}
                          className="text-center space-y-6"
                        >
                          <div className="relative">
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={cn(
                                "absolute inset-0 blur-3xl rounded-full",
                                botStatus === 'win' ? "bg-green-500" : "bg-red-500"
                              )}
                            />
                            {/* Particles */}
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ x: 0, y: 0, opacity: 0 }}
                                animate={{ 
                                  x: (Math.random() - 0.5) * 200, 
                                  y: (Math.random() - 0.5) * 200, 
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0]
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity, 
                                  delay: i * 0.1,
                                  ease: "easeOut"
                                }}
                                className={cn(
                                  "absolute left-1/2 top-1/2 w-2 h-2 rounded-full",
                                  botStatus === 'win' ? "bg-green-400" : "bg-red-400"
                                )}
                              />
                            ))}
                            <div className={cn(
                              "w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl relative z-10",
                              botStatus === 'win' ? "bg-green-500" : "bg-red-500"
                            )}>
                              {botStatus === 'win' ? <TrendingUp className="w-16 h-16 text-white" /> : <TrendingDown className="w-16 h-16 text-white" />}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h3 className={cn(
                              "text-5xl font-black tracking-tighter",
                              botStatus === 'win' ? "text-green-600" : "text-red-600"
                            )}>
                              {botStatus === 'win' ? 'VITÓRIA!' : 'DERROTA'}
                            </h3>
                            <p className="text-lg font-bold text-green-950">
                              {botStatus === 'win' ? '+' : '-'} R$ {Math.abs(botStatus === 'win' ? (currentTrade?.amount || 0) * ((currentTrade?.payout || 0) / 100) : (currentTrade?.amount || 0)).toFixed(2)}
                            </p>
                          </div>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5 }}
                            className="h-1 bg-green-200/50 rounded-full overflow-hidden w-48 mx-auto"
                          >
                            <div className={cn(
                              "h-full",
                              botStatus === 'win' ? "bg-green-500" : "bg-red-500"
                            )} />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>


                  </div>
                </Card>


              </div>

              <Card title="Histórico de Operações" icon={RefreshCw}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-white/5">
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Paridade</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Entrada</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Saída</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resultado</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(isConnected ? history : [])
                        .filter(trade => {
                          const today = new Date().toISOString().split('T')[0];
                          return trade.exitTime?.split('T')[0] === today;
                        })
                        .map((trade) => (
                        <tr key={trade.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-emerald-400">
                                {trade.pair.split('/')[0]}
                              </div>
                              <span className="text-sm font-bold text-white">{trade.pair}</span>
                            </div>
                          </td>
                          <td className="py-4 text-xs text-gray-400 font-medium">
                            {new Date(trade.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-4 text-xs text-gray-400 font-medium">
                            {new Date(trade.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1">
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider w-fit",
                                trade.result === 'win' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                              )}>
                                {trade.result}
                              </span>
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border w-fit",
                                trade.isAutoTrade ? "border-emerald-500/20 text-emerald-500/50" : "border-blue-500/20 text-blue-500/50"
                              )}>
                                {trade.isAutoTrade ? 'AUTO' : 'SINAL'}
                              </span>
                            </div>
                          </td>
                          <td className={cn(
                            "py-4 text-sm font-black text-right",
                            trade.result === 'win' ? "text-green-400" : "text-red-400"
                          )}>
                            {trade.result === 'win' ? '+' : ''}R$ {(trade.value ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-green-700/60 font-medium italic">
                            Nenhuma operação realizada ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card title="Histórico de Saques" icon={Wallet}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-white/5">
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Método</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Valor</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {userWithdrawals.map((w) => (
                        <tr key={w.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4 text-xs text-white font-medium">
                            {new Date(w.createdAt).toLocaleDateString('pt-BR')} {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                              {w.method}
                            </span>
                          </td>
                          <td className="py-4 text-sm font-black text-white">
                            R$ {Number(w.amount).toFixed(2)}
                          </td>
                          <td className="py-4 text-right">
                             <span className={cn(
                               "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                               w.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                               w.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                               "bg-red-500/10 text-red-400"
                             )}>
                               {w.status === 'completed' ? 'Concluído' : 
                                w.status === 'pending' ? 'Pendente' : 'Cancelado'}
                             </span>
                          </td>
                        </tr>
                      ))}
                      {userWithdrawals.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-green-700/60 font-medium italic">
                            Nenhuma solicitação de saque encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}


          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-white">Configurações</h2>
                <p className="text-gray-400">Defina os parâmetros de operação do seu robô.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Gerenciamento de Risco" icon={Shield}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Meta Diária (R$)" 
                      type="number" 
                      value={localConfig?.dailyProfitTarget ?? 0}
                      onChange={(e: any) => handleLocalUpdate({ dailyProfitTarget: Number(e.target.value) })}
                    />
                    <Input 
                      label="Stop Loss (R$)" 
                      type="number" 
                      value={localConfig?.dailyStopLoss ?? 0}
                      onChange={(e: any) => handleLocalUpdate({ dailyStopLoss: Number(e.target.value) })}
                    />
                    <Input 
                      label="Valor p/ Entrada (R$)" 
                      type="number" 
                      value={localConfig?.investmentAmount ?? 0}
                      onChange={(e: any) => handleLocalUpdate({ investmentAmount: Number(e.target.value) })}
                    />
                    <Input 
                      label="Payout Mínimo (%)" 
                      type="number" 
                      value={localConfig?.minPayout ?? 0}
                      onChange={(e: any) => handleLocalUpdate({ minPayout: Number(e.target.value) })}
                    />
                  </div>
                </Card>

                <Card title="Estratégia & Pares" icon={Activity}>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">Conexão com IA</p>
                          <p className="text-[10px] text-gray-400">Verifique se o cérebro do robô está ativo.</p>
                        </div>
                        <button 
                          onClick={testAIConnection}
                          disabled={isTestingAI}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          {isTestingAI ? 'Testando...' : 'Testar IA'}
                        </button>
                      </div>
                      {aiTestResult && (
                        <div className={cn(
                          "p-2 rounded-lg text-[10px] font-bold",
                          aiTestResult.success ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        )}>
                          {aiTestResult.message}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Timeframe</label>
                      <select 
                        className="w-full glass-input rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                        value={localConfig?.timeframe ?? 'M1'}
                        onChange={(e) => handleLocalUpdate({ timeframe: e.target.value as any })}
                      >
                        <option value="AUTO">Mais Assertivo (Auto)</option>
                        <option value="S30">S30 (30 Segundos)</option>
                        <option value="M1">M1 (1 Minuto)</option>
                        <option value="M2">M2 (2 Minutos)</option>
                        <option value="M5">M5 (5 Minutos)</option>
                        <option value="M10">M10 (10 Minutos)</option>
                        <option value="M15">M15 (15 Minutos)</option>
                        <option value="M30">M30 (30 Minutos)</option>
                        <option value="H1">H1 (1 Hora)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-bold text-white">Operação Automática</p>
                        <p className="text-[10px] text-gray-400">O robô abrirá ordens automaticamente.</p>
                      </div>
                      <button 
                        onClick={() => handleLocalUpdate({ isAutoTrade: !localConfig?.isAutoTrade })}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-all duration-300",
                          localConfig?.isAutoTrade ? "bg-emerald-500" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full transition-all duration-300",
                          localConfig?.isAutoTrade ? "translate-x-6" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nicho de Ativos</label>
                      <div className="grid grid-cols-1 gap-2">
                        {assetCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedAssetCategory(category.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border",
                              selectedAssetCategory === category.id
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                            )}
                          >
                            <category.icon className={cn("w-5 h-5", selectedAssetCategory === category.id ? "text-emerald-400" : "text-gray-500")} />
                            <span className="font-bold text-sm">{category.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Ativos em {assetCategories.find(c => c.id === selectedAssetCategory)?.name}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {assetCategories.find(c => c.id === selectedAssetCategory)?.assets.map(asset => (
                          <button 
                            key={asset}
                            onClick={() => {
                              const currentPairs = localConfig?.pairs || [];
                              const newPairs = currentPairs.includes(asset)
                                ? currentPairs.filter(p => p !== asset)
                                : [...currentPairs, asset];
                              handleLocalUpdate({ pairs: newPairs });
                            }}
                            className={cn(
                              "py-2.5 rounded-lg text-[10px] font-bold border transition-all",
                              (localConfig?.pairs || []).includes(asset)
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                : "bg-white/5 border-white/5 text-gray-400"
                            )}
                          >
                            {asset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => updateConfig(localConfig)}
                  disabled={isSaving}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && user?.role === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">Painel Administrativo</h2>
                  <p className="text-gray-400">Gerencie os usuários e o acesso à plataforma.</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-xl px-6 py-3 flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Usuários Ativos</p>
                      <p className="text-xl font-bold text-white">{activeUsersCount}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl px-6 py-3 flex items-center gap-4">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total de Contas</p>
                      <p className="text-xl font-bold text-white">{allUsers.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Niche Management Card */}
                <Card title="Gerenciamento de Nichos de Mercado" icon={Target} className="lg:col-span-3">
                  <p className="text-gray-400 text-sm mb-6">Ative ou desative categorias inteiras de ativos para todos os usuários.</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {allAssetCategories.map((niche) => {
                      const isDisabled = ((globalConfig as any).disabled_niches || []).includes(niche.id);
                      return (
                        <div 
                          key={niche.id}
                          className={cn(
                            "p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 text-center",
                            isDisabled 
                              ? "bg-red-500/5 border-red-500/20 opacity-60" 
                              : "bg-emerald-500/5 border-emerald-500/20"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            isDisabled ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"
                          )}>
                            <niche.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white mb-1">{niche.name}</p>
                            <p className={cn(
                              "text-[8px] font-black uppercase tracking-widest",
                              isDisabled ? "text-red-400" : "text-emerald-400"
                            )}>
                              {isDisabled ? 'Desativado' : 'Ativo'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const currentDisabled = (globalConfig as any).disabled_niches || [];
                              const nextDisabled = isDisabled 
                                ? currentDisabled.filter((id: string) => id !== niche.id)
                                : [...currentDisabled, niche.id];
                              
                              setGlobalConfig(prev => ({ ...prev, disabled_niches: nextDisabled } as any));
                              
                              supabase.from('global_config').update({ disabled_niches: nextDisabled }).eq('id', 1).then(({ error }) => {
                                if (error) alert('Erro ao atualizar nicho!');
                              });
                            }}
                            className={cn(
                              "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              isDisabled 
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                                : "bg-red-600 hover:bg-red-500 text-white"
                            )}
                          >
                            {isDisabled ? 'Ativar' : 'Desativar'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Bot Accuracy Card */}
                <Card title="Controle de Assertividade do Bot" icon={Brain} className="lg:col-span-3">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-300">Taxa de Acerto do Bot (%)</label>
                        <span className="text-2xl font-black text-emerald-400">{(globalConfig as any).bot_accuracy ?? 80}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={99}
                        step={1}
                        value={(globalConfig as any).bot_accuracy ?? 80}
                        onChange={(e: any) => setGlobalConfig(prev => ({ ...prev, bot_accuracy: Number(e.target.value) } as any))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span>50% (Conservador)</span>
                        <span>75% (Equilibrado)</span>
                        <span>99% (Agressivo)</span>
                      </div>
                      <p className="text-[10px] text-gray-500 italic">
                        * Define a probabilidade de GANHO de cada operação para todos os clientes. 80% significa que o bot acerta 8 em cada 10 trades.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const accuracy = (globalConfig as any).bot_accuracy ?? 80;
                        supabase.from('global_config').update({ bot_accuracy: accuracy }).eq('id', 1).then(({ error }) => {
                          if (error) alert('Erro ao salvar!');
                          else alert(`Assertividade definida para ${accuracy}%!`);
                        });
                      }}
                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl transition-all text-sm flex items-center gap-2 shrink-0"
                    >
                      <Check className="w-5 h-5" />
                      Salvar Assertividade
                    </button>
                  </div>
                </Card>

                <Card title="Configuração de Pagamentos e Planos" icon={Wallet} className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Plano {num}</p>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Valor do Plano (R$)</label>
                            <input 
                              type="number"
                              className="w-full glass-input rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                              placeholder="2500"
                              value={globalConfig[`plan${num}_amount` as keyof GlobalConfig] || ''}
                              onChange={(e: any) => setGlobalConfig(prev => ({ ...prev, [`plan${num}_amount`]: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Chave Copia e Cola</label>
                            <textarea 
                              className="w-full glass-input rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs h-32 resize-none"
                              placeholder="000201..."
                              value={globalConfig[`plan${num}_pix` as keyof GlobalConfig] || ''}
                              onChange={(e: any) => setGlobalConfig(prev => ({ ...prev, [`plan${num}_pix`]: e.target.value }))}
                            />
                            <p className="text-[8px] text-gray-500 mt-1 italic">* O QR Code será gerado automaticamente a partir desta chave.</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        supabase.from('global_config').update({
                          pix_key: globalConfig.pixKey,
                          plan1_amount: globalConfig.plan1_amount, plan1_pix: globalConfig.plan1_pix,
                          plan2_amount: globalConfig.plan2_amount, plan2_pix: globalConfig.plan2_pix,
                          plan3_amount: globalConfig.plan3_amount, plan3_pix: globalConfig.plan3_pix,
                          plan4_amount: globalConfig.plan4_amount, plan4_pix: globalConfig.plan4_pix,
                          bot_accuracy: (globalConfig as any).bot_accuracy,
                          disabled_niches: (globalConfig as any).disabled_niches
                        }).eq('id', 1).then(({ error }) => {
                          if (error) alert('Erro ao salvar no banco.');
                          else alert('Configurações de Planos e PIX salvas!');
                        });
                      }}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl transition-all text-xs flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Salvar Configurações
                    </button>
                  </div>
                </Card>

                <Card title="Solicitações de Depósito" icon={Bell} className="lg:col-span-3" badge={depositRequests.filter(d => d.status === 'pending').length.toString()} badgeColor="bg-red-500">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-white/5">
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Valor</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Data</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {depositRequests.map((d) => (
                          <tr key={d.id} className="group">
                            <td className="py-4">
                              <p className="text-sm font-bold text-white">{d.username}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">ID: {d.userId}</p>
                            </td>
                            <td className="py-4">
                              <p className="text-sm font-black text-emerald-400">R$ {d.amount.toLocaleString('pt-BR')}</p>
                            </td>
                            <td className="py-4 text-xs text-gray-400">
                              {new Date(d.createdAt).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                d.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                              )}>
                                {d.status === 'completed' ? 'Confirmado' : 'Pendente'}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {d.status === 'pending' && (
                                  <button 
                                    onClick={() => updateDepositStatus(d.id, 'completed')}
                                    className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                                    title="Confirmar Recebimento"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => deleteDepositRequest(d.id)}
                                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {depositRequests.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-gray-500 italic text-sm">
                              Nenhuma solicitação de depósito no momento.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card title="Solicitações de Saque" icon={DollarSign} className="lg:col-span-3" badge={withdrawRequests.filter(w => w.status === 'pending').length.toString()} badgeColor="bg-red-500">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-white/5">
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Valor</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Método</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Dados</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {withdrawRequests.map((w) => (
                          <tr key={w.id} className="group">
                            <td className="py-4">
                              <p className="text-sm font-bold text-white">{w.username}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">ID: {w.userId}</p>
                            </td>
                            <td className="py-4">
                              <p className="text-sm font-black text-red-400">R$ {w.amount.toLocaleString('pt-BR')}</p>
                            </td>
                            <td className="py-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{w.method}</span>
                            </td>
                            <td className="py-4">
                              <div className="max-w-[200px]">
                                <p className="text-[10px] text-gray-400 break-words font-mono">{w.details}</p>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                w.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" : 
                                w.status === 'cancelled' ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
                              )}>
                                {w.status === 'completed' ? 'Aprovado' : w.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {w.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => updateWithdrawStatus(w.id, 'completed')}
                                      className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                                      title="Aprovar Saque"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => updateWithdrawStatus(w.id, 'cancelled')}
                                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                      title="Cancelar Saque"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => deleteWithdrawRequest(w.id)}
                                  className="p-2 bg-white/5 text-gray-400 hover:bg-white/10 rounded-lg transition-all"
                                  title="Excluir Registro"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {withdrawRequests.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-gray-500 italic text-sm">
                              Nenhuma solicitação de saque no momento.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card title="Lista de Usuários" className="lg:col-span-3">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-white/5">
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Usuário</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Gestão de Dias</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">CPF</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Margem (R$)</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {allUsers.map((u) => (
                          <tr key={u.uid} className="group">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-emerald-400">
                                  {u.username?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white leading-none mb-1">{u.fullName || u.username}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">@{u.username}</p>
                                    <span className="text-[10px] text-gray-600">•</span>
                                    <p className="text-[10px] text-emerald-500/70 uppercase font-black tracking-widest">{u.role}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[9px] text-gray-500 uppercase font-black">Dias: {u.availableDays ?? 0}</span>
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-gray-600"
                                        placeholder="+ Adicionar"
                                        value={pendingDays[u.uid] === undefined ? '' : pendingDays[u.uid]}
                                        onChange={(e) => setPendingDays(prev => ({ ...prev, [u.uid]: Number(e.target.value) }))}
                                      />
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => {
                                            const amountToAdd = pendingDays[u.uid] || 0;
                                            updateUserDays(u.uid, (u.availableDays ?? 0) + amountToAdd);
                                            setPendingDays(prev => {
                                              const newState = { ...prev };
                                              delete newState[u.uid];
                                              return newState;
                                            });
                                          }}
                                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                                          title="Salvar Novos Dias"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        {pendingDays[u.uid] !== undefined && (
                                          <button 
                                            onClick={() => setPendingDays(prev => {
                                              const newState = { ...prev };
                                              delete newState[u.uid];
                                              return newState;
                                            })}
                                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                            title="Limpar"
                                          >
                                            <XCircle className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    {pendingDays[u.uid] !== undefined && pendingDays[u.uid] !== 0 && (
                                      <span className="text-[9px] font-bold text-emerald-400">
                                        Total: {(u.availableDays ?? 0) + (pendingDays[u.uid] || 0)} dias
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <p className="text-[10px] text-gray-400 font-mono">{u.cpf || '---'}</p>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center justify-center gap-2">
                                <input 
                                  type="number" 
                                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-gray-600 font-bold"
                                  placeholder="0.00"
                                  value={pendingMargins[u.uid] === undefined ? '' : pendingMargins[u.uid]}
                                  onChange={(e) => setPendingMargins(prev => ({ ...prev, [u.uid]: Number(e.target.value) }))}
                                />
                                <button 
                                  onClick={() => {
                                    const newMargin = pendingMargins[u.uid] || 0;
                                    updateUserMargin(u.uid, newMargin);
                                    setPendingMargins(prev => {
                                      const newState = { ...prev };
                                      delete newState[u.uid];
                                      return newState;
                                    });
                                  }}
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                                  title="Salvar Margem"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                u.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                              )}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {u.uid !== user.uid && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setUserToEditCredentials(u);
                                        setShowEditCredentialsModal(true);
                                      }}
                                      className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                      title="Editar Usuário/Senha"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => toggleUserStatus(u.uid, u.status)}
                                      className={cn(
                                        "p-2 rounded-lg transition-all",
                                        u.status === 'active' ? "text-red-400 hover:bg-red-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                                      )}
                                      title={u.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                                    >
                                      {u.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    </button>
                                    <button 
                                      onClick={() => deleteUser(u.uid)}
                                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                      title="Excluir Cliente"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Deposit Modal removed */}
      <AnimatePresence>
        {false && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-card rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-10 border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
              
              <button 
                onClick={() => {
                  setShowDepositModal(false);
                  setRequestSent(false);
                }}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-white">DIAS DE USO</h3>
                  <p className="text-gray-400 text-sm mt-1">Adicione dias para continuar operando.</p>
                </div>

                <div className="bg-white/5 p-4 lg:p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Quantidade de Dias</p>
                    <input 
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all text-center font-bold text-lg"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      min="1"
                    />
                  </div>

                  <div className="flex justify-center">
                    <div className="p-3 lg:p-4 bg-white rounded-2xl shadow-sm border border-white/5">
                      <QRCodeSVG value={globalConfig.pixKey} size={140} className="lg:w-[160px] lg:h-[160px]" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Chave PIX Copia e Cola</p>
                    <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5 group">
                      <p className="text-[10px] text-white truncate flex-1 font-mono">{globalConfig.pixKey}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(globalConfig.pixKey);
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {requestSent ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center space-y-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold">Solicitação Enviada!</p>
                        <p className="text-gray-400 text-xs mt-1">Aguarde a confirmação do administrador para os seus dias serem creditados.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowDepositModal(false);
                          setRequestSent(false);
                        }}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all"
                      >
                        Entendido
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 italic">Os dias serão creditados automaticamente após a confirmação do administrador.</p>
                      <button 
                        onClick={async () => {
                          if (!user) return;
                          if (depositAmount <= 0) return;
                          // Request system removed, just show sent state for UI consistency
                          setRequestSent(true);
                        }}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Já realizei o pagamento
                      </button>
                      <button 
                        onClick={() => setShowDepositModal(false)}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5"
                      >
                        Fechar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Broker Connection Modal removed */}
      <AnimatePresence>
        {false && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-card rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-10 border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
              
              <button 
                onClick={() => {
                  setShowBrokerModal(false);
                  setBotError('');
                }}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-white uppercase">Conectar Corretora</h3>
                  <p className="text-gray-400 text-sm mt-1">Insira seus dados da Pocket Option para operar.</p>
                </div>

                <div className="space-y-4 text-left">
                  <Input 
                    label="E-mail Pocket Option" 
                    type="email" 
                    placeholder="seu@email.com"
                    value={localConfig?.pocketEmail || ''}
                    onChange={(e: any) => handleLocalUpdate({ pocketEmail: e.target.value })}
                  />
                  <Input 
                    label="Senha Pocket Option" 
                    type="password" 
                    placeholder="••••••••"
                    value={localConfig?.pocketPassword || ''}
                    onChange={(e: any) => handleLocalUpdate({ pocketPassword: e.target.value })}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleLocalUpdate({ accountType: 'demo' })}
                      className={cn(
                        "py-3 rounded-lg border font-bold transition-all text-xs",
                        localConfig?.accountType === 'demo' 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                          : "bg-white/5 border-white/5 text-gray-400"
                      )}
                    >
                      DEMO
                    </button>
                    <button 
                      onClick={() => handleLocalUpdate({ accountType: 'live' })}
                      className={cn(
                        "py-3 rounded-lg border font-bold transition-all text-xs",
                        localConfig?.accountType === 'live' 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                          : "bg-white/5 border-white/5 text-gray-400"
                      )}
                    >
                      LIVE
                    </button>
                  </div>
                </div>

                {botError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-xl text-xs font-bold border",
                      botError.includes('sucesso') 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {botError.includes('sucesso') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {botError}
                    </div>
                  </motion.div>
                )}

                <button 
                  onClick={async () => {
                    if (!localConfig?.pocketEmail || !localConfig?.pocketPassword) {
                      setBotError("Por favor, preencha todos os campos.");
                      return;
                    }
                    
                    setIsConnecting(true);
                    setBotError("Autenticando com a Pocket Option...");
                    
                    // Save credentials before connecting
                    await updateConfig({
                      pocketEmail: localConfig.pocketEmail,
                      pocketPassword: localConfig.pocketPassword,
                      accountType: localConfig.accountType
                    });

                    // Simulate connection logic
                    setTimeout(() => {
                      setIsConnecting(false);
                      // Simple simulation: fail if password is too short
                      if ((localConfig.pocketPassword || '').length < 6) {
                        setBotError("Erro: Verifique suas informações de login.");
                      } else {
                        setIsConnected(true);
                        setBotError("Logado com sucesso! Iniciando robô...");
                        setTimeout(() => {
                          setShowBrokerModal(false);
                          setBotError('');
                          // Start bot after successful login if requested
                          toggleBot();
                        }, 2000);
                      }
                    }, 2000);
                  }}
                  disabled={isConnecting}
                  className={cn(
                    "w-full py-4 font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2",
                    isConnecting 
                      ? "bg-white/5 text-gray-400 cursor-not-allowed" 
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                  )}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      Conectar e Iniciar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          setSelectedDepositAmount(null);
        }}
        onDeposit={createDepositRequest}
        globalConfig={globalConfig}
        isCreating={isCreatingDeposit}
        selectedAmount={selectedDepositAmount}
        setSelectedAmount={setSelectedDepositAmount}
      />
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={createWithdrawRequest}
        isCreating={isCreatingWithdraw}
      />

      <ResultModal
        isOpen={showResultModal.show}
        type={showResultModal.type}
        onClose={() => setShowResultModal({ show: false, type: null })}
        stats={stats}
        config={config}
      />

      <EditCredentialsModal
        isOpen={showEditCredentialsModal}
        onClose={() => setShowEditCredentialsModal(false)}
        onUpdate={updateCredentials}
        userToEdit={userToEditCredentials}
      />
    </div>
  );
}
