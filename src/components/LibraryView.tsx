import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { Cert } from '../types';
import { BANKS } from '../data';
import { cn } from '../lib/utils';
import { ChevronRight, ChevronDown, CheckCircle2, Target, BookOpen, Search, Menu, Plus } from 'lucide-react';
import { Icon } from './Icon';

const CATS = [
  { key: "labor", name: "労働安全衛生", icon: "ShieldCheck" },
  { key: "danger", name: "危険物取扱者", icon: "Fuel" },
  { key: "denki", name: "電気工事士", icon: "Lightbulb" },
  { key: "eiken", name: "英検", icon: "BookType" },
  { key: "kanken", name: "漢検", icon: "PencilLine" },
  { key: "other", name: "その他・追加", icon: "GraduationCap" },
];

function getCatKey(c: Cert) {
  if (c.bank === "eisei1" || c.bank === "eisei2") return "labor";
  if (c.bank && (c.bank.startsWith("otsu") || c.bank === "kou" || c.bank === "hei")) return "danger";
  if (c.bank === "denki2") return "denki";
  if (c.id && c.id.startsWith("eiken")) return "eiken";
  if (c.id && c.id.startsWith("kanken")) return "kanken";
  return "other";
}

const STATUS_LABEL = { target: "目標", learning: "学習中", done: "取得済み" };
const STATUS_COLORS = {
  target: "bg-slate-100 text-slate-500 border border-slate-200",
  learning: "bg-blue-50 text-blue-600 border border-blue-200",
  done: "bg-emerald-50 text-emerald-600 border border-emerald-200",
};

