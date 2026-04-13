import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Globe, Shield, UserX, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400">
            <ChevronRight size={20} />
          </button>
          <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">الإعدادات</h1>
        </div>

        <div className="space-y-4">
          {/* خيار اللغة - معطل حالياً أو يوجه لرسالة */}
          <button 
            onClick={() => toast.info("اللغة العربية هي اللغة المدعومة حالياً")}
            className="w-full p-6 bg-white/5 rounded-[30px] border border-white/10 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-[#0a0f3c] transition-all">
                <Globe size={20} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase">اللغة / Language</p>
                <p className="font-bold">العربية</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-600" />
          </button>

          <button className="w-full p-6 bg-white/5 rounded-[30px] border border-white/10 flex items-center justify-between group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Shield size={20} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase">الخصوصية</p>
                <p className="font-bold">إعدادات الأمان</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

        <div className="pt-8">
          <button 
            onClick={() => toast.error("يرجى التواصل مع الدعم لحذف الحساب")}
            className="w-full p-6 bg-red-500/5 rounded-[30px] border border-red-500/10 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                <UserX size={20} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">منطقة الخطر</p>
                <p className="font-bold text-red-500">حذف الحساب نهائياً</p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}