import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] flex items-center justify-center" dir="rtl">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-cyan-400/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">الصفحة غير موجودة</h1>
        <p className="text-gray-400 mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-all"
        >
          <Home size={18} />
          <span>العودة للرئيسية</span>
        </button>
      </div>
    </div>
  );
}