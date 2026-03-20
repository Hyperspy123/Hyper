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
        const { data } = await supabase.from('faz3a_posts').select('*, profiles(first_name, last_name, skill_level)').order('created_at', { ascending: false });
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
      toast.success("تم نشر الفزعة في القائمة العامة 🔥");
      setIsModalOpen(false);
      setActiveTab('others_requests');
    } catch (error: any) {
      toast.error("فشل النشر");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* تم تغيير bg-[#05081d] إلى bg-transparent لكي تظهر نجوم الخلفية الموحدة */
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans relative" dir="rtl">
      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24 text-right">
        <div>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
            يا هلا، <span className="text-cyan-400">{userName}</span>
          </h1>
        </div>

        {/* التبويبات بستايل زجاجي شفاف */}
        <div className="flex bg-white/5 p-1 rounded-[22px] border border-white/10 backdrop-blur-3xl gap-1">
            {[
              { id: 'others_requests', label: 'فزعات عامة' },
              { id: 'my_requests', label: 'طلباتي' },
              { id: 'community', label: 'المجمع' }
            ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-400/20' : 'text-gray-400'}`}
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
                /* كروت بـ backdrop-blur-2xl قوية لتظهر النجوم من خلفها */
                <div key={post.id} className={`relative bg-white/5 border rounded-[35px] p-6 space-y-4 backdrop-blur-2xl transition-all duration-500 ${isMyPost ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-white/10'}`}>
                  
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
                    <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-[1000] italic">ناقص {post.missing_players}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase text-gray-400">
                    <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <MapPin size={12} className="text-cyan-400" /> {post.court_name}
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <Clock size={12} className="text-cyan-400" /> {post.match_time}
                    </div>
                  </div>

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
          ) : (
             /* باقي التبويبات بستايل متناسق مع الخلفية */
             <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 opacity-30 italic font-black text-[10px] uppercase tracking-[0.2em]">
                قريباً في المجمع..
             </div>
          )}
        </div>

        {/* الزر العائم - بحدود واضحة ليفصل عن الخلفية */}
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-28 left-6 w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all border-4 border-[#0a0f3c]">
          <Plus size={32} className="text-[#0a0f3c]" />
        </button>
      </main>
    </div>
  );
}