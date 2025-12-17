import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Expense } from "../types/Expense";
import { X, Save, IndianRupee, AlignLeft, Layers } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onUpdated: () => void;
}

const CATEGORIES = [
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

export default function EditExpenseModal({
  open,
  onClose,
  expense,
  onUpdated,
}: Props) {
  const [amount, setAmount] = useState<number | string>(0);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form with expense data
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setCategory(expense.category);
      setDate(expense.date);
      setDescription(expense.description || "");
      setIsIncome(expense.is_income);
    }
  }, [expense]);

  // LOGIC CHANGE: Watch for changes in isIncome
  useEffect(() => {
    // Only run this logic if the modal is open and we have an expense loaded
    if (open && expense) {
        if (isIncome) {
            setCategory("Income");
        } else if (category === "Income") {
            // If switching back to expense from income, reset to default or original
            setCategory(CATEGORIES[0]);
        }
    }
  }, [isIncome, open, expense]);

  if (!open || !expense) return null;

  const updateExpense = async () => {
    setLoading(true);
    
    // Ensure category is correct based on final state
    const finalCategory = isIncome ? "Income" : category;

    const { error } = await supabase
      .from("expenses")
      .update({
        amount: Number(amount),
        category: finalCategory,
        date,
        description,
        is_income: isIncome,
      })
      .eq("id", expense.id);
    
    setLoading(false);

    if (error) {
      alert("Error updating expense: " + error.message);
    } else {
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="glass-card w-full max-w-lg p-8 rounded-3xl relative z-10 animate-[scaleUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit3Icon /> Edit Transaction
            </h2>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
            
            {/* Amount */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-semibold">Amount</label>
                <div className="relative">
                    <IndianRupee className="absolute left-4 top-3.5 text-gray-500" size={18} />
                    <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-neon-pink focus:shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all font-bold"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-semibold">Description</label>
                <div className="relative">
                    <AlignLeft className="absolute left-4 top-3.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-neon-pink transition-all"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                    />
                </div>
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-semibold">Category</label>
                    <div className="relative">
                        <Layers className="absolute left-4 top-3.5 text-gray-500 pointer-events-none" size={18} />
                        <select
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-gray-300 focus:outline-none focus:border-neon-pink appearance-none ${
                                isIncome ? "opacity-50 cursor-not-allowed bg-white/10" : "cursor-pointer"
                            }`}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={isIncome} // DISABLED if Income
                        >
                            {isIncome ? (
                                <option value="Income" className="bg-[#1a1a1a]">Income</option>
                            ) : (
                                CATEGORIES.map((c) => (
                                    <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-semibold">Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-neon-pink transition-all [color-scheme:dark]"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Toggle Switch */}
            <div 
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsIncome(!isIncome)}
            >
                <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isIncome ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${isIncome ? 'left-7' : 'left-1'}`} />
                </div>
                <span className={`text-sm font-medium ${isIncome ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {isIncome ? "Income Transaction" : "Expense Transaction"}
                </span>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all font-medium"
                >
                    Cancel
                </button>

                <button
                    onClick={updateExpense}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold shadow-lg shadow-neon-pink/20 hover:shadow-neon-pink/40 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2"
                >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}

// Helper component for the icon
function Edit3Icon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neon-pink"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
    )
}