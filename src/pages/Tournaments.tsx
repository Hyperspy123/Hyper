import { useState, useEffect } from 'react';
import { createClient } from '@metagptx/web-sdk';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Trophy, Calendar, Users, MapPin, Loader2, DollarSign, Medal } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] pb-20" dir={dir}>
      <Header />

      <div className="pt-18 pb-6 max-w-4xl mx-auto px-4" style={{ paddingTop: '4.5rem' }}>
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center">
            <Trophy size={24} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{t('tournamentsTitle')}</h1>
            <p className="text-gray-400 mt-0.5 text-sm">{t('tournamentsSubtitle')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#14224d]/50 p-1.5 rounded-xl border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all text-center ${
                activeTab === tab.key
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#14224d] border border-white/5 rounded-2xl p-10 text-center">
            <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">{t('noTournaments')}</h3>
            <p className="text-gray-400 text-sm">{t('noTournamentsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(tournament => {
              const badge = getStatusBadge(tournament.status);
              const isFull = tournament.current_participants >= tournament.max_participants;
              const spotsLeft = tournament.max_participants - tournament.current_participants;

              return (
                <div
                  key={tournament.id}
                  className="bg-[#14224d] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={tournament.image_url}
                      alt={tournament.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14224d] via-transparent to-transparent" />
                    <div className={`absolute top-3 ${dir === 'rtl' ? 'right-3' : 'left-3'} flex gap-2`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {getCategoryLabel(tournament.category)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 -mt-4 relative">
                    <h3 className="text-lg font-bold text-white mb-1">{tournament.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{tournament.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={14} className="text-cyan-400" />
                        <span>{tournament.start_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin size={14} className="text-cyan-400" />
                        <span>{tournament.court_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users size={14} className="text-cyan-400" />
                        <span>{tournament.current_participants}/{tournament.max_participants} {t('player')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <DollarSign size={14} className="text-cyan-400" />
                        <span>{tournament.entry_fee} {t('sar')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                      <Medal size={16} className="text-yellow-400" />
                      <span className="text-yellow-300 text-sm font-medium">{tournament.prize}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{t('registered')}</span>
                        <span>{isFull ? t('fullCapacity') : `${spotsLeft} ${t('seatsLeft')}`}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-cyan-500'}`}
                          style={{ width: `${(tournament.current_participants / tournament.max_participants) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegister(tournament)}
                      disabled={isFull || tournament.status === 'completed'}
                      className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium transition-all text-sm"
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
      </div>

      <BottomNav />
    </div>
  );
}