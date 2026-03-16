import { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Mail, Send, MessageSquare, Phone, Clock } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { t, dir } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t('fillAllFields'));
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success(t('messageSent'));
      setName('');
      setEmail('');
      setMessage('');
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f3c] to-[#1a1f4e] pb-20" dir={dir}>
      <Header />

      <div className="pt-18 max-w-lg mx-auto px-4" style={{ paddingTop: '4.5rem' }}>
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center">
            <MessageSquare size={24} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('contactTitle')}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{t('hereToHelp')}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="bg-[#14224d] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Mail size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">{t('email')}</div>
              <div className="text-white text-sm font-medium">support@hyper-padel.com</div>
            </div>
          </div>
          <div className="bg-[#14224d] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Phone size={18} className="text-green-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">{t('phone')}</div>
              <div className="text-white text-sm font-medium" dir="ltr">+966 50 000 0000</div>
            </div>
          </div>
          <div className="bg-[#14224d] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Clock size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-gray-400">{t('workingHours')}</div>
              <div className="text-white text-sm font-medium">{t('workingHoursValue')}</div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#14224d] border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Send size={16} className="text-cyan-400" />
            {t('sendMessage')}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('name')}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                dir="ltr"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-all ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('message')}</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  <span>{t('send')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}