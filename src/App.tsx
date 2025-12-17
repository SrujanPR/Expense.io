import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { LogOut, Wallet, Loader2 } from "lucide-react";
import AddExpense from "./components/AddExpense";
import ExpensesTable from "./components/ExpensesTable";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-neon-pink">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-8 relative overflow-x-hidden selection:bg-neon-pink selection:text-white">
      
      {/* --- INCREASED BACKGROUND INTENSITY --- */}
      
      {/* 1. Global Pink Ambient Light (opacity-30 -> much stronger) */}
      <div className="fixed inset-0 bg-neon-pink/10 pointer-events-none -z-30" />

      {/* 2. Top Left Purple (Stronger) */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#7e22ce] blur-[120px] -z-20 opacity-50 pointer-events-none animate-pulse" />
      
      {/* 3. Bottom Right Hot Pink (Stronger) */}
      <div className="fixed bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#ff007f] blur-[120px] -z-20 opacity-50 pointer-events-none animate-pulse" />
      
      {/* 4. Center Spotlight (New) */}
      <div className="fixed top-[30%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-neon-pink blur-[180px] -z-20 opacity-20 pointer-events-none" />


      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 animate-[slideUp_0.6s_ease-out_forwards]">
          <div className="flex items-center gap-2">
            <div className="bg-neon-pink/20 p-2 rounded-xl border border-neon-pink/40 shadow-[0_0_20px_rgba(255,0,127,0.4)]">
               <Wallet className="text-neon-pink w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,0,127,0.5)]">
              EXPENSE<span className="text-neon-pink">.io</span>
            </h1>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="group flex items-center gap-2 px-5 py-2.5 bg-[#ff007f]/20 hover:bg-[#ff007f] text-white border border-[#ff007f]/50 rounded-xl transition-all duration-300 font-medium shadow-[0_0_15px_rgba(255,0,127,0.2)] hover:shadow-[0_0_30px_rgba(255,0,127,0.6)]"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 animate-[slideUp_0.6s_ease-out_forwards]" style={{ animationDelay: '100ms' }}>
             <AddExpense userId={user.id} />
          </div>
          <div className="lg:col-span-8 animate-[slideUp_0.6s_ease-out_forwards]" style={{ animationDelay: '200ms' }}>
             <Dashboard userId={user.id} />
          </div>
          <div className="lg:col-span-12 animate-[slideUp_0.6s_ease-out_forwards]" style={{ animationDelay: '300ms' }}>
             <ExpensesTable userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- AUTH SCREEN --------------------------- */

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    setLoading(true);
    let response;
    if (mode === "login") {
      response = await supabase.auth.signInWithPassword({ email, password });
    } else {
      response = await supabase.auth.signUp({ email, password });
    }
    setLoading(false);
    if (response.error) {
      alert(response.error.message);
      return;
    }
    if (mode === "signup") {
        alert("Signup successful! Check your email or log in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-[#0a0508]">
      
      {/* Stronger Auth Backgrounds */}
      <div className="absolute inset-0 bg-neon-pink/5 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-[#7e22ce] blur-[150px] rounded-full opacity-40" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-[#ff007f] blur-[150px] rounded-full opacity-40" />

      <div className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 animate-[scaleUp_0.5s_ease-out] border-t border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tighter mb-2 text-white drop-shadow-md">
              EXPENSE<span className="text-neon-pink drop-shadow-[0_0_15px_rgba(255,0,127,0.8)]">.io</span>
            </h1>
            <p className="text-gray-300">
                {mode === "login" ? "Welcome back, Chief." : "Join the neon revolution."}
            </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold ml-1">Email</label>
            <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-neon-pink focus:shadow-[0_0_20px_rgba(255,0,127,0.3)] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold ml-1">Password</label>
            <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-neon-pink focus:shadow-[0_0_20px_rgba(255,0,127,0.3)] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-[0_0_25px_rgba(255,0,127,0.5)] hover:shadow-[0_0_40px_rgba(255,0,127,0.7)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Processing...
                </span>
            ) : (
                mode === "login" ? "LOGIN" : "CREATE ACCOUNT"
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {mode === "login" ? "First time here?" : "Already have an account?"}
            <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="ml-2 text-neon-pink hover:text-white font-medium underline-offset-4 hover:underline transition-colors shadow-neon-pink drop-shadow-[0_0_5px_rgba(255,0,127,0.8)]"
            >
              {mode === "login" ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}