// Mock data layer for China MOS. In production these come from the data sources
// listed in prompt.md (国家企业信用信息公示系统, 海关总署, UN Comtrade, Wikidata, GDELT…).
// Every record carries `sources` so AI output can cite provenance.

export type Source = { name: string; url: string };

export type Company = {
  slug: string;
  name: string;
  nameEn: string;
  industry: string;
  city: string;
  founded: number;
  employees: string;
  revenue: string;
  listed: string;
  logo: string;
  tags: string[];
  overview: { zh: string; en: string; fr: string };
  exportMarkets: string[];
  products: string[];
  competitors: string[];
  riskScore: number;
  growth: number;
  sources: Source[];
};

export const companies: Company[] = [
  {
    slug: "byd", name: "比亚迪", nameEn: "BYD Company", industry: "新能源汽车", city: "深圳",
    founded: 1995, employees: "700,000+", revenue: "¥602B (2023)", listed: "SZSE: 002594 / HKEX: 1211",
    logo: "🔋", tags: ["新能源", "电池", "汽车", "出口"],
    overview: {
      zh: "比亚迪是全球领先的新能源汽车与动力电池制造商，业务涵盖乘用车、商用车、电池、电子与轨道交通。",
      en: "BYD is a global leader in new-energy vehicles and power batteries, spanning passenger cars, commercial vehicles, batteries, electronics and rail transit.",
      fr: "BYD est un leader mondial des véhicules à énergie nouvelle et des batteries, couvrant automobiles, batteries, électronique et transport ferroviaire.",
    },
    exportMarkets: ["Europe", "Southeast Asia", "Latin America", "Middle East"],
    products: ["电动乘用车", "刀片电池", "电动巴士", "储能系统"],
    competitors: ["特斯拉", "宁德时代", "吉利", "长城汽车"],
    riskScore: 22, growth: 34,
    sources: [
      { name: "BYD 2023 Annual Report", url: "https://www.bydglobal.com" },
      { name: "Wikidata", url: "https://www.wikidata.org/wiki/Q816528" },
    ],
  },
  {
    slug: "huawei", name: "华为", nameEn: "Huawei Technologies", industry: "通信设备", city: "深圳",
    founded: 1987, employees: "207,000+", revenue: "¥704B (2023)", listed: "非上市 (员工持股)",
    logo: "📡", tags: ["5G", "芯片", "云", "智能终端"],
    overview: {
      zh: "华为是全球领先的 ICT 基础设施与智能终端提供商，业务涵盖运营商网络、企业业务、消费者业务与云。",
      en: "Huawei is a leading global provider of ICT infrastructure and smart devices across carrier networks, enterprise, consumer and cloud businesses.",
      fr: "Huawei est un fournisseur mondial d'infrastructures TIC et d'appareils intelligents (réseaux, entreprise, grand public, cloud).",
    },
    exportMarkets: ["Asia", "Africa", "Middle East", "Latin America"],
    products: ["5G 基站", "麒麟芯片", "Mate 手机", "华为云"],
    competitors: ["中兴", "爱立信", "诺基亚", "苹果"],
    riskScore: 48, growth: 9,
    sources: [
      { name: "Huawei 2023 Annual Report", url: "https://www.huawei.com" },
      { name: "GDELT", url: "https://www.gdeltproject.org" },
    ],
  },
  {
    slug: "catl", name: "宁德时代", nameEn: "CATL", industry: "动力电池", city: "宁德",
    founded: 2011, employees: "120,000+", revenue: "¥400B (2023)", listed: "SZSE: 300750",
    logo: "⚡", tags: ["电池", "储能", "出口"],
    overview: {
      zh: "宁德时代是全球最大的动力电池制造商，为主流车企供应锂离子电池与储能系统。",
      en: "CATL is the world's largest EV battery maker, supplying lithium-ion cells and energy storage to major automakers.",
      fr: "CATL est le premier fabricant mondial de batteries pour VE, fournissant cellules lithium-ion et stockage aux constructeurs.",
    },
    exportMarkets: ["Europe", "North America", "Asia"],
    products: ["三元电池", "磷酸铁锂电池", "麒麟电池", "储能柜"],
    competitors: ["比亚迪", "LG新能源", "松下"],
    riskScore: 28, growth: 21,
    sources: [{ name: "CATL Annual Report", url: "https://www.catl.com" }],
  },
  {
    slug: "dji", name: "大疆创新", nameEn: "DJI", industry: "无人机", city: "深圳",
    founded: 2006, employees: "14,000+", revenue: "¥30B (est.)", listed: "非上市",
    logo: "🚁", tags: ["无人机", "影像", "机器人"],
    overview: {
      zh: "大疆是全球消费级与工业级无人机的领导者，市占率超过全球 70%。",
      en: "DJI is the global leader in consumer and industrial drones, holding over 70% market share worldwide.",
      fr: "DJI est le leader mondial des drones grand public et industriels, avec plus de 70 % de part de marché.",
    },
    exportMarkets: ["North America", "Europe", "Asia"],
    products: ["Mavic", "Agras 植保机", "Ronin 云台", "行业无人机"],
    competitors: ["Autel", "Parrot", "Skydio"],
    riskScore: 41, growth: 15,
    sources: [{ name: "OpenCorporates", url: "https://opencorporates.com" }],
  },
  {
    slug: "mindray", name: "迈瑞医疗", nameEn: "Mindray", industry: "医疗器械", city: "深圳",
    founded: 1991, employees: "18,000+", revenue: "¥35B (2023)", listed: "SZSE: 300760",
    logo: "🩺", tags: ["医疗器械", "监护", "出口"],
    overview: {
      zh: "迈瑞医疗是中国最大的医疗器械企业，产品覆盖生命信息与支持、体外诊断、医学影像。",
      en: "Mindray is China's largest medical device company, spanning patient monitoring, in-vitro diagnostics and medical imaging.",
      fr: "Mindray est le plus grand fabricant chinois de dispositifs médicaux (monitorage, diagnostic in vitro, imagerie).",
    },
    exportMarkets: ["Europe", "North America", "Asia", "Africa"],
    products: ["监护仪", "呼吸机", "生化分析仪", "超声"],
    competitors: ["飞利浦", "GE医疗", "西门子医疗"],
    riskScore: 24, growth: 18,
    sources: [{ name: "Mindray Annual Report", url: "https://www.mindray.com" }],
  },
  {
    slug: "unitree", name: "宇树科技", nameEn: "Unitree Robotics", industry: "机器人", city: "杭州",
    founded: 2016, employees: "1,000+", revenue: "¥1B (est.)", listed: "非上市 (拟 IPO)",
    logo: "🤖", tags: ["机器人", "四足", "人形"],
    overview: {
      zh: "宇树科技专注四足与人形机器人，是全球出货量领先的消费级机器人企业之一。",
      en: "Unitree focuses on quadruped and humanoid robots and is one of the world's top consumer robotics shippers.",
      fr: "Unitree se spécialise dans les robots quadrupèdes et humanoïdes, parmi les leaders mondiaux du grand public.",
    },
    exportMarkets: ["North America", "Europe", "Asia"],
    products: ["Go2 机器狗", "G1 人形机器人", "B2 工业四足"],
    competitors: ["波士顿动力", "宇数", "小鹏机器人"],
    riskScore: 39, growth: 52,
    sources: [{ name: "CNIPA", url: "https://www.cnipa.gov.cn" }],
  },
];

