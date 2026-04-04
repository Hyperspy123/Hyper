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

  // 1. جلب بيانات المستخدم الحالي
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    }
    getUser();
  }, []);

  // 2. دالة جلب البيانات (محسنة لربط المشاركين)
  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      if (activeTab === 'public_faz3at') {
        // جلب الفزعات المتاحة للجميع
        const { data, error } = await supabase
          .from('faz3a_posts')
          .select('*, profiles:creator_id(first_name, last_name, current_rank)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPublicFaz3at(data || []);
      } 
      else {
        // جلب الفزعات التي أنا طرف فيها (صاحبها أو مشارك فيها)
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

  // 3. التحديث اللحظي (Realtime)
  useEffect(() => {
    fetchData();

    const channel = supabase.channel('faz3a-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_posts' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_participants' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTab, fetchData]);

  // 4. دالة الانضمام الذكية (تربط اللاعب بالسيرفر وتحدث العداد)
  const handleJoin = async (postId: string) => {
    if (!currentUserId) return toast.error("سجل دخولك أولاً");
    setIsJoining(postId);
    
    try {
      // استدعاء الدالة المخزنة في SQL لضمان تسجيل المشارك ونقص العداد في خطوة واحدة
      const { data: success, error } = await supabase.rpc('join_faz3a_secure', {
        p_post_id: postId,
        p_user_id: currentUserId
      });

      if (error) throw error;

      if (success) {
        toast.success("كفو يا وحش! تم تسجيلك في الفريق 🔥");
        setActiveTab('joined_faz3at'); // انتقال تلقائي لصفحة "فزعاتي" لمشاهدة الفريق
      } else {
        toast.error("عذراً، الفريق اكتمل أو أنت مسجل مسبقاً");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("حدث خطأ أثناء الانضمام");
    } finally {
      setIsJoining(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-32 relative text-right" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto space-y-8 pt-24 text-right">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
           <div className="text-right">
              <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">ساحة <span className="text-cyan-400">الفزعات</span></h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 italic tracking-[0.2em]">مباريات محولة من الحجوزات</p>
           </div>
           <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all shadow-xl">
             <ChevronLeft size={20} className="rotate-180" />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            {[
              { id: 'public_faz3at', label: 'فزعات منقولة' },
              { id: 'joined_faz3at', label: 'فزعاتي' }
            ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all duration-300 ${
                    activeTab === tab.id ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20 scale-[1.02]' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
            ))}
        </div>

        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'public_faz3at' ? (
            /* --- تبويب: الفزعات المنقولة (العام) --- */
            publicFaz3at.length > 0 ? publicFaz3at.map(post => {
              const isFull = post.missing_players === 0;
              const isMyPost = post.creator_id === currentUserId;

              return (
                <div key={post.id} className={`relative bg-[#0a0f3c]/40 border border-white/10 rounded-[35px] p-7 space-y-5 backdrop-blur-2xl transition-all duration-500 ${isFull ? 'opacity-50 grayscale' : 'hover:border-cyan-500/30 shadow-2xl'}`}>
                  <div className="flex justify-between items-start text-right">
                    <div className="flex items-center gap-4 text-right">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-cyan-400 border border-white/10 text-xl italic shadow-inner">
                        {post.profiles?.first_name?.[0] || 'P'}
                      </div>
                      <div className="text-right">
                        <h4 className="font-black text-lg italic leading-none mb-1 text-white">{isMyPost ? "حجزك أنت" : (post.profiles?.first_name || "لاعب بادل")}</h4>
                        <p className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest leading-none">{post.profiles?.current_rank || 'ROOKIE'}</p>
                      </div>
                    </div>
                    {isFull ? (
                      <div className="bg-gray-500/20 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic flex items-center gap-1">مكتملة ✅</div>
                    ) : (
                      <div className="bg-cyan-500/10 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black italic tracking-tighter border border-cyan-500/20 shadow-lg shadow-cyan-500/10 animate-pulse">
                        ناقص {post.missing_players} أبطال
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl text-[10px] font-black italic border border-white/5 truncate"><MapPin size={14} className="text-cyan-400" /> {post.court_name}</div>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl text-[10px] font-black italic border border-white/5"><Clock size={14} className="text-cyan-400" /> {post.match_time}</div>
                  </div>

                  {!isMyPost && !isFull && (
                    <button 
                      onClick={() => handleJoin(post.id)} 
                      disabled={isJoining === post.id} 
                      className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[22px] font-[1000] text-[11px] uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-cyan-400"
                    >
                      {isJoining === post.id ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={16} fill="currentColor" /> أبشر بالفزعة ✋</>}
                    </button>
                  )}
                  {isMyPost && (
                    <div className="w-full py-4 border border-dashed border-white/10 rounded-[22px] text-center text-[10px] font-black uppercase text-gray-500 italic">حجزك منشور.. بانتظار الفزيعة</div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-32 opacity-20"><Calendar size={60} className="mx-auto mb-6 text-gray-600" /><p className="text-[10px] font-black uppercase italic tracking-[0.3em] text-gray-600">لا توجد حجوزات منقولة حالياً</p></div>
            )
          ) : (
            /* --- تبويب: فزعاتي (متابعة الفريق والتواصل) --- */
            myFullFaz3at.length > 0 ? myFullFaz3at.map(post => {
              const isOwner = post.creator_id === currentUserId;
              // الحصول على رقم هاتف الشخص الآخر للتواصل
              const contactPhone = isOwner 
                ? post.faz3a_participants?.[0]?.profiles?.phone 
                : post.profiles?.phone;

              return (
                <div key={post.id} className="relative bg-[#0a0f3c]/60 border border-cyan-500/20 rounded-[35px] p-7 space-y-6 shadow-2xl text-right animate-in fade-in duration-500">
                  <div className="flex justify-between items-center text-right">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-cyan-400 uppercase italic mb-1 flex items-center gap-2">
                          {isOwner ? "فزعتك المنشورة" : "فزعة انضممت لها"} <CheckCircle2 size={12} />
                        </p>
                        <h4 className="font-black text-xl italic text-white leading-none">{post.court_name}</h4>
                     </div>
                     <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                       <Clock size={12} className="text-cyan-400" />
                       <span className="text-[10px] font-black italic">{post.match_time}</span>
                     </div>
                  </div>

                  {/* عرض الفريق لايف */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">فريق المباراة الحالي</p>
                        <div className="flex items-center gap-1 text-cyan-400 text-[10px] font-black">
                          <Users size={12} /> {post.faz3a_participants?.length + 1} أبطال
                        </div>
                     </div>
                     
                     <div className="flex flex-wrap gap-3 justify-start">
                        {/* صاحب الفزعة */}
                        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-2xl shadow-inner">
                           <div className="w-9 h-9 rounded-xl bg-cyan-500 text-[#0a0f3c] flex items-center justify-center font-[1000] italic text-xs">
                             {(post.profiles?.first_name?.[0] || 'U')}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black italic text-white leading-none">{(post.profiles?.first_name || 'بطل')}</span>
                              <span className="text-[7px] font-black text-cyan-500 uppercase mt-1">راعيها</span>
                           </div>
                        </div>

                        {/* الفزيعة المنضمين */}
                        {post.faz3a_participants?.map((p: any) => (
                           <div key={p.participant_id} className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-2xl animate-in zoom-in duration-300">
                              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-[1000] italic text-xs text-cyan-400 border border-white/5">
                                {p.profiles?.first_name?.[0] || 'P'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black italic text-gray-200 leading-none">{p.profiles?.first_name || 'فزيع'}</span>
                                <span className="text-[7px] font-black text-gray-500 uppercase mt-1 italic">انضم الآن</span>
                              </div>
                           </div>
                        ))}

                        {/* خانات شاغرة */}
                        {[...Array(post.missing_players)].map((_, i) => (
                           <div key={i} className="w-9 h-9 rounded-xl border border-dashed border-white/10 flex items-center justify-center opacity-20 bg-white/5 animate-pulse">
                             <User size={14} />
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* زر التواصل السريع */}
                  <button 
                    onClick={() => {
                      if (!contactPhone) return toast.error("رقم الهاتف غير متوفر في الملف الشخصي");
                      window.location.href = `https://wa.me/${contactPhone}`;
                    }}
                    className="w-full py-4 bg-green-500 text-[#0a0f3c] rounded-[22px] font-[1000] text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-green-500/20 hover:bg-green-400"
                  >
                    <MessageCircle size={16} /> تواصل مع {isOwner ? "الفزيعة" : "راعي الحجز"} واتساب
                  </button>
                </div>
              );
            }) : (
              <div className="text-center py-32 bg-white/5 rounded-[50px] border border-dashed border-white/10 opacity-30">
                <Zap size={60} className="mx-auto mb-6 text-gray-600 animate-pulse" />
                <p className="text-[10px] font-black uppercase italic tracking-[0.3em] text-gray-600">فزعاتي فاضية.. انضم لأحد الآن!</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}