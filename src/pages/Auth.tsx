import { useState } from 'react';
import { supabase } from '../LLL';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap } from 'lucide-react';


export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      alert(isSignUp ? "Check your email!" : "Welcome back!");
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f3c] flex flex-col justify-center px-6 text-white">
      <div className="mb-10 text-center">
        <div className="inline-block p-4 bg-cyan-500/20 rounded-3xl mb-4">
          <Zap className="text-cyan-400" size={40} />
        </div>
        <h1 className="text-3xl font-bold italic">HYPER PADEL</h1>
        <p className="text-gray-400 mt-2">{isSignUp ? 'Create your player account' : 'Welcome back, champ'}</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-gray-500" size={20} />
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full bg-[#14224d] border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-cyan-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-4 text-gray-500" size={20} />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full bg-[#14224d] border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-cyan-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          disabled={loading}
          className="w-full py-4 bg-cyan-500 rounded-2xl font-bold text-lg hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button 
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-6 text-cyan-400 text-sm font-medium hover:underline"
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}