export type Industry = {
  slug: string; name: string; nameEn: string; icon: string;
  marketSize: string; growth: number; leaders: string[]; cities: string[];
  summary: { zh: string; en: string; fr: string };
};

export const industries: Industry[] = [
  { slug: "nev", name: "新能源汽车", nameEn: "New Energy Vehicles", icon: "🚗", marketSize: "¥1.2T", growth: 34, leaders: ["比亚迪", "特斯拉中国", "理想", "蔚来"], cities: ["深圳", "上海", "合肥", "西安"], summary: { zh: "中国新能源汽车产销连续多年全球第一，出口高速增长。", en: "China leads global NEV production and sales, with fast-growing exports.", fr: "La Chine domine la production et les ventes mondiales de VE, exportations en forte hausse." } },
  { slug: "robotics", name: "机器人", nameEn: "Robotics", icon: "🤖", marketSize: "¥180B", growth: 28, leaders: ["宇树科技", "埃斯顿", "汇川技术"], cities: ["杭州", "深圳", "上海", "苏州"], summary: { zh: "工业与人形机器人快速崛起，政策与资本双重驱动。", en: "Industrial and humanoid robotics are surging, driven by policy and capital.", fr: "La robotique industrielle et humanoïde explose, portée par politiques et capitaux." } },
  { slug: "medical", name: "医疗器械", nameEn: "Medical Devices", icon: "🩺", marketSize: "¥1.1T", growth: 18, leaders: ["迈瑞医疗", "联影医疗", "微创医疗"], cities: ["深圳", "上海", "苏州"], summary: { zh: "国产替代加速，高端影像与IVD增长强劲。", en: "Domestic substitution accelerates; high-end imaging and IVD grow strongly.", fr: "La substitution locale s'accélère; imagerie haut de gamme et DIV en forte croissance." } },
  { slug: "battery", name: "动力电池", nameEn: "Power Batteries", icon: "⚡", marketSize: "¥900B", growth: 21, leaders: ["宁德时代", "比亚迪", "亿纬锂能"], cities: ["宁德", "深圳", "常州"], summary: { zh: "全球动力电池供应中心，出口与海外建厂并进。", en: "The global hub for EV batteries, expanding via exports and overseas plants.", fr: "Le hub mondial des batteries VE, exportations et usines à l'étranger." } },
  { slug: "semiconductor", name: "半导体", nameEn: "Semiconductors", icon: "🔌", marketSize: "¥1.5T", growth: 12, leaders: ["中芯国际", "华虹", "长江存储"], cities: ["上海", "无锡", "武汉"], summary: { zh: "国产化提速，设计强、制造追赶。", en: "Localization accelerates; strong in design, catching up in fabrication.", fr: "Localisation en hausse; forte en conception, en rattrapage en fabrication." } },
  { slug: "crossborder", name: "跨境电商", nameEn: "Cross-border E-commerce", icon: "📦", marketSize: "¥2.4T", growth: 16, leaders: ["SHEIN", "Temu", "Anker"], cities: ["深圳", "广州", "杭州"], summary: { zh: "DTC 与平台化并行，欧洲为核心市场之一。", en: "DTC and platform models grow together; Europe is a core market.", fr: "Modèles DTC et plateformes; l'Europe est un marché clé." } },
];

