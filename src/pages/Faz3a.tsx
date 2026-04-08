import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Loader2, ChevronLeft, Calendar, User, CheckCircle2, Trophy, MessageSquare } from 'lucide-react';
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
      if (activeTab === 'public_faz3at') {
        const { data, error } = await supabase
          .from('faz3a_posts')
          .select('*, profiles:creator_id(first_name, last_name, current_rank), faz3a_participants(participant_id)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPublicFaz3at(data || []);
      } 
      else {
        const { data: myData, error } = await supabase
          .from('faz3a_posts')
          .select(`
            *,
            profiles:creator_id (first_name, last_name, current_rank),
            faz3a_participants (
              participant_id,
              profiles:participant_id (first_name, last_name, current_rank)
            )
          `)
          .or(`creator_id.eq.${user.id}, id.in.(select post_id from faz3a_participants where participant_id = '${user.id}')`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setMyFullFaz3at(myData || []);
      }
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, fetchData]);

  // 1. معالج الانضمام + إرسال تنبيه لراعي الفزعة ✅
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
        // إرسال تنبيه فوري لراعي الفزعة
        await supabase.from('notifications').insert([{
          user_id: post.creator_id,
          type: 'invite',
          title: 'بطل جديد انضم لفزعتك! 🔥',
          message: `انضم لاعب لفزعتك في ${post.court_name}. يمكنك التواصل معه الآن من تبويب "فزعاتي".`,
          is_read: false
        }]);

        toast.success("أبشر بالفزعة! تم إبلاغ راعي الحجز 🔥");
        setActiveTab('joined_faz3at'); 
      } else {
        toast.error("عذراً، الفريق اكتمل أو أنت مسجل مسبقاً!");
      }
    } catch (error: any) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setIsJoining(null);
    }
  };

  // 2. دالة فتح الشات بين الراعي والفزيع ✅
  const startChat = async (otherUserId: string, name: string) => {
    if (!currentUserId) return;
    try {
      const { data: chatRoom, error } = await supabase
        .from('challenges')
        .insert([{
          sender_id: currentUserId,
          receiver_id: otherUserId,
          status: 'accepted'
        }])
        .select()
        .single();

      if (error) {
        // إذا الغرفة موجودة مسبقاً، نحاول جلبها فقط (أو نعتمد على صفحة الرسائل العامة)
        toast.info("جاري الانتقال للمحادثة...");
      }

      toast.success(`فتح الشات مع ${name}..`);
      setTimeout(() => navigate('/messages'), 1000);
    } catch (err) {
      toast.error("خطأ في فتح الشات");
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative text-right" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto space-y-8 pt-24 text-right">
        
        <div className="flex items-center justify-between">
           <div className="text-right">
              <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
                سوق <span className="text-cyan-400">الفزعات</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 italic tracking-widest leading-none">أبطال الملاعب لايف</p>
           </div>
           <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all shadow-xl">
             <ChevronLeft size={20} className="rotate-180" />
           </button>
        </div>

        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            <button onClick={() => setActiveTab('public_faz3at')} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === 'public_faz3at' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-500'}`}>فزعات منقولة</button>
            <button onClick={() => setActiveTab('joined_faz3at')} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === 'joined_faz3at' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-500'}`}>فزعاتي</button>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'public_faz3at' ? (
            publicFaz3at.length > 0 ? publicFaz3at.map(post => {
              const isFull = post.missing_players === 0;
              const isMyPost = post.creator_id === currentUserId;
              const alreadyJoined = post.faz3a_participants?.some((p: any) => p.participant_id === currentUserId);

              return (
                <div key={post.id} className={`bg-[#0a0f3c]/40 border border-white/10 rounded-[35px] p-7 space-y-5 backdrop-blur-2xl transition-all ${isFull ? 'opacity-50 grayscale' : 'hover:border-cyan-500/30'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-cyan-400 border border-white/10 text-xl italic">{post.profiles?.first_name?.[0] || 'P'}</div>
                      <div className="text-right">
                        <h4 className="font-black text-lg italic text-white leading-none">{isMyPost ? "حجزك أنت" : (post.profiles?.first_name || "لاعب بادل")}</h4>
                        <p className="text-[9px] font-black text-cyan-500/60 uppercase mt-1 tracking-tighter italic">راعي الحجز ✅</p>
                      </div>
                    </div>
                    {!isFull && <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black italic animate-pulse">مطلوب {post.missing_players}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] font-black italic border border-white/5 truncate flex items-center gap-2"><MapPin size={14} className="text-cyan-400" /> {post.court_name}</div>
                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] font-black italic border border-white/5 flex items-center gap-2"><Clock size={14} className="text-cyan-400" /> {post.match_time}</div>
                  </div>

                  {!isMyPost && !isFull && !alreadyJoined && (
                    <button onClick={() => handleJoin(post)} disabled={isJoining === post.id} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[22px] font-[1000] text-[11px] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                      {isJoining === post.id ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={16} fill="currentColor" /> أبشر بالفزعة ✋</>}
                    </button>
                  )}
                  {alreadyJoined && (
                    <div className="w-full py-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-[22px] font-black text-[10px] flex items-center justify-center gap-2 italic"><CheckCircle2 size={16} /> أنت مسجل في هذه الفزعة</div>
                  )}
                </div>
              )
            }) : (
              <div className="text-center py-20 opacity-20"><Calendar size={60} className="mx-auto mb-4 text-gray-600" /><p className="font-black italic text-gray-500">لا يوجد فزعات حالياً</p></div>
            )
          ) : (
            myFullFaz3at.length > 0 ? myFullFaz3at.map(post => {
              const isOwner = post.creator_id === currentUserId;

              return (
                <div key={post.id} className="bg-[#0a0f3c]/60 border border-cyan-500/20 rounded-[35px] p-7 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center text-right">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-cyan-400 uppercase italic mb-1">{isOwner ? "فزعتك المنشورة" : "فزعة انضممت لها"} <CheckCircle2 size={12} className="inline ml-1" /></p>
                        <h4 className="font-black text-xl italic text-white leading-none">{post.court_name}</h4>
                     </div>
                     <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-[10px] font-black italic text-gray-400">{post.match_time}</div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic text-right">أبطال المباراة الحاليين ({post.faz3a_participants?.length + 1})</p>
                     <div className="flex flex-col gap-3">
                        {/* راعي الحجز */}
                        {!isOwner && (
                          <div className="flex items-center justify-between bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500 text-[#0a0f3c] flex items-center justify-center font-black italic text-xs uppercase">{post.profiles?.first_name?.[0]}</div>
                              <span className="text-[11px] font-black italic text-white">{post.profiles?.first_name} (راعي الحجز)</span>
                            </div>
                            <button onClick={() => startChat(post.creator_id, post.profiles?.first_name)} className="p-2.5 bg-cyan-500 text-[#0a0f3c] rounded-xl active:scale-90 transition-all"><MessageSquare size={16} /></button>
                          </div>
                        )}

                        {/* الفزيعة المنضمين */}
                        {post.faz3a_participants?.map((p: any) => {
                          const isThatMe = p.participant_id === currentUserId;
                          if (isThatMe) return null; // لا تظهر زر الشات لنفسك

                          return (
                            <div key={p.participant_id} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black italic text-xs text-cyan-400 border border-white/10">{p.profiles?.first_name?.[0]}</div>
                                <span className="text-[11px] font-black italic text-gray-300">{p.profiles?.first_name} (فزيع)</span>
                              </div>
                              {isOwner && (
                                <button onClick={() => startChat(p.participant_id, p.profiles?.first_name)} className="p-2.5 bg-white/10 text-cyan-400 rounded-xl active:scale-90 transition-all border border-white/5"><MessageSquare size={16} /></button>
                              )}
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-cyan-400">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="text-[9px] font-black uppercase italic tracking-widest text-gray-400">تواصل مع الأبطال لتنسيق اللقاء!</span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-20 opacity-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                <Zap size={60} className="mx-auto mb-4 text-gray-600" />
                <p className="font-black italic text-[10px] uppercase tracking-widest text-gray-600">لم تنضم لأي فزعة بعد</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}