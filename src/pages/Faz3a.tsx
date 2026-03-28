import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Loader2, ChevronLeft, MessageCircle, Calendar, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Faz3a() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'public_faz3at' | 'joined_faz3at'>('public_faz3at');
  
  const [publicFaz3at, setPublicFaz3at] = useState<any[]>([]);
  const [joinedRequests, setJoinedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    }
    getUser();
  }, []);

  const fetchData = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      if (activeTab === 'public_faz3at') {
        // جلب الفزعات المحولة من الحجوزات فقط
        const { data } = await supabase
          .from('faz3a_posts')
          .select('*, profiles(first_name, last_name, current_rank)')
          .order('created_at', { ascending: false });
        setPublicFaz3at(data || []);
      } 
      else {
        // جلب الفزعات التي قبلت المشاركة فيها
        const { data: joined } = await supabase
          .from('faz3a_participants')
          .select(`
            post_id,
            faz3a_posts (
              id,
              location,
              court_name,
              match_time,
              creator_id,
              profiles:creator_id (first_name, last_name, current_rank)
            )
          `)
          .eq('participant_id', currentUserId);
        
        const formattedJoined = joined?.map(item => item.faz3a_posts).filter(Boolean) || [];
        setJoinedRequests(formattedJoined);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('faz3a-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_posts' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_participants' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeTab, currentUserId]);

  const handleJoin = async (postId: string) => {
    setIsJoining(postId);
    try {
      const { data: success, error } = await supabase.rpc('join_faz3a_secure', {
        p_post_id: postId,
        p_user_id: currentUserId
      });
      if (success) {
        toast.success("كفو! أبشر بالفزعة تم حجز مكانك 🔥");
        setActiveTab('joined_faz3at');
      } else {
        toast.error("للأسف، اكتمل العدد في هذا الحجز!");
      }
    } catch (error) {
      toast.error("حدث خطأ في الانضمام");
    } finally {
      setIsJoining(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-32 relative text-right" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto space-y-8 pt-24 text-right">
        
        {/* قسم العناوين */}
        <div className="flex items-center justify-between">
           <div className="text-right">
              <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">ساحة <span className="text-cyan-400">الفزعات</span></h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 italic tracking-[0.2em] text-right">مباريات حقيقية من حجوزات اللاعبين</p>
           </div>
           <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all shadow-xl"><ChevronLeft size={20} className="rotate-180" /></button>
        </div>

        {/* التبويبات - تصميم نيون زجاجي */}
        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            {[
              { id: 'public_faz3at', label: 'فزعات منقولة' },
              { id: 'joined_faz3at', label: 'فزعاتي' }
            ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all duration-300 ${
                    activeTab === tab.id 
                    ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20 scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
            ))}
        </div>

        {/* القائمة الرئيسية */}
        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'public_faz3at' ? (
            publicFaz3at.length > 0 ? publicFaz3at.map(post => {
              const isFull = post.missing_players === 0;
              const isMyPost = post.creator_id === currentUserId;

              return (
                <div key={post.id} className={`relative bg-white/5 border border-white/10 rounded-[35px] p-7 space-y-5 backdrop-blur-2xl transition-all duration-500 ${isFull ? 'opacity-50 grayscale' : 'hover:border-cyan-500/30'}`}>
                  
                  {/* بيانات صاحب الحجز */}
                  <div className="flex justify-between items-start text-right">
                    <div className="flex items-center gap-4 text-right">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-cyan-400 border border-white/10 text-xl italic shadow-inner">
                        {post.profiles?.first_name?.[0]}
                      </div>
                      <div className="text-right">
                        <h4 className="font-black text-lg italic leading-none mb-1 text-white text-right">
                          {isMyPost ? "حجزك أنت" : post.profiles?.first_name}
                        </h4>
                        <p className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest text-right leading-none">
                          {post.profiles?.current_rank || 'ROOKIE'}
                        </p>
                      </div>
                    </div>
                    {isFull ? (
                      <div className="bg-gray-500/20 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic flex items-center gap-1 shadow-sm">مكتملة ✅</div>
                    ) : (
                      <div className="bg-cyan-500/10 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black italic tracking-tighter border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                        ناقص {post.missing_players}
                      </div>
                    )}
                  </div>

                  {/* تفاصيل المباراة */}
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl text-[10px] font-black italic text-right border border-white/5">
                      <MapPin size={14} className="text-cyan-400" /> {post.court_name}
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl text-[10px] font-black italic text-right border border-white/5">
                      <Clock size={14} className="text-cyan-400" /> {post.match_time}
                    </div>
                  </div>

                  {/* زر الفزعة الذكي */}
                  {!isMyPost && !isFull && (
                    <button 
                      onClick={() => handleJoin(post.id)} 
                      disabled={isJoining === post.id} 
                      className="w-full py-4.5 bg-white text-[#0a0f3c] rounded-[22px] font-black text-[11px] uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-cyan-400"
                    >
                      {isJoining === post.id ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={16} className="fill-current" /> أبشر بالفزعة ✋</>}
                    </button>
                  )}

                  {isFull && (
                    <div className="w-full py-4 bg-white/5 border border-white/10 rounded-[22px] text-center text-gray-500 text-[10px] font-black uppercase italic tracking-[0.2em]">تم تلبية طلب الفزعة 🛡️</div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-32 bg-white/5 rounded-[50px] border border-dashed border-white/10 opacity-30 animate-pulse">
                <Calendar size={60} className="mx-auto mb-6 text-gray-600" />
                <p className="text-[10px] font-black uppercase italic tracking-[0.3em] text-gray-600">بانتظار تحويل الحجوزات...</p>
              </div>
            )
          ) : (
            /* تبويب الفزعات التي انضممت إليها */
            joinedRequests.length > 0 ? joinedRequests.map(post => (
              <div key={post.id} className="relative bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-[35px] p-7 space-y-5 shadow-2xl overflow-hidden text-right animate-in slide-in-from-right-4 duration-500">
                <div className="absolute top-4 left-4 bg-yellow-500 text-[#0a0f3c] px-3 py-1 rounded-full text-[8px] font-black uppercase italic rotate-[-5deg] shadow-lg flex items-center gap-1">
                  <UserCheck size={10} /> أنت "فزيع" هنا
                </div>
                <div className="flex items-center gap-4 text-right mt-2">
                   <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-black text-xl italic border border-yellow-500/20">{post.profiles?.first_name?.[0]}</div>
                   <div className="text-right">
                      <h4 className="font-black text-sm italic text-white leading-none mb-1 text-right">صاحب الحجز: <span className="text-yellow-500">{post.profiles?.first_name}</span></h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-right leading-none">{post.court_name}</p>
                   </div>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                   <div className="text-[10px] font-black italic text-gray-300 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl"><Clock size={14} className="text-yellow-500" /> {post.match_time}</div>
                   <button onClick={() => window.location.href = `https://wa.me/9665XXXXXXXX`} className="flex-1 py-3.5 bg-green-500 text-[#0a0f3c] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all hover:bg-green-400">
                     <MessageCircle size={14} /> تواصل واتساب
                   </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-32 bg-white/5 rounded-[50px] border border-dashed border-white/10 opacity-30">
                <Zap size={60} className="mx-auto mb-6 text-gray-600" />
                <p className="text-[10px] font-black uppercase italic tracking-[0.3em] text-gray-600">لم تنضم لأي فزعة بعد</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}