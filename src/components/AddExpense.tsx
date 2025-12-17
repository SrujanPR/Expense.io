import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Expense } from "../types/Expense";
import { PlusCircle, Calendar, AlignLeft, IndianRupee, Loader2 } from "lucide-react";

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
  "Miscellaneous"
];

interface Props {
  userId: string;
}

export default function AddExpense({ userId }: Props) {
  const [amount, setAmount] = useState<number | string>(""); 
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [loading, setLoading] = useState(false);

  // LOGIC CHANGE: Automatically set category to "Income" when toggle is active
  useEffect(() => {
    if (isIncome) {
      setCategory("Income");
    } else {
      setCategory(CATEGORIES[0]);
    }
  }, [isIncome]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setLoading(true);

    const expense: Expense = {
      user_id: userId,
      amount: Number(amount),
      category, // This will now be "Income" if isIncome is true
      date,
      description,
      is_income: isIncome,
    };

    const { error } = await supabase.from("expenses").insert([expense]);
    setLoading(false);

    if (error) {
      alert("Error adding expense: " + error.message);
    } else {
      // Reset form
      setAmount("");
      setCategory(CATEGORIES[0]);
      setDescription("");
      setIsIncome(false);
    }
  };

  return (
    <div className="glass-card h-full p-6 rounded-3xl relative overflow-hidden group">
      {/* Decorative Glow Blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-pink/20 rounded-full blur-3xl group-hover:bg-neon-pink/30 transition-all duration-700 pointer-events-none" />

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white relative z-10">
        <PlusCircle className="text-neon-pink" size={24} />
        New Transaction
      </h2>

      <form onSubmit={handleAdd} className="space-y-5 relative z-10">
        
        {/* Amount Input */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-semibold">Amount</label>
          <div className="relative group/input">
            <IndianRupee className="absolute left-4 top-3.5 text-gray-500 group-focus-within/input:text-neon-pink transition-colors" size={18} />
            <input
              type="number"
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-neon-pink focus:shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all text-lg font-bold placeholder-gray-600"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-semibold">Details</label>
          <div className="relative group/input">
            <AlignLeft className="absolute left-4 top-3.5 text-gray-500 group-focus-within/input:text-neon-pink transition-colors" size={18} />
            <input
              type="text"
              placeholder="Description..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-neon-pink focus:shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all placeholder-gray-600"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-semibold">Category</label>
            <select
              className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-neon-pink focus:shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all appearance-none ${
                isIncome ? "opacity-50 cursor-not-allowed bg-white/10" : "cursor-pointer hover:bg-white/10"
              }`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isIncome} // DISABLED if Income
            >
              {isIncome ? (
                // Only show this option if Income is selected
                <option value="Income" className="bg-[#1a1a1a] text-white">Income</option>
              ) : (
                CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#1a1a1a] text-white">
                    {cat}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase tracking-widest ml-1 font-semibold">Date</label>
            <div className="relative group/input">
              <Calendar className="absolute right-4 top-3.5 text-gray-500 pointer-events-none group-focus-within/input:text-neon-pink transition-colors" size={18} />
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-neon-pink focus:shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all [color-scheme:dark]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Custom Toggle Switch for Income */}
        <div 
          className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => setIsIncome(!isIncome)}
        >
          <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isIncome ? 'bg-emerald-500' : 'bg-gray-600'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${isIncome ? 'left-7' : 'left-1'}`} />
          </div>
          <span className={`text-sm font-medium ${isIncome ? 'text-emerald-400' : 'text-gray-400'}`}>
            {isIncome ? "Marked as Income" : "Mark as Income"}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-neon-pink to-purple-600 p-4 font-bold text-white shadow-lg shadow-neon-pink/20 transition-all hover:scale-[1.02] hover:shadow-neon-pink/40 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
            {loading ? "ADDING..." : "ADD ENTRY"}
          </span>
          {/* Button Shine Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>

      </form>
    </div>
  );
}