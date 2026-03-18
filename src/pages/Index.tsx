import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { MapPin, ChevronRight, Star, Zap } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  const COURTS_DATA = [
    {
      id: "d1111111-1111-1111-1111-111111111111", // Court 1
      name: "ملعب ١",
      location: "الدرعية",
      price: "250",
      image: "https://images.unsplash.com/photo-1626225967045-9c76db7b3ed4?q=80&w=1000",
      description: "تحدي: احجز ٥ مرات واحصل على خصم ٢٠٪"
    },
    {
      // FIXED: Changed 'm' to 'b' to make it a valid Hex UUID
      id: "b2222222-2222-2222-2222-222222222222", 
      name: "ملعب ٢",
      location: "الملقا",
      price: "250",
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000",
      description: "تحدي: احجز ٣ مرات واحصل على ساعة مجانية"
    },
    {
      id: "33333333-3333-3333-3333-333333333333", // Court 3
      name: "ملعب ٣",
      location: "الصحافة",
      price: "250",
      image: "https://images.unsplash.com/photo-1592910710242-ca660173a09b?q=80&w=1000",
      description: "تحدي: حجزين = مشروب طاقة"
    }
  ];

  const handleCourtClick = (courtId: string) => {
    // Navigates using the clean, valid UUID
    navigate(`/book/${courtId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0f3c] text-white pb-24" dir="rtl">
      <Header />
      
      <main className="p-6 max-w-md mx-auto space-y-8">
        <section className="mt-4">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            هايب <span className="text-cyan-400">Padel</span>
          </h2>
          <p className="text-gray-400 text-xs mt-2 font-bold tracking-widest uppercase opacity-60">
            اختر ملعبك وابدأ التحدي
          </p>
        </section>

        <div className="grid gap-8">
          {COURTS_DATA.map((court) => (
            <div 
              key={court.id}
              onClick={() => handleCourtClick(court.id)}
              className="group relative bg-[#14224d] rounded-[40px] overflow-hidden border border-white/5 cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-2xl"
            >
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={court.image} 
                  alt={court.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14224d] via-transparent to-transparent" />
                
                <div className="absolute top-4 right-4 bg-cyan-500 text-[#0a0f3c] px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 shadow-2xl border border-cyan-400">
                  <Zap size={12} className="fill-[#0a0f3c]" />
                  {court.description}
                </div>
              </div>

              <div className="p-8 pt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black mb-1">{court.name}</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm font-bold">
                      <MapPin size={14} className="text-cyan-400" />
                      {court.location}
                    </div>
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 text-center">
                    <span className="block text-[8px] text-gray-500 font-black uppercase">الساعة</span>
                    <span className="text-xl font-black text-white">{court.price}</span>
                  </div>
                </div>

                <button className="w-full mt-6 py-4 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-black text-sm hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(6,182,212,0.3)]">
                  احجز الآن <ChevronRight size={18} className="rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}