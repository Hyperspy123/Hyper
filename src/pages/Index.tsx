import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../LLL'; // تأكد من مسار ملف السوبابيس
import Header from '@/components/Header';
import { MapPin, ChevronRight, Zap, Search, SlidersHorizontal, Users, User, SearchX, Star, ShieldCheck, Loader2 } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | '1v1' | '2v2'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // جلب الملاعب من Supabase
  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courts')
        .select('*');
      
      if (!error && data) {
        setCourts(data);
      }
      setLoading(false);
    };
    fetchCourts();
  }, []);

  const filteredCourts = courts.filter(court => {
    const matchesSearch = (court.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (court.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'all' || court.gender === genderFilter;
    const matchesType = typeFilter === 'all' || court.type === typeFilter;
    return matchesSearch && matchesGender && matchesType;
  });

  return (
    <div className="min-h-screen relative text-white pb-32 overflow-x-hidden">
      {/* --- محرك الخلفية المتطور --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#05081d]" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-[15px]"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=2000')` }}
        />
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="p-6 max-w-md mx-auto space-y-10 pt-28">
          <section className="text-center space-y-4">
            <h2 className="text-6xl font-[1000] italic uppercase leading-[0.8] flex flex-col items-center">
              HYPE <span className="text-cyan-400 text-4xl block mt-1 underline decoration-cyan-500/30">PADEL</span>
            </h2>
          </section>

          {/* البحث */}
          <div className="relative flex gap-3">
            <input 
              type="text" 
              placeholder="ابحث عن ملاعب في الرياض..." 
              className="w-full bg-[#0a0f3c]/60 backdrop-blur-3xl border border-white/10 p-4 rounded-[24px] text-xs font-bold outline-none focus:border-cyan-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setShowFilters(!showFilters)} className={`p-4 rounded-[22px] border transition-all ${showFilters ? 'bg-cyan-500 text-[#0a0f3c]' : 'bg-white/5 border-white/10'}`}>
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* عرض الملاعب */}
          <div className="grid gap-12">
            {loading ? (
              <div className="flex flex-col items-center py-20 text-cyan-400 font-black italic">
                <Loader2 className="animate-spin mb-4" size={40} />
                جاري جلب الملاعب...
              </div>
            ) : filteredCourts.length > 0 ? filteredCourts.map((court) => (
              <div 
                key={court.id} 
                onClick={() => navigate(`/book/${court.id}`)} 
                className="group relative bg-[#0a0f3c]/40 backdrop-blur-xl rounded-[50px] overflow-hidden border border-white/10 cursor-pointer transition-all duration-500 shadow-2xl hover:border-cyan-500/30"
              >
                <div className="h-72 overflow-hidden relative">
                  {/* هنا التغيير المهم: نستخدم image_url من قاعدة البيانات */}
                  <img 
                    src={court.image_url || 'https://via.placeholder.com/500'} 
                    alt={court.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05081d] via-transparent to-black/10" />
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-cyan-500 text-[#0a0f3c] px-3 py-1.5 rounded-2xl text-[9px] font-[1000] uppercase shadow-lg border border-cyan-400">
                      موثق ✅
                    </span>
                  </div>
                </div>

                <div className="p-10 pt-4 relative z-10">
                  <div className="flex justify-between items-start text-right" dir="rtl">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-[1000] italic uppercase leading-none text-white">{court.name}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                          <MapPin size={16} className="text-cyan-400" /> {court.location}
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-[28px] border border-white/10 text-center min-w-[100px]">
                      <span className="block text-[8px] text-gray-600 font-black uppercase mb-1">SAR / HR</span>
                      <span className="text-2xl font-black text-white italic">{court.price_per_hour || court.price}</span>
                    </div>
                  </div>
                  <button className="w-full mt-8 py-5 bg-cyan-500 text-[#0a0f3c] rounded-[30px] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/30">
                    احجز الآن <ChevronRight size={20} className="rotate-180 inline-block mr-2" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-24 bg-white/5 rounded-[50px] border border-dashed border-white/20">
                <SearchX size={60} className="text-gray-700 mx-auto mb-6" />
                <h3 className="text-xl font-black text-white mb-2">لا توجد ملاعب!</h3>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}