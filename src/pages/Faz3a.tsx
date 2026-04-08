import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Loader2, ChevronLeft, Calendar, User, CheckCircle2, Trophy, MessageSquare, Plus, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Faz3a() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'public_faz3at' | 'joined_faz3at'>('public_faz3at');
  const [publicFaz3at, setPublicFaz3at] = useState<any[]>([]);
  const [myFullFaz3at, setMyFullFaz3at] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // بيانات الحجز الجديد
  const [newPost, setNewPost] = useState({
    court_name: '',
    match_date: '',
    match_time: '',
    price: ''
  });

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
          .select('*, profiles:creator_id(first_name, last_name, current_rank)')
          .eq('status', 'open')
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

  // نشر حجز جديد ✅
  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    const { error } = await supabase.from('faz3a_posts').insert([{
      creator_id: currentUserId,
      court_name: newPost.court_name,
      match_date: newPost.match_date,
      match_time: newPost.match_time,
      price: newPost.price,
      status: 'open',
      missing_players: 1 // القيمة الافتراضية لنقل الحجز
    }]);

    if (error) {
      toast.error("فشل النشر: " + error.message);
    } else {
      toast.success("تم عرض حجزك للنقل 🔥");
      setShowCreate(false);
      fetchData();
    }
  };

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
        await supabase.from('notifications').insert([{
          user_id: post.creator_id,
          type: 'invite',
          title: 'شخص مهتم بحجزك! 💰',
          message: `انضم لاعب لحجزك في ${post.court_name}. تواصل معه الآن للتنسيق.`,
          is_read: false
        }]);

        toast.success("أبشر بالفزعة! تم إبلاغ راعي الحجز 🔥");
        setActiveTab('joined_faz3at'); 
      }
    } catch (error: any) {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setIsJoining(null);
    }
  };

  const startChat = async (otherUserId: string, name: string) => {
    if (!currentUserId) return;
    const { data: chatRoom } = await supabase
      .from('challenges')
      .insert([{ sender_id: currentUserId, receiver_id: otherUserId, status: 'accepted' }])
      .select().single();

    toast.success(`جاري فتح الشات مع ${name}..`);
    setTimeout(() => navigate('/messages'), 500);
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
              <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 italic tracking-widest leading-none">نقل الحجوزات لايف</p>
           </div>
           <button onClick={() => setShowCreate(!showCreate)} className="p-3 bg-cyan-500 text-[#0a0f3c] rounded-2xl active:scale-90 transition-all shadow-lg shadow-cyan-500/20">
             <Plus size={24} />
           </button>
        </div>

        {showCreate && (
          <form onSubmit={createPost} className="bg-[#0a0f3c] border border-cyan-500/30 rounded-[35px] p-6 space-y-4 animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-black italic text-cyan-400">عرض حجز للنقل 📝</h3>
            <input required placeholder="اسم الملعب..." className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-500" onChange={e => setNewPost({...newPost, court_name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input required type="date" className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setNewPost({...newPost, match_date: e.target.value})} />
              <input required type="time" className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setNewPost({...newPost, match_time: e.target.value})} />
            </div>
            <input required placeholder="السعر المطلوب (ريال)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-500" onChange={e => setNewPost({...newPost, price: e.target.value})} />
            <button className="w-full py-5 bg-cyan-500 text-[#0a0f3c] font-[1000] rounded-2xl uppercase">نشر الحجز 🚀</button>
          </form>
        )}

        <div className="flex bg-[#0a0f3c]/60 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            <button onClick={() => setActiveTab('public_faz3at')} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === 'public_faz3at' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-500'}`}>الحجوزات المتاحة</button>
            <button onClick={() => setActiveTab('joined_faz3at')} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === 'joined_faz3at' ? 'bg-cyan-500 text-[#0a0f3c]' : 'text-gray-500'}`}>عملياتي</button>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'public_faz3at' ? (
            publicFaz3at.length > 0 ? publicFaz3at.map(post => (
                <div key={post.id} className="bg-[#0a0f3c]/40 border border-white/10 rounded-[35px] p-7 space-y-5 backdrop-blur-2xl">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-cyan-400 border border-white/10 text-xl italic">{post.profiles?.first_name?.[0] || 'P'}</div>
                      <div className="text-right">
                        <h4 className="font-black text-lg italic text-white leading-none">{post.profiles?.first_name || "لاعب بادل"}</h4>
                        <p className="text-[9px] font-black text-cyan-500/60 uppercase mt-1 italic tracking-tighter">راعي الحجز ✅</p>
                      </div>
                    </div>
                    <div className="bg-cyan-500/10 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-black italic">{post.price} ريال</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] font-black italic border border-white/5 flex items-center gap-2"><MapPin size={14} className="text-cyan-400" /> {post.court_name}</div>
                    <div className="bg-white/5 p-4 rounded-2xl text-[10px] font-black italic border border-white/5 flex items-center gap-2"><Clock size={14} className="text-cyan-400" /> {post.match_time}</div>
                  </div>

                  {post.creator_id !== currentUserId && (
                    <button onClick={() => handleJoin(post)} disabled={isJoining === post.id} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[22px] font-[1000] text-[11px] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                      {isJoining === post.id ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={16} fill="currentColor" /> أنا أبغا الحجز ✋</>}
                    </button>
                  )}
                </div>
            )) : <p className="text-center opacity-20 py-20 italic">لا توجد حجوزات حالياً</p>
          ) : (
            myFullFaz3at.length > 0 ? myFullFaz3at.map(post => {
              const isOwner = post.creator_id === currentUserId;
              return (
                <div key={post.id} className="bg-[#0a0f3c]/60 border border-cyan-500/20 rounded-[35px] p-7 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center text-right">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-cyan-400 uppercase italic mb-1">{isOwner ? "حجزك المنشور" : "حجز انضممت له"}</p>
                        <h4 className="font-black text-xl italic text-white leading-none">{post.court_name}</h4>
                     </div>
                     <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-[10px] font-black italic text-gray-400">{post.price} ريال</div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic text-right">أطراف العملية</p>
                     <div className="flex flex-col gap-3">
                        {!isOwner && (
                          <div className="flex items-center justify-between bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/10">
                            <span className="text-[11px] font-black italic text-white">{post.profiles?.first_name} (البائع)</span>
                            <button onClick={() => startChat(post.creator_id, post.profiles?.first_name)} className="p-2.5 bg-cyan-500 text-[#0a0f3c] rounded-xl active:scale-90 transition-all"><MessageSquare size={16} /></button>
                          </div>
                        )}
                        {post.faz3a_participants?.map((p: any) => (
                          <div key={p.participant_id} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                            <span className="text-[11px] font-black italic text-gray-300">{p.profiles?.first_name} (المشتري)</span>
                            {isOwner && <button onClick={() => startChat(p.participant_id, p.profiles?.first_name)} className="p-2.5 bg-white/10 text-cyan-400 rounded-xl active:scale-90 transition-all border border-white/5"><MessageSquare size={16} /></button>}
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              );
            }) : <p className="text-center opacity-20 py-20 italic">لم تقم بأي عملية بعد</p>
          )}
        </div>
      </main>
    </div>
  );
}