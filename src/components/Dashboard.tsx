import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Expense } from "../types/Expense";
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend, // Imported Legend
  ResponsiveContainer,
} from "recharts";

interface Props {
  userId: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any; 
}

interface TrendData {
  date: string;
  amount: number;
  [key: string]: any;
}

const COLORS = [
  "#ff007f", // Neon Pink
  "#7e22ce", // Purple
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink-500
];

export default function Dashboard({ userId }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setExpenses(data || []);

    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    let totalExpense = 0;
    let totalIncome = 0;

    data?.forEach((e) => {
      if (e.date.startsWith(thisMonth)) {
        if (e.is_income) totalIncome += e.amount;
        else totalExpense += e.amount;
      }
    });

    setMonthlyExpenses(totalExpense);
    setMonthlyIncome(totalIncome);
  };

  const categorySummary: ChartData[] = Object.values(
    expenses.reduce<Record<string, ChartData>>((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { name: exp.category, value: 0 };
      }
      if (!exp.is_income) acc[exp.category].value += exp.amount;
      return acc;
    }, {})
  );

  const dailyTrend: TrendData[] = Object.values(
    expenses.reduce<Record<string, TrendData>>((acc, exp) => {
      if (!acc[exp.date]) {
        acc[exp.date] = { date: exp.date.slice(5), amount: 0 }; // MM-DD
      }
      if (!exp.is_income) acc[exp.date].amount += exp.amount;
      return acc;
    }, {})
  );

  const netBalance = monthlyIncome - monthlyExpenses;

  // Shared Tooltip Style
  const tooltipStyle = {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
  };

  return (
    <div className="space-y-6">
      
      {/* 1. STAT CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Income */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Income</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">₹ {monthlyIncome}</h3>
            </div>
            <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <ArrowUpCircle size={24} />
            </div>
          </div>
          <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[80%] shadow-[0_0_10px_#10b981]" />
          </div>
        </div>

        {/* Expense */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Expense</p>
              <h3 className="text-2xl font-bold mt-1 text-red-400">₹ {monthlyExpenses}</h3>
            </div>
            <div className="p-2 bg-red-500/20 rounded-full text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <ArrowDownCircle size={24} />
            </div>
          </div>
          <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full w-[45%] shadow-[0_0_10px_#ef4444]" />
          </div>
        </div>

        {/* Balance */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden border-neon-pink/30 shadow-[0_0_20px_rgba(255,0,127,0.15)]">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">Net Balance</p>
              <h3 className="text-2xl font-bold mt-1 text-white">₹ {netBalance}</h3>
            </div>
            <div className="p-2 bg-neon-pink/20 rounded-full text-neon-pink shadow-[0_0_15px_rgba(255,0,127,0.4)]">
              <Wallet size={24} />
            </div>
          </div>
          <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-neon-pink h-full w-[70%] shadow-[0_0_10px_#ff007f]" />
          </div>
        </div>
      </div>

      {/* 2. CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* AREA CHART */}
        <div className="glass-card p-6 rounded-3xl min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-neon-pink" />
            Daily Spend Trend
          </h3>
          
          <div className="flex-1 w-full h-full min-h-[300px]">
            {dailyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff007f" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ff007f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#555" 
                    tick={{fill: '#ccc', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#555" 
                    tick={{fill: '#ccc', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: '#ff007f' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#ff007f" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSplit)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* PIE CHART */}
        <div className="glass-card p-6 rounded-3xl min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-200 mb-6">Category Breakdown</h3>
          
          <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center">
            {categorySummary.length === 0 ? (
              <div className="text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySummary}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {categorySummary.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={tooltipStyle}
                     itemStyle={{ color: '#fff' }}
                  />
                  {/* LEGEND ADDED HERE */}
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-gray-300 font-medium ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}