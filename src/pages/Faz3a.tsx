import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Loader2, ChevronLeft, MessageCircle, Calendar, Users, User, CheckCircle2 } from 'lucide-react';
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

  // 1. التحقق من هوية المستخدم
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    }
    getUser();
  }, []);

  // 2. دالة جلب البيانات (تتضمن فحص المشاركين)
  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      if (activeTab === 'public_faz3at') {
        // جلب الفزعات العامة مع بيانات المشاركين لفحص التسجيل المسبق
        const { data, error } = await supabase
          .from('faz3a_posts')
          .select('*, profiles:creator_id(first_name, last_name, current_rank), faz3a_participants(participant_id)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPublicFaz3at(data || []);
      } 
      else {
        // جلب الفزعات التي يشارك فيها المستخدم أو يملكها
        const { data: myData, error } = await supabase
          .from('faz3a_posts')
          .select(`
            *,
            profiles:creator_id (first_name, last_name, current_rank, phone),
            faz3a_participants (
              participant_id,
              profiles:participant_id (first_name, last_name, current_rank, phone)
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

  // 3. نظام التحديث اللحظي (Real-time)
  useEffect(() => {
    fetchData();
    const channel = supabase.channel('faz3a-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_posts' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_participants' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeTab, fetchData]);

  // 4. معالج الانضمام للفزعة
  const handleJoin = async (postId: string) => {
    if (!currentUserId) return toast.error("سجل دخولك أولاً");
    setIsJoining(postId);
    try {
      const { data: success, error } = await supabase.rpc('join_faz3a_secure', {
        p_post_id: postId,
        p_user_id: currentUserId
      });

      if (error) throw error;

      if (success) {
        toast.success("أبشر بالفزعة! تم تسجيلك في الفريق 🔥");
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

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-32 relative text-right" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto space-y-8 pt-24">
        
        <div className="flex items-center justify-between">
           <div className="text-right">
              <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
                ساحة <span className="text-cyan-400">الفزعات</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 italic tracking-widest leading-none">
                مباريات حقيقية بانتظار الأبطال
              </p>
           </div>
           <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all">
             <ChevronLeft size={20} className="rotate-180" />
           </button>
        </div>

        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            <button 
              onClick={() => setActiveTab('public_faz3at')} 
              className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${
                activeTab === 'public_faz3at' ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20' : 'text-gray-500'
              }`}
            >
              فزعات منقولة
            </button>
            <button 
              onClick={() => setActiveTab('joined_faz3at')} 
              className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${
                activeTab === 'joined_faz3at' ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20' : 'text-gray-500'
              }`}
            >
              فزعاتي
            </button>
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
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-cyan-400 border border-white/10 text-xl italic shadow-inner">
                        {post.profiles?.first_name?.[0] || 'P'}
                      </div>
                      <div className="text-right">
                        <h4 className="font-black text-lg italic text-white leading-none">{isMyPost ? "حجزك" : (post.profiles?.first_name || "لاعب بادل")}</h4>
                        <p className="text-[9px] font-black text-cyan-500/60 uppercase mt-1">{post.profiles?.current_rank || 'ROOKIE'}</p>
                      </div>
                    </div>
                    {isFull ? (
                      <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black italic">مكتملة</span>
                    ) : (
                      <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black italic animate-pulse">ناقص {post.missing_players}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] font-black italic border border-white/5 flex items-center gap-2 truncate"><MapPin size={14} className="text-cyan-400" /> {post.court_name}</div>
                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] font-black italic border border-white/5 flex items-center gap-2"><Clock size={14} className="text-cyan-400" /> {post.match_time}</div>
                  </div>

                  {!isMyPost && !isFull && !alreadyJoined && (
                    <button 
                      onClick={() => handleJoin(post.id)} 
                      disabled={isJoining === post.id}
                      className="w-full py-4.5 bg-cyan-500 text-[#0a0f3c] rounded-[22px] font-[1000] text-[11px] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isJoining === post.id ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={16} fill="currentColor" /> أبشر بالفزعة ✋</>}
                    </button>
                  )}
                  {alreadyJoined && (
                    <div className="w-full py-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-[22px] font-black text-[10px] flex items-center justify-center gap-2 italic">
                       <CheckCircle2 size={16} /> أنت مسجل في هذه الفزعة
                    </div>
                  )}
                </div>
              )
            }) : (
              <div className="text-center py-20 opacity-20"><Calendar size={60} className="mx-auto mb-4" /><p className="font-black italic">لا يوجد فزعات حالياً</p></div>
            )
          ) : (
            myFullFaz3at.length > 0 ? myFullFaz3at.map(post => {
              const isOwner = post.creator_id === currentUserId;
              const contactPhone = isOwner 
                ? post.faz3a_participants?.[0]?.profiles?.phone 
                : post.profiles?.phone;

              return (
                <div key={post.id} className="bg-[#0a0f3c]/60 border border-cyan-500/20 rounded-[35px] p-7 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-cyan-400 uppercase italic mb-1">
                          {isOwner ? "فزعتك المنشورة" : "فزعة انضممت لها"} <CheckCircle2 size={12} className="inline ml-1" />
                        </p>
                        <h4 className="font-black text-xl italic text-white leading-none">{post.court_name}</h4>
                     </div>
                     <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-[10px] font-black italic text-gray-400">{post.match_time}</div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">أبطال الفريق ({post.faz3a_participants?.length + 1})</p>
                     <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 p-2 rounded-2xl">
                           <div className="w-8 h-8 rounded-xl bg-cyan-500 text-[#0a0f3c] flex items-center justify-center font-black italic text-xs">
                             {post.profiles?.first_name?.[0] || 'P'}
                           </div>
                           <span className="text-[10px] font-black italic text-white">{post.profiles?.first_name}</span>
                        </div>
                        {post.faz3a_participants?.map((p: any) => (
                           <div key={p.participant_id} className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl animate-in zoom-in">
                              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-black italic text-xs text-cyan-400">
                                {p.profiles?.first_name?.[0] || 'F'}
                              </div>
                              <span className="text-[10px] font-black italic text-gray-300">{p.profiles?.first_name}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {contactPhone ? (
                    <button 
                      onClick={() => {
                        // تنظيف الرقم من المسافات ليعمل الرابط فوراً
                        const cleanPhone = contactPhone.replace(/\s+/g, '');
                        window.location.href = `https://wa.me/${cleanPhone}`;
                      }}
                      className="w-full py-4 bg-green-500 text-[#0a0f3c] rounded-[22px] font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-green-500/20"
                    >
                      <MessageCircle size={16} /> تواصل مع {isOwner ? "الفزيع" : "راعي الحجز"} واتساب
                    </button>
                  ) : (
                    <div className="text-center py-2 text-[9px] text-gray-500 italic font-bold">بانتظار انضمام لاعب لتفعيل التواصل..</div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-20 opacity-20"><Zap size={60} className="mx-auto mb-4" /><p className="font-black italic">لم تنضم لأي فزعة بعد</p></div>
            )
          )}
        </div>
      </main>
    </div>
  );
}