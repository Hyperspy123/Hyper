import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Loader2, ChevronLeft, CheckCircle2, MessageSquare } from 'lucide-react';
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

  // 2. جلب الفزعات المحولة من الحجوزات
  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      if (activeTab === 'public_faz3at') {
        // جلب الفزعات العامة
        const { data, error } = await supabase
          .from('faz3a_posts')
          .select('*, profiles:creator_id(first_name, last_name, current_rank), faz3a_participants(participant_id)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPublicFaz3at(data || []);
      } else {
        // جلب الفزعات التي تخصني أو انضممت لها
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
      console.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  }, [activeTab]);

  useEffect(() => { 
    fetchData(); 
  }, [activeTab, fetchData]);

  // 3. معالج الانضمام للفزعة
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
        // إرسال تنبيه لصاحب الحجز الأصلي
        await supabase.from('notifications').insert([{ 
          user_id: post.creator_id, 
          type: 'invite', 
          title: 'فزيع جديد انضم لك! 🔥', 
          message: `انضم بطل لفزعتك في ${post.court_name}. نسق معه الآن في الشات.`, 
          is_read: false 
        }]);

        toast.success("كفو! تم تسجيلك في الفزعة 🔥");
        setActiveTab('joined_faz3at'); 
      } else {
        toast.error("الفريق اكتمل أو أنت مسجل مسبقاً");
      }
    } catch (error: any) { 
      toast.error("خطأ في الاتصال"); 
    } finally { 
      setIsJoining(null); 
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] text-white font-sans pb-32 relative text-right" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto space-y-8 pt-24 text-right">
        
        {/* هيدر الصفحة بدون زر الزائد */}
        <div className="flex items-center justify-between">
           <div className="text-right">
              <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
                ساحة <span className="text-cyan-400">الفزعات</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 italic tracking-widest leading-none">الفزعات المحولة من الحجوزات لايف</p>
           </div>
           <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all shadow-xl">
             <ChevronLeft size={20} className="rotate-180" />
           </button>
        </div>

        {/* التبويبات */}
        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            <button onClick={() => setActiveTab('public_faz3at')} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === 'public_faz3at' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-500'}`}>فزعات متاحة</button>
            <button onClick={() => setActiveTab('joined_faz3at')} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === 'joined_faz3at' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-500'}`}>فزعاتي</button>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'public_faz3at' ? (
            /* --- عرض الفزعات المتاحة للجميع --- */
            publicFaz3at.length > 0 ? publicFaz3at.map(post => {
              const alreadyJoined = post.faz3a_participants?.some((p: any) => p.participant_id === currentUserId);
              return (
                <div key={post.id} className="bg-[#0a0f3c]/40 border border-white/10 rounded-[40px] p-7 space-y-5 backdrop-blur-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all shadow-xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4 text-right">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-cyan-400 border border-white/10 text-xl italic">{post.profiles?.first_name?.[0] || 'P'}</div>
                      <div className="text-right">
                        <h4 className="font-black text-lg italic text-white leading-none">{post.creator_id === currentUserId ? "حجزك أنت" : (post.profiles?.first_name || "لاعب بادل")}</h4>
                        <p className="text-[9px] font-black text-cyan-500/60 uppercase mt-1 italic tracking-tighter">{post.profiles?.current_rank || 'ROOKIE'}</p>
                      </div>
                    </div>
                    <div className="bg-cyan-500/10 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-black italic border border-cyan-500/20 tracking-tighter">مطلوب {post.missing_players} لاعبين</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-right font-black italic">
                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] border border-white/5 flex items-center gap-2 truncate justify-end">{post.court_name} <MapPin size={14} className="text-cyan-400" /></div>
                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] border border-white/5 flex items-center gap-2 justify-end">{post.match_time} <Clock size={14} className="text-cyan-400" /></div>
                  </div>

                  {post.creator_id !== currentUserId && !alreadyJoined && (
                    <button onClick={() => handleJoin(post)} disabled={isJoining === post.id} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[22px] font-[1000] text-[11px] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                      {isJoining === post.id ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={16} fill="currentColor" /> أبشر بالفزعة ✋</>}
                    </button>
                  )}
                  {alreadyJoined && (
                    <div className="w-full py-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-[22px] font-black text-[10px] flex items-center justify-center gap-2 italic"><CheckCircle2 size={16} /> أنت مسجل في هذه الفزعة</div>
                  )}
                </div>
              )
            }) : <p className="text-center opacity-20 py-20 italic font-black uppercase tracking-widest text-gray-500">لا توجد فزعات محولة حالياً</p>
          ) : (
            /* --- تبويب فزعاتي (لعرض التواصل مع الفريق) --- */
            myFullFaz3at.length > 0 ? myFullFaz3at.map(post => {
              const isOwner = post.creator_id === currentUserId;
              return (
                <div key={post.id} className="bg-[#0a0f3c]/60 border border-cyan-500/20 rounded-[35px] p-7 space-y-6 shadow-2xl text-right">
                  <div className="flex justify-between items-center">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-cyan-400 uppercase italic mb-1">{isOwner ? "فزعتك المنشورة" : "فزعة انضممت لها"} <CheckCircle2 size={12} className="inline mr-1" /></p>
                        <h4 className="font-black text-xl italic text-white leading-none">{post.court_name}</h4>
                     </div>
                     <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-[10px] font-black italic text-gray-400">{post.match_time}</div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic text-right">تواصل لتنسيق المباراة</p>
                     <div className="flex flex-col gap-3">
                        {!isOwner && (
                          <div className="flex items-center justify-between bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/10">
                            <button onClick={() => navigate('/messages')} className="p-2.5 bg-cyan-500 text-[#0a0f3c] rounded-xl active:scale-90 transition-all shadow-lg"><MessageSquare size={16} /></button>
                            <span className="text-[11px] font-black italic text-white">{post.profiles?.first_name} (الراعي)</span>
                          </div>
                        )}
                        {post.faz3a_participants?.map((p: any) => (
                          <div key={p.participant_id} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                            <button onClick={() => navigate('/messages')} className="p-2.5 bg-white/10 text-cyan-400 rounded-xl active:scale-90 transition-all border border-white/10"><MessageSquare size={16} /></button>
                            <span className="text-[11px] font-black italic text-gray-300">{p.profiles?.first_name} (فزيع)</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              );
            }) : <p className="text-center opacity-20 py-20 italic font-black uppercase tracking-widest text-gray-500">لم تنضم لأي فزعة بعد</p>
          )}
        </div>
      </main>
    </div>
  );
}