import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Expense } from "../types/Expense";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onDeleted: () => void;
}

export default function DeleteExpenseModal({
  open,
  onClose,
  expense,
  onDeleted,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!open || !expense) return null;

  const deleteExpense = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expense.id);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      onDeleted();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Red-tinted Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="glass-card w-full max-w-sm p-6 rounded-3xl relative z-10 animate-[scaleUp_0.2s_ease-out] border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
            <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
            {/* Warning Icon with Glow */}
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="text-red-500" size={32} />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Delete Transaction?</h2>
            
            <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone. You are about to remove:
            </p>

            {/* Expense Detail Preview */}
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 mb-6 flex justify-between items-center">
                <span className="text-gray-300 text-sm">{expense.description || "No Description"}</span>
                <span className="font-bold text-red-400">₹{expense.amount}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all font-medium text-sm"
                >
                    Cancel
                </button>

                <button
                    onClick={deleteExpense}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                    {loading ? (
                        "Deleting..."
                    ) : (
                        <>
                            <Trash2 size={16} /> Confirm Delete
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}