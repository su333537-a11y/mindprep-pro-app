import { QuizSession } from '../App';
import { BANKS } from '../data';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export function ResultView({ session, onBack, onRetryWrong }: {
  session: QuizSession;
  onBack: () => void;
  onRetryWrong: (sess: QuizSession) => void;
}) {
  const bankMeta = BANKS[session.bank];
  const total = session.answers.length;
  const correct = session.answers.filter(a => a.ok).length;
  const pct = Math.round((correct / total) * 100) || 0;

  const bySubj: Record<string, { a: number, c: number }> = {};
  session.answers.forEach(a => {
    const q = bankMeta.questions.find(x => x.id === a.id);
    if (!q) return;
    const k = q.subject;
    if (!bySubj[k]) bySubj[k] = { a: 0, c: 0 };
    bySubj[k].a++;
    if (a.ok) bySubj[k].c++;
  });

  let subjOk = true;
  if (bankMeta.pass.perSubj > 0) {
    Object.values(bySubj).forEach(v => {
      if (v.c / v.a < bankMeta.pass.perSubj) subjOk = false;
    });
  }
  let overallOk = bankMeta.pass.overall > 0 ? (pct >= bankMeta.pass.overall * 100) : true;
  const isPass = overallOk && subjOk;

  let msg = "もう少し！";
  if (isPass) msg = "🎉 合格ライン到達！";
  else if (bankMeta.pass.overall > 0 && !overallOk) msg = `全体${Math.round(bankMeta.pass.overall * 100)}%以上が目安です`;
  else if (bankMeta.pass.perSubj > 0 && !subjOk) msg = `各科目${Math.round(bankMeta.pass.perSubj * 100)}%以上が目安です`;

  const wrongIds = session.answers.filter(a => !a.ok).map(a => a.id);

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto space-y-6 w-full">
      <header className="flex items-center gap-3 mb-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-2xl font-black flex-1 text-text-main">結果発表</h1>
      </header>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-3xl border border-border p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="text-[64px] font-black leading-none text-text-main drop-shadow-sm">
          {correct} <span className="text-3xl text-text-muted">/ {total}</span>
        </div>
        <div className="text-2xl font-black mt-3 text-primary">{pct}%</div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className={cn("mt-6 font-black text-xl py-3 px-6 rounded-2xl inline-block", isPass ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}
        >
          {msg}
        </motion.div>
        
        <div className="h-4 w-full bg-secondary rounded-full mt-8 overflow-hidden shadow-inner">
          <motion.div 
            className={cn("h-full rounded-full", isPass ? "bg-success" : pct >= 40 ? "bg-accent" : "bg-danger")}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-muted px-1">分野別の結果</h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm"
        >
          {bankMeta.subjects.map(s => {
            const v = bySubj[s.key];
            if (!v) return null;
            const r = Math.round((v.c / v.a) * 100);
            return (
              <div key={s.key} className="flex items-center gap-5 p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-black truncate">{s.short}</div>
                  <div className="h-2 w-full bg-secondary rounded-full mt-2.5 overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${r}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className={cn("h-full rounded-full", r >= 70 ? "bg-success" : r >= 40 ? "bg-accent" : "bg-danger")} 
                    />
                  </div>
                </div>
                <div className="w-16 text-right shrink-0">
                  <div className="font-black text-lg">{v.c}/{v.a}</div>
                  <div className="text-xs font-bold text-text-muted">{r}%</div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-8 space-y-3"
      >
        {wrongIds.length > 0 && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRetryWrong({ queue: wrongIds, idx: 0, answers: [], mode: "間違い直し", answered: false, bank: session.bank })}
            className="w-full bg-secondary border border-border p-5 rounded-2xl hover:border-primary text-primary-dark font-black text-lg flex items-center justify-center gap-3 transition-all shadow-sm"
          >
            <RotateCcw size={22} /> 今回の間違いだけ解き直す
          </motion.button>
        )}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="w-full bg-white border border-border p-5 rounded-2xl hover:bg-slate-50 text-text-main font-bold text-lg transition-all shadow-sm"
        >
          資格ページに戻る
        </motion.button>
      </motion.div>
    </div>
  );
}
