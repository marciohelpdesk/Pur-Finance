import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Receipt, 
  Calendar, 
  BarChart3, 
  Settings, 
  Camera, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Fuel,
  Utensils,
  Laptop,
  Home,
  Car,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  X,
  Edit2,
  Trash2,
  Clock,
  Filter,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Wrench,
  Plane,
  Gamepad2,
  Music,
  CreditCard,
  Gift,
  Coffee,
  FileText,
  AlertTriangle,
  Hash,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Types ---
type ViewType = 'Dashboard' | 'Transações' | 'Planejamento' | 'Relatórios' | 'Configurações';

interface Transaction {
  id: string;
  title: string;
  category: string;
  date: string;
  timestamp: string; // ISO string for filtering
  amount: number;
  type: 'income' | 'expense';
  method: 'OCR' | 'Manual' | 'Fixed';
  icon: React.ReactNode;
  predicted?: boolean; // Flag for auto-suggested categories via OCR
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  label: string;
  current: number;
  target: number;
  color: string;
  subTasks: SubTask[];
  dueDate?: string;
  completed?: boolean;
}

interface CategorySpend {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

// --- Category Icon Mapping ---
const CATEGORY_CONFIG: Record<string, { icon: any, color: string, bg: string, hex: string }> = {
  'Alimentação': { icon: Utensils, color: 'text-rose-400', bg: 'bg-rose-400/15', hex: '#f43f5e' },
  'Transporte': { icon: Car, color: 'text-amber-400', bg: 'bg-amber-400/15', hex: '#fbbf24' },
  'Moradia': { icon: Home, color: 'text-blue-400', bg: 'bg-blue-400/15', hex: '#60a5fa' },
  'Receita': { icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/15', hex: '#10b981' },
  'Lazer': { icon: Gamepad2, color: 'text-purple-400', bg: 'bg-purple-400/15', hex: '#a855f7' },
  'Saúde': { icon: HeartPulse, color: 'text-red-400', bg: 'bg-red-400/15', hex: '#f87171' },
  'Educação': { icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-400/15', hex: '#818cf8' },
  'Compras': { icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-400/15', hex: '#f472b6' },
  'Serviços': { icon: Wrench, color: 'text-cyan-400', bg: 'bg-cyan-400/15', hex: '#22d3ee' },
  'Viagem': { icon: Plane, color: 'text-sky-400', bg: 'bg-sky-400/15', hex: '#38bdf8' },
  'Investimentos': { icon: TrendingUp, color: 'text-lime-400', bg: 'bg-lime-400/15', hex: '#a3e635' },
  'Café': { icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-400/15', hex: '#fb923c' },
  'Presentes': { icon: Gift, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/15', hex: '#e879f9' },
  'Outros': { icon: Plus, color: 'text-slate-400', bg: 'bg-slate-400/15', hex: '#94a3b8' },
};

const getCategoryIcon = (category: string) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Outros'];
  const Icon = config.icon;
  return <Icon className={`w-5 h-5 ${config.color}`} />;
};

// --- Mock Data ---
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Restaurante Gourmet', category: 'Alimentação', date: 'Hoje', timestamp: new Date().toISOString().split('T')[0], amount: -85.00, type: 'expense', method: 'OCR', icon: getCategoryIcon('Alimentação') },
  { id: '2', title: 'Posto Shell', category: 'Transporte', date: 'Ontem', timestamp: new Date(Date.now() - 86400000).toISOString().split('T')[0], amount: -220.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Transporte') },
  { id: '3', title: 'Salário Mensal', category: 'Receita', date: '05 Out', timestamp: '2025-10-05', amount: 4340.00, type: 'income', method: 'Fixed', icon: getCategoryIcon('Receita') },
  { id: '4', title: 'Mercado Central', category: 'Alimentação', date: '04 Out', timestamp: '2025-10-04', amount: -320.50, type: 'expense', method: 'OCR', icon: getCategoryIcon('Alimentação') },
  { id: '5', title: 'Aluguel Outubro', category: 'Moradia', date: '01 Out', timestamp: '2025-10-01', amount: -1800.00, type: 'expense', method: 'Fixed', icon: getCategoryIcon('Moradia') },
  { id: '6', title: 'Netflix', category: 'Lazer', date: '28 Set', timestamp: '2025-09-28', amount: -55.90, type: 'expense', method: 'Fixed', icon: getCategoryIcon('Lazer') },
  { id: '7', title: 'Uber Viagem', category: 'Transporte', date: '27 Set', timestamp: '2025-09-27', amount: -32.40, type: 'expense', method: 'Manual', icon: getCategoryIcon('Transporte') },
  { id: '8', title: 'Padaria Pão Quente', category: 'Alimentação', date: '26 Set', timestamp: '2025-09-26', amount: -12.50, type: 'expense', method: 'Manual', icon: getCategoryIcon('Alimentação') },
  { id: '9', title: 'Freelance Design', category: 'Receita', date: '25 Set', timestamp: '2025-09-25', amount: 1200.00, type: 'income', method: 'Manual', icon: getCategoryIcon('Receita') },
  { id: '10', title: 'Farmácia Saúde', category: 'Saúde', date: '24 Set', timestamp: '2025-09-24', amount: -45.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Saúde') },
  { id: '11', title: 'Cinema Shopping', category: 'Lazer', date: '23 Set', timestamp: '2025-09-23', amount: -60.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Lazer') },
  { id: '12', title: 'Supermercado Extra', category: 'Alimentação', date: '22 Set', timestamp: '2025-09-22', amount: -450.00, type: 'expense', method: 'OCR', icon: getCategoryIcon('Alimentação') },
  { id: '13', title: 'Gasolina Ipiranga', category: 'Transporte', date: '21 Set', timestamp: '2025-09-21', amount: -150.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Transporte') },
  { id: '14', title: 'Internet Fibra', category: 'Moradia', date: '20 Set', timestamp: '2025-09-20', amount: -120.00, type: 'expense', method: 'Fixed', icon: getCategoryIcon('Moradia') },
  { id: '15', title: 'Spotify Family', category: 'Lazer', date: '19 Set', timestamp: '2025-09-19', amount: -34.90, type: 'expense', method: 'Fixed', icon: getCategoryIcon('Lazer') },
  { id: '16', title: 'Venda de Teclado', category: 'Receita', date: '18 Set', timestamp: '2025-09-18', amount: 350.00, type: 'income', method: 'Manual', icon: getCategoryIcon('Receita') },
  { id: '17', title: 'Jantar Japonês', category: 'Alimentação', date: '17 Set', timestamp: '2025-09-17', amount: -180.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Alimentação') },
  { id: '18', title: 'Pedágio Rodovia', category: 'Transporte', date: '16 Set', timestamp: '2025-09-16', amount: -14.50, type: 'expense', method: 'Manual', icon: getCategoryIcon('Transporte') },
  { id: '19', title: 'Academia Mensal', category: 'Saúde', date: '15 Set', timestamp: '2025-09-15', amount: -110.00, type: 'expense', method: 'Fixed', icon: getCategoryIcon('Saúde') },
  { id: '20', title: 'Condomínio', category: 'Moradia', date: '14 Set', timestamp: '2025-09-14', amount: -650.00, type: 'expense', method: 'Fixed', icon: getCategoryIcon('Moradia') },
  { id: '21', title: 'Café Starbucks', category: 'Café', date: '13 Set', timestamp: '2025-09-13', amount: -22.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Café') },
  { id: '22', title: 'Manutenção Carro', category: 'Transporte', date: '12 Set', timestamp: '2025-09-12', amount: -850.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Transporte') },
  { id: '23', title: 'Curso Online', category: 'Educação', date: '11 Set', timestamp: '2025-09-11', amount: -299.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Educação') },
  { id: '24', title: 'Dividendos', category: 'Investimentos', date: '10 Set', timestamp: '2025-09-10', amount: 150.00, type: 'income', method: 'Fixed', icon: getCategoryIcon('Investimentos') },
  { id: '25', title: 'Lanche Rápido', category: 'Alimentação', date: '09 Set', timestamp: '2025-09-09', amount: -35.00, type: 'expense', method: 'Manual', icon: getCategoryIcon('Alimentação') },
];

const CATEGORY_SPENDING: CategorySpend[] = [
  { name: 'Alimentação', amount: 840.00, percentage: 45, color: CATEGORY_CONFIG['Alimentação'].hex, icon: 'Utensils' },
  { name: 'Transporte', amount: 450.00, percentage: 25, color: CATEGORY_CONFIG['Transporte'].hex, icon: 'Car' },
  { name: 'Lazer', amount: 210.00, percentage: 15, color: CATEGORY_CONFIG['Lazer'].hex, icon: 'Gamepad2' },
];

const INITIAL_GOALS: Goal[] = [
  { 
    id: 'g1', 
    label: "Reserva de Emergência", 
    current: 8500, 
    target: 15000, 
    color: "#22d3ee",
    dueDate: "2026-12-31",
    completed: false,
    subTasks: [
      { id: 's1', title: 'Economizar R$ 1000 este mês', completed: true },
      { id: 's2', title: 'Vender itens usados', completed: false },
      { id: 's3', title: 'Cortar assinaturas inúteis', completed: true },
    ]
  },
  { 
    id: 'g2', 
    label: "Viagem de Férias", 
    current: 1200, 
    target: 5000, 
    color: "#a855f7",
    dueDate: "2026-07-15",
    completed: false,
    subTasks: [
      { id: 's4', title: 'Pesquisar passagens', completed: true },
      { id: 's5', title: 'Reservar hotel', completed: false },
    ]
  },
  { 
    id: 'g3', 
    label: "Novo Setup", 
    current: 450, 
    target: 3000, 
    color: "#f43f5e",
    dueDate: "2026-05-20",
    completed: false,
    subTasks: [
      { id: 's6', title: 'Escolher monitor', completed: false },
      { id: 's7', title: 'Comparar preços de GPUs', completed: false },
    ]
  },
  {
    id: 'g4',
    label: "Curso de Inglês",
    current: 2500,
    target: 2500,
    color: "#10b981",
    dueDate: "2025-12-20",
    completed: true,
    subTasks: [
      { id: 's8', title: 'Pagar matrícula', completed: true },
      { id: 's9', title: 'Comprar material', completed: true },
    ]
  }
];

const REPORT_DATA = {
  weekly: [
    { name: 'Seg', gastos: 120, receitas: 0, Alimentação: 50, Transporte: 30, Moradia: 0, Lazer: 20, Outros: 20 },
    { name: 'Ter', gastos: 85, receitas: 0, Alimentação: 30, Transporte: 20, Moradia: 0, Lazer: 10, Outros: 25 },
    { name: 'Qua', gastos: 220, receitas: 0, Alimentação: 100, Transporte: 50, Moradia: 0, Lazer: 40, Outros: 30 },
    { name: 'Qui', gastos: 45, receitas: 0, Alimentação: 15, Transporte: 10, Moradia: 0, Lazer: 5, Outros: 15 },
    { name: 'Sex', gastos: 310, receitas: 4340, Alimentação: 120, Transporte: 80, Moradia: 0, Lazer: 60, Outros: 50 },
    { name: 'Sáb', gastos: 150, receitas: 0, Alimentação: 60, Transporte: 30, Moradia: 0, Lazer: 40, Outros: 20 },
    { name: 'Dom', gastos: 90, receitas: 0, Alimentação: 40, Transporte: 10, Moradia: 0, Lazer: 30, Outros: 10 },
  ],
  monthly: [
    { name: 'Sem 1', gastos: 1200, receitas: 4340, Alimentação: 400, Transporte: 200, Moradia: 400, Lazer: 100, Outros: 100 },
    { name: 'Sem 2', gastos: 850, receitas: 0, Alimentação: 300, Transporte: 150, Moradia: 200, Lazer: 100, Outros: 100 },
    { name: 'Sem 3', gastos: 1100, receitas: 500, Alimentação: 350, Transporte: 200, Moradia: 300, Lazer: 150, Outros: 100 },
    { name: 'Sem 4', gastos: 950, receitas: 0, Alimentação: 300, Transporte: 150, Moradia: 300, Lazer: 100, Outros: 100 },
  ],
  yearly: [
    { name: 'Jan', gastos: 4200, receitas: 5000, Alimentação: 1000, Transporte: 500, Moradia: 1200, Lazer: 300, Outros: 200 },
    { name: 'Fev', gastos: 3800, receitas: 5000, Alimentação: 900, Transporte: 400, Moradia: 1200, Lazer: 200, Outros: 100 },
    { name: 'Mar', gastos: 4500, receitas: 5500, Alimentação: 1100, Transporte: 600, Moradia: 1200, Lazer: 400, Outros: 200 },
    { name: 'Abr', gastos: 4100, receitas: 5000, Alimentação: 1000, Transporte: 500, Moradia: 1200, Lazer: 300, Outros: 100 },
    { name: 'Mai', gastos: 3900, receitas: 5200, Alimentação: 950, Transporte: 450, Moradia: 1200, Lazer: 200, Outros: 100 },
    { name: 'Jun', gastos: 4800, receitas: 6000, Alimentação: 1300, Transporte: 700, Moradia: 1500, Lazer: 500, Outros: 200 },
  ]
};

const CATEGORIES = [
  { name: 'Alimentação', keywords: ['mercado', 'restaurante', 'padaria', 'café', 'comida', 'sabor', 'iFood', 'supermercado', 'extra', 'carrefour', 'pão', 'lanche', 'pizza', 'hambúrguer'] },
  { name: 'Transporte', keywords: ['posto', 'gasolina', 'uber', 'carro', 'pedágio', 'combustível', 'shell', 'ipiranga', 'estacionamento', 'ônibus', 'metrô', '99app'] },
  { name: 'Moradia', keywords: ['aluguel', 'condomínio', 'internet', 'luz', 'água', 'gás', 'reforma', 'móveis', 'decoração', 'limpeza'] },
  { name: 'Lazer', keywords: ['netflix', 'spotify', 'cinema', 'academia', 'curso', 'viagem', 'hotel', 'show', 'teatro', 'games', 'steam', 'playstation'] },
  { name: 'Receita', keywords: ['salário', 'freelance', 'venda', 'dividendos', 'reembolso', 'pix recebido', 'transferência'] },
  { name: 'Outros', keywords: [] }
];

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [planningTab, setPlanningTab] = useState<'active' | 'history'>('active');
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [cashFlowMonths, setCashFlowMonths] = useState(6);

  const cashFlowData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = cashFlowMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });
      const year = d.getFullYear();
      const monthPrefix = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const monthTransactions = transactions.filter(t => t.timestamp.startsWith(monthPrefix));
      const incomeVal = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenseVal = Math.abs(monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
      
      data.push({
        name: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year.toString().slice(-2)}`,
        receitas: incomeVal,
        despesas: expenseVal
      });
    }
    return data;
  }, [transactions, cashFlowMonths]);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [balance, setBalance] = useState(2450.00);
  const [income, setIncome] = useState(4340.00);
  const [expenses, setExpenses] = useState(1890.00);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Filter State
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterId, setFilterId] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('Todos');

  // Sorting State
  const [sortField, setSortField] = useState<'date' | 'title' | 'category' | 'amount' | 'method'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isManualOCRModalOpen, setIsManualOCRModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [ocrResult, setOcrResult] = useState<{title: string, category: string, amount: number, rawTitle?: string, rawAmount?: number} | null>(null);

  // Filter Logic
  const filteredTransactions = transactions.filter(tr => {
    const matchesCategory = filterCategory === 'Todas' || tr.category === filterCategory;
    const matchesType = filterType === 'all' || tr.type === filterType;
    const matchesMethod = filterMethod === 'Todos' || tr.method === filterMethod;
    
    // Date range logic
    let matchesDate = true;
    if (filterStartDate && filterEndDate) {
      matchesDate = tr.timestamp >= filterStartDate && tr.timestamp <= filterEndDate;
    } else if (filterStartDate) {
      matchesDate = tr.timestamp >= filterStartDate;
    } else if (filterEndDate) {
      matchesDate = tr.timestamp <= filterEndDate;
    }

    const matchesSearch = tr.date.toLowerCase().includes(filterSearch.toLowerCase()) || 
                         tr.title.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesId = !filterId || tr.id.toLowerCase().includes(filterId.toLowerCase());
    return matchesCategory && matchesType && matchesMethod && matchesDate && matchesSearch && matchesId;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortField === 'method') {
      comparison = a.method.localeCompare(b.method);
    } else if (sortField === 'date') {
      comparison = a.date.localeCompare(b.date);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when transactions or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length, filterCategory, filterType, filterMethod, filterStartDate, filterEndDate, filterSearch, filterId]);

  // Parallax effect for blobs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const predictCategory = (title: string): string => {
    const t = title.toLowerCase();
    
    let bestMatch = 'Outros';
    let maxScore = 0;

    CATEGORIES.forEach(cat => {
      let score = 0;
      cat.keywords.forEach(kw => {
        if (t.includes(kw.toLowerCase())) {
          score += 1;
        }
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = cat.name;
      }
    });

    return bestMatch;
  };

  const handleOCR = () => {
    setIsOCRProcessing(true);
    setTimeout(() => {
      setIsOCRProcessing(false);
      
      const mockReceipts = [
        { rawTitle: 'R3ST4UR4NT3 S4B0R', rawAmount: -65.0, suggestedTitle: 'Restaurante Sabor', suggestedAmount: -65.00 },
        { rawTitle: 'P0ST0 1P1R4NG4', rawAmount: -180.0, suggestedTitle: 'Posto Ipiranga', suggestedAmount: -180.00 },
        { rawTitle: '4M4Z0N PR1M3', rawAmount: -14.9, suggestedTitle: 'Amazon Prime', suggestedAmount: -14.90 },
        { rawTitle: 'M3RC4D0 L1QU1D0', rawAmount: -245.3, suggestedTitle: 'Mercado Líquido', suggestedAmount: -245.30 },
        { rawTitle: 'UB3R TR1P', rawAmount: -28.5, suggestedTitle: 'Uber Trip', suggestedAmount: -28.50 },
      ];
      
      const receipt = mockReceipts[Math.floor(Math.random() * mockReceipts.length)];
      const category = predictCategory(receipt.suggestedTitle);
      
      setOcrResult({ 
        title: receipt.suggestedTitle, 
        category: category, 
        amount: receipt.suggestedAmount,
        rawTitle: receipt.rawTitle,
        rawAmount: receipt.rawAmount
      });
    }, 2500);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Título', 'Categoria', 'Data', 'Valor', 'Tipo', 'Método', 'Timestamp'];
    const rows = filteredTransactions.map(tr => [
      tr.id,
      `"${tr.title}"`,
      `"${tr.category}"`,
      `"${tr.date}"`,
      tr.amount.toString(),
      tr.type,
      tr.method,
      tr.timestamp
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTransaction = (title: string, amount: number, category: string, date: string, formattedDate: string, type: 'income' | 'expense', id?: string, method: 'OCR' | 'Manual' | 'Fixed' = 'Manual', predicted: boolean = false) => {
    if (id) {
      // Update existing
      const oldTr = transactions.find(t => t.id === id);
      if (!oldTr) return;

      // Adjust totals
      if (oldTr.type === 'expense') {
        setExpenses(prev => prev - Math.abs(oldTr.amount));
        setBalance(prev => prev + Math.abs(oldTr.amount));
      } else {
        setIncome(prev => prev - oldTr.amount);
        setBalance(prev => prev - oldTr.amount);
      }

      const updatedTransaction: Transaction = {
        ...oldTr,
        title,
        category,
        date: formattedDate || oldTr.date,
        timestamp: date ? new Date(date).toISOString().split('T')[0] : oldTr.timestamp,
        amount: type === 'expense' ? -amount : amount,
        type,
        icon: getCategoryIcon(category),
        predicted: false
      };

      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      
      if (type === 'expense') {
        setExpenses(prev => prev + amount);
        setBalance(prev => prev - amount);
      } else {
        setIncome(prev => prev + amount);
        setBalance(prev => prev + amount);
      }
    } else {
      // Add new
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        category,
        date: formattedDate || 'Hoje',
        timestamp: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: type === 'expense' ? -amount : amount,
        type,
        method,
        icon: getCategoryIcon(category),
        predicted
      };
      setTransactions([newTransaction, ...transactions]);
      if (type === 'expense') {
        setExpenses(prev => prev + amount);
        setBalance(prev => prev - amount);
      } else {
        setIncome(prev => prev + amount);
        setBalance(prev => prev + amount);
      }
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const tr = transactions.find(t => t.id === id);
    if (!tr) return;
    setTransactionToDelete(tr);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!transactionToDelete) return;
    const { id, amount, type } = transactionToDelete;

    if (type === 'expense') {
      setExpenses(prev => prev - Math.abs(amount));
      setBalance(prev => prev + Math.abs(amount));
    } else {
      setIncome(prev => prev - amount);
      setBalance(prev => prev - amount);
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    setIsDeleteConfirmOpen(false);
    setTransactionToDelete(null);
  };

  const handleManualExpense = () => {
    const amount = 50.00;
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Despesa Manual',
      category: 'Outros',
      date: 'Agora',
      timestamp: new Date().toISOString().split('T')[0],
      amount: -amount,
      type: 'expense',
      method: 'Manual',
      icon: getCategoryIcon('Outros')
    };
    setTransactions([newTransaction, ...transactions]);
    setExpenses(prev => prev + amount);
    setBalance(prev => prev - amount);
  };

  const toggleSubTask = (goalId: string, subTaskId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subTasks: goal.subTasks.map(st => 
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return goal;
    }));
  };

  const addGoal = (label: string, target: number, color: string, dueDate?: string) => {
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      label,
      current: 0,
      target,
      color,
      subTasks: [],
      dueDate,
      completed: false
    };
    setGoals([...goals, newGoal]);
  };

  const completeGoal = (goalId: string) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, completed: true } : g));
  };

  const addSubTask = (goalId: string, title: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subTasks: [...goal.subTasks, { id: Math.random().toString(36).substr(2, 9), title, completed: false }]
        };
      }
      return goal;
    }));
  };

  return (
    <div className="relative min-h-screen">
      {/* Liquid Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ filter: 'url(#goo)' }}>
        <motion.div 
          animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
          className="absolute w-[500px] h-[500px] -top-24 -left-24 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary blur-[60px] opacity-40 animate-blob" 
        />
        <motion.div 
          animate={{ x: mousePos.x * 0.8, y: mousePos.y * 0.8 }}
          className="absolute w-[400px] h-[400px] -bottom-12 -right-12 rounded-full bg-accent-liquid blur-[60px] opacity-40 animate-blob [animation-delay:-5s]" 
        />
        <motion.div 
          animate={{ x: mousePos.x * 1.2, y: mousePos.y * 1.2 }}
          className="absolute w-[300px] h-[300px] top-[40%] left-[60%] rounded-full bg-[#f43f5e] blur-[60px] opacity-40 animate-blob [animation-delay:-10s]" 
        />
      </div>

      {/* SVG Filter for Gooey Effect */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="hidden">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingTransaction ? 'Editar Transação' : (modalType === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa')}
                </h3>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-dim hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = (formData.get('title') as string).trim();
                const amount = Number(formData.get('amount'));
                const category = formData.get('category') as string;
                const dateInput = formData.get('date') as string;
                const type = formData.get('type') as 'income' | 'expense';
                
                let formattedDate = editingTransaction?.date || 'Hoje';
                if (dateInput) {
                  const [year, month, day] = dateInput.split('-');
                  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                  formattedDate = `${day} ${months[parseInt(month) - 1]}`;
                }

                if (title && amount > 0) {
                  handleAddTransaction(title, amount, category, dateInput, formattedDate, type, editingTransaction?.id);
                }
              }} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Título</label>
                  <input 
                    name="title"
                    type="text"
                    required
                    pattern=".*\S+.*"
                    title="O título não pode estar vazio"
                    defaultValue={editingTransaction?.title || ''}
                    placeholder="Ex: Salário, Aluguel, Mercado..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Valor (R$)</label>
                    <input 
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      defaultValue={editingTransaction ? Math.abs(editingTransaction.amount) : ''}
                      placeholder="0,00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Tipo</label>
                    <select 
                      name="type"
                      defaultValue={editingTransaction?.type || modalType}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                    >
                      <option value="income">Receita</option>
                      <option value="expense">Despesa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Data</label>
                  <input 
                    name="date"
                    type="date"
                    defaultValue={editingTransaction?.timestamp || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Categoria</label>
                  <select 
                    name="category"
                    defaultValue={editingTransaction?.category || (modalType === 'income' ? 'Receita' : 'Alimentação')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                  >
                    <option value="Receita">Receita</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Moradia">Moradia</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Compras">Compras</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Viagem">Viagem</option>
                    <option value="Investimentos">Investimentos</option>
                    <option value="Café">Café</option>
                    <option value="Presentes">Presentes</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold text-bg transition-all shadow-lg ${
                    modalType === 'income' 
                      ? 'bg-success hover:shadow-success/20' 
                      : 'bg-danger hover:shadow-danger/20'
                  }`}
                >
                  {editingTransaction ? 'SALVAR ALTERAÇÕES' : `CONFIRMAR ${modalType === 'income' ? 'RECEITA' : 'DESPESA'}`}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Manual OCR Modal */}
        {isManualOCRModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualOCRModalOpen(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText size={20} className="text-accent-liquid" />
                  Entrada Manual de Recibo
                </h3>
                <button 
                  onClick={() => setIsManualOCRModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-dim hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-text-dim mb-6">
                Insira os detalhes do recibo para processamento manual. A IA categorizará automaticamente com base no título.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = (formData.get('title') as string).trim();
                const amount = Number(formData.get('amount'));
                
                if (title && amount > 0) {
                  setIsManualOCRModalOpen(false);
                  setIsOCRProcessing(true);
                  
                  setTimeout(() => {
                    setIsOCRProcessing(false);
                    const category = predictCategory(title);
                    setOcrResult({ title: title.toUpperCase(), category: category, amount: -amount });
                  }, 1500);
                }
              }} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Estabelecimento / Título</label>
                  <input 
                    name="title"
                    type="text"
                    required
                    pattern=".*\S+.*"
                    title="O título não pode estar vazio"
                    placeholder="Ex: STARBUCKS COFFEE, MERCADO EXTRA..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Valor Total (R$)</label>
                  <input 
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-bg bg-accent-liquid shadow-lg shadow-accent-liquid/20 hover:shadow-accent-liquid/40 transition-all flex items-center justify-center gap-2"
                >
                  <CheckSquare size={18} />
                  PROCESSAR RECIBO
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* OCR Result Modal */}
        {ocrResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOcrResult(null)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Confirmar Transação</h3>
                <button 
                  onClick={() => setOcrResult(null)}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-dim hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-text-dim mb-6">
                A IA analisou o recibo e sugeriu os seguintes ajustes. Verifique antes de salvar.
              </p>
              
              {ocrResult.rawTitle && ocrResult.rawAmount !== undefined && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">Texto Original Extraído</h4>
                  <p className="text-sm text-white font-mono">{ocrResult.rawTitle} - R$ {Math.abs(ocrResult.rawAmount).toFixed(2)}</p>
                </div>
              )}
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = (formData.get('title') as string).trim();
                const amount = Number(formData.get('amount'));
                const category = formData.get('category') as string;
                
                if (title && amount > 0) {
                  handleAddTransaction(title, amount, category, new Date().toISOString().split('T')[0], 'Agora', 'expense', undefined, 'OCR', true);
                  setOcrResult(null);
                }
              }} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Estabelecimento / Título</label>
                  <input 
                    name="title"
                    type="text"
                    required
                    pattern=".*\S+.*"
                    title="O título não pode estar vazio"
                    defaultValue={ocrResult.title}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Valor (R$)</label>
                    <input 
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      defaultValue={Math.abs(ocrResult.amount)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Categoria Sugerida</label>
                    <select 
                      name="category"
                      defaultValue={ocrResult.category}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-bg bg-accent-liquid shadow-lg shadow-accent-liquid/20 hover:shadow-accent-liquid/40 transition-all flex items-center justify-center gap-2"
                >
                  <CheckSquare size={18} />
                  CONFIRMAR E SALVAR
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Goal Modal */}
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoalModalOpen(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Nova Meta</h3>
                <button 
                  onClick={() => setIsGoalModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-dim hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = (formData.get('title') as string).trim();
                const target = Number(formData.get('target'));
                const dueDate = formData.get('dueDate') as string;
                
                if (title && target > 0) {
                  addGoal(title, target, '#22d3ee', dueDate || undefined);
                  setIsGoalModalOpen(false);
                }
              }} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Título da Meta</label>
                  <input 
                    name="title"
                    type="text"
                    required
                    pattern=".*\S+.*"
                    title="O título não pode estar vazio"
                    placeholder="Ex: Viagem, Carro Novo, Reserva..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Valor Alvo (R$)</label>
                  <input 
                    name="target"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Data de Vencimento (Opcional)</label>
                  <input 
                    name="dueDate"
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-liquid/50 transition-colors [color-scheme:dark]"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-bg bg-accent-liquid shadow-lg shadow-accent-liquid/20 hover:shadow-accent-liquid/40 transition-all"
                >
                  CRIAR META
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-bg/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-panel p-8 shadow-2xl border-danger/20"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Excluir Transação?</h3>
                <p className="text-text-dim text-sm mb-6">
                  Você está prestes a excluir a transação <span className="text-white font-semibold">"{transactionToDelete?.title}"</span>. Esta ação não pode ser desfeita.
                </p>
                
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button 
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                  >
                    CANCELAR
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="py-3 rounded-xl font-bold text-bg bg-danger shadow-lg shadow-danger/20 hover:shadow-danger/40 transition-all"
                  >
                    EXCLUIR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={`app-container grid gap-6 p-6 max-w-[1600px] mx-auto h-screen transition-all duration-500
        grid-cols-1 
        lg:grid-cols-[280px_1fr] 
        ${activeView === 'Dashboard' ? 'xl:grid-cols-[280px_1fr_350px]' : 'xl:grid-cols-[280px_1fr]'}
      `}>
        
        {/* Sidebar */}
        <aside className="sidebar flex flex-col gap-10 lg:row-span-2">
          <div className="logo text-2xl font-extrabold tracking-tighter flex items-center gap-3 bg-gradient-to-r from-white to-text-dim bg-clip-text text-transparent">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="url(#logo-grad)" strokeWidth="4"/>
              <path d="M16 8V24M10 14L16 8L22 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#a855f7"/>
                  <stop offset="1" stopColor="#22d3ee"/>
                </linearGradient>
              </defs>
            </svg>
            PUR FINANCE
          </div>
          
          <nav className="nav-links flex flex-col gap-2">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={activeView === 'Dashboard'} 
              onClick={() => setActiveView('Dashboard')}
            />
            <NavItem 
              icon={<Receipt size={20} />} 
              label="Transações" 
              active={activeView === 'Transações'} 
              onClick={() => setActiveView('Transações')}
            />
            <NavItem 
              icon={<Calendar size={20} />} 
              label="Planejamento" 
              active={activeView === 'Planejamento'} 
              onClick={() => setActiveView('Planejamento')}
            />
            <NavItem 
              icon={<BarChart3 size={20} />} 
              label="Relatórios" 
              active={activeView === 'Relatórios'} 
              onClick={() => setActiveView('Relatórios')}
            />
            <NavItem 
              icon={<Settings size={20} />} 
              label="Configurações" 
              active={activeView === 'Configurações'} 
              onClick={() => setActiveView('Configurações')}
            />
            <div className="h-px bg-white/5 my-2 mx-4" />
            <NavItem 
              icon={<Download size={20} />} 
              label="Exportar CSV" 
              onClick={handleExportCSV}
              rightIcon={<Download size={16} />}
            />
          </nav>

          <div className="glass-panel mt-auto p-5">
            <p className="text-[0.75rem] text-text-dim">Assinatura Pro</p>
            <p className="text-[0.9rem] font-semibold mt-1">Status: Ativo</p>
            <div className="h-1.5 bg-glass-border rounded-full w-full mt-2 overflow-hidden">
              <div className="h-full bg-accent-liquid shadow-[0_0_10px_#22d3ee] rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={`main-content-area ${activeView === 'Dashboard' ? 'contents' : 'lg:col-start-2 lg:row-start-1 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-glass-border'}`}>
          <main className={`main-content flex flex-col gap-6 ${activeView === 'Dashboard' ? 'lg:col-start-2 lg:row-start-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-glass-border' : ''}`}>
          <AnimatePresence mode="wait">
            {activeView === 'Dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="glass-panel p-7 flex justify-between items-center bg-gradient-to-br from-accent-primary/15 to-accent-secondary/15 border-accent-primary/30">
                  <div className="balance-info">
                    <span className="text-[0.75rem] uppercase tracking-[1.5px] text-text-dim mb-2 block">Saldo Disponível</span>
                    <h1 className="text-5xl font-mono font-semibold tracking-tighter">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h1>
                    <p className="text-sm text-success mt-2.5 flex items-center gap-1">
                      <TrendingUp size={14} /> 12% em relação ao mês anterior
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.75rem] uppercase tracking-[1.5px] text-text-dim mb-2 block">Economia do Mês</span>
                    <div className="text-4xl font-mono font-semibold text-accent-liquid">56%</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <StatCard label="Receitas" value={`R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="text-success" />
                  <StatCard label="Despesas" value={`R$ ${expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} color="text-danger" />
                  <StatCard label="Meta Mensal" value="R$ 5.000,00" color="text-accent-primary" />
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <ActionButton icon={<Camera size={24} />} label="ESCANEAR RECIBO (OCR)" onClick={handleOCR} />
                  <ActionButton icon={<FileText size={24} />} label="ENTRADA MANUAL OCR" onClick={() => setIsManualOCRModalOpen(true)} />
                  <ActionButton icon={<Wallet size={24} />} label="NOVA DESPESA MANUAL" onClick={handleManualExpense} />
                </div>

                <div className="glass-panel p-7">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-white">Últimas Transações</h2>
                    <span 
                      className="text-xs text-accent-liquid cursor-pointer hover:underline"
                      onClick={() => setActiveView('Transações')}
                    >
                      Ver tudo
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {transactions.slice(0, 5).map((tr) => (
                        <div key={tr.id}>
                          <TransactionRow 
                            tr={tr} 
                            compact 
                            onEdit={(tr) => {
                              setEditingTransaction(tr);
                              setModalType(tr.type);
                              setIsModalOpen(true);
                            }}
                            onDelete={(id) => handleDeleteTransaction(id)}
                          />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'Transações' && (
              <motion.div 
                key="transactions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="glass-panel p-7">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Histórico de Transações</h2>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => { setModalType('income'); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all text-sm font-semibold"
                      >
                        <Plus size={16} /> ADICIONAR RECEITA <FileText size={16} />
                      </button>
                      <button 
                        onClick={() => { setModalType('expense'); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all text-sm font-semibold"
                      >
                        <Plus size={16} /> ADICIONAR DESPESA <FileText size={16} />
                      </button>
                      <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-sm font-semibold"
                      >
                        <Download size={16} /> EXPORTAR CSV
                      </button>
                      <div className="text-sm text-text-dim">
                        Exibindo {paginatedTransactions.length} de {filteredTransactions.length} transações
                      </div>
                    </div>
                  </div>

                  {/* Filters UI */}
                  <div className="flex flex-wrap items-end gap-4 mb-8 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-wider ml-1">
                        <Filter size={12} className="text-accent-liquid" />
                        Categoria
                      </label>
                      <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-bg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-liquid/50 min-w-[140px] appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <option value="Todas">Todas</option>
                        <option value="Alimentação">Alimentação</option>
                        <option value="Transporte">Transporte</option>
                        <option value="Moradia">Moradia</option>
                        <option value="Receita">Receita</option>
                        <option value="Lazer">Lazer</option>
                        <option value="Saúde">Saúde</option>
                        <option value="Educação">Educação</option>
                        <option value="Compras">Compras</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Viagem">Viagem</option>
                        <option value="Investimentos">Investimentos</option>
                        <option value="Café">Café</option>
                        <option value="Presentes">Presentes</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-wider ml-1">
                        <TrendingUp size={12} className="text-accent-liquid" />
                        Tipo
                      </label>
                      <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-bg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-liquid/50 min-w-[120px] appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <option value="all">Todos</option>
                        <option value="income">Receitas (Income)</option>
                        <option value="expense">Despesas (Expense)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-wider ml-1">
                        <Receipt size={12} className="text-accent-liquid" />
                        Método de Pagamento
                      </label>
                      <select 
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="bg-bg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-liquid/50 min-w-[120px] appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <option value="Todos">Todos</option>
                        <option value="OCR">OCR</option>
                        <option value="Manual">Manual</option>
                        <option value="Fixed">Fixo</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-wider ml-1">
                        <Calendar size={12} className="text-accent-liquid" />
                        Período
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="date"
                          value={filterStartDate}
                          onChange={(e) => setFilterStartDate(e.target.value)}
                          className="bg-bg border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-liquid/50 [color-scheme:dark] cursor-pointer hover:bg-white/5 transition-colors"
                        />
                        <span className="text-text-dim text-sm">até</span>
                        <input 
                          type="date"
                          value={filterEndDate}
                          onChange={(e) => setFilterEndDate(e.target.value)}
                          className="bg-bg border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-liquid/50 [color-scheme:dark] cursor-pointer hover:bg-white/5 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          onClick={() => {
                            const today = new Date();
                            const last7Days = new Date(today);
                            last7Days.setDate(today.getDate() - 7);
                            setFilterStartDate(last7Days.toISOString().split('T')[0]);
                            setFilterEndDate(today.toISOString().split('T')[0]);
                          }}
                          className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-text-dim hover:text-white transition-colors border border-white/10"
                        >
                          Últimos 7 dias
                        </button>
                        <button 
                          onClick={() => {
                            const today = new Date();
                            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                            setFilterStartDate(firstDayOfMonth.toISOString().split('T')[0]);
                            setFilterEndDate(today.toISOString().split('T')[0]);
                          }}
                          className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-text-dim hover:text-white transition-colors border border-white/10"
                        >
                          Este Mês
                        </button>
                        <button 
                          onClick={() => {
                            const today = new Date();
                            const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                            setFilterStartDate(firstDayOfYear.toISOString().split('T')[0]);
                            setFilterEndDate(today.toISOString().split('T')[0]);
                          }}
                          className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-text-dim hover:text-white transition-colors border border-white/10"
                        >
                          Este Ano
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-grow">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-wider ml-1">
                        <Search size={12} className="text-accent-liquid" />
                        Busca (Data / Título / ID)
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                          <input 
                            type="text"
                            placeholder="Data ou nome..."
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                            className="bg-bg border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-liquid/50 w-full"
                          />
                        </div>
                        <div className="relative w-[150px]">
                          <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                          <input 
                            type="text"
                            placeholder="ID..."
                            value={filterId}
                            onChange={(e) => setFilterId(e.target.value)}
                            className="bg-bg border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent-liquid/50 w-full"
                          />
                        </div>
                        {(filterCategory !== 'Todas' || filterType !== 'all' || filterMethod !== 'Todos' || filterStartDate || filterEndDate || filterSearch || filterId) && (
                          <button 
                            onClick={() => {
                              setFilterCategory('Todas');
                              setFilterType('all');
                              setFilterMethod('Todos');
                              setFilterStartDate('');
                              setFilterEndDate('');
                              setFilterSearch('');
                              setFilterId('');
                            }}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white transition-colors whitespace-nowrap flex items-center gap-2"
                          >
                            <X size={14} />
                            Limpar Filtros
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-[100px_1fr_120px_120px_100px_80px] gap-4 px-4 py-3 border-b border-white/10 text-[10px] font-bold text-text-dim uppercase tracking-wider mb-2">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('date')}>
                      Data {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('title')}>
                      Título {sortField === 'title' && (sortDirection === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('category')}>
                      Categoria {sortField === 'category' && (sortDirection === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors justify-end" onClick={() => handleSort('amount')}>
                      Valor {sortField === 'amount' && (sortDirection === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors justify-center" onClick={() => handleSort('method')}>
                      Método de Pagamento {sortField === 'method' && (sortDirection === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                    </div>
                    <div className="flex justify-end">Ações</div>
                  </div>

                  <div className="flex flex-col gap-1 min-h-[600px]">
                    <AnimatePresence mode="popLayout">
                      {paginatedTransactions.map((tr) => (
                        <div key={tr.id}>
                          <TransactionRow 
                            tr={tr} 
                            onEdit={(tr) => {
                              setEditingTransaction(tr);
                              setModalType(tr.type);
                              setIsModalOpen(true);
                            }}
                            onDelete={(id) => handleDeleteTransaction(id)}
                          />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mt-8">
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Itens por página</label>
                      <select 
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-liquid/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl border transition-all font-mono text-sm ${
                              currentPage === page 
                                ? 'bg-accent-liquid border-accent-liquid text-bg shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                                : 'bg-white/5 border-white/10 text-text-dim hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
                      Página {currentPage} de {totalPages || 1}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'Planejamento' && (
              <motion.div 
                key="planning"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="glass-panel p-7">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Planejamento Financeiro</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button 
                          onClick={() => setPlanningTab('active')}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${planningTab === 'active' ? 'bg-accent-liquid text-bg shadow-lg shadow-accent-liquid/20' : 'text-text-dim hover:text-white'}`}
                        >
                          Ativas
                        </button>
                        <button 
                          onClick={() => setPlanningTab('history')}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider ${planningTab === 'history' ? 'bg-accent-liquid text-bg shadow-lg shadow-accent-liquid/20' : 'text-text-dim hover:text-white'}`}
                        >
                          Histórico
                        </button>
                      </div>
                      <button 
                        onClick={() => setIsGoalModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-liquid/10 text-accent-liquid border border-accent-liquid/20 hover:bg-accent-liquid/20 transition-all text-sm font-semibold"
                      >
                        <Plus size={16} /> NOVA META
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                      <h3 className="text-lg font-semibold mb-4">
                        {planningTab === 'active' ? 'Metas de Economia' : 'Metas Concluídas'}
                      </h3>
                      <div className="space-y-6">
                        {goals.filter(g => planningTab === 'active' ? !g.completed : g.completed).map(goal => (
                          <div key={goal.id}>
                            <GoalItem 
                              goal={goal} 
                              onToggleSubTask={(stId) => toggleSubTask(goal.id, stId)} 
                              onAddSubTask={(title) => addSubTask(goal.id, title)}
                              onComplete={() => completeGoal(goal.id)}
                            />
                          </div>
                        ))}
                        {goals.filter(g => planningTab === 'active' ? !g.completed : g.completed).length === 0 && (
                          <div className="text-center py-10 text-text-dim italic text-sm">
                            Nenhuma meta {planningTab === 'active' ? 'ativa' : 'no histórico'}.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Orçamento por Categoria</h3>
                        <div className="space-y-4">
                          <BudgetItem label="Alimentação" spent={840} limit={1200} />
                          <BudgetItem label="Transporte" spent={450} limit={600} />
                          <BudgetItem label="Lazer" spent={210} limit={500} />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Distribuição das Metas</h3>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={goals.filter(g => g.current > 0)}
                                dataKey="current"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                {goals.filter(g => g.current > 0).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color || '#22d3ee'} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                                contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Calendar size={20} className="text-accent-liquid" />
                      Calendário de Metas
                    </h3>
                    <GoalCalendar goals={goals} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'Relatórios' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="glass-panel p-7">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Relatórios de Desempenho</h2>
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setReportPeriod(p)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            reportPeriod === p ? 'bg-accent-liquid text-bg shadow-lg' : 'text-text-dim hover:text-white'
                          }`}
                        >
                          {p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensal' : 'Anual'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-10">
                    {/* Monthly Summary Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const currentMonth = cashFlowData[cashFlowData.length - 1] || { receitas: 0, despesas: 0 };
                        const prevMonth = cashFlowData[cashFlowData.length - 2] || { receitas: 0, despesas: 0 };
                        
                        const incomeChange = prevMonth.receitas > 0 
                          ? ((currentMonth.receitas - prevMonth.receitas) / prevMonth.receitas) * 100 
                          : (currentMonth.receitas > 0 ? 100 : 0);
                          
                        const expenseChange = prevMonth.despesas > 0 
                          ? ((currentMonth.despesas - prevMonth.despesas) / prevMonth.despesas) * 100 
                          : (currentMonth.despesas > 0 ? 100 : 0);

                        return (
                          <>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-text-dim uppercase tracking-wider">Receitas (Mês Atual)</span>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${incomeChange >= 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                  {incomeChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  {Math.abs(incomeChange).toFixed(1)}%
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-success">
                                R$ {currentMonth.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-text-dim">
                                vs R$ {prevMonth.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no mês anterior
                              </div>
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-text-dim uppercase tracking-wider">Despesas (Mês Atual)</span>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${expenseChange <= 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                  {expenseChange <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                  {Math.abs(expenseChange).toFixed(1)}%
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-danger">
                                R$ {currentMonth.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-text-dim">
                                vs R$ {prevMonth.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no mês anterior
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Cash Flow Chart */}
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-text-dim uppercase tracking-wider">Fluxo de Caixa Mensal</h3>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                          {[3, 6, 12, 24].map((m) => (
                            <button
                              key={m}
                              onClick={() => setCashFlowMonths(m)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                cashFlowMonths === m ? 'bg-accent-liquid text-bg' : 'text-text-dim hover:text-white'
                              }`}
                            >
                              {m}M
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={cashFlowData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke="rgba(255,255,255,0.3)" 
                              fontSize={12} 
                              tickLine={false} 
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.3)" 
                              fontSize={12} 
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              itemStyle={{ fontSize: '12px' }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Line 
                              type="monotone" 
                              dataKey="receitas" 
                              name="Receitas"
                              stroke="#10b981" 
                              strokeWidth={3} 
                              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#05070a' }} 
                              activeDot={{ r: 6, strokeWidth: 0 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="despesas" 
                              name="Despesas"
                              stroke="#f43f5e" 
                              strokeWidth={3} 
                              dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#05070a' }} 
                              activeDot={{ r: 6, strokeWidth: 0 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 pt-8 border-t border-white/5">
                    <div className="h-[300px] w-full">
                      <h3 className="text-sm font-semibold text-text-dim mb-4 uppercase tracking-wider">Tendência de Gastos vs Receitas</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REPORT_DATA[reportPeriod]}>
                          <defs>
                            <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `R$${value}`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="gastos" stroke="#f43f5e" fillOpacity={1} fill="url(#colorGastos)" />
                          <Area type="monotone" dataKey="receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorReceitas)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-[350px] w-full">
                      <h3 className="text-sm font-semibold text-text-dim mb-4 uppercase tracking-wider">Gastos Detalhados por Categoria</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REPORT_DATA[reportPeriod]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `R$${value}`}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '11px' }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Bar dataKey="Alimentação" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Transporte" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Moradia" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Lazer" stackId="a" fill="#a855f7" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Outros" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-[350px] w-full">
                      <h3 className="text-sm font-semibold text-text-dim mb-4 uppercase tracking-wider">Gastos Diários da Semana</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REPORT_DATA.weekly}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `R$${value}`}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '11px' }}
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Bar dataKey="Alimentação" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Transporte" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Moradia" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Lazer" stackId="a" fill="#a855f7" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Outros" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            )}

            {activeView === 'Configurações' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="glass-panel p-7">
                  <h2 className="text-2xl font-bold mb-6">Configurações</h2>
                  <div className="space-y-6">
                    <SettingToggle label="Notificações de Gastos" active />
                    <SettingToggle label="Modo Escuro Líquido" active />
                    <SettingToggle label="Sincronização Bancária" />
                    <SettingToggle label="Relatórios Semanais" active />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </main>

          {/* Right Panel */}
          <aside className={`right-panel ${activeView === 'Dashboard' ? 'xl:col-start-3 xl:row-start-1 lg:col-start-2 lg:row-start-2' : 'lg:col-start-2 lg:row-start-2'} grid grid-cols-1 ${activeView === 'Dashboard' ? 'xl:flex xl:flex-col lg:grid-cols-2' : 'xl:grid-cols-2'} gap-6 ${activeView !== 'Dashboard' ? 'pb-10' : ''}`}>
          
          <div className="glass-panel p-7">
            <h2 className="text-lg font-semibold text-white mb-5">Próximas Contas</h2>
            
            <AlertCard 
              title="VENCE EM 2 DIAS" 
              label="Netflix Premium" 
              value="R$ 55,90" 
              color="border-danger" 
              titleColor="text-red-300" 
            />

            <AlertCard 
              title="VENCE EM 5 DIAS" 
              label="Aluguel Outubro" 
              value="R$ 1.800,00" 
              color="border-amber-500/20" 
              titleColor="text-amber-300" 
              bg="bg-amber-500/5"
            />
          </div>

          <div className="glass-panel p-7 flex-grow">
            <h2 className="text-lg font-semibold text-white mb-6">Gastos por Categoria</h2>
            
            <div className="flex flex-col gap-6">
              {CATEGORY_SPENDING.map((cat) => {
                const config = CATEGORY_CONFIG[cat.name as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG['Outros'];
                const Icon = config.icon;
                return (
                  <div key={cat.name} className="category-item-wrap">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${config.bg} ${config.color}`}>
                          <Icon size={12} />
                        </div>
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className="font-mono text-xs">R$ {cat.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-1.5 bg-glass-border rounded-full w-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg width="128" height="128" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    fill="none" 
                    stroke="url(#liquid-grad)" 
                    strokeWidth="8" 
                    strokeDasharray="180 251" 
                    strokeLinecap="round" 
                    transform="rotate(-90 50 50)"
                    initial={{ strokeDashoffset: 251 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="800" fontFamily="Inter">72% GAUS</text>
                  <defs>
                    <linearGradient id="liquid-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#22d3ee" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className="text-[0.75rem] text-text-dim mt-3">Projeção de saúde financeira</p>
            </div>
          </div>

        </aside>
        </div>
      </div>

      {/* OCR Loader Overlay */}
      <AnimatePresence>
        {isOCRProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ocr-loader"
          >
            <div className="liquid-spinner"></div>
            <p className="font-mono tracking-[2px] text-accent-liquid">PROCESSANDO IMAGEM COM IA...</p>
            <p className="text-sm text-text-dim">Extraindo valores, datas e categorias via Vision API</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function NavItem({ icon, label, active = false, onClick, rightIcon }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, rightIcon?: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl font-medium transition-all w-full text-left group ${
        active 
          ? 'bg-white/8 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' 
          : 'text-text-dim hover:bg-white/4 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          animate={active ? { scale: 1.1, color: '#22d3ee' } : { scale: 1 }}
          className={`${active ? 'text-accent-liquid' : 'group-hover:text-white transition-colors'}`}
        >
          {icon}
        </motion.div>
        {label}
      </div>
      {rightIcon && (
        <div className="text-text-dim group-hover:text-accent-liquid transition-colors opacity-40 group-hover:opacity-100">
          {rightIcon}
        </div>
      )}
    </button>
  );
}

function TransactionRow({ tr, compact = false, onEdit, onDelete }: { 
  tr: Transaction, 
  compact?: boolean,
  onEdit?: (tr: Transaction) => void,
  onDelete?: (id: string) => void
}) {
  const config = CATEGORY_CONFIG[tr.category] || CATEGORY_CONFIG['Outros'];
  const Icon = config.icon;

  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 rounded-[20px] bg-white/2 hover:bg-white/5 border border-transparent hover:border-glass-border transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color} border border-white/5 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[0.95rem]">{tr.title}</p>
              {tr.predicted && (
                <span className="text-[0.5rem] px-1 py-0.2 rounded bg-accent-liquid/20 text-accent-liquid border border-accent-liquid/30 font-bold">
                  SUGESTÃO
                </span>
              )}
            </div>
            <p className="text-[0.75rem] text-text-dim mt-0.5">{tr.date} • {tr.category}</p>
            <p className="text-[0.65rem] text-text-dim/70 mt-0.5">{tr.timestamp} • {tr.method || 'Manual'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`font-mono text-right font-medium ${tr.type === 'expense' ? 'text-[#fda4af]' : 'text-success'}`}>
            {tr.type === 'expense' ? '-' : '+'}R$ {Math.abs(tr.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(tr); }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
              title="Editar"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(tr.id); }}
              className="p-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger transition-all"
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-[100px_1fr_120px_120px_100px_80px] items-center p-4 rounded-[20px] bg-white/2 hover:bg-white/5 border border-transparent hover:border-glass-border transition-all group gap-4"
    >
      <div className="text-sm text-text-dim font-mono">{tr.date}</div>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${config.bg} ${config.color} border border-white/5 group-hover:scale-110 transition-transform`}>
          <Icon size={16} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="font-semibold text-[0.95rem] truncate">{tr.title}</p>
          <p className="text-[0.7rem] text-text-dim mt-0.5 truncate">
            {tr.timestamp} • {tr.method || 'Manual'}
          </p>
        </div>
      </div>
      <div className="text-sm text-text-dim flex items-center gap-2">
        <span className={`${config.color}`}>{tr.category}</span>
        {tr.predicted && (
          <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-accent-liquid/20 text-accent-liquid border border-accent-liquid/30 font-bold animate-pulse">
            SUGESTÃO
          </span>
        )}
      </div>
      <div className={`font-mono text-right font-medium ${tr.type === 'expense' ? 'text-[#fda4af]' : 'text-success'}`}>
        {tr.type === 'expense' ? '-' : '+'}R$ {Math.abs(tr.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>
      <div className="flex justify-center">
        <span className={`text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase border ${
          tr.method === 'OCR' ? 'bg-accent-liquid/10 text-accent-liquid border-accent-liquid/20' : 
          tr.method === 'Manual' ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' : 
          'bg-white/10 text-white border-white/20'
        }`}>
          {tr.method}
        </span>
      </div>
      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit?.(tr); }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
          title="Editar"
        >
          <Edit2 size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete?.(tr.id); }}
          className="p-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger transition-all"
          title="Excluir"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function GoalItem({ goal, onToggleSubTask, onAddSubTask, onComplete }: { 
  goal: Goal, 
  onToggleSubTask: (id: string) => void, 
  onAddSubTask: (title: string) => void,
  onComplete?: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubTask, setNewSubTask] = useState('');
  
  const percent = goal.subTasks.length > 0 
    ? (goal.subTasks.filter(st => st.completed).length / goal.subTasks.length) * 100 
    : (goal.current / goal.target) * 100;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  };
  
  return (
    <div className="space-y-3">
      <div 
        className="cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between text-sm mb-1">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${goal.completed ? 'text-text-dim line-through' : ''}`}>{goal.label}</span>
            {isExpanded ? <ChevronUp size={14} className="text-text-dim" /> : <ChevronDown size={14} className="text-text-dim" />}
            {goal.completed && <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Concluída</span>}
          </div>
          <span className="font-mono">R$ {goal.current} / R$ {goal.target}</span>
        </div>
        
        {goal.dueDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-text-dim mb-2 uppercase tracking-wider font-bold">
            <Clock size={10} className="text-accent-liquid" />
            {goal.completed ? 'Concluída em: ' : 'Vence em: '} <span className="text-white">{formatDate(goal.dueDate)}</span>
          </div>
        )}

        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            className="h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            style={{ backgroundColor: goal.completed ? '#4b5563' : goal.color }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4 border-l border-white/10 space-y-3"
          >
            <div className="space-y-2">
              {goal.subTasks.map(st => (
                <div 
                  key={st.id} 
                  className="flex items-center justify-between group cursor-pointer py-1"
                  onClick={() => onToggleSubTask(st.id)}
                >
                  <div className="flex items-center gap-3">
                    {st.completed ? (
                      <CheckSquare size={16} className="text-accent-liquid" />
                    ) : (
                      <Square size={16} className="text-text-dim group-hover:text-white transition-colors" />
                    )}
                    <span className={`text-sm transition-all ${st.completed ? 'text-text-dim line-through' : 'text-white'}`}>
                      {st.title}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.completed ? 'bg-success/10 text-success' : 'bg-white/5 text-text-dim'}`}>
                    {st.completed ? 'CONCLUÍDO' : 'PENDENTE'}
                  </span>
                </div>
              ))}
            </div>

            {!goal.completed && (
              <div className="flex gap-2 mt-2">
                <input 
                  type="text" 
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  placeholder="Nova subtarefa..."
                  className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-liquid/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSubTask.trim()) {
                      onAddSubTask(newSubTask);
                      setNewSubTask('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newSubTask.trim()) {
                      onAddSubTask(newSubTask);
                      setNewSubTask('');
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            {!goal.completed && (
              <button 
                onClick={onComplete}
                className="w-full mt-4 py-2 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                Marcar como Concluída
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BudgetItem({ label, spent, limit }: { label: string, spent: number, limit: number }) {
  const percent = Math.min(100, (spent / limit) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span>{label}</span>
        <span className="font-mono">R$ {spent} de R$ {limit}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full rounded-full ${percent > 90 ? 'bg-danger' : 'bg-accent-liquid'}`}
        />
      </div>
    </div>
  );
}

function SettingToggle({ label, active = false }: { label: string, active?: boolean }) {
  const [isOn, setIsOn] = useState(active);
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5">
      <span className="font-medium">{label}</span>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={`w-12 h-6 rounded-full relative transition-colors ${isOn ? 'bg-accent-liquid' : 'bg-white/10'}`}
      >
        <motion.div 
          animate={{ x: isOn ? 26 : 2 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  );
}

function GoalCalendar({ goals }: { goals: Goal[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const days = [];
  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`pad-${i}`} className="h-14 border border-white/5 bg-white/2 opacity-20" />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayGoals = goals.filter(g => g.dueDate === dateStr);
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const isSelected = selectedDate === dateStr;

    days.push(
      <div 
        key={d}
        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
        className={`h-14 border border-white/5 p-1 relative cursor-pointer transition-all hover:bg-white/10 ${
          isSelected ? 'bg-accent-liquid/20 border-accent-liquid/50 z-10 scale-105 shadow-lg' : 'bg-white/4'
        } ${isToday ? 'ring-1 ring-accent-primary/50' : ''}`}
      >
        <span className={`text-[10px] font-mono ${isToday ? 'text-accent-primary font-bold' : 'text-text-dim'}`}>{d}</span>
        <div className="flex flex-wrap gap-0.5 mt-1">
          {dayGoals.map(g => (
            <div 
              key={g.id} 
              className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.3)]"
              style={{ backgroundColor: g.color }}
            />
          ))}
        </div>
        {dayGoals.length > 0 && !isSelected && (
          <div className="absolute bottom-1 right-1 text-[8px] font-bold text-accent-liquid">
            {dayGoals.length}
          </div>
        )}
      </div>
    );
  }

  const selectedGoals = selectedDate ? goals.filter(g => g.dueDate === selectedDate) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold font-mono uppercase tracking-wider">{monthNames[month]} {year}</h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-text-dim hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-text-dim hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-text-dim uppercase font-bold tracking-widest">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-liquid"></div> Metas</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-primary"></div> Hoje</div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="text-center py-2 text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-white/5">{d}</div>
        ))}
        {days}
      </div>

      <AnimatePresence>
        {selectedGoals.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-panel p-5 border-accent-liquid/30 bg-accent-liquid/5"
          >
            <h4 className="text-xs font-bold text-accent-liquid uppercase tracking-widest mb-3 flex items-center gap-2">
              <Calendar size={14} /> Metas para {selectedDate?.split('-').reverse().join('/')}
            </h4>
            <div className="space-y-3">
              {selectedGoals.map(g => (
                <div key={g.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: g.color }}></div>
                    <div>
                      <p className="font-semibold text-sm">{g.label}</p>
                      <p className="text-[10px] text-text-dim">Alvo: R$ {g.target.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold">{(g.current / g.target * 100).toFixed(0)}%</p>
                    <div className="w-20 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-accent-liquid" style={{ width: `${g.current / g.target * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="glass-panel p-6">
      <span className="text-[0.75rem] uppercase tracking-[1.5px] text-text-dim mb-2 block">{label}</span>
      <span className={`text-2xl font-mono font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="h-[120px] rounded-3xl border-2 border-dashed border-glass-border bg-transparent text-text-main cursor-pointer transition-all duration-400 hover:border-accent-liquid hover:bg-accent-liquid/5 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-3 font-semibold text-sm"
    >
      <span className="opacity-70">{icon}</span>
      {label}
    </button>
  );
}

function AlertCard({ title, label, value, color, titleColor, bg = "bg-danger/5" }: any) {
  return (
    <div className={`relative p-5 rounded-3xl border border-white/5 mb-3 overflow-hidden ${bg}`}>
      <div className={`absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full ${color.replace('border-', 'bg-')}`}></div>
      <p className={`text-[0.85rem] font-bold mb-1 ${titleColor}`}>{title}</p>
      <div className="flex justify-between items-center">
        <span className="text-[0.8rem] text-text-dim">{label}</span>
        <span className="font-mono text-sm">{value}</span>
      </div>
    </div>
  );
}
