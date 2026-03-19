import { useState, useEffect } from 'react';
import { supabase } from '../LLL';
import Header from '@/components/Header';
import { MapPin, Clock, Zap, Plus, Loader2, CheckCircle2, X, Trash2, User } from 'lucide-react';
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
        const { data } = await supabase.from('profiles').select('*').eq('is_public', true).neq('id', currentUserId);
        setCommunityPlayers(data || []);
      } 
      else if (activeTab === 'my_requests') {
        const { data } = await supabase.from('faz3a_posts').select('*').eq('creator_id', currentUserId).order('created_at', { ascending: false });
        setMyRequests(data || []);
      } 
      else if (activeTab === 'others_requests') {
        // جلب الكل (بدون استثناء المستخدم الحالي) لترتيبهم
        const { data } = await supabase.from('faz3a_posts').select('*, profiles(first_name, last_name, skill_level)').order('created_at', { ascending: false });
        
        // الترتيب: طلباتي أولاً، ثم طلبات الآخرين
        const sortedData = data?.sort((a, b) => {
          if (a.creator_id === currentUserId) return -1;
          if (b.creator_id === currentUserId) return 1;
          return 0;
        });
        
        setOthersRequests(sortedData || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, currentUserId]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء طلب الفزعة؟")) return;
    try {
      const { error } = await supabase.from('faz3a_posts').delete().eq('id', postId);
      if (error) throw error;
      toast.success("تم إلغاء طلب الفزعة");
      fetchData(); // إعادة جلب البيانات لتحديث القائمة العامة
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
      toast.success("تم نشر الفزعة في القائمة العامة 🔥");
      setIsModalOpen(false);
      setActiveTab('others_requests'); // العودة للقائمة العامة لرؤية الطلب في الأعلى
    } catch (error: any) {
      toast.error("فشل النشر");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05081d] pb-32 text-white font-sans relative overflow-x-hidden" dir="rtl">
      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24 text-right">
        <div>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
            يا هلا، <span className="text-cyan-400">{userName}</span>
          </h1>
        </div>

        <div className="flex bg-white/5 p-1 rounded-[22px] border border-white/10 backdrop-blur-md gap-1">
            {[
              { id: 'others_requests', label: 'فزعات عامة' },
              { id: 'my_requests', label: 'طلباتي' },
              { id: 'community', label: 'المجمع' }
            ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20' : 'text-gray-500'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={40} /></div>
          ) : activeTab === 'others_requests' ? (
            othersRequests.map(post => {
              const isMyPost = post.creator_id === currentUserId;
              return (
                <div key={post.id} className={`relative bg-white/5 border rounded-[35px] p-6 space-y-4 backdrop-blur-xl transition-all duration-500 ${isMyPost ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-white/10'}`}>
                  
                  {/* علامة "طلبك الشخصي" */}
                  {isMyPost && (
                    <div className="absolute -top-3 -left-3 bg-cyan-500 text-[#0a0f3c] px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase italic tracking-tighter shadow-xl animate-bounce">
                      طلبك الشخصي
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase ${isMyPost ? 'bg-cyan-500 text-[#0a0f3c]' : 'bg-white/10 text-cyan-400'}`}>
                        {isMyPost ? <User size={18} /> : post.profiles?.first_name?.[0]}
                      </div>
                      <div className="text-right">
                        <h4 className="font-black text-xs italic">{isMyPost ? "أنت (صاحب الفزعة)" : `${post.profiles?.first_name} ${post.profiles?.last_name}`}</h4>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{isMyPost ? "جاهز للمباراة" : post.profiles?.skill_level}</p>
                      </div>
                    </div>
                    <div className="bg-cyan-500 text-[#0a0f3c] px-3 py-1 rounded-full text-[10px] font-[1000] italic">ناقص {post.missing_players}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase text-gray-400">
                    <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <MapPin size={12} className="text-cyan-400" /> {post.court_name}
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <Clock size={12} className="text-cyan-400" /> {post.match_time}
                    </div>
                  </div>

                  {/* زر التفاعل المتغير */}
                  {isMyPost ? (
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      <Trash2 size={14} /> إلغاء طلب الفزعة
                    </button>
                  ) : (
                    <button className="w-full py-4 bg-white text-[#05081d] rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">فزعتكم عندي ✋</button>
                  )}
                </div>
              );
            })
          ) : activeTab === 'my_requests' ? (
            /* تبويب طلباتي كأرشيف مختصر */
            myRequests.map(post => (
              <div key={post.id} className="bg-white/5 border border-cyan-500/30 rounded-[35px] p-6 space-y-4 backdrop-blur-xl">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-cyan-400 uppercase italic tracking-widest">إدارة طلبك الشخصي</span>
                    <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-500 hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                 </div>
                 <div className="text-[11px] font-bold text-gray-300">ملعب: {post.court_name} | الوقت: {post.match_time}</div>
              </div>
            ))
          ) : (
             communityPlayers.map(player => (
               <div key={player.id} className="bg-white/5 border border-white/10 rounded-[35px] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center font-black text-cyan-400 uppercase">{player.first_name?.[0]}</div>
                    <div className="text-right">
                      <h4 className="font-black text-sm">{player.first_name}</h4>
                      <span className="text-[8px] font-black text-gray-500 uppercase">{player.skill_level}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 border border-white/10 text-cyan-400 rounded-xl text-[10px] font-black hover:bg-cyan-400 hover:text-black transition-all">دعوة</button>
               </div>
             ))
          )}
        </div>

        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-28 left-6 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg z-50 hover:scale-110 active:scale-95 transition-all border-4 border-[#05081d]">
          <Plus size={32} className="text-[#0a0f3c]" />
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#05081d]/90 backdrop-blur-md">
            <div className="bg-[#0a0f3c] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black italic text-cyan-400 tracking-tighter uppercase">إنشاء فزعة</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 italic">كم لاعب ناقصك؟</label>
                <div className="flex gap-4">
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setMissingPlayers(num)} className={`flex-1 py-4 rounded-2xl font-[1000] border transition-all ${missingPlayers === num ? 'bg-cyan-400 border-cyan-400 text-[#0a0f3c] scale-105 shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}>{num}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreatePost} disabled={isSubmitting} className="w-full py-5 bg-cyan-500 text-[#0a0f3c] rounded-[24px] font-[1000] uppercase text-xs shadow-lg flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "انشر الفزعة الآن 🔥"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}