export type City = {
  slug: string; name: string; nameEn: string; gdp: string; pop: string;
  pillars: string[]; leaders: string[]; summary: { zh: string; en: string; fr: string };
};

export const cities: City[] = [
  { slug: "shenzhen", name: "深圳", nameEn: "Shenzhen", gdp: "¥3.46T", pop: "17.7M", pillars: ["电子信息", "新能源", "生物医药"], leaders: ["华为", "比亚迪", "腾讯", "大疆"], summary: { zh: "中国科技创新与硬件供应链中心，创业密度全国第一。", en: "China's hub for tech innovation and hardware supply chains.", fr: "Le pôle chinois de l'innovation tech et des chaînes matérielles." } },
  { slug: "shanghai", name: "上海", nameEn: "Shanghai", gdp: "¥4.72T", pop: "24.9M", pillars: ["金融", "集成电路", "汽车", "生物医药"], leaders: ["特斯拉中国", "中芯国际", "上汽"], summary: { zh: "国际金融中心与外资总部首选地。", en: "International financial center and top choice for foreign HQs.", fr: "Centre financier international, siège privilégié des groupes étrangers." } },
  { slug: "hangzhou", name: "杭州", nameEn: "Hangzhou", gdp: "¥2.0T", pop: "12.4M", pillars: ["数字经济", "电商", "机器人"], leaders: ["阿里巴巴", "宇树科技", "海康威视"], summary: { zh: "数字经济与电商之都，机器人新势力聚集。", en: "Capital of digital economy and e-commerce; a robotics rising star.", fr: "Capitale de l'économie numérique et du e-commerce." } },
  { slug: "suzhou", name: "苏州", nameEn: "Suzhou", gdp: "¥2.5T", pop: "12.9M", pillars: ["高端制造", "生物医药", "纳米"], leaders: ["博世苏州", "信达生物"], summary: { zh: "外资制造重镇，工业园区营商环境全国领先。", en: "A manufacturing powerhouse with top-tier industrial parks.", fr: "Pôle manufacturier majeur, zones industrielles de premier rang." } },
];

