import { useState } from 'react';
import { QuizSession } from '../App';
import { useStore } from '../store';
import { BANKS } from '../data';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

export function QuizView({ session, onUpdateSession, onQuit, onFinish }: {
  session: QuizSession;
  onUpdateSession: (sess: QuizSession) => void;
  onQuit: () => void;
  onFinish: (sess: QuizSession) => void;
}) {
  const { data, updateData } = useStore();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const bank = BANKS[session.bank];
  const qId = session.queue[session.idx];
  const q = bank.questions.find(x => x.id === qId);
  const bankData = data.bankData[session.bank];
  const isSaved = bankData?.saved.includes(qId);

  if (!q) return null;

  const toggleSave = () => {
    updateData(prev => {
      const d = prev.bankData[session.bank] || { stats: {}, saved: [], wrong: [], history: [] };
      const newSaved = d.saved.includes(qId) 
        ? d.saved.filter(id => id !== qId)
        : [...d.saved, qId];
      return { ...prev, bankData: { ...prev.bankData, [session.bank]: { ...d, saved: newSaved } } };
    });
  };

  const handleNext = () => {
    if (!session.answered) {
      if (selectedIdx === null) return;
      const ok = selectedIdx === q.answer;
      
      // Update stats
      updateData(prev => {
        const d = prev.bankData[session.bank] || { stats: {}, saved: [], wrong: [], history: [] };
        const st = d.stats[qId] || { a: 0, c: 0, last: null };
        const newStats = { ...d.stats, [qId]: { a: st.a + 1, c: st.c + (ok ? 1 : 0), last: ok } };
        
        const newWrong = ok 
          ? d.wrong.filter(id => id !== qId)
          : (d.wrong.includes(qId) ? d.wrong : [...d.wrong, qId]);

        return { ...prev, bankData: { ...prev.bankData, [session.bank]: { ...d, stats: newStats, wrong: newWrong } } };
      });

      onUpdateSession({
        ...session,
        answered: true,
        answers: [...session.answers, { id: qId, sel: selectedIdx, ok }]
      });
    } else {
      setSelectedIdx(null);
      if (session.idx >= session.queue.length - 1) {
        onFinish(session);
      } else {
        onUpdateSession({ ...session, idx: session.idx + 1, answered: false });
      }
    }
  };

  const progressPct = ((session.idx + (session.answered ? 1 : 0)) / session.queue.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <header className="bg-white px-4 py-4 border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onQuit} className="p-2 -ml-2 text-slate-400 hover:text-danger transition-colors rounded-full hover:bg-danger/10">
            <X size={24} />
          </button>
          <div className="text-sm font-extrabold text-text-muted bg-secondary px-3 py-1 rounded-full">{session.mode}</div>
          <div className="text-sm font-black text-primary font-mono bg-primary/10 px-3 py-1 rounded-full">{session.idx + 1} / {session.queue.length}</div>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full" 
            initial={{ width: `${(session.idx / session.queue.length) * 100}%` }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          />
        </div>
      </header>

      <main className="flex-1 p-5 pb-32 max-w-2xl mx-auto w-full">
        <motion.div 
          key={qId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="flex gap-2 mb-5">
            <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shadow-sm">
              {bank.subjects.find(s => s.key === q.subject)?.short || q.subject}
            </span>
            <span className="text-xs font-bold px-3 py-1.5 bg-secondary text-primary-dark rounded-full border border-primary/20 shadow-sm">
              {q.topic}
            </span>
          </div>

          <h2 className="text-xl font-extrabold leading-relaxed mb-8 text-text-main">{q.q}</h2>

          <div className="space-y-4">
            {q.choices.map((choice, i) => {
            const isSelected = selectedIdx === i;
            const isCorrect = q.answer === i;
            
            let stateClass = "bg-card border-border hover:border-primary text-text-main";
            let marker = String.fromCharCode(65 + i); // A, B, C...

            if (session.answered) {
              if (isCorrect) {
                stateClass = "bg-[#e1f6ef] border-success text-success font-bold";
                marker = "✓";
              } else if (isSelected) {
                stateClass = "bg-[#fdeaee] border-danger text-danger";
                marker = "✕";
              } else {
                stateClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
              }
            } else if (isSelected) {
              stateClass = "bg-blue-50 border-primary text-primary font-bold shadow-sm";
            }

            return (
              <motion.button
                whileHover={!session.answered ? { scale: 1.02 } : {}}
                whileTap={!session.answered ? { scale: 0.98 } : {}}
                key={i}
                disabled={session.answered}
                onClick={() => setSelectedIdx(i)}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border-2 transition-all flex gap-4 items-center shadow-sm",
                  stateClass,
                  !session.answered && !isSelected && "hover:bg-slate-50 hover:shadow-md"
                )}
              >
                <span className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black",
                  session.answered && isCorrect ? "bg-success border-success text-white shadow-md shadow-success/30" :
                  session.answered && isSelected ? "bg-danger border-danger text-white shadow-md shadow-danger/30" :
                  isSelected ? "bg-primary border-primary text-white shadow-md shadow-primary/30" : "bg-background border-slate-200 text-slate-400"
                )}>
                  {marker}
                </span>
                <span className="flex-1 font-medium leading-relaxed text-[15px]">{choice}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {session.answered && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className={cn(
                "mt-8 p-6 rounded-3xl border-2 shadow-lg",
                selectedIdx === q.answer ? "bg-[#F0FDF4] border-success/30" : "bg-[#FFF1F2] border-danger/30"
              )}
            >
              <div className={cn("text-xl font-black flex items-center gap-2 mb-4", selectedIdx === q.answer ? "text-success" : "text-danger")}>
                {selectedIdx === q.answer ? <><CheckCircle2 size={28} /> 正解！やったね！</> : <><XCircle size={28} /> おしい！不正解</>}
              </div>
              <p className="text-[15px] font-medium leading-relaxed text-text-main mb-5">{q.exp}</p>
              <div className="bg-white border-2 border-accent/20 p-4 rounded-2xl text-sm text-[#B45309] font-bold leading-relaxed shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Star size={18} className="text-accent" fill="currentColor" />
                </div>
                <div>
                  <div className="text-xs font-black mb-1 opacity-70">POINT</div>
                  {q.point}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex gap-4 max-w-2xl mx-auto rounded-t-3xl">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSave}
          className={cn(
            "w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-colors shrink-0 shadow-sm",
            isSaved ? "bg-accent/10 border-accent text-accent" : "bg-background border-border text-slate-400 hover:border-slate-300 hover:bg-slate-50"
          )}
        >
          <Star fill={isSaved ? "currentColor" : "none"} size={28} />
        </motion.button>
        <motion.button
          whileHover={(!session.answered && selectedIdx === null) ? {} : { scale: 1.02 }}
          whileTap={(!session.answered && selectedIdx === null) ? {} : { scale: 0.98 }}
          onClick={handleNext}
          disabled={!session.answered && selectedIdx === null}
          className={cn(
            "flex-1 h-16 rounded-2xl font-black text-xl flex items-center justify-center gap-2 transition-all",
            !session.answered && selectedIdx === null 
              ? "bg-slate-100 text-slate-400" 
              : "bg-gradient-to-r from-primary to-primary-dark text-white shadow-[0_8px_20px_rgba(255,139,167,0.3)] hover:shadow-[0_12px_25px_rgba(255,139,167,0.4)]"
          )}
        >
          {!session.answered ? "解答する" : session.idx >= session.queue.length - 1 ? "結果を見る" : "次の問題へ"}
          {session.answered && <ChevronRight size={24} />}
        </motion.button>
      </div>
    </motion.div>
  );
}
