import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../LLL'; 
import Header from '@/components/Header';
import { MapPin, ChevronRight, Zap, Search, SlidersHorizontal, Users, User, SearchX, Star, ShieldCheck, Loader2, Crown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; 

export default function Index() {
  const { t, dir, lang } = useLanguage(); 
  const navigate = useNavigate();
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | '1v1' | '2v2'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 🔥 نظام التصنيفات المأخوذ من الملف الشخصي 🔥
  const matchesPlayed = 3; 
  const ranks = [
    { titleAr: 'مبتدئ', titleEn: 'Beginner', req: 0 },
    { titleAr: 'محترف', titleEn: 'Pro', req: 50 },
    { titleAr: 'نخبة', titleEn: 'Elite', req: 100 }
  ];

  const currentRankIndex = ranks.reduce((acc, rank, index) => matchesPlayed >= rank.req ? index : acc, 0);
  const nextRank = ranks[currentRankIndex + 1] || ranks[ranks.length - 1];
  let progressPercent = 100;
  if (matchesPlayed < 100) {
    progressPercent = ((matchesPlayed - currentRank.req) / (nextRank.req - currentRank.req)) * 100;
  }

  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('courts').select('*');
      if (!error && data) {
        setCourts(data);
      }
      setLoading(false);
    };
    fetchCourts();
  }, []);

  const filteredCourts = courts.filter(court => {
    const safeName = String(court.name || '').toLowerCase();
    const safeLocation = String(court.location || '').toLowerCase();
    const safeGender = String(court.gender || '').toLowerCase();
    const safeType = String(court.type || '').toLowerCase();

    const searchStr = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchStr || safeName.includes(searchStr) || safeLocation.includes(searchStr);
    
    let matchesGender = true;
    if (genderFilter !== 'all') {
      const isFemale = safeGender.includes('female') || safeGender.includes('women') || safeGender.includes('نسا');
      if (genderFilter === 'female') {
        matchesGender = isFemale;
      } else if (genderFilter === 'male') {
        matchesGender = !isFemale; 
      }
    }
    
    let matchesType = true;
    if (typeFilter !== 'all') {
      const is1v1 = safeType.includes('1') || safeType.includes('single') || safeType.includes('فردي');
      if (typeFilter === '1v1') {
        matchesType = is1v1;
      } else if (typeFilter === '2v2') {
        matchesType = !is1v1; 
      }
    }
    
    return matchesSearch && matchesGender && matchesType;
  });

  return (
    <div className="min-h-screen relative text-white pb-32 overflow-x-hidden" dir={dir}>
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#05081d]" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-125 opacity-40 transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=2000')`,
            filter: 'blur(15px) brightness(0.4) contrast(1.1)' 
          }}
        />
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '35px 35px' }} />
        <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05081d]/50 via-transparent to-[#05081d]" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="p-6 max-w-md mx-auto space-y-6 pt-24">
          <section className="text-center space-y-4">
            <div className="flex justify-center mb-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20" />
                <div className="relative bg-white/5 border border-white/10 p-5 rounded-[30px] backdrop-blur-xl">
                   <Zap size={35} className="text-cyan-400 fill-cyan-400" />
                </div>
              </div>
            </div>
            <div className="space-y-1 mb-4">
              <h2 className="text-5xl font-[1000] italic tracking-tighter uppercase leading-[0.8] flex flex-col items-center">
                HYPER <span className="text-cyan-400 text-3xl block mt-1 underline decoration-cyan-500/30 underline-offset-8">PADEL</span>
              </h2>
            </div>
          </section>

          <div className="relative z-50 group mt-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[20px] opacity-20 group-focus-within:opacity-40 transition duration-500 blur" />
            <div className="relative flex gap-3">
              <div className="relative flex-1 group/input">
                <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors`} size={16} />
                <input 
                  type="text" 
                  placeholder={lang === 'ar' ? 'ابحث عن ملاعب في الرياض...' : 'Search for courts...'} 
                  className={`w-full bg-[#0a0f3c]/60 backdrop-blur-3xl border border-white/10 p-3.5 ${dir === 'rtl' ? 'pr-10' : 'pl-10'} rounded-[18px] text-xs font-bold outline-none focus:border-cyan-500/50 transition-all shadow-2xl placeholder:text-gray-600`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`p-3.5 rounded-[16px] border transition-all duration-500 ${showFilters ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                <SlidersHorizontal size={18} />
              </button>
            </div>

            {showFilters && (
              <div className="absolute top-full right-0 left-0 mt-3 p-5 bg-[#0a0f3c]/95 backdrop-blur-3xl rounded-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5 animate-in fade-in zoom-in-95 duration-300 z-[100]">
                <div>
                  <div className={`flex items-center gap-2 mb-2 text-gray-400 text-[9px] font-black uppercase tracking-widest ${dir === 'ltr' ? 'flex-row' : ''}`}>
                    <User size={12} className="text-cyan-400" /> {lang === 'ar' ? 'الفئة' : 'CATEGORY'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setGenderFilter('all')} className={`py-2 rounded-xl text-[9px] font-black border transition-all ${genderFilter === 'all' ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {t('filter_all' as any) || 'الكل'}
                    </button>
                    <button onClick={() => setGenderFilter('male')} className={`py-2 rounded-xl text-[9px] font-black border transition-all ${genderFilter === 'male' ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {t('filter_mens' as any) || 'رجالي'}
                    </button>
                    <button onClick={() => setGenderFilter('female')} className={`py-2 rounded-xl text-[9px] font-black border transition-all ${genderFilter === 'female' ? 'bg-purple-500 border-purple-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {t('filter_womens' as any) || 'نسائي'}
                    </button>
                  </div>
                </div>

                <div>
                  <div className={`flex items-center gap-2 mb-2 text-gray-400 text-[9px] font-black uppercase tracking-widest ${dir === 'ltr' ? 'flex-row' : ''}`}>
                    <Users size={12} className="text-cyan-400" /> {lang === 'ar' ? 'نمط اللعب' : 'PLAY STYLE'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setTypeFilter('all')} className={`py-2 rounded-xl text-[9px] font-black border transition-all ${typeFilter === 'all' ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {t('filter_all' as any) || 'الكل'}
                    </button>
                    <button onClick={() => setTypeFilter('1v1')} className={`py-2 rounded-xl text-[9px] font-black border transition-all ${typeFilter === '1v1' ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {t('filter_1v1' as any) || '1 VS 1'}
                    </button>
                    <button onClick={() => setTypeFilter('2v2')} className={`py-2 rounded-xl text-[9px] font-black border transition-all ${typeFilter === '2v2' ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {t('filter_2v2' as any) || '2 VS 2'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 🔥 التصميم الجديد للملاعب (مستطيلات مدمجة) 🔥 */}
          <div className="grid gap-4 mt-4">
            {loading ? (
              <div className="flex flex-col items-center py-20 text-cyan-400 font-black italic">
                <Loader2 className="animate-spin mb-4" size={40} /> {lang === 'ar' ? 'جاري جلب الملاعب...' : 'Fetching Courts...'}
              </div>
            ) : filteredCourts.length > 0 ? filteredCourts.map((court) => {
              const isFemale = String(court.gender || '').toLowerCase().includes('female') || String(court.gender || '').includes('نسا');
              const is1v1 = String(court.type).toLowerCase().includes('1');

              return (
                <div 
                  key={court.id} 
                  onClick={() => navigate(`/book/${court.id}`)} 
                  className="group relative bg-[#0a0f3c]/60 backdrop-blur-xl rounded-[24px] overflow-hidden border border-white/10 cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-xl hover:border-cyan-500/40 flex h-36"
                >
                  {/* قسم الصورة (يأخذ 35% من العرض) */}
                  <div className="w-[35%] h-full relative overflow-hidden shrink-0">
                    <img src={court.image_url || court.image} alt={court.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className={`absolute inset-0 bg-gradient-to-${dir === 'rtl' ? 'l' : 'r'} from-[#0a0f3c]/90 to-transparent`} />
                    
                    {/* الشارات المصغرة فوق الصورة */}
                    <div className={`absolute top-2 ${dir === 'rtl' ? 'right-2' : 'left-2'} flex flex-col gap-1`}>
                      {court.isVerified && (
                        <span className="bg-cyan-500 text-[#0a0f3c] p-1 rounded-md shadow-lg border border-cyan-400">
                          <ShieldCheck size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* قسم التفاصيل (يأخذ 65% من العرض) */}
                  <div className={`w-[65%] p-4 flex flex-col justify-between relative z-10 ${dir === 'rtl' ? '-mr-6' : '-ml-6'}`}>
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xl font-[1000] italic uppercase leading-none truncate text-white">{court.name}</h3>
                        <div dir="ltr" className="bg-[#05081d]/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5 text-center shrink-0">
                          <span className="block text-[14px] font-black text-cyan-400 italic leading-none">{court.price_per_hour || court.price}</span>
                          <span className="text-[6px] text-gray-500 font-black uppercase tracking-widest mt-0.5 block">SAR/HR</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1.5 text-gray-400 text-[9px] font-bold tracking-tight">
                        <MapPin size={10} className="text-cyan-500" /> 
                        <span className="truncate">{court.location}</span>
                      </div>
                    </div>

                    {/* الفئات وزر الحجز المصغر */}
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border ${isFemale ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {isFemale ? (lang === 'ar' ? 'نسائي' : 'Women') : (lang === 'ar' ? 'رجالي' : 'Men')}
                        </span>
                        {court.type && (
                          <span dir="ltr" className="px-2 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-md text-[8px] font-black uppercase">
                            {is1v1 ? '1 VS 1' : '2 VS 2'}
                          </span>
                        )}
                      </div>

                      <button className="bg-cyan-500 text-[#0a0f3c] p-2 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:bg-cyan-400 transition-colors">
                        <ChevronRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  </div>
                  
                  {/* نجمة مميز */}
                  <div className={`absolute top-0 ${dir === 'rtl' ? 'left-4' : 'right-4'} bg-yellow-500 p-1.5 rounded-b-lg shadow-lg`}>
                    <Star size={10} className="fill-[#0a0f3c] text-[#0a0f3c]" />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-[30px] border border-dashed border-white/20 mt-4">
                <SearchX size={50} className="text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-white mb-1 tracking-tight">
                  {lang === 'ar' ? 'لا توجد ملاعب!' : 'No Courts!'}
                </h3>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}