export type Playbook = {
  slug: string; category: string; title: { zh: string; en: string; fr: string };
  time: string; cost: string; difficulty: "低" | "中" | "高";
};

export const playbookCategories = ["市场进入", "销售", "营销", "跨境电商", "采购", "OEM/ODM", "品牌建设", "微信营销", "小红书", "抖音", "知识产权", "CCC认证", "注册商标", "设立外资公司", "招聘", "税务", "物流", "展会", "融资", "机器人", "新能源", "医疗器械"];

export const playbooks: Playbook[] = [
  { slug: "setup-wfoe", category: "设立外资公司", title: { zh: "在中国设立外商独资企业（WFOE）", en: "Set up a WFOE in China", fr: "Créer une WFOE en Chine" }, time: "2–4 个月", cost: "¥80k–200k", difficulty: "中" },
  { slug: "market-entry", category: "市场进入", title: { zh: "欧洲品牌进入中国市场完整攻略", en: "Full China market entry playbook for European brands", fr: "Guide complet d'entrée sur le marché chinois" }, time: "3–6 个月", cost: "¥200k+", difficulty: "高" },
  { slug: "find-odm", category: "OEM/ODM", title: { zh: "寻找并验证中国 ODM 工厂", en: "Find and vet Chinese ODM factories", fr: "Trouver et valider des usines ODM chinoises" }, time: "1–3 个月", cost: "¥20k–100k", difficulty: "中" },
  { slug: "ccc", category: "CCC认证", title: { zh: "办理 CCC 强制性产品认证", en: "Obtain CCC compulsory certification", fr: "Obtenir la certification CCC" }, time: "2–5 个月", cost: "¥30k–120k", difficulty: "中" },
  { slug: "xiaohongshu", category: "小红书", title: { zh: "用小红书打造品牌种草", en: "Build brand buzz on Xiaohongshu (RED)", fr: "Créer du buzz sur Xiaohongshu" }, time: "持续", cost: "¥50k+/月", difficulty: "中" },
  { slug: "trademark", category: "注册商标", title: { zh: "在中国注册商标并防抢注", en: "Register a trademark and prevent squatting", fr: "Déposer une marque et éviter le squatting" }, time: "9–12 个月", cost: "¥5k–20k", difficulty: "低" },
];

export type Supplier = {
  slug: string; name: string; category: string; city: string;
  products: string[]; capacity: string; certs: string[]; riskScore: number; exportMarkets: string[];
};

export const suppliers: Supplier[] = [
  { slug: "sunwoda", name: "欣旺达", category: "电池 PACK", city: "深圳", products: ["消费电池", "动力电池"], capacity: "50 GWh/年", certs: ["IATF 16949", "ISO 9001", "UL"], riskScore: 26, exportMarkets: ["Europe", "Asia"] },
  { slug: "luxshare", name: "立讯精密", category: "精密制造 / ODM", city: "东莞", products: ["连接器", "声学", "整机组装"], capacity: "大规模", certs: ["ISO 9001", "IATF 16949"], riskScore: 30, exportMarkets: ["North America", "Europe"] },
  { slug: "han-tech", name: "汉德精工", category: "CNC / 五金", city: "苏州", products: ["精密结构件", "铝合金外壳"], capacity: "中小批量", certs: ["ISO 9001"], riskScore: 44, exportMarkets: ["Europe"] },
  { slug: "greenfood", name: "绿康食品", category: "食品代工 / OEM", city: "青岛", products: ["休闲食品", "调味品"], capacity: "10k 吨/年", certs: ["BRC", "HACCP", "ISO 22000"], riskScore: 33, exportMarkets: ["Europe", "Middle East"] },
];

export type Policy = {
  slug: string; org: string; date: string; impact: "高" | "中" | "低";
  title: { zh: string; en: string; fr: string }; tags: string[];
};

