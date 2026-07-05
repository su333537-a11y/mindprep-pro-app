import { QuizSession } from '../App';
import { useStore } from '../store';
import { BANKS } from '../data';
import { cn } from '../lib/utils';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export function StatsView({ certId, onBack, onStartQuiz }: { 
  certId: string, 
  onBack: () => void,
  onStartQuiz: (session: QuizSession) => void
}) {
  const { data, getBankData, updateData } = useStore();
  const cert = data.certs.find(c => c.id === certId);
  
  if (!cert || cert.kind !== 'quiz' || !cert.bank || !BANKS[cert.bank]) return null;

  const bankMeta = BANKS[cert.bank];
  const bankData = getBankData(cert.bank);

  const qs = bankMeta.questions;
  const answeredCount = qs.filter(q => bankData.stats[q.id]?.a > 0).length;
  
  let a = 0, c = 0;
  Object.values(bankData.stats).forEach(s => { a += s.a; c += s.c; });
  const overallRate = a ? Math.round((c / a) * 100) : null;
  const coverRate = Math.round((answeredCount / qs.length) * 100) || 0;

  const resetStats = () => {
    if (confirm(`${cert.name} の解答履歴・統計・保存問題をすべてリセットします。よろしいですか？`)) {
      updateData(prev => ({
        ...prev,
        bankData: {
          ...prev.bankData,
          [cert.bank!]: { stats: {}, saved: [], wrong: [], history: [] }
        }
      }));
      onBack();
    }
  };

  const startSubject = (key: string, short: string) => {
    let ids = qs.filter(q => q.subject === key).map(q => q.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    onStartQuiz({ queue: ids, idx: 0, answers: [], mode: short, answered: false, bank: cert.bank! });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="pb-24 pt-6 px-4 max-w-2xl mx-auto space-y-6 w-full"
    >
      <header className="flex items-center gap-3 mb-2">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-2xl font-black flex-1 truncate text-text-main">成績・分析</h1>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatBox label="学習した問題" val={answeredCount} color="text-primary-dark" delay={0.1} />
        <StatBox label="全体正答率" val={overallRate !== null ? `${overallRate}%` : "–"} color="text-accent" delay={0.2} />
        <StatBox label="カバー率" val={`${coverRate}%`} color="text-success" delay={0.3} />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-bold text-text-muted px-1">科目別の正答率（弱点ほど赤色）</h2>
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          {bankMeta.subjects.map(s => {
            const ids = qs.filter(q => q.subject === s.key).map(q => q.id);
            const done = ids.filter(id => bankData.stats[id]?.a > 0).length;
            let sa = 0, sc = 0;
            ids.forEach(id => { const st = bankData.stats[id]; if (st) { sa += st.a; sc += st.c; } });
            const r = sa ? Math.round((sc / sa) * 100) : null;

            return (
              <motion.button 
                whileHover={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
                key={s.key} 
                onClick={() => startSubject(s.key, s.short)}
                className="w-full flex items-center gap-4 p-5 border-b border-slate-100 last:border-0 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-black truncate text-text-main">{s.name}</div>
                  <div className="text-xs font-bold text-text-muted mt-1.5">学習 {done}/{ids.length}問</div>
                  <div className="h-2 w-full bg-secondary rounded-full mt-2.5 overflow-hidden shadow-inner">
                    {r !== null && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${r}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className={cn("h-full rounded-full", r >= 70 ? "bg-success" : r >= 40 ? "bg-accent" : "bg-danger")} 
                      />
                    )}
                  </div>
                </div>
                <div className="w-16 text-right shrink-0 flex flex-col items-end">
                  <div className="font-black text-lg text-text-main">{r !== null ? `${r}%` : '未挑戦'}</div>
                  <div className="text-primary mt-2 bg-primary/10 p-1.5 rounded-full"><Play fill="currentColor" size={16} /></div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-bold text-text-muted px-1">最近のセッション</h2>
        {bankData.history.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-8 text-center text-text-muted text-sm font-bold shadow-sm">
            まだ記録がありません。
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
            {bankData.history.map((rec, i) => {
              const dt = new Date(rec.date);
              const ds = `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
              const pct = Math.round((rec.score / rec.total) * 100) || 0;
              return (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-extrabold text-[15px] text-text-main">{rec.mode}</div>
                    <div className="text-xs font-bold text-text-muted mt-1">{ds}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lg">{rec.score}/{rec.total}</div>
                    <div className="text-xs font-bold text-text-muted">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <div className="pt-8">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetStats} 
          className="w-full py-4 text-danger text-sm font-bold flex items-center justify-center gap-2 hover:bg-danger/10 rounded-2xl transition-colors"
        >
          <RotateCcw size={18} /> この資格の学習記録をリセット
        </motion.button>
      </div>
    </motion.div>
  );
}

function StatBox({ label, val, color, delay = 0 }: { label: string, val: string | number, color: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", delay }}
      className="bg-white rounded-2xl p-4 border border-border text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
    >
      <div className={cn("text-3xl font-black tracking-tight", color)}>{val}</div>
      <div className="text-[11px] text-text-muted mt-1.5 font-bold leading-tight">{label}</div>
    </motion.div>
  );
}
