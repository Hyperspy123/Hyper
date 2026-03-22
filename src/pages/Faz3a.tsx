import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Plus, Loader2, X, Trash2, User, ChevronLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Faz3a() {
  const [userName, setUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'others_requests' | 'my_requests' | 'community'>('others_requests');
  
  const [communityPlayers, setCommunityPlayers] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [othersRequests, setOthersRequests] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingPlayers, setMissingPlayers] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

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
        // جلب اللاعبين العامين مع ترتيبهم حسب عدد المباريات
        const { data } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, current_rank, total_matches')
          .eq('is_public', true)
          .neq('id', currentUserId)
          .order('total_matches', { ascending: false });
        setCommunityPlayers(data || []);
      } 
      else if (activeTab === 'my_requests') {
        const { data } = await supabase.from('faz3a_posts').select('*').eq('creator_id', currentUserId).order('created_at', { ascending: false });
        setMyRequests(data || []);
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
  }, [activeTab, currentUserId]);

  // 🔥 محرك إرسال الدعوات
  const handleSendInvite = async (receiverId: string, receiverName: string) => {
    // التأكد من وجود طلب فزعة نشط للمستخدم الحالي
    const { data: activeRequests } = await supabase
      .from('faz3a_posts')
      .select('id')
      .eq('creator_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!activeRequests || activeRequests.length === 0) {
      toast.error("يا بطل، لازم تنشر طلب فزعة أولاً عشان تقدر تدعو الناس!");
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

      if (error) throw error;
      toast.success(`تم إرسال دعوة لـ ${receiverName} 🎾🔥`);
    } catch (error: any) {
      toast.error("حدث خطأ أثناء إرسال الدعوة، جرب مرة ثانية");
    } finally {
      setInvitingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء طلب الفزعة؟")) return;
    try {
      const { error } = await supabase.from('faz3a_posts').delete().eq('id', postId);
      if (error) throw error;
      toast.success("تم إلغاء طلب الفزعة");
      fetchData();
    } catch (error: any) {
      toast.error("فشل الإلغاء");
    }
  };

  const handleCreatePost = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('faz3a_posts').insert([
        { 
          creator_id: currentUserId, 
          missing_players: missingPlayers, 
          location: 'الصحافة', 
          court_name: 'ملعب هايب', 
          match_time: '10:00 PM' 
        }
      ]);
      if (error) throw error;
      toast.success("تم نشر الفزعة! ادعُ اللاعبين الآن من قائمة المجتمع 🔥");
      setIsModalOpen(false);
      setActiveTab('community'); // تحويل المستخدم للمجتمع فوراً للبدء بالدعوات
    } catch (error: any) {
      toast.error("فشل النشر");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-32 relative overflow-x-hidden text-right" dir="rtl">
      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24">
        <div className="flex items-center justify-between">
           <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
            يا هلا، <span className="text-cyan-400">{userName}</span>
          </h1>
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 backdrop-blur-md active:scale-90 transition-all">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        </div>

        {/* التبويبات الزجاجية */}
        <div className="flex bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-3xl gap-1.5 shadow-2xl">
            {[
              { id: 'others_requests', label: 'فزعات عامة' },
              { id: 'my_requests', label: 'طلباتي' },
              { id: 'community', label: 'المجتمع' }
            ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase transition-all duration-300 ${activeTab === tab.id ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20 scale-[1.02]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'others_requests' ? (
            othersRequests.length > 0 ? othersRequests.map(post => {
              const isMyPost = post.creator_id === currentUserId;
              return (
                <div key={post.id} className={`relative bg-white/5 border rounded-[35px] p-7 space-y-5 backdrop-blur-2xl transition-all duration-500 shadow-2xl ${isMyPost ? 'border-cyan-500/50' : 'border-white/10'}`}>
                  {isMyPost && <div className="absolute -top-3 left-6 bg-cyan-500 text-[#0a0f3c] px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase italic tracking-tighter shadow-xl">طلبك النشط</div>}
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm uppercase ${isMyPost ? 'bg-cyan-500 text-[#0a0f3c]' : 'bg-white/10 text-cyan-400 border border-white/10'}`}>
                        {isMyPost ? <User size={20} /> : post.profiles?.first_name?.[0]}
                      </div>
                      <div className="text-right">
                        <h4 className="font-black text-lg italic leading-none mb-1">{isMyPost ? "أنت" : `${post.profiles?.first_name} ${post.profiles?.last_name}`}</h4>
                        <p className="text-[9px] font-black text-cyan-500/60 uppercase tracking-[0.2em]">{post.profiles?.current_rank || 'ROOKIE 🥉'}</p>
                      </div>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-[1000] italic uppercase">ناقص {post.missing_players}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 text-[10px] font-black italic">
                      <MapPin size={14} className="text-cyan-400" /> {post.court_name}
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 text-[10px] font-black italic">
                      <Clock size={14} className="text-cyan-400" /> {post.match_time}
                    </div>
                  </div>

                  {isMyPost ? (
                    <button onClick={() => handleDeletePost(post.id)} className="w-full py-4.5 bg-red-500/10 text-red-500 border border-red-500/10 rounded-[22px] font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg">
                      <Trash2 size={16} /> إلغاء طلب الفزعة
                    </button>
                  ) : (
                    <button className="w-full py-4.5 bg-white text-[#0a0f3c] rounded-[22px] font-black text-[11px] uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Zap size={16} className="fill-current" /> فزعتكم عندي ✋
                    </button>
                  )}
                </div>
              )
            }) : (
              <div className="text-center py-20 opacity-30 font-black uppercase text-xs tracking-widest">لا توجد فزعات عامة حالياً</div>
            )
          ) : activeTab === 'my_requests' ? (
            myRequests.length > 0 ? myRequests.map(post => (
              <div key={post.id} className="bg-white/5 border border-cyan-500/20 rounded-[35px] p-7 space-y-4 backdrop-blur-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-500">
                 <div className="flex justify-between items-center relative">
                    <span className="text-[11px] font-[1000] text-cyan-400 uppercase italic tracking-widest">إدارة طلبك النشط</span>
                    <button onClick={() => handleDeletePost(post.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                 </div>
                 <div className="text-sm font-black text-gray-300 italic">ملعب: {post.court_name} | الوقت: {post.match_time} | مطلوب: {post.missing_players}</div>
              </div>
            )) : (
              <div className="text-center py-20 opacity-30 font-black uppercase text-xs tracking-widest">ليس لديك طلبات نشطة</div>
            )
          ) : (
             communityPlayers.map(player => (
               <div key={player.id} className="bg-white/5 border border-white/10 rounded-[35px] p-6 flex items-center justify-between backdrop-blur-xl shadow-2xl group hover:border-cyan-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4 text-right">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 border border-white/5 flex items-center justify-center font-black text-cyan-400 text-lg shadow-inner group-hover:scale-110 transition-transform">
                      {player.first_name?.[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-lg italic leading-none mb-1 text-white">{player.first_name} {player.last_name}</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest italic">{player.current_rank || 'ROOKIE 🥉'}</span>
                         <span className="text-[8px] text-gray-600 font-bold leading-none">• {player.total_matches} مباراة</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    disabled={invitingId === player.id}
                    onClick={() => handleSendInvite(player.id, player.first_name)}
                    className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl text-[10px] font-black uppercase hover:bg-cyan-500 hover:text-[#0a0f3c] transition-all active:scale-90 flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {invitingId === player.id ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> دعوة</>}
                  </button>
               </div>
             ))
          )}
        </div>

        {/* زر الإضافة العائم بستايل نيون */}
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-28 left-6 w-18 h-18 bg-cyan-500 rounded-[22px] flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] z-50 hover:scale-110 active:scale-90 transition-all border-4 border-[#05081d]">
          <Plus size={36} className="text-[#0a0f3c]" strokeWidth={3} />
        </button>

        {/* مودال إنشاء فزعة */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300 text-right" dir="rtl">
            <div className="bg-[#0a0f3c]/90 border border-white/10 w-full max-w-sm rounded-[45px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-[1000] italic text-cyan-400 tracking-tighter uppercase leading-none">إنشاء فزعة</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <div className="space-y-5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 italic">كم بطل ناقصك؟</label>
                <div className="flex gap-3">
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setMissingPlayers(num)} className={`flex-1 py-5 rounded-[22px] font-[1000] text-lg border transition-all duration-300 ${missingPlayers === num ? 'bg-cyan-500 border-cyan-400 text-[#0a0f3c] shadow-xl shadow-cyan-500/40' : 'bg-white/5 border-white/10 text-gray-400'}`}>{num}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreatePost} disabled={isSubmitting} className="w-full py-5.5 bg-cyan-500 text-[#0a0f3c] rounded-[26px] font-[1000] uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} className="fill-current" /> انشر الفزعة وادعُ أصحابك 🔥</>}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}