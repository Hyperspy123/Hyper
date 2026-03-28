import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Plus, Loader2, X, Trash2, User, ChevronLeft, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Faz3a() {
  const [userName, setUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'others_requests' | 'my_requests' | 'community'>('others_requests');
  
  const [communityPlayers, setCommunityPlayers] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [joinedRequests, setJoinedRequests] = useState<any[]>([]);
  const [othersRequests, setOthersRequests] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingPlayers, setMissingPlayers] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).single();
        setUserName(profile?.first_name || "لاعب");
      }
    }
    getUserData();
  }, []);

  const fetchData = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      if (activeTab === 'community') {
        const { data } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, current_rank, total_matches')
          .eq('is_public', true)
          .neq('id', currentUserId)
          .order('total_matches', { ascending: false });
        setCommunityPlayers(data || []);
      } 
      else if (activeTab === 'my_requests') {
        const { data: mine } = await supabase.from('faz3a_posts').select('*').eq('creator_id', currentUserId).order('created_at', { ascending: false });
        setMyRequests(mine || []);

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
      else if (activeTab === 'others_requests') {
        const { data } = await supabase.from('faz3a_posts').select('*, profiles(first_name, last_name, current_rank)').order('created_at', { ascending: false });
        setOthersRequests(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('faz3a-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_posts' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faz3a_participants' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeTab, currentUserId]);

  const handleJoinFromPublic = async (postId: string) => {
    setIsJoining(postId);
    try {
      const { data: success, error } = await supabase.rpc('join_faz3a_secure', {
        p_post_id: postId,
        p_user_id: currentUserId
      });
      if (error) throw error;
      if (success) {
        toast.success("كفو! تم تسجيلك في الفزعة 🔥");
        setActiveTab('my_requests');
      } else {
        toast.error("للأسف، اكتمل العدد في هذه الفزعة!");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الانضمام");
    } finally {
      setIsJoining(null);
    }
  };

  const handleSendInvite = async (receiverId: string, receiverName: string) => {
    const { data: activeRequests } = await supabase.from('faz3a_posts').select('id').eq('creator_id', currentUserId).order('created_at', { ascending: false }).limit(1);
    if (!activeRequests || activeRequests.length === 0) {
      toast.error("لازم تنشر طلب فزعة أولاً!");
      setActiveTab('my_requests');
      return;
    }
    setInvitingId(receiverId);
    try {
      const { error } = await supabase.rpc('send_faz3a_invite', {
        p_receiver_id: receiverId,
        p_post_id: activeRequests[0].id,
        p_sender_name: userName || 'لاعب من هايب'
      });
      if (!error) toast.success(`تم إرسال دعوة لـ ${receiverName} 🎾🔥`);
    } finally {
      setInvitingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء طلب الفزعة؟")) return;
    try {
      await supabase.from('faz3a_posts').delete().eq('id', postId);
      toast.success("تم الإلغاء");
      fetchData();
    } catch (error) { toast.error("فشل الإلغاء"); }
  };

  const handleCreatePost = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('faz3a_posts').insert([{ creator_id: currentUserId, missing_players: missingPlayers, location: 'الصحافة', court_name: 'ملعب هايب', match_time: '10:00 PM' }]);
      if (!error) {
        toast.success("تم النشر! ادعُ الشباب الآن");
        setIsModalOpen(false);
        setActiveTab('community');
      }
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-32 relative text-right" dir="rtl">
      <Header />
      <main className="p-6 max-w-md mx-auto space-y-8 pt-24">
        <div className="flex items-center justify-between">
           <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">يا هلا، <span className="text-cyan-400">{userName}</span></h1>
           <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 active:scale-90 transition-all"><ChevronLeft size={20} className="rotate-180" /></button>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            {[
              { id: 'others_requests', label: 'فزعات عامة' },
              { id: 'my_requests', label: 'طلباتي' },
              { id: 'community', label: 'المجتمع' }
            ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20 scale-[1.02]' : 'text-gray-500'}`}>{tab.label}</button>
            ))}
        </div>

        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'others_requests' ? (
            othersRequests.map(post => {
              const isMyPost = post.creator_id === currentUserId;
              const isFull = post.missing_players === 0;
              return (
                <div key={post.id} className={`relative bg-white/5 border rounded-[35px] p-7 space-y-5 backdrop-blur-2xl transition-all duration-500 ${isMyPost ? 'border-cyan-500/50' : 'border-white/10'} ${isFull ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4 text-right">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-cyan-400 border border-white/10">{post.profiles?.first_name?.[0]}</div>
                      <div>
                        <h4 className="font-black text-lg italic leading-none mb-1">{isMyPost ? "أنت" : post.profiles?.first_name}</h4>
                        <p className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest">{post.profiles?.current_rank || 'ROOKIE'}</p>
                      </div>
                    </div>
                    {isFull ? <div className="bg-gray-500/20 border border-gray-500/30 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic flex items-center gap-1"><CheckCircle2 size={12} /> مكتملة</div> : <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black italic uppercase">ناقص {post.missing_players}</div>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-black italic">
                    <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl"><MapPin size={14} className="text-cyan-400" /> {post.court_name}</div>
                    <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl"><Clock size={14} className="text-cyan-400" /> {post.match_time}</div>
                  </div>
                  {!isMyPost && !isFull && (
                    <button onClick={() => handleJoinFromPublic(post.id)} disabled={isJoining === post.id} className="w-full py-4.5 bg-white text-[#0a0f3c] rounded-[22px] font-black text-[11px] uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                      {isJoining === post.id ? <Loader2 className="animate-spin" size={16} /> : <><Zap size={16} className="fill-current" /> فزعتكم عندي ✋</>}
                    </button>
                  )}
                  {isFull && <div className="w-full py-4 bg-white/5 border border-white/10 rounded-[22px] text-center text-gray-500 text-[10px] font-black uppercase italic tracking-widest">تم تلبية هذه الفزعة 🛡️</div>}
                </div>
              );
            })
          ) : activeTab === 'my_requests' ? (
            <div className="space-y-10 animate-in fade-in duration-500">
              {myRequests.length > 0 && (
                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] px-4 italic leading-none">طلباتي النشطة</h3>
                   {myRequests.map(post => (
                      <div key={post.id} className="bg-white/5 border border-cyan-500/20 rounded-[35px] p-7 flex justify-between items-center backdrop-blur-xl">
                         <div className="text-right">
                            <p className="font-black text-sm italic text-white">{post.court_name}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">{post.match_time} | {post.missing_players === 0 ? "اكتمل العدد ✅" : `ناقص ${post.missing_players}`}</p>
                         </div>
                         <button onClick={() => handleDeletePost(post.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                      </div>
                   ))}
                </div>
              )}
              {joinedRequests.length > 0 && (
                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.3em] px-4 italic leading-none">الشباب طالبينك 🔥</h3>
                   {joinedRequests.map(post => (
                      <div key={post.id} className="relative bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-[35px] p-7 space-y-5 shadow-2xl overflow-hidden">
                         <div className="absolute top-4 left-4 bg-yellow-500 text-[#0a0f3c] px-3 py-1 rounded-full text-[8px] font-black uppercase italic rotate-[-5deg] shadow-lg">الشباب طالبينك</div>
                         <div className="flex items-center gap-4 text-right">
                            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-black border border-yellow-500/20">{post.profiles?.first_name?.[0]}</div>
                            <div>
                               <h4 className="font-black text-sm italic text-white leading-none mb-1">داعي الفزعة: <span className="text-yellow-500">{post.profiles?.first_name}</span></h4>
                               <p className="text-[9px] text-gray-500 font-bold uppercase">{post.court_name}</p>
                            </div>
                         </div>
                         <div className="flex items-center justify-between gap-3 pt-2">
                            <div className="text-[10px] font-black italic text-gray-300 flex items-center gap-2"><Clock size={14} className="text-yellow-500" /> {post.match_time}</div>
                            <button onClick={() => window.location.href = `https://wa.me/9665XXXXXXXX`} className="flex-1 py-3 bg-green-500 text-[#0a0f3c] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                              <MessageCircle size={14} /> تواصل واتساب
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
              )}
              {myRequests.length === 0 && joinedRequests.length === 0 && (
                <div className="text-center py-32 bg-white/5 rounded-[50px] border border-dashed border-white/10 opacity-30">
                  <Zap size={40} className="mx-auto mb-4 text-gray-600" />
                  <p className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-600 italic">لا توجد طلبات.. ابدأ فزعة جديدة!</p>
                </div>
              )}
            </div>
          ) : (
             communityPlayers.map(player => (
               <div key={player.id} className="bg-white/5 border border-white/10 rounded-[35px] p-6 flex items-center justify-between backdrop-blur-xl group hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-4 text-right">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 border border-white/5 flex items-center justify-center font-black text-cyan-400 text-lg group-hover:scale-110 transition-transform">{player.first_name?.[0]}</div>
                    <div>
                      <h4 className="font-black text-lg italic text-white leading-none mb-1">{player.first_name}</h4>
                      <span className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest italic">{player.current_rank || 'ROOKIE'}</span>
                    </div>
                  </div>
                  <button disabled={invitingId === player.id} onClick={() => handleSendInvite(player.id, player.first_name)} className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl text-[10px] font-black uppercase active:scale-90 transition-all flex items-center gap-2">
                    {invitingId === player.id ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> دعوة</>}
                  </button>
               </div>
             ))
          )}
        </div>

        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-28 left-6 w-18 h-18 bg-cyan-500 rounded-[22px] flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] z-50 border-4 border-[#05081d] active:scale-90 transition-all hover:scale-110"><Plus size={36} className="text-[#0a0f3c]" strokeWidth={3} /></button>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in">
            <div className="bg-[#0a0f3c]/90 border border-white/10 w-full max-w-sm rounded-[45px] p-10 space-y-8 shadow-2xl text-right" dir="rtl">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-[1000] italic text-cyan-400 uppercase leading-none">إنشاء فزعة</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-5">
                <label className="text-[10px] font-black text-gray-500 uppercase px-2 italic tracking-widest leading-none">كم بطل ناقصك؟</label>
                <div className="flex gap-3">
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setMissingPlayers(num)} className={`flex-1 py-5 rounded-[22px] font-[1000] text-lg border transition-all ${missingPlayers === num ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-xl shadow-cyan-500/40 scale-105' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>{num}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreatePost} disabled={isSubmitting} className="w-full py-5.5 bg-cyan-500 text-[#0a0f3c] rounded-[26px] font-[1000] uppercase text-xs flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} className="fill-current" /> انشر الفزعة وادعُ أصحابك 🔥</>}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}