export const policies: Policy[] = [
  { slug: "nev-subsidy-2026", org: "工信部", date: "2026-06-20", impact: "高", title: { zh: "新能源汽车下乡与以旧换新政策延续", en: "NEV rural rollout & trade-in subsidy extended", fr: "Subvention VE rural et reprise prolongée" }, tags: ["新能源", "补贴"] },
  { slug: "foreign-invest-catalog", org: "商务部", date: "2026-06-12", impact: "高", title: { zh: "鼓励外商投资产业目录更新", en: "Updated catalog of industries encouraging foreign investment", fr: "Catalogue des industries encourageant l'IDE mis à jour" }, tags: ["外资", "投资"] },
  { slug: "customs-cbec", org: "海关总署", date: "2026-05-30", impact: "中", title: { zh: "跨境电商零售进口清单扩容", en: "Cross-border e-commerce import list expanded", fr: "Liste d'importation e-commerce élargie" }, tags: ["跨境电商", "海关"] },
  { slug: "data-export", org: "国家网信办", date: "2026-05-18", impact: "高", title: { zh: "数据出境合规要求细化", en: "Refined compliance rules for cross-border data transfer", fr: "Règles de conformité pour le transfert de données affinées" }, tags: ["数据", "合规"] },
];

export const news = [
  { title: { zh: "中国 5 月新能源车出口同比增长 42%", en: "China NEV exports up 42% YoY in May", fr: "Exportations VE chinoises +42 % en mai" }, source: "GDELT / 海关总署", time: "2h" },
  { title: { zh: "宁德时代宣布在欧洲新建电池工厂", en: "CATL announces new battery plant in Europe", fr: "CATL annonce une nouvelle usine en Europe" }, source: "Google News", time: "5h" },
  { title: { zh: "国务院推出新一轮稳外资措施", en: "State Council rolls out new measures to stabilize FDI", fr: "Le Conseil d'État lance des mesures pour stabiliser l'IDE" }, source: "商务部", time: "8h" },
  { title: { zh: "人形机器人产业获多地政策支持", en: "Humanoid robotics gains policy backing across provinces", fr: "La robotique humanoïde soutenue par plusieurs provinces" }, source: "工信部", time: "12h" },
];

export const indicators = [
  { label: { zh: "GDP 增速", en: "GDP Growth", fr: "Croissance PIB" }, value: "5.2%", trend: "+0.1", up: true },
  { label: { zh: "CPI", en: "CPI", fr: "IPC" }, value: "0.6%", trend: "-0.1", up: false },
  { label: { zh: "进出口总额", en: "Trade Volume", fr: "Commerce" }, value: "¥21.2T", trend: "+3.4%", up: true },
  { label: { zh: "FDI", en: "FDI", fr: "IDE" }, value: "¥498B", trend: "-2.1%", up: false },
  { label: { zh: "PMI", en: "PMI", fr: "PMI" }, value: "50.4", trend: "+0.3", up: true },
  { label: { zh: "社零总额", en: "Retail Sales", fr: "Ventes détail" }, value: "¥3.9T", trend: "+4.2%", up: true },
];

export const dataSources: Source[] = [
  { name: "国家企业信用信息公示系统", url: "https://www.gsxt.gov.cn" },
  { name: "国家统计局", url: "https://www.stats.gov.cn" },
  { name: "海关总署", url: "http://www.customs.gov.cn" },
  { name: "UN Comtrade", url: "https://comtrade.un.org" },
  { name: "OpenCorporates", url: "https://opencorporates.com" },
  { name: "Wikidata", url: "https://www.wikidata.org" },
  { name: "GDELT", url: "https://www.gdeltproject.org" },
  { name: "Google Patents / CNIPA", url: "https://patents.google.com" },
  { name: "OpenStreetMap", url: "https://www.openstreetmap.org" },
];

export const getCompany = (slug: string) => companies.find((c) => c.slug === slug);
export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
export const getCity = (slug: string) => cities.find((c) => c.slug === slug);
export const getPlaybook = (slug: string) => playbooks.find((p) => p.slug === slug);
