import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Expense } from "../types/Expense";
import { 
  Search, Filter, Download, RefreshCw, 
  Edit3, Trash2, Calendar, FolderOpen 
} from "lucide-react";

import EditExpenseModal from "./EditExpenseModal";
import DeleteExpenseModal from "./DeleteExpenseModal";
import { exportExpensesToCSV } from "../utils/exportCsv";

interface Props {
  userId: string;
}

const CATEGORIES = [
  "All",
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Personal Care",
  "Miscellaneous",
];

export default function ExpensesTable({ userId }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Expense | null>(null);

  // Load expenses
  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    setLoading(false);

    if (error) {
      alert("Error fetching expenses: " + error.message);
    } else {
      setExpenses(data || []);
    }
  };

  // Unique months for dropdown
  const months = Array.from(new Set(expenses.map((e) => e.date.slice(0, 7))));

  // Filter logic
  const filtered = expenses.filter((exp) => {
    const matchesSearch = exp.description
      ?.toLowerCase()
      .includes(search.toLowerCase());

    // Allow "Income" to show if filtering by All, otherwise follow logic
    const matchesCategory =
      categoryFilter === "All" || exp.category === categoryFilter;

    const matchesMonth =
      monthFilter === "All" || exp.date.slice(0, 7) === monthFilter;

    return matchesSearch && matchesCategory && matchesMonth;
  });

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="text-neon-pink" /> Expense History
        </h2>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={fetchExpenses}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-pink/50 transition-all text-sm font-medium text-gray-300 hover:text-white flex-1 md:flex-none justify-center"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          
          <button
            onClick={() => exportExpensesToCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-all flex-1 md:flex-none justify-center"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Search */}
        <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
            <input
                type="text"
                placeholder="Search transactions..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink focus:shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3 relative">
            <Filter className="absolute left-4 top-3.5 text-gray-500" size={18} />
            <select
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-300 focus:outline-none focus:border-neon-pink transition-all appearance-none cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
            >
                {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat}</option>
                ))}
            </select>
        </div>

        {/* Month Filter */}
        <div className="md:col-span-3 relative">
            <Calendar className="absolute left-4 top-3.5 text-gray-500" size={18} />
            <select
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-300 focus:outline-none focus:border-neon-pink transition-all appearance-none cursor-pointer"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
            >
                <option value="All" className="bg-[#1a1a1a]">All Months</option>
                {months.map((m) => (
                    <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>
                ))}
            </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500 italic">
                  No transactions found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-gray-300 font-mono text-sm">{exp.date}</td>
                  
                  <td className="p-4">
                    {/* LOGIC UPDATE: Check is_income to show special badge */}
                    {exp.is_income ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Income
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 group-hover:bg-neon-pink/20 group-hover:text-neon-pink transition-colors">
                        {exp.category}
                      </span>
                    )}
                  </td>
                  
                  <td className={`p-4 font-bold text-base ${exp.is_income ? 'text-emerald-400' : 'text-white'}`}>
                    ₹ {exp.amount}
                  </td>
                  
                  <td className="p-4 text-gray-400 text-sm max-w-[200px] truncate">
                    {exp.description || "-"}
                  </td>
                  
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${
                        exp.is_income 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${exp.is_income ? "bg-emerald-400" : "bg-red-400"}`}></span>
                      {exp.is_income ? "Income" : "Expense"}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => { setSelected(exp); setEditOpen(true); }}
                            className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:scale-110 transition-all"
                            title="Edit"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button
                            onClick={() => { setSelected(exp); setDeleteOpen(true); }}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-110 transition-all"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      <EditExpenseModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        expense={selected}
        onUpdated={fetchExpenses}
      />

      <DeleteExpenseModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        expense={selected}
        onDeleted={fetchExpenses}
      />
    </div>
  );
}