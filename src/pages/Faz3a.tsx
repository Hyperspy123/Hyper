import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { Users, MapPin, Clock, Zap, Plus, Search, Loader2, Target, Award, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const getRankInfo = (matches: number) => {
  if (matches < 10) return { title: 'مستجد', icon: '🥚' };
  if (matches < 50) return { title: 'هايب', icon: '⚡' };
  if (matches < 150) return { title: 'برنس', icon: '👑' };
  if (matches < 300) return { title: 'كينج', icon: '🦁' };
  return { title: 'أسطورة', icon: '🌌' };
};

export default function Faz3a() {
  const [userName, setUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'others_requests' | 'my_requests' | 'community'>('community');
  
  const [communityPlayers, setCommunityPlayers] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [othersRequests, setOthersRequests] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingPlayers, setMissingPlayers] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 1. جلب بيانات المستخدم الحالي عند التشغيل
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

  // 2. جلب البيانات بناءً على التبويب المختار
  useEffect(() => {
    async function fetchData() {
      if (!currentUserId) return;
      setLoading(true);
      try {
        if (activeTab === 'community') {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_public', true)
            .neq('id', currentUserId); // جلب الجميع ما عدا "أنا" (هنا سيظهر أخوك)
          if (error) throw error;
          setCommunityPlayers(data || []);
        } 
        else if (activeTab === 'my_requests') {
          const { data, error } = await supabase
            .from('faz3a_posts')
            .select('*')
            .eq('creator_id', currentUserId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setMyRequests(data || []);
        } 
        else if (activeTab === 'others_requests') {
          const { data, error } = await supabase
            .from('faz3a_posts')
            .select('*, profiles(first_name, last_name, skill_level)')
            .neq('creator_id', currentUserId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setOthersRequests(data || []);
        }
      } catch (error: any) {
        console.error("Fetch Error:", error.message);
        toast.error("فشل في تحديث البيانات");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab, currentUserId]);

  // 3. دالة إرسال دعوة خاصة (Direct Invite)
  const sendDirectInvite = async (receiverId: string, receiverName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return toast.error("سجل دخولك أولاً");

      console.log("إرسال دعوة إلى:", receiverId); // للتحقق من الـ ID في الـ Console

      const { error } = await supabase.from('faz3a_invites').insert([
        { 
          sender_id: user.id, 
          receiver_id: receiverId, 
          status: 'pending' 
        }
      ]);

      if (error) throw error;
      toast.success(`تم إرسال دعوة لـ ${receiverName} 🔥`, { icon: <CheckCircle2 className="text-cyan-400" /> });
    } catch (error: any) {
      console.error("Invite Error:", error.message);
      toast.error("فشل الإرسال: تأكد من تشغيل الـ SQL الأخير");
    }
  };

  // 4. دالة إنشاء طلب فزعة عام
  const handleCreatePost = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول");

      const { error } = await supabase.from('faz3a_posts').insert([
        { 
          creator_id: user.id, 
          missing_players: missingPlayers, 
          location: 'الصحافة', 
          court_name: 'ملعب هايب', 
          match_time: '10:00 PM' 
        }
      ]);

      if (error) throw error;

      toast.success("تم نشر طلب الفزعة! 🔥");
      setIsModalOpen(false);
      setActiveTab('my_requests'); 
    } catch (error: any) {
      console.error("Post Error:", error.message);
      toast.error("فشل النشر");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] pb-32 text-white font-sans relative overflow-x-hidden" dir="rtl">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24 text-right">
        <div className="mt-4">
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
            يا هلا، <span className="text-cyan-400">{userName}</span>
          </h1>
        </div>

        {/* --- نظام التبويبات الثلاثي --- */}
        <div className="flex bg-white/5 p-1 rounded-[22px] border border-white/10 backdrop-blur-md overflow-x-auto no-scrollbar gap-1">
            {[
              { id: 'others_requests', label: 'فزعات عامة' },
              { id: 'my_requests', label: 'طلباتي' },
              { id: 'community', label: 'المجمع' }
            ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[90px] py-3 rounded-[18px] text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20' : 'text-gray-500'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="space-y-4 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-cyan-400" size={40} />
            </div>
          ) : activeTab === 'community' ? (
            communityPlayers.length > 0 ? (
              communityPlayers.map((player) => (
                <div key={player.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[35px] p-6 flex items-center justify-between group hover:border-cyan-500/40 transition-all shadow-xl">
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-white/10 flex items-center justify-center font-black text-cyan-400 text-xl shadow-inner uppercase">
                        {player.first_name?.[0] || 'P'}
                      </div>
                      <div className="text-right">
                          <h4 className="font-black text-sm text-white">{player.first_name} {player.last_name}</h4>
                          <div className="flex gap-2 mt-1">
                              <span className="text-[8px] font-black bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-400 uppercase tracking-tighter">{player.skill_level}</span>
                              <span className="text-[8px] font-black bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-400 uppercase tracking-tighter">{getRankInfo(player.matches_count || 0).title}</span>
                          </div>
                      </div>
                  </div>
                  <button 
                    onClick={() => sendDirectInvite(player.id, player.first_name)} 
                    className="px-4 py-2 bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-[#0a0f3c] rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-lg"
                  >
                    إرسال دعوة
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-30 text-[10px] font-black uppercase italic">لا يوجد لاعبين متاحين حالياً</div>
            )
          ) : activeTab === 'my_requests' ? (
            myRequests.length > 0 ? myRequests.map(post => (
              <div key={post.id} className="bg-white/5 border border-cyan-500/30 rounded-[35px] p-6 space-y-4 backdrop-blur-xl">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-cyan-400 uppercase italic">طلبك نشط حالياً</span>
                    <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black italic">ناقصك {post.missing_players}</div>
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase text-gray-400">
                    <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <MapPin size={14} className="text-cyan-400" /> {post.location}
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <Clock size={14} className="text-cyan-400" /> {post.match_time}
                    </div>
                  </div>
              </div>
            )) : <div className="text-center py-20 opacity-20 text-[10px] font-black uppercase tracking-widest">لم تنشئ أي فزعة بعد</div>
          ) : (
            othersRequests.length > 0 ? othersRequests.map(post => (
              <div key={post.id} className="bg-white/5 border border-white/10 rounded-[35px] p-6 space-y-4 backdrop-blur-xl">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-xs uppercase">{post.profiles?.first_name?.[0]}</div>
                      <div className="text-right">
                        <h4 className="font-black text-xs">{post.profiles?.first_name} {post.profiles?.last_name}</h4>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{post.profiles?.skill_level}</p>
                      </div>
                    </div>
                    <div className="bg-cyan-500 text-[#0a0f3c] px-3 py-1 rounded-full text-[10px] font-[1000] italic">ناقصنا {post.missing_players}</div>
                  </div>
                  <button className="w-full py-4 bg-white text-[#05081d] rounded-2xl font-[1000] text-[10px] uppercase shadow-lg active:scale-95 transition-all">فزعتكم عندي ✋</button>
              </div>
            )) : <div className="text-center py-20 opacity-20 text-[10px] font-black uppercase italic tracking-widest">لا توجد طلبات فزعة حالياً</div>
          )}
        </div>

        {/* Floating Button */}
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-28 left-6 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg z-50 hover:scale-110 active:scale-95 transition-all border-4 border-[#05081d]">
          <Plus size={32} className="text-[#0a0f3c]" />
        </button>

        {/* Create Post Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#05081d]/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-[1000] italic uppercase text-cyan-400 tracking-tighter">إنشاء طلب فزعة</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">كم لاعب ناقصك؟</label>
                <div className="flex gap-4">
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setMissingPlayers(num)} className={`flex-1 py-4 rounded-2xl font-black border transition-all ${missingPlayers === num ? 'bg-cyan-400 border-cyan-400 text-[#0a0f3c] shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}>{num}</button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleCreatePost} 
                disabled={isSubmitting}
                className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] uppercase text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "نشر الطلب الآن"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}