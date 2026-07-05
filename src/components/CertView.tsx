import { useStore } from '../store';
import { BANKS } from '../data';
import { Cert, QuizSession } from '../types';
import { cn } from '../lib/utils';
import { ArrowLeft, Play, BarChart2, Bell, ExternalLink, Settings, Trash2, ShieldAlert, Zap, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';

export function CertView({ certId, onBack, onStartQuiz, onOpenStats }: { 
  certId: string, 
  onBack: () => void, 
  onStartQuiz: (session: QuizSession) => void,
  onOpenStats: () => void
}) {
  const { data, updateData, getBankData } = useStore();
  const cert = data.certs.find(c => c.id === certId);
  
  if (!cert) return null;

  const isQuiz = cert.kind === 'quiz' && cert.bank && BANKS[cert.bank];
  const bankMeta = isQuiz ? BANKS[cert.bank!] : null;
  const bankData = isQuiz ? getBankData(cert.bank!) : null;

  const setStatus = (status: Cert['status']) => {
    updateData(prev => ({
      ...prev,
      certs: prev.certs.map(c => c.id === certId ? { ...c, status } : c)
    }));
  };

  const deleteCert = () => {
    if (confirm("この資格をライブラリから削除しますか？")) {
      updateData(prev => ({ ...prev, certs: prev.certs.filter(c => c.id !== certId) }));
      onBack();
    }
  };

  const startMock = () => {
    if (!bankMeta || !bankData) return;
    let ids: (string|number)[] = [];
    bankMeta.subjects.forEach(s => {
      const qIds = bankMeta.questions.filter(q => q.subject === s.key).map(q => q.id);
      // shuffle
      for (let i = qIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qIds[i], qIds[j]] = [qIds[j], qIds[i]];
      }
      ids = ids.concat(qIds.slice(0, s.mock));
    });
    // overall shuffle
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    onStartQuiz({ queue: ids, idx: 0, answers: [], mode: bankMeta.mockLabel, answered: false, bank: cert.bank! });
  };

  const startRandom = (n: number) => {
    if (!bankMeta) return;
    const ids = bankMeta.questions.map(q => q.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    onStartQuiz({ queue: ids.slice(0, n), idx: 0, answers: [], mode: `ランダム${n}問`, answered: false, bank: cert.bank! });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pb-24 pt-6 px-4 space-y-6"
    >
      <header className="flex items-center gap-3">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-extrabold flex-1 truncate text-text-main">{cert.name}</h1>
      </header>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-3xl border border-border p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-inner">
            <Icon name={cert.icon || "GraduationCap"} size={36} />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-main">{cert.name}</h2>
            <p className="text-sm text-text-muted mt-1 font-medium">{cert.note || "カスタム資格"}</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="text-sm font-bold text-text-muted mb-3 flex items-center gap-2">
            <Icon name="Target" size={16} /> ステータス
          </div>
          <div className="flex gap-2">
            {(['target', 'learning', 'done'] as const).map(st => (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={st}
                onClick={() => setStatus(st)}
                className={cn(
                  "flex-1 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm",
                  cert.status === st 
                    ? "bg-primary text-white shadow-primary/30" 
                    : "bg-background text-text-muted border border-border hover:bg-slate-50"
                )}
              >
                {st === 'target' ? '目標' : st === 'learning' ? '学習中' : '取得済み'}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-bold text-text-muted mb-3 flex items-center gap-2">
            <Icon name="Calendar" size={16} /> 試験日
          </div>
          <input 
            type="date"
            value={cert.examDate || ''}
            onChange={(e) => updateData(prev => ({
              ...prev,
              certs: prev.certs.map(c => c.id === certId ? { ...c, examDate: e.target.value } : c)
            }))}
            className="w-full bg-background border border-border rounded-2xl p-4 text-text-main font-bold outline-none focus:border-primary transition-colors shadow-inner"
          />
        </div>
      </motion.div>

      {isQuiz && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-bold text-text-muted px-1 flex items-center gap-2">
            <Play size={16} /> 演習をはじめる
          </h2>
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={startMock}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white p-5 rounded-2xl shadow-[0_8px_20px_rgba(255,139,167,0.3)] hover:shadow-[0_12px_25px_rgba(255,139,167,0.4)] transition-all font-black text-lg flex items-center justify-center gap-3"
          >
            <Play fill="currentColor" size={22} /> {bankMeta.mockLabel}
          </motion.button>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startRandom(10)} 
              className="bg-white border border-border p-4 rounded-2xl shadow-sm hover:border-accent hover:text-accent transition-colors text-center font-bold flex flex-col items-center gap-2"
            >
              <Zap size={24} className="text-accent" />
              <span>クイック10問</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startRandom(20)} 
              className="bg-white border border-border p-4 rounded-2xl shadow-sm hover:border-blue-400 hover:text-blue-500 transition-colors text-center font-bold flex flex-col items-center gap-2"
            >
              <Shuffle size={24} className="text-blue-400" />
              <span>ランダム20問</span>
            </motion.button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenStats}
            className="w-full bg-secondary border border-border p-4 rounded-2xl hover:border-primary transition-colors font-bold flex items-center justify-center gap-2 text-primary-dark shadow-sm mt-2"
          >
            <BarChart2 size={20} /> 詳しい成績を見る
          </motion.button>
        </motion.div>
      )}

      {cert.notices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-text-muted px-1 flex items-center gap-2">
            <Bell size={16} /> お知らせ・法改正
          </h2>
          <div className="bg-[#fff8eb] border border-[#ffdb99] rounded-xl p-4 space-y-3">
            {cert.notices.map((n, i) => (
              <div key={i} className="border-l-4 border-accent pl-3">
                <div className="text-xs text-accent font-medium">{n.date}</div>
                <div className="font-bold text-sm text-[#8a5d00] mt-0.5">{n.title}</div>
                <div className="text-sm text-text-main mt-1">{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cert.resources.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-text-muted px-1 flex items-center gap-2">
            <ExternalLink size={16} /> 公式リンク・資料
          </h2>
          <div className="space-y-2">
            {cert.resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block bg-card border border-border p-3 rounded-xl hover:border-primary transition-colors text-sm font-medium flex items-center gap-2">
                <ExternalLink size={16} className="text-slate-400" /> {r.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {!isQuiz && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-8"
        >
          <button onClick={deleteCert} className="w-full py-4 text-danger text-sm font-bold flex items-center justify-center gap-2 hover:bg-danger/10 rounded-2xl transition-colors">
            <Trash2 size={18} /> この資格を削除する
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
