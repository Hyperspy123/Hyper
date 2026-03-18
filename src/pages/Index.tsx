import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { MapPin, ChevronRight, Zap, Search, SlidersHorizontal, Users, User, SearchX, Trophy } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  const COURTS_DATA = [
    {
      id: "d1111111-1111-1111-1111-111111111111",
      name: "ملعب هايب 1",
      location: "الدرعية",
      price: "250",
      image: "https://images.unsplash.com/photo-1626225967045-9c76db7b3ed4?q=80&w=1000",
      description: "احجز ٥ مرات واحصل على خصم ٢٠٪",
      gender: "female",
      type: "2v2"
    },
    {
      id: "b2222222-2222-2222-2222-222222222222", 
      name: "ملعب بادل 2",
      location: "الملقا",
      price: "280",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
      description: "احجز ٣ مرات واحصل على ساعة مجانية",
      gender: "male",
      type: "2v2"
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "ملعب الرياض 3",
      location: "الصحافة",
      price: "220",
      image: "https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=1000",
      description: "حجزين = مشروب طاقة مجاني",
      gender: "male",
      type: "1v1"
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | '1v1' | '2v2'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCourts = COURTS_DATA.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         court.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'all' || court.gender === genderFilter;
    const matchesType = typeFilter === 'all' || court.type === typeFilter;
    return matchesSearch && matchesGender && matchesType;
  });

  return (
    <div className="min-h-screen relative text-white pb-32 overflow-x-hidden">
      
      {/* 1. نظام الخلفية السينمائي (LAYERED BACKGROUND) */}
      <div className="fixed inset-0 z-[-1]">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=2000')`,
            filter: 'brightness(0.1) contrast(1.2)' 
          }}
        />
        {/* نيون متحرك في الخلفية */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05081d]/80 via-transparent to-[#05081d]" />
      </div>

      <Header />
      
      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-28">
        
        {/* قسم الترحيب المطور */}
        <section className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">ملاعب الرياض متاحة الآن</span>
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.85]">
            هايب <span className="text-cyan-400">Padel</span>
          </h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
            اختر ملعبك وابدأ التحدي الحقيقي
          </p>
        </section>

        {/* Search & Filter (Glassmorphism) */}
        <div className="relative z-50">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن ملعب أو حي..." 
                className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-4 pr-12 rounded-[24px] text-xs font-bold outline-none focus:border-cyan-500/50 transition-all shadow-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-[22px] border transition-all duration-500 ${
                showFilters 
                ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg shadow-cyan-500/40 rotate-180' 
                : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {showFilters && (
            <div className="absolute top-full right-0 left-0 mt-4 p-8 bg-[#0a0f3c]/90 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-8 animate-in fade-in zoom-in-95 duration-300" dir="rtl">
              <div>
                <div className="flex items-center gap-2 mb-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <User size={14} className="text-cyan-400" /> نوع الحجز
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'male', 'female'] as const).map((g) => (
                    <button key={g} onClick={() => setGenderFilter(g)} className={`py-3 rounded-2xl text-[10px] font-black border transition-all ${genderFilter === g ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {g === 'all' ? 'الكل' : g === 'male' ? 'رجالي' : 'نسائي'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <Users size={14} className="text-cyan-400" /> نمط اللعب
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', '1v1', '2v2'] as const).map((t) => (
                    <button key={t} onClick={() => setTypeFilter(t)} className={`py-3 rounded-2xl text-[10px] font-black border transition-all ${typeFilter === t ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {t === 'all' ? 'الكل' : t === '1v1' ? '1v1' : '2v2'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Court Grid (Premium Cards) */}
        <div className="grid gap-10">
          {filteredCourts.length > 0 ? filteredCourts.map((court) => (
            <div 
              key={court.id} 
              onClick={() => navigate(`/book/${court.id}`)} 
              className="group relative bg-white/5 backdrop-blur-xl rounded-[48px] overflow-hidden border border-white/10 cursor-pointer active:scale-[0.97] transition-all duration-500 shadow-2xl"
            >
              <div className="h-64 overflow-hidden relative">
                <img src={court.image} alt={court.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05081d] via-transparent to-transparent opacity-80" />
                
                {/* شارات الملعب */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase backdrop-blur-xl border ${court.gender === 'female' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                    {court.gender === 'female' ? 'نسائي 🚺' : 'رجالي 🚹'}
                  </span>
                  <span className="px-4 py-2 rounded-2xl text-[9px] font-black uppercase bg-black/40 text-gray-300 border border-white/10 backdrop-blur-xl text-center font-mono tracking-tighter">
                    {court.type}
                  </span>
                </div>

                <div className="absolute top-6 right-6 bg-cyan-500 text-[#0a0f3c] px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-2xl border border-cyan-400 animate-bounce-subtle">
                  <Trophy size={14} className="fill-[#0a0f3c]" /> تحدي نشط
                </div>
              </div>

              <div className="p-8 -mt-6 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{court.name}</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold tracking-tight">
                        <MapPin size={16} className="text-cyan-400" /> {court.location}
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-[28px] border border-white/10 text-center min-w-[100px] shadow-inner">
                    <span className="block text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">SAR / HR</span>
                    <span className="text-2xl font-black text-cyan-400 italic leading-none">{court.price}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 italic">
                  ⚡ {court.description}
                </div>

                <button className="w-full mt-6 py-5 bg-cyan-500 text-[#0a0f3c] rounded-[28px] font-black text-xs uppercase tracking-widest group-hover:bg-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 group-hover:gap-6">
                  احجز الآن <ChevronRight size={20} className="rotate-180" />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-24 bg-white/5 backdrop-blur-xl rounded-[48px] border border-dashed border-white/20">
              <SearchX size={60} className="text-gray-700 mx-auto mb-6 animate-pulse" />
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">لا توجد نتائج!</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">جرب البحث بكلمات مختلفة</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}