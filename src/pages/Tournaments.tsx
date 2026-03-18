import { useState, useEffect } from 'react';
import { createClient } from '@metagptx/web-sdk';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
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

  const handleRegister = (tournament: Tournament) => {
    if (tournament.current_participants >= tournament.max_participants) {
      toast.error(t('tournamentFullError'));
      return;
    }
    if (tournament.status === 'completed') {
      toast.error(t('tournamentEndedError'));
      return;
    }
    toast.success(`${t('registeredSuccess')} - ${tournament.name}`);
  };

  return (
    // STEP 1: Changed gradient to bg-transparent to show App.tsx mesh glows
    <div className="min-h-screen bg-transparent pb-32 text-white font-sans" dir={dir}>
      <Header />

      <main className="p-6 max-w-md mx-auto space-y-8">
        {/* Page Header */}
        <div className="mt-4">
          <div className="flex items-center gap-4 mb-4">
             <button 
              onClick={() => navigate('/')} 
              className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-cyan-400 hover:bg-cyan-500 hover:text-[#0a0f3c] transition-all active:scale-90"
            >
              <ChevronLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.15)]">
              <Trophy size={24} className="text-yellow-400 shadow-sm" />
            </div>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
            {t('tournamentsTitle')}
          </h1>
          <p className="text-gray-400 text-xs mt-2 font-bold tracking-widest uppercase opacity-60">
            {t('tournamentsSubtitle')}
          </p>
        </div>

        {/* Tabs - Glass Style */}
        <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-[24px] mb-8 border border-white/10 shadow-xl">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-cyan-500 text-[#0a0f3c] shadow-[0_10px_20px_rgba(6,182,212,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <span className="text-cyan-500 font-black italic text-sm animate-pulse uppercase tracking-widest">جاري التحميل...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-[40px] border border-dashed border-white/10 opacity-60">
            <Trophy size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">{t('noTournaments')}</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t('noTournamentsDesc')}</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filtered.map(tournament => {
              const badge = getStatusBadge(tournament.status);
              const isFull = tournament.current_participants >= tournament.max_participants;
              const spotsLeft = tournament.max_participants - tournament.current_participants;

              return (
                // STEP 2: Applied Glassmorphism (bg-white/5 + backdrop-blur-xl)
                <div
                  key={tournament.id}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden transition-all duration-300 hover:border-white/20 shadow-2xl"
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
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border backdrop-blur-md ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                        {getCategoryLabel(tournament.category)}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 pt-2">
                    <h3 className="text-2xl font-black mb-2 tracking-tight">{tournament.name}</h3>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6 line-clamp-2 uppercase tracking-wider opacity-80">{tournament.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                        <Calendar size={16} className="text-cyan-400" />
                        <span className="text-white text-[11px] font-black">{tournament.start_date}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                        <MapPin size={16} className="text-cyan-400" />
                        <span className="text-white text-[11px] font-black truncate">{tournament.court_name}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                        <Users size={16} className="text-cyan-400" />
                        <span className="text-white text-[11px] font-black">{tournament.current_participants}/{tournament.max_participants}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                        <DollarSign size={16} className="text-cyan-400" />
                        <span className="text-white text-[11px] font-black">{tournament.entry_fee} {t('sar')}</span>
                      </div>
                    </div>

                    {/* Prize Highlight */}
                    <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]">
                      <Medal size={20} className="text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-black uppercase tracking-tight">{tournament.prize}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                        <span>{t('registered')}</span>
                        <span className={isFull ? 'text-red-400' : 'text-cyan-400'}>
                          {isFull ? t('fullCapacity') : `${spotsLeft} ${t('seatsLeft')}`}
                        </span>
                      </div>
                      <div className="h-2.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isFull ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`}
                          style={{ width: `${(tournament.current_participants / tournament.max_participants) * 100}%` }}
                        >
                           <div className="absolute inset-0 bg-white/20 w-full h-[1px] top-0" />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegister(tournament)}
                      disabled={isFull || tournament.status === 'completed'}
                      className="w-full py-4 rounded-[24px] bg-cyan-500 text-[#0a0f3c] font-black text-sm uppercase tracking-tighter hover:bg-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-[0_10px_20px_rgba(6,182,212,0.3)] active:scale-95"
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