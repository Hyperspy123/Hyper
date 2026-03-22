import { useState, useEffect } from 'react';
import { createClient } from '@metagptx/web-sdk';
import Header from '@/components/Header';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Trophy, Calendar, Users, MapPin, Loader2, DollarSign, Medal, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const client = createClient();

interface Tournament {
  id: number;
  name: string;
  description: string;
  court_id: number;
  court_name: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize: string;
  category: string;
  status: string;
  image_url: string;
}

type TabType = 'all' | 'upcoming' | 'ongoing' | 'completed';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { t, dir } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await client.entities.tournaments.query({ query: {} });
        if (response?.data?.items) {
          setTournaments(response.data.items);
        }
      } catch (err) {
        console.error('Failed to fetch tournaments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filtered = activeTab === 'all'
    ? tournaments
    : tournaments.filter(tr => tr.status === activeTab);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: t('allTab') },
    { key: 'upcoming', label: t('upcomingTab') },
    { key: 'ongoing', label: t('ongoingTab') },
    { key: 'completed', label: t('completedTab') },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { label: t('statusUpcoming'), style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'ongoing':
        return { label: t('statusOngoing'), style: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'completed':
        return { label: t('statusCompletedTournament'), style: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
      default:
        return { label: status, style: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const getCategoryLabel = (cat: string) => cat === 'men' ? t('menCategory') : t('womenCategory');

  return (
    // 🌌 الشفافية المطلقة لإظهار نجوم App.tsx
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans relative overflow-x-hidden" dir={dir}>
      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8 relative z-10 pt-24 text-right">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-4 mb-6">
             <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 backdrop-blur-md active:scale-90 transition-all"
            >
              <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
              <Trophy size={24} className="text-yellow-400" />
            </div>
          </div>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase leading-none">
            {t('tournamentsTitle')}
          </h1>
          <p className="text-gray-500 text-[10px] mt-2 font-black tracking-[0.3em] uppercase italic opacity-60">
            {t('tournamentsSubtitle')}
          </p>
        </div>

        {/* Tabs - Glass Style */}
        <div className="flex bg-white/5 backdrop-blur-3xl p-1.5 rounded-[24px] mb-8 border border-white/10 shadow-2xl">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 rounded-[18px] font-black text-[10px] uppercase transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-cyan-500 text-[#0a0f3c] shadow-lg shadow-cyan-500/20'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-[40px] border border-dashed border-white/10 opacity-30 font-black text-[10px] uppercase tracking-widest italic">
            {t('noTournaments')}
          </div>
        ) : (
          <div className="grid gap-8">
            {filtered.map(tournament => {
              const badge = getStatusBadge(tournament.status);
              const isFull = tournament.current_participants >= tournament.max_participants;
              const spotsLeft = tournament.max_participants - tournament.current_participants;

              return (
                <div
                  key={tournament.id}
                  className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden transition-all duration-300 shadow-2xl active:scale-[0.98]"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={tournament.image_url}
                      alt={tournament.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05081d]/90 via-transparent to-transparent" />
                    <div className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex gap-2`}>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-[1000] uppercase border backdrop-blur-md ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl text-[9px] font-[1000] uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                        {getCategoryLabel(tournament.category)}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 pt-4">
                    <h3 className="text-2xl font-[1000] mb-2 tracking-tight italic uppercase leading-none">{tournament.name}</h3>
                    <p className="text-gray-500 text-[10px] font-black leading-relaxed mb-6 uppercase tracking-wider italic opacity-80">{tournament.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/5 p-3.5 rounded-2xl flex items-center gap-3 border border-white/5">
                        <Calendar size={14} className="text-cyan-400" />
                        <span className="text-white text-[10px] font-black italic">{tournament.start_date}</span>
                      </div>
                      <div className="bg-white/5 p-3.5 rounded-2xl flex items-center gap-3 border border-white/5">
                        <MapPin size={14} className="text-cyan-400" />
                        <span className="text-white text-[10px] font-black italic truncate">{tournament.court_name}</span>
                      </div>
                      <div className="bg-white/5 p-3.5 rounded-2xl flex items-center gap-3 border border-white/5">
                        <Users size={14} className="text-cyan-400" />
                        <span className="text-white text-[10px] font-black italic">{tournament.current_participants}/{tournament.max_participants}</span>
                      </div>
                      <div className="bg-white/5 p-3.5 rounded-2xl flex items-center gap-3 border border-white/5">
                        <DollarSign size={14} className="text-cyan-400" />
                        <span className="text-white text-[10px] font-black italic">{tournament.entry_fee} {t('sar')}</span>
                      </div>
                    </div>

                    {/* Prize Highlight */}
                    <div className="flex items-center gap-3 mb-6 px-5 py-3.5 rounded-2xl bg-yellow-400/5 border border-yellow-400/10">
                      <Medal size={18} className="text-yellow-400" />
                      <span className="text-yellow-400 text-[11px] font-[1000] uppercase tracking-tighter italic">{tournament.prize}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                        <span>{t('registered')}</span>
                        <span className={isFull ? 'text-red-400' : 'text-cyan-400'}>
                          {isFull ? t('fullCapacity') : `${spotsLeft} ${t('seatsLeft')}`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${isFull ? 'bg-red-500' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}
                          style={{ width: `${(tournament.current_participants / tournament.max_participants) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => toast.success(`${t('registeredSuccess')} - ${tournament.name}`)}
                      disabled={isFull || tournament.status === 'completed'}
                      className="w-full py-5 rounded-[24px] bg-cyan-500 text-[#0a0f3c] font-[1000] text-xs uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:bg-white/5 disabled:text-gray-500"
                    >
                      {tournament.status === 'completed'
                        ? t('tournamentEnded')
                        : isFull
                        ? t('tournamentFull')
                        : t('registerNow')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}