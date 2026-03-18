import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { MapPin, ChevronRight, Zap, Search, SlidersHorizontal, Users, User, Check, SearchX } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  // 1. SIMULATION DATA
  const COURTS_DATA = [
    {
      id: "d1111111-1111-1111-1111-111111111111",
      name: "ملعب هايب 1",
      location: "الدرعية",
      price: "250",
      image: "https://images.unsplash.com/photo-1626225967045-9c76db7b3ed4?q=80&w=1000",
      description: "تحدي: احجز ٥ مرات واحصل على خصم ٢٠٪",
      gender: "female",
      type: "2v2"
    },
    {
      id: "b2222222-2222-2222-2222-222222222222", 
      name: "ملعب بادل 2",
      location: "الملقا",
      price: "280",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
      description: "تحدي: احجز ٣ مرات واحصل على ساعة مجانية",
      gender: "male",
      type: "2v2"
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "ملعب الرياض 3",
      location: "الصحافة",
      price: "220",
      image: "https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=1000",
      description: "تحدي: حجزين = مشروب طاقة",
      gender: "male",
      type: "1v1"
    }
  ];

  // 2. STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | '1v1' | '2v2'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 3. FILTER LOGIC
  const filteredCourts = COURTS_DATA.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         court.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'all' || court.gender === genderFilter;
    const matchesType = typeFilter === 'all' || court.type === typeFilter;
    return matchesSearch && matchesGender && matchesType;
  });

  return (
    <div className="min-h-screen bg-transparent text-white pb-32" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto space-y-8">
        <section className="mt-4">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            هايب <span className="text-cyan-400">Padel</span>
          </h2>
          <p className="text-gray-400 text-[10px] mt-2 font-black uppercase tracking-widest opacity-60">
            اختر ملعبك وابدأ التحدي
          </p>
        </section>

        {/* Search & Filter */}
        <div className="relative z-50">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن ملعب أو حي..." 
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 p-4 pr-12 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 transition-all placeholder:text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                showFilters || genderFilter !== 'all' || typeFilter !== 'all' 
                ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {showFilters && (
            <div className="absolute top-full right-0 left-0 mt-3 p-6 bg-[#0a0f3c]/95 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <User size={14} /> التصنيف
                </div>
                <div className="flex gap-2">
                  {(['all', 'male', 'female'] as const).map((g) => (
                    <button key={g} onClick={() => setGenderFilter(g)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border transition-all ${genderFilter === g ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10'}`}>
                      {g === 'all' ? 'الكل' : g === 'male' ? 'رجالي' : 'نسائي'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <Users size={14} /> نوع اللعب
                </div>
                <div className="flex gap-2">
                  {(['all', '1v1', '2v2'] as const).map((t) => (
                    <button key={t} onClick={() => setTypeFilter(t)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border transition-all ${typeFilter === t ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10'}`}>
                      {t === 'all' ? 'الكل' : t === '1v1' ? '1 ضد 1' : '2 ضد 2'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Court Grid */}
        <div className="grid gap-8">
          {filteredCourts.length > 0 ? filteredCourts.map((court) => (
            <div key={court.id} onClick={() => navigate(`/book/${court.id}`)} className="group relative bg-white/5 backdrop-blur-xl rounded-[40px] overflow-hidden border border-white/10 cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-2xl hover:border-white/20">
              <div className="h-56 overflow-hidden relative">
                <img src={court.image} alt={court.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05081d]/90 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase backdrop-blur-md border ${court.gender === 'female' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>{court.gender === 'female' ? 'نسائي' : 'رجالي'}</span>
                  <span className="px-3 py-1.5 rounded-xl text-[8px] font-black uppercase bg-white/10 text-gray-300 border border-white/10 backdrop-blur-md">{court.type === '1v1' ? '1 ضد 1' : '2 ضد 2'}</span>
                </div>
                <div className="absolute top-4 right-4 bg-cyan-500 text-[#0a0f3c] px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 shadow-2xl border border-cyan-400">
                  <Zap size={12} className="fill-[#0a0f3c]" /> {court.description}
                </div>
              </div>
              <div className="p-8 pt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black mb-1 tracking-tight">{court.name}</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm font-bold"><MapPin size={14} className="text-cyan-400" /> {court.location}</div>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-center shadow-inner"><span className="block text-[8px] text-gray-500 font-black uppercase tracking-widest">الساعة</span><span className="text-xl font-black text-white">{court.price}</span></div>
                </div>
                <button className="w-full mt-6 py-4 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-black text-sm uppercase tracking-tighter hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(6,182,212,0.3)]">احجز الآن <ChevronRight size={18} className="rotate-180" /></button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-[40px] border border-dashed border-white/10">
              <SearchX size={48} className="text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-black text-white mb-2 tracking-tight">لم نجد أي ملعب!</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">جرب تغيير كلمات البحث أو خيارات الفرز</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}