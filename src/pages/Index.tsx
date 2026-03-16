import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/LLL'; 
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useI18n } from '@/lib/i18n';
import { MapPin, Star, Clock, Search, Filter, Zap } from 'lucide-react';

interface Court {
  id: string; // Changed from number to string to support UUIDs
  name: string;
  type: string;
  surface: string;
  price_per_hour: number;
  image_url: string;
  description: string;
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1626224484214-405021440a4e?auto=format&fit=crop&q=80&w=1000';

export default function Index() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const { data, error } = await supabase.from('courts').select('*');
        if (error) console.error(error);
        else if (data) {
          setCourts(data);
          setFilteredCourts(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  useEffect(() => {
    const results = courts.filter(court =>
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.surface.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourts(results);
  }, [searchQuery, courts]);

  const handleBooking = async (courtId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate(`/book/${courtId}`);
    } else {
      navigate('/auth');
    }
  };

  // Get the first court to use for the Featured Card dynamically
  const featuredCourt = courts[0];

  return (
    <div className="min-h-screen bg-[#0a0f3c] pb-24 text-white font-sans" dir="rtl">
      <Header />
      
      <div className="relative h-80 w-full overflow-hidden">
        <img src={HERO_IMAGE} className="w-full h-full object-cover scale-110" alt="Padel" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f3c] via-[#0a0f3c]/40 to-transparent" />
        <div className="absolute bottom-10 right-6 left-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-cyan-500 text-[#0a0f3c] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">موسم جديد</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter leading-none mb-2">احجز ملعبك الآن</h1>
          <p className="text-cyan-400 font-medium">تجربة بادل استثنائية في قلب الرياض</p>
        </div>
      </div>

      <main className="px-4 -mt-6 relative z-10">
        
        <div className="flex gap-2 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-4 top-3.5 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن ملعب أو منطقة..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14224d] border border-white/10 p-3.5 pr-12 rounded-2xl text-sm outline-none focus:border-cyan-500 text-right transition-all"
            />
          </div>
          <button className="bg-[#14224d] border border-white/10 p-3 rounded-2xl text-cyan-400 hover:bg-white/5 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* 3. DYNAMIC Featured Card */}
        {featuredCourt && (
          <section className="mb-10">
            <div className="relative group bg-[#14224d] rounded-[32px] overflow-hidden border border-cyan-500/20 shadow-2xl">
              <div className="h-64 relative overflow-hidden">
                <img 
                  src={featuredCourt.image_url || "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=1200"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Featured" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14224d] to-transparent" />
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                  <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold">الأكثر طلباً</span>
                </div>
              </div>
              <div className="p-6 -mt-12 relative z-10">
                <h3 className="text-2xl font-black mb-1 italic">{featuredCourt.name}</h3>
                <p className="text-gray-400 text-sm mb-4 flex items-center gap-1"><MapPin size={14} className="text-cyan-400" /> حي الملقا، الرياض</p>
                <button 
                  onClick={() => handleBooking(featuredCourt.id)} // Uses real UUID now
                  className="w-full py-4 bg-cyan-500 text-[#0a0f3c] font-black rounded-2xl shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-all active:scale-95"
                >
                  احجز الآن - {featuredCourt.price_per_hour} ريال
                </button>
              </div>
            </div>
          </section>
        )}

        <h2 className="text-xl font-black italic mb-6 flex items-center gap-2 tracking-tight">
          <Star className="text-cyan-400 fill-cyan-400" size={20} />
          {searchQuery ? `نتائج البحث عن "${searchQuery}"` : 'الملاعب المتاحة'}
        </h2>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="bg-[#14224d] h-48 rounded-3xl" />
          </div>
        ) : (
          <div className="grid gap-6 pb-10">
            {filteredCourts.length > 0 ? (
              filteredCourts.map((court) => (
                <div 
                  key={court.id} 
                  className="group bg-[#14224d]/50 backdrop-blur-sm rounded-[28px] overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all duration-300 shadow-lg"
                >
                  <div className="h-44 relative overflow-hidden">
                    <img 
                      src={court.image_url || 'https://images.unsplash.com/photo-1554068865-24bccd4e34b8?auto=format&fit=crop&q=80&w=1000'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={court.name} 
                    />
                    <div className="absolute bottom-3 left-3 bg-[#0a0f3c]/90 px-3 py-1 rounded-xl font-black text-cyan-400 border border-cyan-400/20 shadow-xl">
                      {court.price_per_hour} ريال
                    </div>
                  </div>

                  <div className="p-5 text-right">
                    <h3 className="text-lg font-bold mb-3 tracking-tight">{court.name}</h3>
                    <div className="flex items-center justify-start gap-4 text-gray-400 text-xs mb-5">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-cyan-500" /> {court.surface}</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="text-cyan-500" /> ٦٠ دقيقة</span>
                    </div>
                    
                    <button 
                      onClick={() => handleBooking(court.id)}
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-cyan-500 hover:text-[#0a0f3c] transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95"
                    >
                      حجز الآن
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[#14224d]/30 rounded-[32px] border border-dashed border-white/10">
                <p className="text-gray-500">لا توجد ملاعب تطابق بحثك...</p>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}