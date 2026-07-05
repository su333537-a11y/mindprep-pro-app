import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve(process.cwd(), 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error("No script tag found");
  process.exit(1);
}

const scriptContent = scriptMatch[1];

let dataTs = `import { BankMeta, Cert } from './types';\n\n`;

const extractVar = (varName) => {
  const regex = new RegExp(`const ${varName} = ([\\s\\S]*?);\\n\\n`);
  const match = scriptContent.match(regex);
  if (match) {
    dataTs += `export const ${varName} = ${match[1]};\n\n`;
  }
};

const vars = [
  'QUESTIONS',
  'BANK_OTSU4',
  'BANK_KOU',
  'BANK_DENKI2',
  'SEI_OTSU1',
  'SEI_OTSU2',
  'SEI_OTSU3',
  'SEI_OTSU5',
  'SEI_OTSU6',
  'BANK_HEI',
  'BANK_EIKEN3',
  'BANK_EIKEN_P2',
  'BANK_EIKEN2',
  'BANK_KANKEN5',
  'BANK_KANKEN4',
  'BANK_KANKEN3',
];

vars.forEach(extractVar);

dataTs += `
const _OTSU_HOREI = BANK_OTSU4.filter(q=>q.subject==="法令");
const _OTSU_BUTSU = BANK_OTSU4.filter(q=>q.subject==="物化");
function otsuBank(name: string, sei: any[]) { return { name, pass:{overall:0,perSubj:0.6}, mockLabel:"本番模試（35問）",
  subjects:[
    {key:"法令", name:"危険物に関する法令", short:"法令", mock:15},
    {key:"物化", name:"物理学・化学", short:"物理化学", mock:10},
    {key:"性質", name:"性質・火災予防・消火", short:"性質・消火", mock:10},
  ], questions: [..._OTSU_HOREI, ..._OTSU_BUTSU, ...sei] }; }
const _eikenSubj=[
  {key:"語彙", name:"語彙", short:"語彙", mock:7},
  {key:"文法", name:"文法", short:"文法", mock:5},
  {key:"会話", name:"会話", short:"会話", mock:4},
  {key:"読解", name:"読解", short:"読解", mock:4},
];
const _kankenSubj=[
  {key:"読み", name:"読み", short:"読み", mock:7},
  {key:"書き", name:"書き取り", short:"書き", mock:6},
  {key:"部首", name:"部首", short:"部首", mock:3},
  {key:"対義語類義語", name:"対義語・類義語", short:"対類", mock:2},
  {key:"四字熟語", name:"四字熟語", short:"四字", mock:2},
];

export const BANKS: Record<string, BankMeta> = {
  eisei1: { name:"第一種衛生管理者", pass:{overall:0.6, perSubj:0.4}, mockLabel:"本番模試（44問）",
    subjects:[
      {key:"法令有害", name:"関係法令（有害業務）", short:"法令(有害)", mock:10},
      {key:"衛生有害", name:"労働衛生（有害業務）", short:"衛生(有害)", mock:10},
      {key:"法令一般", name:"関係法令（その他）", short:"法令(他)", mock:7},
      {key:"衛生一般", name:"労働衛生（その他）", short:"衛生(他)", mock:7},
      {key:"労働生理", name:"労働生理", short:"労働生理", mock:10},
    ], questions: QUESTIONS },
  eisei2: { name:"第二種衛生管理者", pass:{overall:0.6, perSubj:0.4}, mockLabel:"本番模試（30問）",
    subjects:[
      {key:"法令一般", name:"関係法令", short:"関係法令", mock:10},
      {key:"衛生一般", name:"労働衛生", short:"労働衛生", mock:10},
      {key:"労働生理", name:"労働生理", short:"労働生理", mock:10},
    ], questions: QUESTIONS.filter((q: any)=>["法令一般","衛生一般","労働生理"].includes(q.subject)) },
  otsu4: { name:"危険物取扱者 乙種第4類", pass:{overall:0, perSubj:0.6}, mockLabel:"本番模試（35問）",
    subjects:[
      {key:"法令", name:"危険物に関する法令", short:"法令", mock:15},
      {key:"物化", name:"物理学・化学", short:"物理化学", mock:10},
      {key:"性質", name:"性質・火災予防・消火", short:"性質・消火", mock:10},
    ], questions: BANK_OTSU4 },
  kou: { name:"危険物取扱者 甲種", pass:{overall:0, perSubj:0.6}, mockLabel:"本番模試（45問）",
    subjects:[
      {key:"法令", name:"危険物に関する法令", short:"法令", mock:15},
      {key:"物化", name:"物理学・化学", short:"物理化学", mock:10},
      {key:"性質", name:"性質・火災予防・消火（全類）", short:"性質・消火", mock:20},
    ], questions: BANK_KOU },
  denki2: { name:"第二種電気工事士（学科）", pass:{overall:0.6, perSubj:0}, mockLabel:"本番模試（50問）",
    subjects:[
      {key:"電気理論", name:"電気理論", short:"電気理論", mock:10},
      {key:"配線設計", name:"配線設計", short:"配線設計", mock:6},
      {key:"機器材料", name:"機器・材料・工具", short:"機器材料", mock:10},
      {key:"施工検査", name:"施工方法・検査", short:"施工検査", mock:10},
      {key:"法令", name:"法令", short:"法令", mock:6},
      {key:"配線図", name:"配線図", short:"配線図", mock:8},
    ], questions: BANK_DENKI2 },
  otsu1: otsuBank("危険物取扱者 乙種第1類", SEI_OTSU1),
  otsu2: otsuBank("危険物取扱者 乙種第2類", SEI_OTSU2),
  otsu3: otsuBank("危険物取扱者 乙種第3類", SEI_OTSU3),
  otsu5: otsuBank("危険物取扱者 乙種第5類", SEI_OTSU5),
  otsu6: otsuBank("危険物取扱者 乙種第6類", SEI_OTSU6),
  hei: { name:"危険物取扱者 丙種", pass:{overall:0, perSubj:0.6}, mockLabel:"本番模試（25問）",
    subjects:[
      {key:"法令", name:"法令", short:"法令", mock:10},
      {key:"燃焼消火", name:"燃焼及び消火", short:"燃焼消火", mock:5},
      {key:"性質", name:"性質・火災予防・消火", short:"性質", mock:10},
    ], questions: BANK_HEI },
  eiken3: { name:"英検3級", pass:{overall:0.6, perSubj:0}, mockLabel:"模試（20問）", subjects:_eikenSubj, questions: BANK_EIKEN3 },
  eikenP2:{ name:"英検準2級", pass:{overall:0.6, perSubj:0}, mockLabel:"模試（20問）", subjects:_eikenSubj, questions: BANK_EIKEN_P2 },
  eiken2: { name:"英検2級", pass:{overall:0.6, perSubj:0}, mockLabel:"模試（20問）", subjects:_eikenSubj, questions: BANK_EIKEN2 },
  kanken5:{ name:"漢検5級", pass:{overall:0.7, perSubj:0}, mockLabel:"模試（20問）", subjects:_kankenSubj, questions: BANK_KANKEN5 },
  kanken4:{ name:"漢検4級", pass:{overall:0.7, perSubj:0}, mockLabel:"模試（20問）", subjects:_kankenSubj, questions: BANK_KANKEN4 },
  kanken3:{ name:"漢検3級", pass:{overall:0.7, perSubj:0}, mockLabel:"模試（20問）", subjects:_kankenSubj, questions: BANK_KANKEN3 },
};

const EXAM_OR = "https://www.exam.or.jp/";
const SHOUBO = "https://www.shoubo-shiken.or.jp/";
const SHIKEN = "https://www.shiken.or.jp/";
const EIKEN_URL = "https://www.eiken.or.jp/eiken/";
const KANKEN_URL = "https://www.kanken.or.jp/kanken/";
function qcert(id: string, bank: string, name: string, icon: string, note: string, res: any): Cert { return {id,kind:"quiz",bank,name,icon,status:"target",note,notices:[],resources:res?[res]:[]}; }
function gcert(id: string, name: string, icon: string, note: string, res: any): Cert { return {id,kind:"generic",name,icon,status:"target",manualProg:0,note,notices:[],resources:res?[res]:[]}; }

export const defaultCerts = (): Cert[] => {
  const r_shoubo={label:"公式：消防試験研究センター", url:SHOUBO};
  const r_eiken={label:"公式：日本英語検定協会", url:EIKEN_URL};
  const r_kanken={label:"公式：日本漢字能力検定協会", url:KANKEN_URL};
  return [
    { id:"eisei1", kind:"quiz", bank:"eisei1", name:"第一種衛生管理者", icon:"🛡️", status:"learning", note:"国家資格・全業種対応",
      notices:[
        {date:"2025-04", title:"化学物質の自律的管理が本格化", body:"化学物質管理者・保護具着用管理責任者の選任義務化（2024.4〜）に続き、リスクアセスメント対象物質が大幅に拡大。出題でも頻出のテーマです。"},
        {date:"2025-04", title:"リスクアセスメント対象物質の追加", body:"対象物質が順次拡大（2025・2026と段階的に増加）。SDS・ばく露低減措置とあわせて押さえましょう。"}
      ],
      resources:[{label:"公式：安全衛生技術試験協会（試験案内）", url:EXAM_OR}] },
    { id:"eisei2", kind:"quiz", bank:"eisei2", name:"第二種衛生管理者", icon:"🩹", status:"target", note:"有害業務以外の業種向け（30問）",
      notices:[{date:"2025-04", title:"労働安全衛生関係の改正に注意", body:"ストレスチェックや一般健康診断など、第一種と共通の関係法令・労働衛生の改正が出題に影響します。"}],
      resources:[{label:"公式：安全衛生技術試験協会（試験案内）", url:EXAM_OR}] },
    qcert("otsu4","otsu4","危険物取扱者 乙種第4類","⛽","引火性液体（ガソリン等）・受験者最多", r_shoubo),
    qcert("otsu1","otsu1","危険物取扱者 乙種第1類","🧯","酸化性固体", r_shoubo),
    qcert("otsu2","otsu2","危険物取扱者 乙種第2類","🔥","可燃性固体", r_shoubo),
    qcert("otsu3","otsu3","危険物取扱者 乙種第3類","💧","自然発火性・禁水性", r_shoubo),
    qcert("otsu5","otsu5","危険物取扱者 乙種第5類","💥","自己反応性物質", r_shoubo),
    qcert("otsu6","otsu6","危険物取扱者 乙種第6類","🧴","酸化性液体", r_shoubo),
    qcert("kou","kou","危険物取扱者 甲種","🧪","全6類対応・上位資格", r_shoubo),
    qcert("hei","hei","危険物取扱者 丙種","🪔","第4類の一部・入門", r_shoubo),
    qcert("denki2","denki2","第二種電気工事士（学科）","💡","一般用電気工作物・学科(CBT)対策", {label:"公式：電気技術者試験センター", url:SHIKEN}),
    qcert("eiken2","eiken2","英検2級","📗","高校卒業程度", r_eiken),
    qcert("eikenP2","eikenP2","英検準2級","📙","高校中級程度", r_eiken),
    qcert("eiken3","eiken3","英検3級","📘","中学卒業程度", r_eiken),
    gcert("eikenP1","英検準1級","📕","大学中級程度", r_eiken),
    gcert("eiken1","英検1級","🎖️","大学上級程度", r_eiken),
    gcert("eiken4","英検4級","📓","中学中級程度", r_eiken),
    gcert("eiken5","英検5級","📔","中学初級程度", r_eiken),
    qcert("kanken3","kanken3","漢検3級","✍️","中学校卒業程度", r_kanken),
    qcert("kanken4","kanken4","漢検4級","🖌️","中学校在学程度", r_kanken),
    qcert("kanken5","kanken5","漢検5級","🖊️","小学校6年修了程度", r_kanken),
    gcert("kankenP2","漢検準2級","📝","高校在学程度", r_kanken),
    gcert("kanken2","漢検2級","📝","高校卒業・大学程度", r_kanken),
    gcert("kankenP1","漢検準1級","🏅","大学・一般程度", r_kanken),
    gcert("kanken1","漢検1級","🏆","大学・一般（上級）", r_kanken),
    gcert("kanken6","漢検6級","✏️","小学校5年修了程度", r_kanken),
    gcert("kanken7","漢検7級","✏️","小学校4年修了程度", r_kanken),
    gcert("kanken8","漢検8級","✏️","小学校3年修了程度", r_kanken),
    gcert("kanken9","漢検9級","✏️","小学校2年修了程度", r_kanken),
    gcert("kanken10","漢検10級","✏️","小学校1年修了程度", r_kanken),
  ];
};
`;

fs.writeFileSync(path.resolve(process.cwd(), 'src/data.ts'), dataTs);
