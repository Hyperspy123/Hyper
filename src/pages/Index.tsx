import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { MapPin, ChevronRight, Zap, Search, SlidersHorizontal, Users, User, SearchX, Trophy, Star, ShieldCheck } from 'lucide-react';

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
      type: "2v2",
      isVerified: true
    },
    {
      id: "b2222222-2222-2222-2222-222222222222", 
      name: "ملعب بادل 2",
      location: "الملقا",
      price: "280",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
      description: "احجز ٣ مرات واحصل على ساعة مجانية",
      gender: "male",
      type: "2v2",
      isVerified: false
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "ملعب الرياض 3",
      location: "الصحافة",
      price: "220",
      image: "https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=1000",
      description: "حجزين = مشروب طاقة مجاني",
      gender: "male",
      type: "1v1",
      isVerified: true
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
      
      {/* --- محرك الخلفية المتطور (Background Engine) --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* لون القاعدة الداكن */}
        <div className="absolute inset-0 bg-[#05081d]" />
        
        {/* طبقة صورة الملعب المموهة (بشفافية أعلى للظهور) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-125 opacity-40 transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=2000')`,
            filter: 'blur(15px) brightness(0.4) contrast(1.1)' 
          }}
        />
        
        {/* طبقة نقاط الشبكة التقنية (Dots Grid) */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '35px 35px' 
          }} 
        />

        {/* إضاءات النيون (Glows) */}
        <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* تدرج تعتيم نهائي للتركيز */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05081d]/50 via-transparent to-[#05081d]" />
      </div>

      {/* --- محتوى الصفحة (Content Layer) --- */}
      <div className="relative z-10">
        <Header />
        
        <main className="p-6 max-w-md mx-auto space-y-10 pt-28">
          
          {/* شعار الهوية */}
          <section className="text-center space-y-4">
            <div className="flex justify-center mb-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20" />
                <div className="relative bg-white/5 border border-white/10 p-5 rounded-[35px] backdrop-blur-xl">
                   <Zap size={45} className="text-cyan-400 fill-cyan-400" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-6xl font-[1000] italic tracking-tighter uppercase leading-[0.8] flex flex-col items-center">
                HYPE <span className="text-cyan-400 text-4xl block mt-1 underline decoration-cyan-500/30 underline-offset-8">PADEL</span>
              </h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] pt-4 opacity-70">Elite Riyadh Community</p>
            </div>
          </section>

          {/* البحث والفلترة */}
          <div className="relative z-50 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[26px] opacity-20 group-focus-within:opacity-40 transition duration-500 blur" />
            <div className="relative flex gap-3">
              <div className="relative flex-1 group/input">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="ابحث عن ملاعب في الرياض..." 
                  className="w-full bg-[#0a0f3c]/60 backdrop-blur-3xl border border-white/10 p-4 pr-12 rounded-[24px] text-xs font-bold outline-none focus:border-cyan-500/50 transition-all shadow-2xl placeholder:text-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-[22px] border transition-all duration-500 ${
                  showFilters ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>

            {showFilters && (
              <div className="absolute top-full right-0 left-0 mt-4 p-8 bg-[#0a0f3c]/95 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-8 animate-in fade-in zoom-in-95 duration-300 z-[100]">
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

          {/* شبكة الملاعب */}
          <div className="grid gap-12">
            {filteredCourts.length > 0 ? filteredCourts.map((court) => (
              <div 
                key={court.id} 
                onClick={() => navigate(`/book/${court.id}`)} 
                className="group relative bg-[#0a0f3c]/40 backdrop-blur-xl rounded-[50px] overflow-hidden border border-white/10 cursor-pointer active:scale-[0.96] transition-all duration-500 shadow-2xl hover:border-cyan-500/30"
              >
                <div className="h-72 overflow-hidden relative">
                  <img src={court.image} alt={court.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05081d] via-transparent to-black/10" />
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {court.isVerified && (
                      <span className="bg-cyan-500 text-[#0a0f3c] px-3 py-1.5 rounded-2xl text-[9px] font-[1000] uppercase flex items-center gap-1 shadow-lg border border-cyan-400">
                        <ShieldCheck size={12} /> موثق
                      </span>
                    )}
                    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase backdrop-blur-xl border ${court.gender === 'female' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                      {court.gender === 'female' ? 'نسائي 🚺' : 'رجالي 🚹'}
                    </span>
                  </div>

                  <div className="absolute top-6 right-6 bg-yellow-500 text-black px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-2xl border border-yellow-400 rotate-3">
                    <Star size={14} className="fill-black" /> مـمـيـز
                  </div>
                </div>

                <div className="p-10 pt-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-[1000] italic tracking-tighter uppercase leading-none text-white">{court.name}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-bold tracking-tight">
                          <MapPin size={16} className="text-cyan-400" /> {court.location}
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-[28px] border border-white/10 text-center min-w-[100px] shadow-inner">
                      <span className="block text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] mb-1">SAR / HR</span>
                      <span className="text-2xl font-black text-white italic leading-none">{court.price}</span>
                    </div>
                  </div>

                  <button className="w-full mt-8 py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-[#0a0f3c] rounded-[30px] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all flex items-center justify-center gap-3">
                    احجز الآن <ChevronRight size={20} className="rotate-180" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-24 bg-white/5 backdrop-blur-xl rounded-[50px] border border-dashed border-white/20">
                <SearchX size={60} className="text-gray-700 mx-auto mb-6" />
                <h3 className="text-xl font-black text-white mb-2 tracking-tight">لا توجد ملاعب!</h3>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}