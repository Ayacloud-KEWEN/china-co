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
  summary?: { zh: string; en: string; fr: string };
  steps?: { title: string; detail: string }[];
  documents?: string[];
  departments?: string[];
  risks?: string[];
  tips?: string[];
  faq?: { q: string; a: string }[];
  relatedCities?: string[];
  sourceUrl?: string;
};

export const playbookCategories = ["市场进入", "销售", "营销", "跨境电商", "采购", "OEM/ODM", "品牌建设", "微信营销", "小红书", "抖音", "知识产权", "CCC认证", "注册商标", "设立外资公司", "招聘", "税务", "物流", "展会", "融资", "机器人", "新能源", "医疗器械"];

export const playbooks: Playbook[] = [
  {
    slug: "setup-wfoe", category: "设立外资公司",
    title: { zh: "在中国设立外商独资企业（WFOE）", en: "Set up a WFOE in China", fr: "Créer une WFOE en Chine" },
    time: "2–4 个月", cost: "¥80k–200k", difficulty: "中",
    summary: {
      zh: "外商独资企业（WFOE）是外国投资者在华 100% 控股的有限责任公司，可独立经营、开票与利润汇出，是欧洲企业进入中国最常见的实体形式。",
      en: "A WFOE is a limited company wholly owned by foreign investors — the most common vehicle for European firms to operate, invoice and repatriate profits in China.",
      fr: "La WFOE est une société à 100 % de capitaux étrangers, la forme la plus courante pour opérer, facturer et rapatrier des bénéfices en Chine.",
    },
    steps: [
      { title: "公司名称预先核准", detail: "向拟设立地市场监督管理局提交企业名称，核准字号、行业与组织形式。" },
      { title: "确定注册地址与经营范围", detail: "租赁真实办公地址（部分园区可挂靠），经营范围需与实际业务及负面清单相符。" },
      { title: "商务主管部门备案/审批", detail: "负面清单外行业为备案制，清单内需审批；通过外商投资信息报告系统提交。" },
      { title: "领取营业执照", detail: "市场监督管理局核发营业执照（含统一社会信用代码）。" },
      { title: "刻制公章", detail: "公安备案刻制公章、财务章、法人章与发票章。" },
      { title: "银行开户", detail: "开立人民币基本户与外币资本金账户。" },
      { title: "外汇登记", detail: "通过银行办理外汇登记（原 SAFE 登记），用于资本金结汇。" },
      { title: "税务与社保登记", detail: "税务报到、申领发票（税控），办理社保公积金开户。" },
    ],
    documents: ["投资者主体资格证明（公证认证）", "法定代表人及董事护照", "注册地址租赁合同", "公司章程", "经营范围说明", "投资总额与注册资本说明"],
    departments: ["市场监督管理局", "商务主管部门", "公安局（刻章备案）", "银行", "外汇管理局（SAFE）", "税务局", "社保公积金中心"],
    risks: ["经营范围与负面清单不符导致退回", "注册地址不合规（虚拟地址被查）", "资本金结汇用途受限", "利润汇出需完税凭证", "部分行业需前置许可（食品、医疗器械等）"],
    tips: ["先确认行业是否在《外商投资准入负面清单》内", "优先选择自贸区/经开区享受优惠与更快审批", "注册资本认缴制但需与经营规模匹配", "聘请本地代理记账降低合规成本"],
    faq: [
      { q: "需要多少注册资本？", a: "多数行业实行认缴制、无最低限额，但需与经营规模、租金与人力匹配，过低会影响资质与工作签证。" },
      { q: "全流程多久？", a: "顺利情况下约 2–4 个月，取决于行业审批与地址落实。" },
      { q: "利润可以汇回欧洲吗？", a: "可以。完成年度审计、企业所得税汇算清缴并取得完税凭证后，可通过银行购汇汇出。" },
    ],
    relatedCities: ["上海", "深圳", "苏州"],
    sourceUrl: "http://www.mofcom.gov.cn",
  },
  {
    slug: "market-entry", category: "市场进入",
    title: { zh: "欧洲品牌进入中国市场完整攻略", en: "Full China market entry playbook for European brands", fr: "Guide complet d'entrée sur le marché chinois" },
    time: "3–6 个月", cost: "¥200k+", difficulty: "高",
    summary: {
      zh: "欧洲品牌进入中国需在实体、合规、渠道、营销与本地化五个维度系统规划。本攻略给出从调研到落地的整体路线。",
      en: "Entering China spans five dimensions — entity, compliance, channels, marketing and localization. This playbook lays out the path from research to launch.",
      fr: "Entrer en Chine couvre cinq axes : entité, conformité, canaux, marketing et localisation, de l'étude au lancement.",
    },
    steps: [
      { title: "市场与竞品调研", detail: "评估市场规模、政策、竞争格局、目标客群与定价空间。" },
      { title: "选择进入模式", detail: "跨境电商试水 / 设立 WFOE / 合资 / 找经销代理，权衡控制力与投入。" },
      { title: "合规与资质", detail: "产品准入（CCC/NMPA 等）、商标与知识产权、数据与广告合规。" },
      { title: "渠道搭建", detail: "天猫国际/京东/抖音电商，线下经销，B2B 直销。" },
      { title: "品牌与营销本地化", detail: "微信/小红书/抖音内容与 KOL，中文品牌与本地客服。" },
      { title: "运营与迭代", detail: "数据驱动优化选品、定价与投放，建立售后与履约。" },
    ],
    documents: ["市场调研报告", "进入模式可行性分析", "合规清单", "商标注册", "渠道合同", "营销预算"],
    departments: ["视模式而定：市场监管、商务、海关、网信办（广告/数据合规）"],
    risks: ["低估合规与本地化成本", "渠道选择错误", "商标未先行被抢注", "照搬欧洲打法水土不服", "现金流与回款周期压力"],
    tips: ["先用跨境电商低成本验证需求再重投入", "商标与域名/社媒账号先行注册", "组建或外包本地团队", "预留合规缓冲期"],
    faq: [
      { q: "一定要设立公司吗？", a: "不一定。可先用跨境电商保税/直邮模式验证，跑通后再设实体。" },
      { q: "预算怎么估？", a: "试水期数十万元级；规模化后含团队/营销/合规通常 ¥200k+ 起。" },
    ],
    relatedCities: ["上海", "深圳", "杭州"],
    sourceUrl: "http://www.mofcom.gov.cn",
  },
  {
    slug: "find-odm", category: "OEM/ODM",
    title: { zh: "寻找并验证中国 ODM 工厂", en: "Find and vet Chinese ODM factories", fr: "Trouver et valider des usines ODM chinoises" },
    time: "1–3 个月", cost: "¥20k–100k", difficulty: "中",
    summary: {
      zh: "在中国寻找并验证 ODM/OEM 工厂是硬件与消费品出海的关键。系统化的筛选、审厂与质控流程能显著降低质量与交付风险。",
      en: "Finding and vetting ODM/OEM factories is critical for hardware sourcing. A systematic screen-audit-QC process cuts quality and delivery risk.",
      fr: "Trouver et auditer des usines ODM/OEM est clé pour le sourcing matériel : un processus tri-audit-contrôle réduit les risques.",
    },
    steps: [
      { title: "明确产品规格与需求", detail: "编写规格书：材料、公差、认证、包装、MOQ 与目标成本。" },
      { title: "多渠道寻源", detail: "1688/阿里国际站、广交会/行业展会、行业协会、同行推荐。" },
      { title: "初筛与询价", detail: "核对资质、产能、出口经验、认证；比较报价与 MOQ。" },
      { title: "样品打样", detail: "索取样品验证质量与一致性，必要时做第三方测试。" },
      { title: "工厂审核", detail: "现场或第三方审厂：质量体系、设备、用工合规与社会责任。" },
      { title: "商务谈判与合同", detail: "明确价格、账期、交期、质量标准、验货条款与知识产权归属。" },
      { title: "量产与质控", detail: "首件确认、过程巡检、出货前验货（AQL 抽检）。" },
    ],
    documents: ["产品规格书", "工厂营业执照与出口资质", "体系认证（ISO 9001 等）", "产品认证（CE/CCC 等）", "审厂报告", "样品测试报告", "采购合同"],
    departments: ["商业流程，无政府审批", "第三方验厂/验货机构（SGS、TÜV、BV 等）"],
    risks: ["贸易商冒充工厂", "打样合格量产降配", "MOQ 与账期压力", "知识产权被复制", "旺季产能挤兑导致交期延误"],
    tips: ["用第三方审厂与验货", "分批付款绑定质量节点", "签署保密与模具/IP 归属条款", "小批量试产验证再放量"],
    faq: [
      { q: "如何辨别工厂还是贸易商？", a: "核对营业执照经营范围、要求视频看产线、核对增值税发票抬头与出口主体。" },
      { q: "一定要去现场吗？", a: "建议至少一次现场或委托第三方审厂，尤其是定制与高货值订单。" },
    ],
    relatedCities: ["深圳", "苏州", "杭州"],
    sourceUrl: "https://www.1688.com",
  },
  {
    slug: "ccc", category: "CCC认证",
    title: { zh: "办理 CCC 强制性产品认证", en: "Obtain CCC compulsory certification", fr: "Obtenir la certification CCC" },
    time: "2–5 个月", cost: "¥30k–120k", difficulty: "中",
    summary: {
      zh: "中国强制性产品认证（CCC/3C）是列入目录产品进入中国市场的强制门槛，未获证不得进口、销售或在经营活动中使用。",
      en: "China Compulsory Certification (CCC/3C) is a mandatory gate for listed products — without it they can't be imported, sold or used commercially in China.",
      fr: "La certification obligatoire CCC/3C conditionne l'accès au marché des produits listés : sans elle, ni import ni vente en Chine.",
    },
    steps: [
      { title: "判断产品是否在 CCC 目录内", detail: "对照《强制性产品认证目录》确认类别；不在目录内可申请《不属于 CCC 范围》说明。" },
      { title: "选择指定认证机构", detail: "向国家认监委（CNCA）指定机构（如 CQC）提交申请。" },
      { title: "提交申请与技术资料", detail: "产品说明、电路图、关键元器件清单、CB 报告等。" },
      { title: "型式试验", detail: "送样至指定实验室按国标（GB）测试。" },
      { title: "初始工厂检查", detail: "认证机构对生产厂进行现场审查（质量体系与一致性）。" },
      { title: "评价与发证", detail: "通过后核发 CCC 证书。" },
      { title: "标志使用与获证后监督", detail: "加施 CCC 标志并接受年度监督检查。" },
    ],
    documents: ["申请表", "产品铭牌与说明书", "电气原理图/PCB", "关键元器件与材料清单", "CB 报告（如有）", "工厂质量手册", "商标授权（如适用）"],
    departments: ["国家市场监督管理总局 / 国家认监委（CNCA）", "指定认证机构（如 CQC）", "指定检测实验室"],
    risks: ["关键元器件变更需变更证书", "工厂检查不通过延误上市", "目录判定错误导致清关受阻", "标志滥用被处罚"],
    tips: ["提前用 CB 报告加速型式试验", "变更元器件前先评估是否需重新认证", "进口前确认清关所需 CCC 证书与产品一致"],
    faq: [
      { q: "所有电子产品都要 CCC 吗？", a: "只有列入目录的产品才需要，需按目录逐项判定。" },
      { q: "周期多久？", a: "一般 2–5 个月，取决于测试与工厂检查排期。" },
    ],
    sourceUrl: "https://www.samr.gov.cn",
  },
  {
    slug: "xiaohongshu", category: "小红书",
    title: { zh: "用小红书打造品牌种草", en: "Build brand buzz on Xiaohongshu (RED)", fr: "Créer du buzz sur Xiaohongshu" },
    time: "持续", cost: "¥50k+/月", difficulty: "中",
    summary: {
      zh: "小红书（RED）是中国中高端消费决策的核心种草平台，尤其适合美妆、母婴、家居、食品与生活方式品牌建立口碑。",
      en: "Xiaohongshu (RED) is China's key discovery platform for premium consumers — ideal for beauty, mother-baby, home, food and lifestyle brands.",
      fr: "Xiaohongshu (RED) est la plateforme de découverte clé pour les consommateurs premium en Chine.",
    },
    steps: [
      { title: "开设企业号", detail: "完成企业认证，搭建品牌主页与专业号。" },
      { title: "内容与人设定位", detail: "明确目标人群、内容支柱与视觉风格。" },
      { title: "KOL/KOC 投放", detail: "头部造势 + 腰尾部铺量，以真实体验种草。" },
      { title: "信息流与搜索广告", detail: "结合薯条/聚光投放放大优质笔记。" },
      { title: "电商闭环", detail: "挂载商城/店铺或引导天猫京东转化。" },
      { title: "数据复盘", detail: "监测互动、收藏、搜索指数与转化，迭代内容。" },
    ],
    documents: ["企业营业执照（认证）", "品牌与产品资料", "内容排期表", "KOL 名单与合同", "投放预算表"],
    departments: ["商业运营，无政府审批", "注意《广告法》合规：不得用绝对化用语、需标注广告"],
    risks: ["虚假种草/刷量被限流处罚", "违反广告法用语被罚", "内容同质化难破圈", "ROI 不稳定"],
    tips: ["重视真实测评与 UGC", "腰尾部 KOC 性价比高", "标注合作避免违规", "用搜索卡位品类关键词"],
    faq: [
      { q: "需要中国公司吗？", a: "企业号认证通常需中国营业执照，可通过合资/代运营解决。" },
      { q: "多久见效？", a: "种草是持续投入，一般 1–3 个月积累搜索与口碑。" },
    ],
    sourceUrl: "https://www.xiaohongshu.com",
  },
  {
    slug: "trademark", category: "注册商标",
    title: { zh: "在中国注册商标并防抢注", en: "Register a trademark and prevent squatting", fr: "Déposer une marque et éviter le squatting" },
    time: "9–12 个月", cost: "¥5k–20k", difficulty: "低",
    summary: {
      zh: "中国采用商标注册在先原则，抢注风险高。尽早在国家知识产权局商标局注册中英文及图形商标，是品牌进入中国的第一道防线。",
      en: "China is first-to-file with high squatting risk. Registering Chinese, English and logo marks early with CNIPA is a brand's first line of defense.",
      fr: "La Chine applique le premier-déposant : déposer tôt les marques (chinoise, anglaise, logo) auprès de la CNIPA est essentiel.",
    },
    steps: [
      { title: "商标检索", detail: "在商标局数据库检索近似商标，评估注册可行性。" },
      { title: "确定类别与商品项目", detail: "按尼斯分类选定类别（建议核心 + 防御类别）。" },
      { title: "提交申请", detail: "通过商标局或代理机构提交并缴纳官费。" },
      { title: "形式审查", detail: "检查申请文件是否合规，通过后下发受理通知。" },
      { title: "实质审查", detail: "审查显著性及是否与在先商标冲突（约 4–6 个月）。" },
      { title: "初步审定公告", detail: "公告 3 个月异议期。" },
      { title: "核准注册", detail: "无异议则核发《商标注册证》，有效期 10 年。" },
    ],
    documents: ["申请人主体资格证明", "商标图样", "商品/服务清单", "委托书（代理时）"],
    departments: ["国家知识产权局商标局（CNIPA）"],
    risks: ["被在先抢注需通过异议/无效程序维权，成本高", "仅注册英文未注册中文易被抢注", "类别覆盖不足留下空档", "驳回需复审"],
    tips: ["中英文 + 图形分别注册", "覆盖核心及关联防御类别", "进入前先注册再上市", "保留使用证据以防连续三年不使用被撤销（撤三）"],
    faq: [
      { q: "多久拿证？", a: "顺利约 9–12 个月。" },
      { q: "需要在中国有公司吗？", a: "不需要，境外主体可通过代理直接申请。" },
    ],
    sourceUrl: "https://www.cnipa.gov.cn",
  },
  {
    slug: "crossborder-ecommerce", category: "跨境电商",
    title: { zh: "通过跨境电商进入中国（保税 / 直邮）", en: "Enter China via cross-border e-commerce (bonded / direct mail)", fr: "Entrer en Chine via le e-commerce transfrontalier" },
    time: "1–3 个月", cost: "¥50k–300k", difficulty: "中",
    summary: {
      zh: "跨境电商是欧洲品牌进入中国成本最低的路径：无需在华设立实体，通过保税仓或直邮直接卖给消费者，并享受跨境电商零售进口税收优惠。",
      en: "Cross-border e-commerce is the lowest-cost way into China — sell to consumers via bonded warehouses or direct mail without a local entity, under preferential retail-import tax rules.",
      fr: "Le e-commerce transfrontalier est la voie la moins coûteuse : vendre via entrepôt sous douane ou envoi direct, sans entité locale.",
    },
    steps: [
      { title: "确认商品在正面清单内", detail: "对照《跨境电商零售进口商品清单》；清单外商品不能走此渠道。" },
      { title: "选择模式", detail: "保税备货（1210，先入保税仓、下单后清关、时效快）或直邮（9610，海外发货、无需备货）。" },
      { title: "选择平台/渠道", detail: "天猫国际、京东国际、抖音商城，或自建独立站 + 小程序。" },
      { title: "备案与资质", detail: "完成海关跨境电商相关备案；境外主体通过境内代理、物流与支付企业协作。" },
      { title: "三单对碰与清关", detail: "订单、支付单、物流单推送海关，实现实时通关。" },
      { title: "仓储与履约", detail: "入保税区仓库（宁波/郑州/杭州等）或海外仓直邮。" },
      { title: "营销与转化", detail: "小红书/抖音种草导流，平台站内投放。" },
    ],
    documents: ["品牌授权书", "商品资质（化妆品备案 / 食品标签等）", "报关资料", "海外主体证明", "与境内代理/物流/支付服务商协议"],
    departments: ["海关总署", "跨境电商综试区管委会", "市场监督管理局（商品合规）", "税务局"],
    risks: ["商品不在正面清单被退运", "超出个人单次 ¥5,000 / 年度 ¥26,000 限额需按一般贸易报关", "刷单造假三单被海关处罚", "保税仓压货占用资金", "跨境电商商品不得二次线下分销"],
    tips: ["先用直邮小批量测款，跑通再转保税备货", "选综试区（杭州/宁波/郑州）政策与配套成熟", "化妆品/食品提前确认标签与备案要求", "把跨境电商当作低成本验证需求的第一步"],
    faq: [
      { q: "需要在中国注册公司吗？", a: "不需要。跨境电商零售进口可由境外主体 + 境内服务商（代理/物流/支付）完成。" },
      { q: "税负怎么算？", a: "跨境电商零售进口关税税率暂设为 0，进口环节增值税与消费税按法定应纳税额的 70% 征收，限额内适用。" },
    ],
    relatedCities: ["杭州", "宁波", "广州"],
    sourceUrl: "http://www.customs.gov.cn",
  },
  {
    slug: "china-tax-basics", category: "税务",
    title: { zh: "外资企业在华税务合规基础", en: "Tax compliance basics for foreign-invested enterprises", fr: "Bases de la conformité fiscale en Chine" },
    time: "持续", cost: "¥30k–150k/年", difficulty: "中",
    summary: {
      zh: "外资企业在华主要涉及增值税、企业所得税与预提所得税。理解税率、优惠与申报节奏，是控制成本与避免罚则的基础。",
      en: "FIEs in China mainly face VAT, corporate income tax and withholding tax. Knowing the rates, incentives and filing rhythm is the basis of cost control and compliance.",
      fr: "Les entreprises étrangères font face à la TVA, l'IS et la retenue à la source : connaître taux, incitations et échéances est essentiel.",
    },
    steps: [
      { title: "税务报到与税种核定", detail: "取得营业执照后到税务局报到，核定税种与征收方式。" },
      { title: "申领发票与税控", detail: "开通增值税发票系统，申领发票额度。" },
      { title: "确定纳税人身份", detail: "一般纳税人（可抵扣进项、可开专票）vs 小规模纳税人（征收率低但不可抵扣）。" },
      { title: "月度/季度申报", detail: "增值税按月或按季申报；企业所得税按季预缴。" },
      { title: "年度汇算清缴", detail: "年度企业所得税汇算清缴，并出具年度审计报告。" },
      { title: "关联交易与转让定价", detail: "与境外母公司交易需符合独立交易原则并准备同期资料。" },
      { title: "利润汇出", detail: "完税后经银行购汇汇出，股息需缴预提所得税。" },
    ],
    documents: ["营业执照", "财务报表与账簿", "年度审计报告", "增值税发票", "关联交易同期资料", "税收协定待遇备案资料"],
    departments: ["国家税务总局及地方税务局", "银行（付汇）", "会计师事务所（审计）"],
    risks: ["进项发票不合规无法抵扣", "关联交易定价不合理被特别纳税调整", "未适用税收协定优惠多缴预提税", "逾期申报罚款与纳税信用降级", "个税代扣代缴未履行的连带责任"],
    tips: ["B2B 客户通常要求增值税专票，需评估一般纳税人身份", "高新技术企业可享 15% 企业所得税优惠", "中国与多数欧盟国家有双边税收协定，股息预提税可降至 5%–10%", "聘请本地代理记账并按月对账"],
    faq: [
      { q: "主要税率是多少？", a: "增值税一般为 13%（货物）/ 9%（交通、建筑等）/ 6%（现代服务）；企业所得税 25%，高新技术企业 15%；股息预提所得税 10%（协定可能更低）。" },
      { q: "亏损可以弥补吗？", a: "一般可向后结转 5 年；高新技术企业与科技型中小企业可延长至 10 年。" },
    ],
    sourceUrl: "https://www.chinatax.gov.cn",
  },
  {
    slug: "china-logistics-import", category: "物流",
    title: { zh: "从欧洲到中国的进口物流与清关", en: "Import logistics and customs clearance from Europe to China", fr: "Logistique d'import et dédouanement vers la Chine" },
    time: "2–8 周/批次", cost: "视货量而定", difficulty: "中",
    summary: {
      zh: "货物进入中国需完成运输、报关、缴税与检验。选对运输方式、HS 编码与贸易术语，直接决定成本、时效与合规风险。",
      en: "Importing into China means transport, declaration, duties and inspection. Incoterms, HS codes and mode choice drive cost, lead time and risk.",
      fr: "Importer en Chine implique transport, déclaration, taxes et inspection : Incoterms, codes SH et mode déterminent coût et délai.",
    },
    steps: [
      { title: "确定贸易术语（Incoterms）", detail: "EXW/FOB/CIF/DDP 决定责任、费用与风险划分。" },
      { title: "归类 HS 编码", detail: "决定关税税率与监管条件（是否需 CCC、许可证等）。" },
      { title: "选择运输方式", detail: "海运（成本低，约 30–45 天）、空运（快但贵）、中欧班列（约 15–20 天，居中）。" },
      { title: "准备报关单证", detail: "合同、商业发票、装箱单、提单、原产地证等。" },
      { title: "进口报关与查验", detail: "向海关申报，可能被查验；特殊商品需检验检疫。" },
      { title: "缴纳税费", detail: "关税 + 进口环节增值税（部分商品另征消费税）。" },
      { title: "放行与国内配送", detail: "提货、入仓、国内干线与落地配。" },
    ],
    documents: ["购销合同", "商业发票", "装箱单", "提单/运单", "原产地证（享协定税率）", "报关委托书", "产品准入证明（CCC / 注册证等）"],
    departments: ["海关总署（含检验检疫职能）", "税务局（进口环节增值税）", "市场监督管理局（产品合规）"],
    risks: ["HS 编码归类错误导致补税与滞纳金", "缺少准入证书（CCC/NMPA）被扣货", "未提供原产地证多缴关税", "旺季舱位紧张与运价波动", "DDP 条款下境外发货人承担境内清关风险"],
    tips: ["提前与报关行确认 HS 编码与监管条件", "申请原产地证以适用协定税率", "首批小批量试运验证流程", "中欧班列适合中高值、时效敏感货物", "保税仓可延缓缴税、改善现金流"],
    faq: [
      { q: "进口要交哪些税？", a: "关税（按 HS 税率）+ 进口环节增值税（通常 13%），部分商品另征消费税。" },
      { q: "中欧班列值得用吗？", a: "时效约为海运一半、成本约为空运的三分之一，适合中高值且时效敏感的货物。" },
    ],
    relatedCities: ["上海", "宁波"],
    sourceUrl: "http://www.customs.gov.cn",
  },
  {
    slug: "china-trade-fairs", category: "展会",
    title: { zh: "参加中国展会（进博会 / 广交会）获客", en: "Exhibit at Chinese trade fairs (CIIE / Canton Fair)", fr: "Exposer aux salons chinois (CIIE / Foire de Canton)" },
    time: "3–6 个月准备", cost: "¥50k–300k", difficulty: "中",
    summary: {
      zh: "展会仍是中国 B2B 获客与渠道对接的高效方式。进博会面向进口品牌，广交会侧重出口采购，行业展则精准触达垂直客户。",
      en: "Trade fairs remain an efficient B2B channel in China: CIIE targets import brands, Canton Fair export sourcing, and vertical shows reach niche buyers.",
      fr: "Les salons restent efficaces en B2B : le CIIE vise les marques importées, la Foire de Canton le sourcing export.",
    },
    steps: [
      { title: "选择展会", detail: "进博会（CIIE，进口导向）、广交会（Canton Fair，出口导向）、行业展（如 CMEF 医疗、工博会）。" },
      { title: "报名与选位", detail: "通过主办方或代理报名；越早报名展位位置越好。" },
      { title: "预算与展位设计", detail: "展位费、搭建、物流、差旅与人员成本。" },
      { title: "展品运输与报关", detail: "使用 ATA 单证册办理暂时进口，或按展览品报关。" },
      { title: "签证与人员", detail: "办理商务签证（M 签），准备口译与中文销售资料。" },
      { title: "展前预约客户", detail: "提前 4–6 周邀约目标客户/经销商并排定会谈。" },
      { title: "展中与展后跟进", detail: "收集线索，30 天内跟进转化。" },
    ],
    documents: ["参展合同", "中文企业与产品资料", "ATA 单证册或展品报关资料", "展品清单", "邀请函（签证用）", "样品与宣传物料"],
    departments: ["展会主办方（如中国国际进口博览局、中国进出口商品交易会）", "海关（展品报关 / ATA）", "中国驻外使领馆（签证）"],
    risks: ["展品清关延误错过开展", "未提前邀约导致到场无效客流", "仅英文物料转化差", "展会现场仿制与知识产权风险", "旺季差旅与酒店成本高"],
    tips: ["首次可先以观众身份考察一届再决定参展", "ATA 单证册可免税暂时进口展品，展后复运出境", "准备中文资料与微信二维码承接线索", "展位靠近主通道或龙头企业效果更好", "参展前先完成商标/外观专利布局"],
    faq: [
      { q: "广交会还是进博会？", a: "想把商品卖进中国选进博会（进口导向）；想找中国供应商或做出口选广交会。" },
      { q: "展品能免税带进吗？", a: "可用 ATA 单证册办理暂时进口，展后复运出境；若在现场销售则需正式报关缴税。" },
    ],
    relatedCities: ["上海", "广州"],
    sourceUrl: "https://www.cantonfair.org.cn",
  },
  {
    slug: "wechat-marketing", category: "微信营销",
    title: { zh: "用微信生态做品牌与私域运营", en: "Build brand and private-domain traffic on WeChat", fr: "Développer sa marque et son trafic privé sur WeChat" },
    time: "持续", cost: "¥30k+/月", difficulty: "中",
    summary: {
      zh: "微信是中国最重要的用户触点。公众号、小程序、企业微信与视频号构成从内容到成交再到复购的私域闭环。",
      en: "WeChat is China's key customer touchpoint: official accounts, mini-programs, WeCom and Channels form a private-domain loop from content to purchase to repeat.",
      fr: "WeChat est le point de contact clé en Chine : comptes officiels, mini-programmes, WeCom et Channels forment une boucle privée.",
    },
    steps: [
      { title: "注册与认证账号", detail: "公众号（服务号/订阅号）认证通常需中国营业执照与对公账户。" },
      { title: "搭建内容阵地", detail: "服务号（每月 4 次群发、可接支付）vs 订阅号（每日 1 次、偏内容）。" },
      { title: "开发小程序", detail: "商城/工具/预约，承接交易与服务。" },
      { title: "用企业微信做私域", detail: "将客户沉淀到企微，做 1 对 1 与社群运营。" },
      { title: "视频号与直播", detail: "短视频与直播引流，可与小程序打通成交。" },
      { title: "广告投放", detail: "朋友圈广告/公众号广告按地域与人群定向。" },
      { title: "数据与复购", detail: "用标签与自动化做分层触达和复购。" },
    ],
    documents: ["中国营业执照（认证用）", "对公账户", "品牌授权", "小程序类目资质（如食品经营许可）", "广告与内容合规材料"],
    departments: ["商业平台（腾讯），无政府审批", "内容与广告需符合《广告法》；医疗/食品等类目需额外资质"],
    risks: ["无中国主体难以完成认证（功能受限）", "诱导分享等违规被封禁", "小程序类目资质不全被驳回", "纯广告内容打开率低", "私域运营需长期人力投入"],
    tips: ["服务号更适合品牌转化（可支付、可模板消息）", "用企微 + 社群提升复购", "小程序比 H5 的体验与留存更好", "朋友圈广告适合区域小规模测试", "内容要本地化重做，而非直接翻译欧洲素材"],
    faq: [
      { q: "没有中国公司能做微信吗？", a: "可注册海外主体公众号但功能受限；建议通过代运营或合资主体完成认证，以解锁支付与小程序。" },
      { q: "公众号还是小程序？", a: "公众号做内容与触达，小程序做交易与服务，通常配合使用。" },
    ],
    sourceUrl: "https://mp.weixin.qq.com",
  },
  {
    slug: "douyin-ecommerce", category: "抖音",
    title: { zh: "抖音电商与直播带货入门", en: "Getting started with Douyin e-commerce and livestream selling", fr: "Débuter avec le e-commerce et le live sur Douyin" },
    time: "2–4 个月起步", cost: "¥100k+/月", difficulty: "高",
    summary: {
      zh: "抖音是中国增长最快的兴趣电商渠道，内容即货架。短视频种草 + 直播成交 + 千川投放可快速起量，但对内容与供应链要求高。",
      en: "Douyin is China's fastest-growing interest-based commerce channel — content is the shelf. Video seeding + livestream + paid traffic scale fast but demand strong content and supply chain.",
      fr: "Douyin est le canal de commerce d'intérêt à plus forte croissance : le contenu est le rayon.",
    },
    steps: [
      { title: "开通抖音小店", detail: "以企业资质入驻，选择类目并缴纳保证金。" },
      { title: "账号与内容定位", detail: "品牌自播号 + 达人矩阵，明确人群与卖点。" },
      { title: "短视频种草", detail: "高频产出测试内容，跑出爆款素材模型。" },
      { title: "直播带货", detail: "品牌自播（稳定）+ 达人带货（爆发），设计货盘与话术。" },
      { title: "千川投放", detail: "用巨量千川放大已跑通的素材与直播间。" },
      { title: "供应链与履约", detail: "备货、发货时效与退换货（平台考核严格）。" },
      { title: "数据复盘", detail: "GMV、UV 价值、退货率与 ROI 持续优化。" },
    ],
    documents: ["营业执照与类目资质", "品牌授权 / 商标注册证", "质检报告", "类目保证金", "店铺与商品资料"],
    departments: ["商业平台（字节跳动），无政府审批", "宣传需符合《广告法》与《电子商务法》"],
    risks: ["退货率高侵蚀利润（服饰类尤甚）", "达人坑位费与 ROI 不确定", "违规宣传被扣分或封禁", "发货时效不达标被处罚", "只投流不做内容难以持续"],
    tips: ["先用少量达人测品再放量", "自播稳住基本盘，达人做爆发", "重视退货率与履约体验分", "素材要有“内容感”而非硬广", "类目保证金与资质提前备齐"],
    faq: [
      { q: "需要中国公司吗？", a: "抖音小店通常需中国营业执照；海外品牌可通过跨境店或代运营（TP）入驻。" },
      { q: "多久能起量？", a: "通常需 2–4 个月跑通内容与货盘模型，且需持续投入。" },
    ],
    sourceUrl: "https://www.douyin.com",
  },
  {
    slug: "hiring-in-china", category: "招聘",
    title: { zh: "在中国招聘与用工合规", en: "Hiring and employment compliance in China", fr: "Recrutement et conformité de l'emploi en Chine" },
    time: "1–3 个月", cost: "视岗位而定", difficulty: "中",
    summary: {
      zh: "中国劳动法对劳动者保护较强。合规的书面劳动合同、社保公积金与外籍员工工作许可，是外资企业用工的三大基础。",
      en: "China's labor law is employee-protective. Written contracts, mandatory social insurance and work permits for foreigners are the three pillars of compliant hiring.",
      fr: "Le droit du travail chinois protège fortement les salariés : contrat écrit, cotisations sociales et permis de travail sont essentiels.",
    },
    steps: [
      { title: "确定用工模式", detail: "直接雇佣（需实体）、劳务派遣、外包，或用 PEO/EOR 过渡。" },
      { title: "招聘渠道", detail: "猎头、BOSS 直聘/智联/前程无忧、校园招聘。" },
      { title: "签订书面劳动合同", detail: "须在用工之日起一个月内签订，否则需支付双倍工资。" },
      { title: "约定试用期", detail: "试用期长度与合同期限挂钩（三年以上合同最长 6 个月）。" },
      { title: "办理社保与公积金", detail: "五险一金按当地基数缴纳，属强制义务。" },
      { title: "外籍员工工作许可", detail: "工作许可通知 → Z 签证 → 居留许可，分 A/B/C 类。" },
      { title: "日常合规", detail: "考勤、加班费、个税代扣代缴，规章制度需民主程序与公示。" },
    ],
    documents: ["劳动合同", "员工登记表与学历/背景材料", "社保公积金开户资料", "外籍员工学位证与无犯罪记录（领事认证）", "体检报告", "员工手册与规章制度"],
    departments: ["人力资源和社会保障局", "社保中心与住房公积金管理中心", "外国人来华工作管理服务系统", "公安出入境管理部门", "税务局（个税）"],
    risks: ["未签书面合同需支付双倍工资", "违法解除需支付赔偿金（2N）", "社保未足额缴纳被稽查补缴", "外籍人员无证工作被罚款并遣返", "规章制度未公示不能作为处罚依据"],
    tips: ["设立实体前可用 PEO/EOR 先雇人", "试用期解除也需有依据与证据留存", "竞业限制须按月支付补偿方才有效", "社保按实际工资基数缴纳，勿按最低基数", "提前 2–3 个月启动外籍员工工作许可"],
    faq: [
      { q: "没有实体能雇人吗？", a: "可通过 PEO/EOR 或劳务派遣过渡，但长期建议设立实体。" },
      { q: "外籍员工需要什么？", a: "工作许可（A/B/C 类）+ Z 签证 + 居留许可，通常需学历与工作经历证明并办理领事认证。" },
    ],
    sourceUrl: "http://www.mohrss.gov.cn",
  },
  {
    slug: "ip-protection-china", category: "知识产权",
    title: { zh: "在中国保护知识产权（专利 / 海关备案 / 维权）", en: "Protecting IP in China (patents, customs recordal, enforcement)", fr: "Protéger la PI en Chine (brevets, douanes, contentieux)" },
    time: "6–24 个月", cost: "¥20k–200k", difficulty: "中",
    summary: {
      zh: "中国实行注册在先原则，IP 布局必须先于市场进入。专利、商标与海关知识产权备案组合使用，才能有效防仿与维权。",
      en: "China is first-to-file: IP must be filed before market entry. Patents, trademarks and customs recordal together deter copying and enable enforcement.",
      fr: "La Chine applique le premier-déposant : déposer avant d'entrer. Brevets, marques et enregistrement douanier permettent l'action.",
    },
    steps: [
      { title: "IP 盘点与布局规划", detail: "梳理商标、发明/实用新型/外观专利、著作权与商业秘密。" },
      { title: "商标注册", detail: "中英文 + 图形，覆盖核心与防御类别（详见「注册商标」攻略）。" },
      { title: "专利申请", detail: "发明（审查约 2–3 年）；实用新型与外观设计（约 6–12 个月，不做实质审查）。" },
      { title: "著作权登记", detail: "软件与美术作品登记，便于举证。" },
      { title: "海关知识产权备案", detail: "在海关总署备案后，海关可主动查扣侵权货物。" },
      { title: "监测与取证", detail: "监测电商平台与展会，发现侵权先做公证取证。" },
      { title: "维权", detail: "平台投诉、行政查处（市场监管）、民事诉讼或刑事报案。" },
    ],
    documents: ["主体资格证明", "商标图样与类别清单", "专利说明书与权利要求书", "著作权样本", "海关备案申请与权属证明", "侵权证据与公证书"],
    departments: ["国家知识产权局（CNIPA，含商标局与专利局）", "海关总署", "市场监督管理局", "人民法院"],
    risks: ["进入前未注册被抢注，反被起诉", "仅在欧洲有专利、中国无保护（专利具地域性）", "未布局实用新型/外观导致仿制难阻止", "证据不足导致维权失败", "诉讼周期长、成本高"],
    tips: ["进入市场前 12 个月启动 IP 布局", "可用 PCT / 马德里体系进入中国以简化流程", "外观设计专利申请快，对防仿非常有效", "做海关备案可拦截侵权货物", "发现侵权先公证取证再投诉"],
    faq: [
      { q: "欧洲的专利在中国有效吗？", a: "无效。专利具有地域性，需通过 PCT 或直接在中国申请。" },
      { q: "最快的防仿手段？", a: "外观设计专利（约 6–12 个月）+ 商标 + 电商平台投诉通道，并配合海关备案。" },
    ],
    sourceUrl: "https://www.cnipa.gov.cn",
  },
  {
    slug: "nmpa-medical-device", category: "医疗器械",
    title: { zh: "医疗器械 NMPA 注册进入中国", en: "NMPA registration for medical devices in China", fr: "Enregistrement NMPA des dispositifs médicaux en Chine" },
    time: "1–3 年（II/III 类）", cost: "¥200k–2M", difficulty: "高",
    summary: {
      zh: "医疗器械进入中国须经国家药监局（NMPA）注册或备案。按风险分为 I/II/III 类，类别决定路径、周期与成本，III 类最严。",
      en: "Medical devices need NMPA registration or filing to enter China. Risk class (I/II/III) drives the pathway, timeline and cost — class III is the strictest.",
      fr: "Les dispositifs médicaux exigent un enregistrement NMPA. La classe de risque (I/II/III) détermine le parcours et le coût.",
    },
    steps: [
      { title: "产品分类界定", detail: "依《医疗器械分类目录》确定 I/II/III 类；不明确时可申请分类界定。" },
      { title: "指定境内代理人", detail: "境外厂商须委托中国境内企业作为代理人承担相应责任。" },
      { title: "准备技术文件", detail: "产品技术要求、说明书、质量体系、生物相容性等资料。" },
      { title: "型式检验", detail: "送 NMPA 认可的检验机构进行检测。" },
      { title: "临床评价 / 临床试验", detail: "可走同品种比对争取豁免；III 类高风险产品常需在中国开展临床试验。" },
      { title: "提交注册申请", detail: "I 类备案（市级）、II 类（省级）、III 类（国家级 NMPA）。" },
      { title: "技术审评与发证", detail: "审评、发补、体系核查后取得注册证（有效期 5 年）。" },
      { title: "上市后与延续", detail: "不良事件监测、变更注册，到期前及时办理延续。" },
    ],
    documents: ["境外上市证明（CE 证书 / 自由销售证明）", "产品技术要求", "型式检验报告", "临床评价资料", "质量管理体系文件", "境内代理人委托书", "中文说明书与标签"],
    departments: ["国家药品监督管理局（NMPA）及省/市级药监部门", "NMPA 认可的检验机构", "海关（进口环节）"],
    risks: ["分类判定错误导致整体路径出错", "临床试验成本与周期不可控", "发补（补充资料）反复拉长周期", "代理人选择不当影响责任划分与沟通", "注册证到期未延续导致断供"],
    tips: ["尽早做分类界定，它决定整体路径", "优先争取临床评价豁免（同品种比对）", "CE 资料不能直接套用，需按中国要求重整", "预留 1–3 年周期与充足预算", "可先以 II 类产品试水再推 III 类"],
    faq: [
      { q: "有 CE 证就能在中国卖吗？", a: "不能。必须单独取得 NMPA 注册/备案，CE 资料仅作支持性材料。" },
      { q: "一定要做中国临床试验吗？", a: "不一定。可通过同品种临床评价争取豁免，但 III 类高风险产品通常需在中国开展临床。" },
    ],
    relatedCities: ["上海", "苏州", "深圳"],
    sourceUrl: "https://www.nmpa.gov.cn",
  },
  {
    slug: "b2b-sales-china", category: "销售",
    title: { zh: "在中国建立 B2B 销售体系（直销 / 经销）", en: "Build a B2B sales system in China (direct vs distributors)", fr: "Construire un système de vente B2B en Chine" },
    time: "3–6 个月", cost: "¥100k+/年", difficulty: "中",
    summary: {
      zh: "中国 B2B 销售依赖本地化服务、渠道关系与回款管理。选直销还是经销代理，决定你的控制力、成本与扩张速度。",
      en: "B2B selling in China hinges on local service, channel relationships and collections. Direct vs distributor decides control, cost and speed.",
      fr: "La vente B2B en Chine repose sur le service local, les canaux et le recouvrement : direct ou distributeur change tout.",
    },
    steps: [
      { title: "明确销售模式", detail: "直销（控制力强、成本高）vs 经销代理（覆盖快、让渡利润与控制）vs 混合。" },
      { title: "客户分层与定价", detail: "按行业/规模分层，设计价格体系与折扣政策（防窜货）。" },
      { title: "招募与筛选经销商", detail: "考察渠道资源、资金实力、服务能力与合规记录。" },
      { title: "签订经销协议", detail: "明确区域、独家性、任务量、价格、退换货与知识产权条款。" },
      { title: "组建本地销售团队", detail: "销售 + 售前技术 + 售后，薪酬通常为底薪 + 提成。" },
      { title: "招投标与合规", detail: "国企/政府项目需走招投标；严格反商业贿赂合规。" },
      { title: "回款与信用管理", detail: "账期管理、开具增值税专票、应收账款风险控制。" },
    ],
    documents: ["经销协议", "价格政策文件", "销售合同模板", "增值税专用发票资质", "中文产品资料", "招投标资质文件"],
    departments: ["商业流程，无政府审批", "招投标涉及公共资源交易中心", "合同与发票涉及税务局"],
    risks: ["经销商窜货与低价扰乱价格体系", "账期长、回款难、坏账风险", "独家授权给错误伙伴锁死市场", "商业贿赂风险（欧洲母公司受本国反腐败法约束）", "销售过度依赖个人关系，人走客户走"],
    tips: ["先用经销商快速验证市场，再在核心区域自建直销", "协议中设置区域与价格管控条款并留退出机制", "B2B 客户普遍要求增值税专票，影响纳税人身份选择", "用 CRM 沉淀客户资产而非依赖销售个人", "对销售团队做反腐败合规培训"],
    faq: [
      { q: "直销还是找经销商？", a: "客单价高、需深度服务选直销；标准化、需快速覆盖选经销商。多数企业先经销、后在核心区域转直销。" },
      { q: "账期一般多长？", a: "B2B 常见 30–90 天，国企与大客户可能更长，需预留现金流。" },
    ],
  },
  {
    slug: "china-marketing-mix", category: "营销",
    title: { zh: "中国数字营销全景与预算分配", en: "China digital marketing landscape and budget allocation", fr: "Panorama du marketing digital chinois et allocation budgétaire" },
    time: "持续", cost: "¥100k+/月", difficulty: "中",
    summary: {
      zh: "中国营销生态与欧美完全不同：没有 Google/Facebook，流量集中在微信、抖音、小红书、B站与电商站内。理解各平台角色与预算配比是第一步。",
      en: "China's marketing stack differs entirely from the West — no Google/Facebook. Traffic sits in WeChat, Douyin, Xiaohongshu, Bilibili and on-platform commerce.",
      fr: "L'écosystème marketing chinois n'a ni Google ni Facebook : le trafic est sur WeChat, Douyin, Xiaohongshu, Bilibili.",
    },
    steps: [
      { title: "明确目标与人群", detail: "品牌认知 / 线索获取 / 电商转化，目标不同则平台组合不同。" },
      { title: "平台选型", detail: "微信（私域与转化）、小红书（种草）、抖音（兴趣电商）、B站（年轻/科技）、知乎（专业）、微博（热点）。" },
      { title: "搜索与站内", detail: "百度 SEO/SEM 承接主动搜索；电商站内（直通车等）承接购买意图。" },
      { title: "内容本地化", detail: "重做而非翻译：中文品牌名、本地视觉与使用场景。" },
      { title: "KOL/KOC 组合", detail: "头部造势 + 腰尾部铺量 + 素人 UGC。" },
      { title: "预算分配与测试", detail: "小预算多平台测试，跑出 ROI 后集中投入。" },
      { title: "度量与归因", detail: "平台数据割裂，需建立统一口径并把流量回流到私域。" },
    ],
    documents: ["营销策略与预算表", "内容排期表", "KOL 名单与合同", "中文品牌视觉规范", "广告合规审查清单"],
    departments: ["商业运营，无政府审批", "广告内容须符合《广告法》：禁绝对化用语、需标明广告"],
    risks: ["照搬欧洲素材水土不服", "平台数据孤岛导致归因困难", "刷量与虚假流量", "违反广告法被处罚", "只买流量不建私域，获客成本持续上升"],
    tips: ["先用小红书/抖音种草测试需求，再放大投放", "把流量沉淀到微信私域以降低长期获客成本", "中文品牌名尽早注册并全渠道统一", "预留 10–20% 预算做持续测试"],
    faq: [
      { q: "中国没有 Google/Facebook 怎么投？", a: "用百度做搜索，抖音/小红书/微信做内容与社交，电商站内广告承接转化。" },
      { q: "预算怎么分？", a: "早期可按内容种草 60% / 效果投放 20% / 私域与测试 20% 起步，跑通后按 ROI 调整。" },
    ],
  },
  {
    slug: "sourcing-from-china", category: "采购",
    title: { zh: "从中国采购的完整流程与风控", en: "End-to-end sourcing from China and risk control", fr: "Sourcing depuis la Chine : processus et maîtrise des risques" },
    time: "1–3 个月", cost: "视订单而定", difficulty: "中",
    summary: {
      zh: "从中国采购涉及寻源、比价、合同、质控、物流与付款六个环节。系统化流程能把质量与资金风险降到可控范围。",
      en: "Sourcing from China spans sourcing, quoting, contracting, QC, logistics and payment. A systematic process keeps quality and cash risk contained.",
      fr: "Le sourcing en Chine couvre recherche, devis, contrat, contrôle qualité, logistique et paiement.",
    },
    steps: [
      { title: "需求与规格定义", detail: "明确规格、数量、质量标准、交期与目标价。" },
      { title: "寻源与询价", detail: "1688（内贸价）、阿里国际站、广交会、行业展会或采购代理。" },
      { title: "供应商评估", detail: "核验营业执照、出口资质、产能、认证与过往客户。" },
      { title: "比价与谈判", detail: "至少 3 家比价；明确含税/不含税、FOB/EXW、MOQ 与阶梯价。" },
      { title: "签订采购合同", detail: "规格、验收标准、交期、违约责任、付款方式与争议解决。" },
      { title: "生产跟单与验货", detail: "过程跟进 + 出货前第三方验货（AQL 抽检）。" },
      { title: "物流与付款", detail: "安排运输报关；用 T/T 分期或信用证（L/C）控制风险。" },
    ],
    documents: ["采购规格书", "供应商资质文件", "报价比价表", "采购合同", "验货报告", "形式发票（PI）", "装箱单与提单"],
    departments: ["商业流程，无政府审批", "出口环节涉及中国海关", "第三方验货机构（SGS / TÜV / BV）"],
    risks: ["贸易商加价冒充工厂", "样品与量产质量不一致", "预付款后跑单或无法交付", "汇率波动侵蚀利润", "春节前后产能紧张导致交期延误"],
    tips: ["春节（1–2 月）前后产能紧张，提前 2–3 个月下单", "用 30/70 或 30/40/30 分期付款绑定质量节点", "大额订单用信用证（L/C）或第三方担保", "务必安排出货前第三方验货", "人民币结算通常可议价，但需管理汇率风险"],
    faq: [
      { q: "1688 比阿里国际站便宜吗？", a: "通常更便宜（面向内贸），但多数供应商不支持出口与英文沟通，需借助采购代理。" },
      { q: "怎么防止被骗？", a: "核验营业执照、实地或视频验厂、分期付款、出货前第三方验货，大额订单用信用证。" },
    ],
    relatedCities: ["深圳", "宁波", "义乌"],
  },
  {
    slug: "brand-building-china", category: "品牌建设",
    title: { zh: "欧洲品牌在中国的品牌建设与本地化", en: "Brand building and localization for European brands in China", fr: "Construction de marque et localisation en Chine" },
    time: "6–12 个月", cost: "¥200k+", difficulty: "高",
    summary: {
      zh: "品牌进入中国不只是翻译。中文品牌名、本土叙事、社媒资产与口碑体系，决定消费者是否认你、记住你、愿意为你溢价。",
      en: "Branding in China is not translation. A Chinese name, local narrative, social assets and word-of-mouth decide recognition, recall and price premium.",
      fr: "La marque en Chine ne se traduit pas : nom chinois, récit local et bouche-à-oreille décident de la reconnaissance et du premium.",
    },
    steps: [
      { title: "中文品牌命名", detail: "音译 / 意译 / 音意结合；检查商标可注册性与负面谐音。" },
      { title: "商标与账号先行", detail: "注册中英文商标，抢注微信/微博/小红书/抖音账号与域名。" },
      { title: "品牌定位与叙事", detail: "找到对中国消费者成立的价值主张，而非照搬欧洲。" },
      { title: "视觉与内容体系", detail: "中文视觉规范、包装本地化、内容支柱。" },
      { title: "建立口碑资产", detail: "在小红书/知乎/B站沉淀真实测评与 UGC。" },
      { title: "渠道与体验一致性", detail: "线上线下、客服话术与售后保持统一。" },
      { title: "长期度量", detail: "品牌搜索指数、心智份额、溢价能力与复购率。" },
    ],
    documents: ["品牌命名与商标检索报告", "商标注册证", "中文品牌手册", "内容与视觉规范", "社媒账号矩阵清单"],
    departments: ["商业运营，无政府审批", "商标涉及国家知识产权局", "广告内容须符合《广告法》"],
    risks: ["中文名被抢注或存在负面谐音", "照搬欧洲定位在本地不成立", "社媒账号被他人抢占", "只做投放不建口碑，停投即停量", "渠道价格混乱损害品牌形象"],
    tips: ["中文名进入市场前就注册商标，否则可能被抢注后反被索赔", "让中国团队与真实消费者参与命名和定位测试", "把“欧洲原产”翻译成对中国用户的具体好处，而非标签", "小红书笔记/知乎回答等口碑资产是长期护城河"],
    faq: [
      { q: "一定要中文名吗？", a: "强烈建议。搜索、口传与电商检索都依赖中文名；你不取，市场会替你取一个你无法控制的。" },
      { q: "品牌多久见效？", a: "通常 6–12 个月建立初步认知，2–3 年才形成心智与溢价。" },
    ],
    relatedCities: ["上海", "杭州"],
  },
  {
    slug: "financing-in-china", category: "融资",
    title: { zh: "在中国融资与申请政府扶持", en: "Financing and government incentives in China", fr: "Financement et aides publiques en Chine" },
    time: "6–12 个月", cost: "视轮次而定", difficulty: "高",
    summary: {
      zh: "外资企业在华可通过股权融资、银行信贷与政府扶持获得资金。政府引导基金与园区补贴常被忽视，却是落地早期的重要杠杆。",
      en: "FIEs can raise equity, borrow, or tap government support. Guidance funds and park incentives are often overlooked but are key early leverage.",
      fr: "Les entreprises étrangères peuvent lever des fonds, emprunter ou obtenir des aides publiques — souvent sous-estimées.",
    },
    steps: [
      { title: "明确资金用途与结构", detail: "股权 vs 债权；境内主体融资 vs 境外母公司融资。" },
      { title: "梳理实体与股权架构", detail: "WFOE / 合资 / 受限行业的特殊安排，影响外资准入与退出。" },
      { title: "股权融资", detail: "接触人民币基金、产业资本（CVC）与政府引导基金。" },
      { title: "政府扶持与补贴", detail: "园区落户奖励、研发补贴、人才补贴、高新技术企业认定（所得税降至 15%）。" },
      { title: "银行信贷", detail: "外资企业可申请，通常需抵押或母公司担保。" },
      { title: "尽调与交割", detail: "财务/法律/税务尽调，注意历史合规问题。" },
      { title: "外汇与出资", detail: "外方出资需办理外汇登记；资本金结汇有用途限制。" },
    ],
    documents: ["中文商业计划书", "公司章程与股权结构图", "审计报告与财务预测", "高新技术企业申报材料", "园区落户协议", "外汇登记材料"],
    departments: ["商务主管部门（外资）", "市场监督管理局", "外汇管理局（SAFE）", "科技部门（高新认定）", "地方园区管委会", "银行"],
    risks: ["外资准入负面清单限制部分行业的股权结构与融资", "资本金结汇用途受限，不能随意使用", "政府补贴通常要求实际经营、纳税与就业落地", "估值与对赌条款风险", "退出（分红/股权转让）涉及税务与外汇审批"],
    tips: ["落户前先与园区谈奖励与补贴，落户后议价能力显著下降", "争取高新技术企业认定，企业所得税从 25% 降至 15%", "人民币基金更看重本地落地与营收，而非海外故事", "预留外汇登记与结汇的时间", "补贴申报有窗口期，错过通常要等一年"],
    faq: [
      { q: "外资企业能拿政府补贴吗？", a: "可以。多数园区与科技类补贴对内外资一视同仁，但通常要求当地有实体、纳税与就业。" },
      { q: "母公司能直接给钱吗？", a: "可以，通过增资（资本金）或外债（需外债额度登记），两者的外汇与税务处理不同。" },
    ],
    sourceUrl: "http://www.mofcom.gov.cn",
  },
  {
    slug: "robotics-market-china", category: "机器人",
    title: { zh: "机器人企业进入中国市场", en: "Entering China's robotics market", fr: "Entrer sur le marché chinois de la robotique" },
    time: "6–12 个月", cost: "¥300k+", difficulty: "高",
    summary: {
      zh: "中国是全球最大工业机器人市场，同时人形/服务机器人爆发。本土厂商性价比强、政策扶持密集，欧洲企业需以高精度、可靠性与行业 know-how 切入。",
      en: "China is the world's largest industrial-robot market with humanoid/service robotics surging. Local players compete on price — foreign firms win on precision, reliability and domain know-how.",
      fr: "La Chine est le premier marché de robots industriels : les acteurs étrangers gagnent sur la précision et le savoir-faire métier.",
    },
    steps: [
      { title: "细分选择", detail: "工业机器人（汽车/3C/焊接）、协作机器人、AGV/AMR、人形与服务机器人。" },
      { title: "市场与竞争评估", detail: "对标发那科/ABB/库卡与本土厂商（埃斯顿、汇川、宇树等），明确差异化。" },
      { title: "准入与安全合规", detail: "电气安全与 EMC；部分产品涉及 CCC；特种设备另有要求。" },
      { title: "渠道与系统集成商", detail: "中国市场高度依赖系统集成商（SI），选对 SI 等于选对客户。" },
      { title: "本地化与服务", detail: "本地备件、工程师与响应时效是采购决策关键。" },
      { title: "本地生产或合资", detail: "本地组装可降本，并满足客户对交期与国产化的要求。" },
      { title: "政策与园区", detail: "对接地方智能制造/机器人产业扶持政策。" },
    ],
    documents: ["产品技术资料与安全认证", "CCC 证书（如适用）", "系统集成商合作协议", "本地服务与备件方案", "专利布局清单"],
    departments: ["市场监督管理局（产品合规/CCC）", "工业和信息化主管部门（产业政策）", "地方园区管委会", "海关（进口）"],
    risks: ["本土厂商价格战压缩利润", "核心技术被逆向与人才流失", "缺乏本地服务导致客户流失", "国产替代导向使部分招标偏向本土厂商", "账期长占用现金流"],
    tips: ["用系统集成商快速进入行业场景，而非直接做终端客户", "IP（专利 + 外观）必须前置布局", "本地服务能力是溢价的关键理由", "关注地方机器人/智能制造专项补贴", "从高精度、高可靠性细分切入而非拼价格"],
    faq: [
      { q: "中国机器人市场还有外资机会吗？", a: "有。高端工业机器人、精密减速器/伺服、特殊工艺 know-how 与高可靠性场景仍以外资为主。" },
      { q: "一定要本地生产吗？", a: "不必然，但本地组装与备件能显著改善交期、成本与中标概率。" },
    ],
    relatedCities: ["深圳", "上海", "苏州", "杭州"],
    sourceUrl: "https://www.miit.gov.cn",
  },
  {
    slug: "nev-market-china", category: "新能源",
    title: { zh: "新能源与动力电池企业进入中国", en: "Entering China's new-energy and battery market", fr: "Entrer sur le marché chinois des énergies nouvelles et batteries" },
    time: "6–18 个月", cost: "¥500k+", difficulty: "高",
    summary: {
      zh: "中国是全球最大的新能源汽车与动力电池市场，产业链完整、竞争极度激烈。外资多以技术、材料、装备或合资形式参与，而非整车硬拼。",
      en: "China is the largest NEV and battery market with a complete, fiercely competitive supply chain. Foreign players usually enter via technology, materials, equipment or JVs.",
      fr: "La Chine est le premier marché VE et batteries : les étrangers entrent surtout par la technologie, les matériaux ou des coentreprises.",
    },
    steps: [
      { title: "定位价值链环节", detail: "整车、电池、材料（正负极/电解液/隔膜）、装备、充电与储能。" },
      { title: "评估竞争与准入", detail: "对标比亚迪/宁德时代等头部；乘用车制造外资股比限制已取消。" },
      { title: "合规与认证", detail: "车辆需强制性认证与公告；电池涉 GB 强标与安全测试；储能另有并网要求。" },
      { title: "供应链与合作", detail: "与本土电池/材料/整车厂建立配套或合资关系。" },
      { title: "本地化生产", detail: "客户与政策普遍要求本地供应以保交期与降本。" },
      { title: "补贴与政策", detail: "国家购车补贴已退坡，转向以旧换新、地方消费补贴与产业落地扶持。" },
      { title: "出海联动", detail: "中国基地反向供应欧洲时，需关注欧盟反补贴调查与电池法规（碳足迹/回收）。" },
    ],
    documents: ["产品技术与安全测试报告", "强制性认证 / 公告材料", "合资或配套协议", "环评与安全生产许可（生产环节）", "碳足迹与合规文件（出口欧盟）"],
    departments: ["工业和信息化部（公告/准入）", "国家市场监督管理总局（CCC/强标）", "国家发展改革委（项目备案）", "生态环境部门（环评）", "地方园区管委会"],
    risks: ["价格战导致利润极薄", "技术被快速追赶与同质化", "阶段性产能过剩与账期压力", "欧盟对华电动车反补贴措施影响双向布局", "欧盟电池法对碳足迹与回收提出新要求"],
    tips: ["避开整车红海，从材料、装备、BMS、热管理等高壁垒环节切入", "与头部电池/整车厂绑定配套是最快路径", "关注地方新能源专项补贴与用地/用电优惠", "提前布局碳足迹数据以满足欧盟电池法"],
    faq: [
      { q: "外资还能造整车吗？", a: "可以，乘用车外资股比限制已取消；但整车竞争极为激烈，多数外资选择合资或聚焦细分。" },
      { q: "现在还有补贴吗？", a: "国家购车补贴已退坡结束，现以以旧换新、地方消费补贴与产业落地（用地/税收/研发）扶持为主。" },
    ],
    relatedCities: ["深圳", "上海", "合肥", "常州"],
    sourceUrl: "https://www.miit.gov.cn",
  },
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
