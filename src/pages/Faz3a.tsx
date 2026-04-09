import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Loader2, ChevronLeft, CheckCircle2, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Faz3a() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'public_faz3at' | 'joined_faz3at'>('public_faz3at');
  const [publicFaz3at, setPublicFaz3at] = useState<any[]>([]);
  const [myFullFaz3at, setMyFullFaz3at] = useState<any[]>([]);
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

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. جلب كل الفزعات المفتوحة بدون شروط معقدة لضمان وصول البيانات
      const { data, error } = await supabase
        .from('faz3a_posts')
        .select(`
          *, 
          profiles:creator_id (id, first_name, last_name, avatar_url, current_rank), 
          faz3a_participants (
            participant_id, 
            profiles:participant_id (id, first_name, last_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. الفلترة البرمجية (أضمن طريقة لظهور البيانات فوراً)
      
      // تبويب المتاحة: أي فزعة لست أنا صاحبها ولم أنضم لها بعد
      const available = data?.filter(p => 
        p.creator_id !== user.id && 
        !p.faz3a_participants?.some((pt: any) => pt.participant_id === user.id)
      ) || [];
      
      // تبويب فزعاتي: التي أنشأتها أنا أو التي أنا مشارك فيها
      const mine = data?.filter(p => 
        p.creator_id === user.id || 
        p.faz3a_participants?.some((pt: any) => pt.participant_id === user.id)
      ) || [];

      setPublicFaz3at(available);
      setMyFullFaz3at(mine);

    } catch (err: any) { 
      console.error("Fetch Error:", err.message); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchData();

    // مستمع لحظي شامل لكل الجداول المرتبطة
    const channel = supabase.channel('faz3a_global_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_posts' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_participants' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleJoin = async (post: any) => {
    if (!currentUserId) return toast.error("سجل دخولك أولاً");
    setIsJoining(post.id);
    try {
      const { data: success, error } = await supabase.rpc('join_faz3a_secure', { 
        p_post_id: post.id, 
        p_user_id: currentUserId 
      });

      if (error) throw error;

      if (success) {
        toast.success("كفو! أبشر بالفزعة 🔥");
        setActiveTab('joined_faz3at');
        fetchData();
      } else {
        toast.error("الفريق اكتمل");
      }
    } catch (error) { 
      toast.error("خطأ في الاتصال"); 
    } finally { 
      setIsJoining(null); 
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative text-right" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto space-y-8 pt-24">
        
        <div className="flex items-center justify-between">
           <div className="text-right">
              <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
                ساحة <span className="text-cyan-400">الفزعات</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 italic tracking-widest leading-none">تنسيق الفزعات لايف</p>
           </div>
           <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400"><ChevronLeft size={20} className="rotate-180" /></button>
        </div>

        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            <button onClick={() => setActiveTab('public_faz3at')} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black transition-all ${activeTab === 'public_faz3at' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>فزعات متاحة</button>
            <button onClick={() => setActiveTab('joined_faz3at')} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black transition-all ${activeTab === 'joined_faz3at' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-400'}`}>فزعاتي</button>
        </div>

        <div className="space-y-6">
          {loading && (activeTab === 'public_faz3at' ? publicFaz3at.length === 0 : myFullFaz3at.length === 0) ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'public_faz3at' ? (
            publicFaz3at.length > 0 ? publicFaz3at.map(post => {
              const count = post.faz3a_participants?.length || 0;
              const isFull = count >= post.missing_players;
              return (
                <div key={post.id} className="bg-[#0a0f3c]/40 border border-white/10 rounded-[40px] p-7 space-y-5 backdrop-blur-2xl relative overflow-hidden group shadow-xl transition-all">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${isFull ? 'bg-green-500' : 'bg-cyan-500'}`} />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-cyan-400 border border-white/10 text-xl italic">{post.profiles?.first_name?.[0]}</div>
                    <div className="text-right">
                      <h4 className="font-black text-lg italic text-white leading-none">{post.profiles?.first_name}</h4>
                      <p className="text-[9px] font-black text-cyan-500/60 uppercase mt-1 italic tracking-tighter">بطل هايب ✅</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-black italic">
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-2 justify-end">{post.court_name} <MapPin size={14} className="text-cyan-400" /></div>
                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-2 justify-end">{post.match_time} <Clock size={14} className="text-cyan-400" /></div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black italic">
                      <span className={isFull ? 'text-green-400' : 'text-cyan-400'}>{isFull ? 'مكتمل ✅' : `باقي ${post.missing_players - count} أبطال`}</span>
                      <span className="text-gray-500">حالة الفريق</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${isFull ? 'bg-green-500' : 'bg-cyan-500'}`} style={{ width: `${(count / post.missing_players) * 100}%` }} />
                    </div>
                  </div>
                  {!isFull && (
                    <button onClick={() => handleJoin(post)} disabled={isJoining === post.id} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[22px] font-[1000] text-[11px] uppercase flex items-center justify-center gap-2">
                      {isJoining === post.id ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={16} fill="currentColor" /> أبشر بالفزعة ✋</>}
                    </button>
                  )}
                </div>
              )
            }) : <p className="text-center opacity-20 py-20 italic">لا توجد فزعات متاحة</p>
          ) : (
            myFullFaz3at.length > 0 ? myFullFaz3at.map(post => (
                <div key={post.id} className="bg-[#0a0f3c]/60 border border-cyan-500/20 rounded-[35px] p-7 space-y-6 shadow-2xl text-right animate-in fade-in">
                  <div className="flex justify-between items-center">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-cyan-400 uppercase italic mb-1">{post.creator_id === currentUserId ? "فزعتك المنشورة" : "فزعة انضممت لها"}</p>
                        <h4 className="font-black text-xl italic text-white leading-none">{post.court_name}</h4>
                     </div>
                     <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-[10px] font-black italic text-gray-400">{post.match_time}</div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-gray-500 uppercase italic text-right">أبطال المباراة:</p>
                     <div className="flex flex-col gap-3">
                        {post.faz3a_participants?.map((p: any) => (
                          <div key={p.participant_id} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                            {p.participant_id !== currentUserId ? (
                                <button onClick={() => navigate('/messages')} className="p-2.5 bg-white/10 text-cyan-400 rounded-xl"><MessageSquare size={16} /></button>
                            ) : <div className="w-10" />} 
                            <span className="text-[11px] font-black italic text-gray-300">{p.profiles?.first_name} {p.participant_id === currentUserId ? "(أنت)" : "(بطل)"}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
            )) : <p className="text-center opacity-20 py-20 italic">لم تشارك في أي فزعة بعد</p>
          )}
        </div>
      </main>
    </div>
  );
}