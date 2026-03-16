import { useState, useEffect } from 'react';
import { createClient } from '@metagptx/web-sdk';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useI18n } from '@/lib/i18n';
import { Gift, Percent, Star, Loader2, MapPin, Trophy, Tag, Zap, Clock, Users, Sparkles, Crown, Heart, Target, Award, BadgeCheck, Flame, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const client = createClient();

interface Reward {
  id: number;
  court_id: number;
  court_name: string;
  title: string;
  description: string;
  condition_text: string;
  discount_percent: number;
  icon: string;
  is_active: boolean;
}

interface Booking {
  id: number;
  court_id: number;
  court_name: string;
  status: string;
}

function getRewardIcon(icon: string, discount: number) {
  const iconMap: Record<string, { Icon: any; from: string; to: string; border: string }> = {
    '🎉': { Icon: Sparkles, from: 'from-purple-500', to: 'to-pink-500', border: 'border-purple-500/30' },
    '🏆': { Icon: Trophy, from: 'from-yellow-400', to: 'to-amber-600', border: 'border-yellow-500/30' },
    '⭐': { Icon: Star, from: 'from-yellow-400', to: 'to-orange-500', border: 'border-yellow-500/30' },
    '🎁': { Icon: Gift, from: 'from-pink-500', to: 'to-rose-600', border: 'border-pink-500/30' },
    '💰': { Icon: Tag, from: 'from-green-400', to: 'to-emerald-600', border: 'border-green-500/30' },
    '⚡': { Icon: Zap, from: 'from-cyan-400', to: 'to-blue-500', border: 'border-cyan-500/30' },
    '🔥': { Icon: Flame, from: 'from-orange-500', to: 'to-red-600', border: 'border-orange-500/30' },
    '👥': { Icon: Users, from: 'from-indigo-400', to: 'to-violet-600', border: 'border-indigo-500/30' },
    '⏰': { Icon: Clock, from: 'from-teal-400', to: 'to-cyan-600', border: 'border-teal-500/30' },
    '👑': { Icon: Crown, from: 'from-amber-400', to: 'to-yellow-600', border: 'border-amber-500/30' },
    '❤️': { Icon: Heart, from: 'from-rose-400', to: 'to-pink-600', border: 'border-rose-500/30' },
    '🎯': { Icon: Target, from: 'from-blue-400', to: 'to-indigo-600', border: 'border-blue-500/30' },
    '✅': { Icon: BadgeCheck, from: 'from-green-400', to: 'to-emerald-600', border: 'border-green-500/30' },
    '🏅': { Icon: Award, from: 'from-amber-400', to: 'to-orange-600', border: 'border-amber-500/30' },
    '📋': { Icon: Tag, from: 'from-slate-400', to: 'to-gray-600', border: 'border-slate-500/30' },
  };

  const match = iconMap[icon];
  if (match) return match;

  if (discount >= 30) return { Icon: Crown, from: 'from-amber-400', to: 'to-yellow-600', border: 'border-amber-500/30' };
  if (discount >= 20) return { Icon: Flame, from: 'from-orange-500', to: 'to-red-600', border: 'border-orange-500/30' };
  if (discount >= 10) return { Icon: Sparkles, from: 'from-cyan-400', to: 'to-blue-500', border: 'border-cyan-500/30' };
  return { Icon: Gift, from: 'from-purple-500', to: 'to-pink-500', border: 'border-purple-500/30' };
}

function RewardIconBadge({ icon, discount }: { icon: string; discount: number }) {
  const { Icon, from, to, border } = getRewardIcon(icon, discount);
  return (
    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${from} ${to} border ${border} flex items-center justify-center shrink-0 shadow-lg`}>
      <Icon size={24} className="text-white drop-shadow-md" />
    </div>
  );
}

function extractRequiredCount(conditionText: string): number {
  const arabicNums: Record<string, string> = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
  const normalized = conditionText.replace(/[٠-٩]/g, (d) => arabicNums[d] || d);
  const match = normalized.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 3;
}

function ProgressBar({ current, required, rewardTitle, t }: { current: number; required: number; rewardTitle: string; t: (key: string, params?: Record<string, string | number>) => string }) {
  const isCompleted = current >= required;
  const percentage = Math.min((current / required) * 100, 100);

  if (isCompleted) {
    return (
      <div className="mt-3">
        <button
          onClick={() => toast.success(`${t('rewardClaimed')}: ${rewardTitle}`)}
          className="w-full py-2.5 rounded-xl bg-gradient-to-l from-green-500 to-emerald-500 text-white font-bold text-xs hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Gift size={14} />
          <span>{t('claimReward')}</span>
          <ChevronLeft size={14} />
        </button>
      </div>
    );
  }

  const remaining = required - current;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-gray-500">{t('progress')}</span>
        <span className="text-[10px] text-cyan-400 font-bold">{current} / {required}</span>
      </div>
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-cyan-600 transition-all duration-700 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 15 && (
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
          )}
        </div>
      </div>
      <p className="text-[10px] text-gray-500 mt-1">
        {remaining === 1 ? t('oneBookingLeft') : t('bookingsLeft', { count: remaining })}
      </p>
    </div>
  );
}

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<string>('all');
  const [user, setUser] = useState<any>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const { t, dir } = useI18n();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) setUser(res.data);
      } catch {
        setUser(null);
      }

      try {
        const response = await client.entities.rewards.query({
          query: { is_active: true },
        });
        if (response?.data?.items) {
          setRewards(response.data.items);
        }
      } catch (err) {
        console.error('Failed to fetch rewards:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        const response = await client.entities.bookings.query({
          query: { status: 'confirmed' },
        });
        if (response?.data?.items) {
          setUserBookings(response.data.items);
        }
      } catch {
        setUserBookings([]);
      }
    };
    fetchBookings();
  }, [user]);

  const getBookingCountForCourt = (courtId: number): number => {
    return userBookings.filter(b => b.court_id === courtId).length;
  };

  const courtNames = ['all', ...Array.from(new Set(rewards.map(r => r.court_name)))];

  const filteredRewards = selectedCourt === 'all'
    ? rewards
    : rewards.filter(r => r.court_name === selectedCourt);

  const groupedRewards: Record<string, Reward[]> = {};
  filteredRewards.forEach(r => {
    if (!groupedRewards[r.court_name]) groupedRewards[r.court_name] = [];
    groupedRewards[r.court_name].push(r);
  });

  const completedCount = rewards.filter(r => {
    const required = extractRequiredCount(r.condition_text);
    const current = getBookingCountForCourt(r.court_id);
    return current >= required;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] pb-20" dir={dir}>
      <Header />

      <div className="max-w-4xl mx-auto px-4" style={{ paddingTop: '4.5rem' }}>
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center">
              <Gift size={24} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t('rewardsTitle')}</h1>
              <p className="text-gray-400 mt-0.5 text-sm">{t('rewardsSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Summary Banner */}
        <div className="bg-gradient-to-l from-cyan-500/10 to-purple-500/10 border border-cyan-500/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
              <Trophy size={28} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white mb-1">{t('rewardsBannerTitle')}</h2>
              <p className="text-gray-400 text-xs">{t('rewardsBannerDesc')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-cyan-400">{rewards.length}</div>
              <div className="text-xs text-gray-400">{t('availableOffers')}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-yellow-400">
                {rewards.length > 0 ? Math.max(...rewards.map(r => r.discount_percent)) : 0}%
              </div>
              <div className="text-xs text-gray-400">{t('highestDiscount')}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-green-400">
                {user ? completedCount : new Set(rewards.map(r => r.court_name)).size}
              </div>
              <div className="text-xs text-gray-400">{user ? t('readyRewards') : t('participatingCourts')}</div>
            </div>
          </div>
        </div>

        {/* Court Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {courtNames.map(name => (
            <button
              key={name}
              onClick={() => setSelectedCourt(name)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCourt === name
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-[#14224d] border border-white/5 text-gray-300 hover:border-cyan-500/30'
              }`}
            >
              {name === 'all' ? (
                <>
                  <Star size={14} />
                  <span>{t('allCourts')}</span>
                </>
              ) : (
                <>
                  <MapPin size={14} />
                  <span>{name}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Login prompt */}
        {!user && !loading && (
          <div className="bg-[#14224d] border border-yellow-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
              <BadgeCheck size={20} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{t('loginForProgress')}</p>
              <p className="text-gray-500 text-xs mt-0.5">{t('progressAfterLogin')}</p>
            </div>
            <button
              onClick={() => client.auth.toLogin()}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-400 transition-colors shrink-0"
            >
              {t('login')}
            </button>
          </div>
        )}

        {/* Rewards Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
          </div>
        ) : Object.keys(groupedRewards).length === 0 ? (
          <div className="bg-[#14224d] border border-white/5 rounded-2xl p-10 text-center">
            <Gift size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">{t('noRewards')}</h3>
            <p className="text-gray-400">{t('noRewardsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedRewards).map(([courtName, courtRewards]) => (
              <div key={courtName}>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">{courtName}</h3>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {courtRewards.length} {courtRewards.length === 1 ? t('offer') : t('offers')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courtRewards.map(reward => {
                    const requiredCount = extractRequiredCount(reward.condition_text);
                    const currentCount = user ? getBookingCountForCourt(reward.court_id) : 0;

                    return (
                      <div
                        key={reward.id}
                        className="group bg-[#14224d] border border-white/5 rounded-2xl p-5 hover:border-cyan-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/5"
                      >
                        <div className="flex items-start gap-4">
                          <RewardIconBadge icon={reward.icon} discount={reward.discount_percent} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-white font-bold text-sm">{reward.title}</h4>
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                                <Percent size={12} className="text-green-400" />
                                <span className="text-green-400 font-bold text-sm">{reward.discount_percent}%</span>
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{reward.description}</p>
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-cyan-300 text-xs font-medium">
                                <BadgeCheck size={12} className="text-cyan-400" />
                                {reward.condition_text}
                              </span>
                            </div>

                            {user && (
                              <ProgressBar
                                current={currentCount}
                                required={requiredCount}
                                rewardTitle={reward.title}
                                t={t}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}