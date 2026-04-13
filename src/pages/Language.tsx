import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { ChevronRight, Globe, Check, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Language() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // حفظ اللغة في المتصفح عشان ما تضيع إذا سوى تحديث
    localStorage.setItem('i18nextLng', lng);
    
    // تغيير اتجاه الصفحة (RTL للعربي و LTR للإنجليزي)
    const dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
    
    // إشعار سريع للمستخدم (اختياري)
    console.log(`Language changed to: ${lng}`);
  };

  const languages = [
    { 
      code: 'ar', 
      name: 'العربية', 
      label: 'ARABIC',
      flag: '🇸🇦', 
      desc: 'واجهة تطبيق عربية بالكامل' 
    },
    { 
      code: 'en', 
      name: 'English', 
      label: 'ENGLISH',
      flag: '🇺🇸', 
      desc: 'Full English interface' 
    }
  ];

  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-20" dir={isAr ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="p-6 max-w-md mx-auto pt-24 space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 active:scale-90 transition-all"
          >
            <ChevronRight size={20} className={isAr ? 'rotate-0' : 'rotate-180'} />
          </button>
          <div>
            <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none">
              {isAr ? 'اللغة' : 'Language'}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
              {isAr ? 'اختر لغتك المفضلة' : 'Select your preference'}
            </p>
          </div>
        </div>

        {/* Language Cards */}
        <div className="space-y-4">
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full p-6 rounded-[35px] border transition-all duration-500 flex items-center justify-between group relative overflow-hidden
                  ${isActive 
                    ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-[1.02]' 
                    : 'bg-[#0a0f3c] border-white/5 text-white hover:border-white/20 active:scale-95'
                  }`}
              >
                {/* زخرفة خلفية بسيطة للكارت المختار */}
                {isActive && (
                   <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                     <Languages size={100} />
                   </div>
                )}

                <div className="flex items-center gap-5 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner
                    ${isActive ? 'bg-[#0a0f3c]/10' : 'bg-white/5'}`}>
                    {lang.flag}
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-[#0a0f3c]/70' : 'text-cyan-400'}`}>
                      {lang.label}
                    </p>
                    <h3 className="font-[1000] text-xl italic leading-none">{lang.name}</h3>
                  </div>
                </div>

                {isActive && (
                  <div className="bg-[#0a0f3c] p-2 rounded-xl text-cyan-400 shadow-lg relative z-10">
                    <Check size={20} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-[#0a0f3c] p-8 rounded-[40px] border border-white/10 text-center space-y-3 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-2">
            <Globe className="text-cyan-400 animate-[spin_10s_linear_infinite]" size={32} />
          </div>
          <p className="text-xs font-bold text-gray-400 leading-relaxed px-4">
            {isAr 
              ? 'تغيير اللغة سيقوم بتحديث جميع النصوص والاتجاهات داخل التطبيق فوراً' 
              : 'Changing the language will instantly update all texts and layouts across the app'}
          </p>
        </div>
      </main>
    </div>
  );
}