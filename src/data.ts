import { BankMeta, Cert } from './types';

// 第一種衛生管理者 問題データ（抜粋）
export const QUESTIONS = [
  {
    id: 1, subject: "法令有害", topic: "衛生管理者の選任",
    q: "常時800人の労働者を使用する製造業の事業場における衛生管理者の選任について、法令上、正しいものはどれか。",
    choices: [
      "衛生管理者は2人選任すればよく、そのうち1人は専属でない労働衛生コンサルタントでもよい。",
      "衛生管理者は3人以上選任しなければならない。",
      "選任すべき衛生管理者のうち少なくとも1人を専任の衛生管理者としなければならない。",
      "第二種衛生管理者免許を有する者のうちから衛生管理者を選任することができる。",
      "選任した衛生管理者については、遅滞なく労働基準監督署長に報告する必要はない。"
    ],
    answer: 0,
    exp: "常時501～1,000人の事業場では衛生管理者は2人以上選任する。うち1人は専属でない労働衛生コンサルタントでよい（残りは専属）。3人以上必要となるのは1,001～2,000人。",
    point: "衛生管理者数: 〜50:1／51〜200:1／201〜500:2／501〜1000:2／1001〜2000:3"
  },
  {
    id: 2, subject: "法令有害", topic: "専任の衛生管理者",
    q: "次の事業場のうち、法令上、専任の衛生管理者を選任しなければならないものはどれか。",
    choices: [
      "常時600人の労働者を使用し、そのうち深夜業に常時50人が従事する事業場。",
      "常時1,200人の労働者を使用する事業場。",
      "常時400人の労働者を使用し、坑内労働に常時20人が従事する事業場。",
      "常時300人の労働者を使用する事業場。",
      "常時500人の労働者を使用し、多量の高熱物体を取り扱う業務に常時10人が従事する事業場。"
    ],
    answer: 1,
    exp: "専任の衛生管理者が必要なのは、(1)常時1,000人を超える労働者を使用する事業場、または(2)常時500人を超え、一定の有害業務に常時30人以上従事する事業場。",
    point: "専任要件: ①1,000人超 ②500人超かつ特定有害業務に常時30人以上"
  },
  // ... 他の問題データも同様の構造（アプリの動作確認用のため一部抜粋）
];

// 危険物取扱者 乙種第4類（乙4） 問題バンク（抜粋）
export const BANK_OTSU4 = [
  { id:"o1", subject:"法令", topic:"危険物の定義",
    q:"消防法上の危険物について、正しいものはどれか。",
    choices:["危険物は第1類から第6類に分類され、気体のものも含まれる。","第4類危険物は引火性液体である。","危険物は常温・常圧で必ず液体である。","プロパンガスは第4類危険物に含まれる。","危険物の分類は物質の色によって決まる。"],
    answer:1,
    exp:"消防法の危険物は第1類〜第6類の固体または液体で、気体は含まない（高圧ガスは別法令）。第4類は引火性液体。プロパン等の可燃性ガスは消防法危険物ではない。",
    point:"消防法危険物=第1〜6類の固体・液体（気体は対象外）。第4類=引火性液体" },
  { id:"o2", subject:"法令", topic:"指定数量",
    q:"指定数量に関する記述として、誤っているものはどれか。",
    choices:["ガソリン（第1石油類・非水溶性）の指定数量は200Lである。","灯油・軽油（第2石油類・非水溶性）の指定数量は1000Lである。","重油（第3石油類・非水溶性）の指定数量は2000Lである。","指定数量以上の危険物の貯蔵・取扱いは原則として市町村長等の許可を受けた施設で行う。","指定数量は危険性が高い物品ほど大きい値が定められている。"],
    answer:4,
    exp:"指定数量は危険性が高いものほど『小さい』値（少量で規制対象）。",
    point:"指定数量: 特殊引火物50/第1石油類200/アルコール400/第2石油類1000(L)。危険なほど小さい" },
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
    ], questions: QUESTIONS.filter(q=>["法令一般","衛生一般","労働生理"].includes(q.subject)) },
  otsu4: { name:"危険物取扱者 乙種第4類", pass:{overall:0, perSubj:0.6}, mockLabel:"本番模試（35問）",
    subjects:[
      {key:"法令", name:"危険物に関する法令", short:"法令", mock:15},
      {key:"物化", name:"物理学・化学", short:"物理化学", mock:10},
      {key:"性質", name:"性質・火災予防・消火", short:"性質・消火", mock:10},
    ], questions: BANK_OTSU4 },
};

const EXAM_OR = "https://www.exam.or.jp/";
const SHOUBO = "https://www.shoubo-shiken.or.jp/";
const SHIKEN = "https://www.shiken.or.jp/";

export function qcert(id: string, bank: string, name: string, icon: string, note: string, res?: any): Cert { 
  return {id,kind:"quiz",bank,name,icon,status:"target",note,notices:[],resources:res?[res]:[]}; 
}
export function gcert(id: string, name: string, icon: string, note: string, res?: any): Cert { 
  return {id,kind:"generic",name,icon,status:"target",manualProg:0,note,notices:[],resources:res?[res]:[]}; 
}

export const defaultCerts = (): Cert[] => {
  const r_shoubo={label:"公式：消防試験研究センター", url:SHOUBO};
  const r_eiken={label:"公式：日本英語検定協会", url:EIKEN_URL};
  const r_kanken={label:"公式：日本漢字能力検定協会", url:KANKEN_URL};
  return [
    { id:"eisei1", kind:"quiz", bank:"eisei1", name:"第一種衛生管理者", icon:"ShieldCheck", status:"learning", note:"国家資格・全業種対応",
      notices:[
        {date:"2025-04", title:"化学物質の自律的管理が本格化", body:"化学物質管理者・保護具着用管理責任者の選任義務化（2024.4〜）に続き、リスクアセスメント対象物質が大幅に拡大。"}
      ],
      resources:[{label:"公式：安全衛生技術試験協会", url:EXAM_OR}] },
    { id:"eisei2", kind:"quiz", bank:"eisei2", name:"第二種衛生管理者", icon:"Bandage", status:"target", note:"有害業務以外の業種向け",
      notices:[],
      resources:[{label:"公式：安全衛生技術試験協会", url:EXAM_OR}] },
    qcert("otsu4","otsu4","危険物取扱者 乙種第4類","Fuel","引火性液体（ガソリン等）", r_shoubo),
    gcert("denki2","第二種電気工事士（学科）","Lightbulb","一般用電気工作物", {label:"公式：電気技術者試験センター", url:SHIKEN}),
    gcert("eiken2","英検2級","BookMarked","高校卒業程度"),
    gcert("kanken3","漢検3級","PencilLine","中学校卒業程度"),
  ];
};