export function LibraryView({ onOpenCert }: { onOpenCert: (id: string) => void }) {
  const { data, updateData } = useStore();
  const certs = data.certs;

  const totalDone = certs.filter(c => c.status === "done").length;
  const totalLearning = certs.filter(c => c.status === "learning").length;

  const toggleCat = (key: string) => {
    updateData(prev => ({
      ...prev,
      ui: { ...prev.ui, openCats: { ...prev.ui.openCats, [key]: !prev.ui.openCats[key] } }
    }));
  };

  const addCert = () => {
    const name = window.prompt("追加する資格の名前を入力してください");
    if (!name) return;
    const id = "c" + Date.now();
    updateData(prev => ({
      ...prev,
      certs: [...prev.certs, { id, kind: "generic", name: name.trim(), icon: "🎓", status: "target", manualProg: 0, notices: [], resources: [] }],
      ui: { ...prev.ui, openCats: { ...prev.ui.openCats, other: true } }
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-24 pt-6 px-4 space-y-6"
    >
      <header className="flex items-center justify-between">
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl font-bold tracking-tight text-text-main flex items-center gap-2"
        >
          <Icon name="LibraryBig" className="text-primary" size={28} />
          <span>資格ライブラリ</span>
        </motion.h1>
      </header>

      {/* Summary */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        <StatBox label="登録資格" val={certs.length} color="text-primary-dark" />
        <StatBox label="学習中" val={totalLearning} color="text-blue-500" />
        <StatBox label="取得済み" val={totalDone} color="text-success" />
      </motion.div>

      {/* Recommended Books Affiliate */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <a href="https://www.amazon.co.jp/" target="_blank" rel="noopener noreferrer" className="block bg-secondary rounded-2xl p-4 border border-border shadow-sm hover:border-primary transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-primary">
              <Icon name="BookOpen" size={24} />
            </div>
            <div className="flex-1">
              <div className="text-xs text-primary font-bold mb-0.5">おすすめテキスト・問題集</div>
              <div className="text-sm font-bold text-text-main line-clamp-1">合格率UP！おすすめ参考書はこちら</div>
              <div className="text-xs text-text-muted mt-0.5">試験対策に最適な書籍をご紹介</div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-primary" />
          </div>
        </a>
      </motion.div>

      <div className="flex justify-end gap-3 text-sm text-text-muted">
        <button className="hover:text-primary transition-colors" onClick={() => updateData(p => ({ ...p, ui: { ...p.ui, openCats: CATS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {}) } }))}>
          すべて開く
        </button>
        <button className="hover:text-primary transition-colors" onClick={() => updateData(p => ({ ...p, ui: { ...p.ui, openCats: {} } }))}>
          すべて閉じる
        </button>
      </div>

      <div className="space-y-4">
        {CATS.map(cat => {
          const items = certs.filter(c => getCatKey(c) === cat.key);
          if (items.length === 0) return null;
          const open = !!data.ui.openCats[cat.key];
          const done = items.filter(c => c.status === "done").length;
          const learning = items.filter(c => c.status === "learning").length;

          return (
            <div key={cat.key} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleCat(cat.key)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <Icon name={cat.icon} size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-text-main truncate">{cat.name}</h2>
                  <div className="text-xs text-text-muted mt-0.5">
                    {items.length} 資格 ・ 学習中 {learning} ・ 取得 {done}
                  </div>
                </div>
                <div className="text-slate-400 shrink-0">
                  {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 space-y-2 border-t border-slate-100">
                      {items.map(c => (
                        <CertCard key={c.id} cert={c} onClick={() => onOpenCert(c.id)} bankData={c.bank ? data.bankData[c.bank] : null} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addCert} 
        className="w-full py-4 border-2 border-dashed border-primary/30 text-primary bg-primary/5 rounded-2xl font-bold hover:border-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <Plus size={20} /> 資格を追加する
      </motion.button>

    </motion.div>
  );
}

function StatBox({ label, val, color }: { label: string, val: number, color: string }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-border text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
      <div className={cn("text-3xl font-black tracking-tight", color)}>{val}</div>
      <div className="text-xs text-text-muted mt-1 font-bold">{label}</div>
    </div>
  );
}

function getCountdown(dateString: string | undefined) {
  if (!dateString) return null;
  const exam = new Date(dateString);
  exam.setHours(0,0,0,0);
  const today = new Date();
  today.setHours(0,0,0,0);
  const days = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days < 0) return { text: "試験終了！お疲れ様でした", style: "text-text-muted bg-slate-100 border-slate-200" };
  if (days === 0) return { text: "いよいよ本日が試験日です！", style: "text-danger bg-danger/10 border-danger/20 animate-pulse" };
  
  let text = "";
  if (days <= 7) {
    text = `残り${days}日。追い込みです。`;
    return { text, style: "text-danger bg-danger/10 border-danger/20 font-black animate-pulse shadow-sm" };
  } else if (days <= 30) {
    text = `試験まであと${days}日。集中していきましょう。`;
    return { text, style: "text-accent bg-accent/10 border-accent/20 font-bold shadow-sm" };
  } else {
    text = `試験まであと${days}日。`;
    return { text, style: "text-primary bg-primary/10 border-primary/20 font-bold" };
  }
}

function CertCard({ cert, onClick, bankData }: { cert: Cert, onClick: () => void, bankData: any }) {
  let progPct = 0;
  let accText = '未挑戦';
  let barColor = 'bg-slate-300';
  let barFillColor = 'bg-slate-400';

  if (cert.kind === 'quiz' && cert.bank && BANKS[cert.bank] && bankData) {
    const qs = BANKS[cert.bank].questions;
    const done = qs.filter(q => bankData.stats[q.id]?.a > 0).length;
    progPct = Math.round((done / qs.length) * 100) || 0;
    
    let a=0, c=0;
    qs.forEach(q => { const s=bankData.stats[q.id]; if(s){ a+=s.a; c+=s.c; } });
    const acc = a ? Math.round((c/a)*100) : null;
    accText = acc !== null ? `正答率 ${acc}%` : '未挑戦';

    if (acc === null) {
      barFillColor = 'bg-primary';
    } else if (acc < 40) {
      barFillColor = 'bg-danger';
    } else if (acc < 70) {
      barFillColor = 'bg-accent';
    } else {
      barFillColor = 'bg-success';
    }
  } else {
    progPct = cert.manualProg || 0;
    if (progPct < 40) barFillColor = 'bg-danger';
    else if (progPct < 70) barFillColor = 'bg-accent';
    else barFillColor = 'bg-success';
    accText = '手動進捗';
  }

  const countdown = getCountdown(cert.examDate);

  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 bg-white border border-border rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-primary text-left transition-all relative overflow-hidden",
        cert.status === 'done' ? "opacity-75" : ""
      )}
    >
      {cert.status === 'done' && (
        <div className="absolute top-0 right-0 p-1.5 bg-success text-white rounded-bl-xl shadow-sm">
          <CheckCircle2 size={16} />
        </div>
      )}
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-sm">
        <Icon name={cert.icon || "GraduationCap"} size={26} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-extrabold text-[15px] truncate">{cert.name}</span>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm", STATUS_COLORS[cert.status])}>
            {STATUS_LABEL[cert.status]}
          </span>
        </div>
        {countdown && (
          <div className={cn("text-[11px] px-2 py-1 rounded-md border mt-1 mb-1 inline-block", countdown.style)}>
            {countdown.text}
          </div>
        )}
        <div className="text-xs text-text-muted mt-1.5 flex justify-between items-center font-medium">
          <span>学習 {progPct}% ・ {accText}</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden shadow-inner">
          <motion.div 
            className={cn("h-full rounded-full", barFillColor)} 
            initial={{ width: 0 }}
            animate={{ width: `${progPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.button>
  );
}
