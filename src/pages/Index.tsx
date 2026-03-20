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
      image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=800",
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
      image: "https://images.unsplash.com/photo-1554062614-6da4d9753066?q=80&w=800",
      description: "احجز ٣ مرات واحصل على ساعة مجانية",
      gender: "male",
      type: "2v2",
      isVerified: false
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
    /* اجعل الخلفية هنا bg-transparent لكي تظهر نجوم App.tsx */
    <div className="min-h-screen bg-transparent text-white pb-32 relative z-10" dir="rtl">
      
      <Header />
      
      <main className="p-6 max-w-md mx-auto space-y-10 pt-28">
        
        {/* شعار الهوية - مع تأثير توهج شفاف */}
        <section className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-10" />
              <div className="relative bg-white/5 border border-white/10 p-5 rounded-[35px] backdrop-blur-3xl">
                 <Zap size={45} className="text-cyan-400 fill-cyan-400" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-6xl font-[1000] italic tracking-tighter uppercase leading-[0.8] flex flex-col items-center">
              HYPE <span className="text-cyan-400 text-4xl block mt-1 underline decoration-cyan-500/20 underline-offset-8">PADEL</span>
            </h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] pt-4 italic">Elite Riyadh Community</p>
          </div>
        </section>

        {/* البحث والفلترة - بستايل زجاجي شفاف */}
        <div className="relative z-50 group">
          <div className="relative flex gap-3">
            <div className="relative flex-1 group/input">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن ملاعب في الرياض..." 
                className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 p-4 pr-12 rounded-[24px] text-xs font-bold outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-[22px] border transition-all duration-500 ${
                showFilters ? 'bg-cyan-500 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {showFilters && (
            <div className="absolute top-full right-0 left-0 mt-4 p-8 bg-[#0a0f3c]/90 backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300 z-[100]">
              <div className="space-y-6">
                <div>
                  <div className="text-gray-400 text-[10px] font-black uppercase mb-3 px-2 italic">نوع الحجز</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['all', 'male', 'female'] as const).map((g) => (
                      <button key={g} onClick={() => setGenderFilter(g)} className={`py-3 rounded-2xl text-[10px] font-black border transition-all ${genderFilter === g ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                        {g === 'all' ? 'الكل' : g === 'male' ? 'رجالي' : 'نسائي'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* شبكة الملاعب - كروت زجاجية عائمة فوق النجوم */}
        <div className="grid gap-12">
          {filteredCourts.map((court) => (
            <div 
              key={court.id} 
              onClick={() => navigate(`/book/${court.id}`)} 
              className="group relative bg-white/5 backdrop-blur-2xl rounded-[50px] overflow-hidden border border-white/10 cursor-pointer active:scale-[0.96] transition-all duration-500 shadow-2xl hover:border-cyan-500/30"
            >
              <div className="h-72 overflow-hidden relative">
                <img src={court.image} alt={court.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05081d]/80 via-transparent to-transparent" />
                
                <div className="absolute top-6 left-6">
                   <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase backdrop-blur-xl border ${court.gender === 'female' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'}`}>
                    {court.gender === 'female' ? 'نسائي 🚺' : 'رجالي 🚹'}
                  </span>
                </div>
              </div>

              <div className="p-10 pt-4 relative z-10 text-right">
                <div className="flex justify-between items-start">
                   <div className="bg-white/5 backdrop-blur-md p-4 rounded-[28px] border border-white/10 text-center min-w-[90px]">
                    <span className="block text-[8px] text-gray-500 font-black uppercase mb-1">SAR / HR</span>
                    <span className="text-2xl font-black text-white italic leading-none">{court.price}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-[1000] italic tracking-tighter uppercase leading-none text-white">{court.name}</h3>
                    <div className="flex items-center gap-2 justify-end text-gray-500 text-xs font-bold">
                        {court.location} <MapPin size={14} className="text-cyan-400" />
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 py-5 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                   احجز الآن <ChevronRight size={20} className="rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}