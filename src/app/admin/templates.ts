// Curated, real, verifiable starting points for the admin entry wizards.
// These are well-known facts (landmark laws / major listed manufacturers) used
// only to PREFILL a new-entry form — the admin reviews and can edit everything
// before saving. Numeric/volatile fields (capacity, risk score) are left blank
// on purpose rather than fabricated.

import type { Policy, Supplier } from "@/db/schema";

export type PolicyTemplate = Partial<Policy> & { slug: string; title: { zh: string; en: string; fr: string } };
export type SupplierTemplate = Partial<Supplier> & { slug: string; name: string };

// Real Chinese government portals (roots are stable; admin can paste a deep link).
export const policyOrgs: { name: string; url: string }[] = [
  { name: "国务院", url: "https://www.gov.cn" },
  { name: "全国人大常委会", url: "http://www.npc.gov.cn" },
  { name: "商务部", url: "http://www.mofcom.gov.cn" },
  { name: "工业和信息化部", url: "https://www.miit.gov.cn" },
  { name: "国家发展改革委", url: "https://www.ndrc.gov.cn" },
  { name: "海关总署", url: "http://www.customs.gov.cn" },
  { name: "国家网信办", url: "http://www.cac.gov.cn" },
  { name: "国家税务总局", url: "https://www.chinatax.gov.cn" },
  { name: "国家市场监督管理总局", url: "https://www.samr.gov.cn" },
  { name: "中国人民银行", url: "http://www.pbc.gov.cn" },
];

// Common, standard certifications for the supplier wizard's quick-add.
export const supplierCerts = [
  "ISO 9001", "IATF 16949", "ISO 14001", "ISO 13485", "ISO 22000",
  "CE", "RoHS", "REACH", "UL", "BRC", "HACCP", "FSC", "FDA",
];

export const policyTemplates: PolicyTemplate[] = [
  {
    slug: "foreign-investment-law", org: "全国人大", impact: "高", region: "全国", effectiveDate: "2020-01-01",
    date: "2019-03-15", sourceUrl: "https://www.gov.cn",
    title: { zh: "中华人民共和国外商投资法", en: "Foreign Investment Law of the PRC", fr: "Loi de la RPC sur l'investissement étranger" },
    summary: { zh: "确立外商投资准入前国民待遇加负面清单管理制度，保护外商投资合法权益，规范外商投资促进与管理。", en: "Establishes pre-establishment national treatment plus a negative list, protecting the rights of foreign investors.", fr: "Établit le traitement national avant établissement et une liste négative, protégeant les droits des investisseurs étrangers." },
    tags: ["外资", "投资", "法律"],
  },
  {
    slug: "data-security-law", org: "全国人大常委会", impact: "高", region: "全国", effectiveDate: "2021-09-01",
    date: "2021-06-10", sourceUrl: "http://www.npc.gov.cn",
    title: { zh: "中华人民共和国数据安全法", en: "Data Security Law of the PRC", fr: "Loi de la RPC sur la sécurité des données" },
    summary: { zh: "建立数据分类分级保护制度，规范数据处理活动，保障数据安全与开发利用。", en: "Creates a tiered data-classification protection regime and regulates data-processing activities.", fr: "Crée un régime de classification des données et encadre les activités de traitement." },
    tags: ["数据", "安全", "合规"],
  },
  {
    slug: "pipl", org: "全国人大常委会", impact: "高", region: "全国", effectiveDate: "2021-11-01",
    date: "2021-08-20", sourceUrl: "http://www.npc.gov.cn",
    title: { zh: "中华人民共和国个人信息保护法", en: "Personal Information Protection Law (PIPL)", fr: "Loi sur la protection des informations personnelles (PIPL)" },
    summary: { zh: "规范个人信息处理活动，明确处理规则、个人权利与处理者义务，个人信息跨境提供受限。", en: "Regulates personal-information processing; restricts cross-border transfers of personal data.", fr: "Encadre le traitement des données personnelles et restreint les transferts transfrontaliers." },
    tags: ["数据", "个人信息", "合规"],
  },
  {
    slug: "data-export-assessment", org: "国家网信办", impact: "高", region: "全国", effectiveDate: "2022-09-01",
    date: "2022-07-07", sourceUrl: "http://www.cac.gov.cn",
    title: { zh: "数据出境安全评估办法", en: "Measures for Security Assessment of Cross-border Data Transfer", fr: "Mesures d'évaluation de sécurité pour le transfert transfrontalier de données" },
    summary: { zh: "明确数据出境安全评估的适用情形、申报程序与评估要求。", en: "Defines when a cross-border data-transfer security assessment is required and the filing procedure.", fr: "Définit les cas nécessitant une évaluation de sécurité et la procédure de déclaration." },
    tags: ["数据出境", "合规", "网信办"],
  },
  {
    slug: "encouraged-fdi-catalogue", org: "国家发展改革委、商务部", impact: "高", region: "全国", effectiveDate: "2023-01-01",
    date: "2022-10-26", sourceUrl: "https://www.ndrc.gov.cn",
    title: { zh: "鼓励外商投资产业目录（2022年版）", en: "Catalogue of Industries Encouraging Foreign Investment (2022)", fr: "Catalogue des industries encourageant l'IDE (2022)" },
    summary: { zh: "扩大鼓励外商投资范围，引导外资投向先进制造、现代服务业及中西部地区。", en: "Expands encouraged sectors, steering FDI toward advanced manufacturing, services and central/western regions.", fr: "Élargit les secteurs encouragés, orientant l'IDE vers l'industrie avancée et les régions centrales." },
    tags: ["外资", "产业目录", "鼓励类"],
  },
  {
    slug: "rcep-entry", org: "商务部", impact: "高", region: "全国", effectiveDate: "2022-01-01",
    date: "2022-01-01", sourceUrl: "http://www.mofcom.gov.cn",
    title: { zh: "区域全面经济伙伴关系协定（RCEP）生效", en: "Regional Comprehensive Economic Partnership (RCEP) enters into force", fr: "Entrée en vigueur du RCEP" },
    summary: { zh: "区域内关税逐步削减，统一原产地累积规则，便利区域内贸易与供应链。", en: "Phases down tariffs and unifies rules of origin across member states, easing regional trade.", fr: "Réduit progressivement les tarifs et unifie les règles d'origine régionales." },
    tags: ["RCEP", "关税", "贸易协定"],
  },
];

export const supplierTemplates: SupplierTemplate[] = [
  {
    slug: "luxshare", name: "立讯精密 (Luxshare Precision)", category: "精密制造 / 连接器 / ODM", city: "东莞",
    products: ["连接器", "声学器件", "整机组装"], certs: ["ISO 9001", "IATF 16949", "ISO 14001"], exportMarkets: ["North America", "Europe"],
  },
  {
    slug: "sunwoda", name: "欣旺达 (Sunwoda)", category: "电池 PACK / 储能", city: "深圳",
    products: ["消费电池", "动力电池", "储能系统"], certs: ["ISO 9001", "IATF 16949", "UL"], exportMarkets: ["Europe", "Asia"],
  },
  {
    slug: "goertek", name: "歌尔股份 (GoerTek)", category: "声学 / 微电子 / 精密零组件", city: "潍坊",
    products: ["声学器件", "TWS 耳机", "传感器"], certs: ["ISO 9001", "IATF 16949"], exportMarkets: ["North America", "Europe", "Asia"],
  },
  {
    slug: "sunny-optical", name: "舜宇光学 (Sunny Optical)", category: "光学元件 / 镜头", city: "宁波",
    products: ["手机镜头", "车载镜头", "光学模组"], certs: ["ISO 9001", "IATF 16949"], exportMarkets: ["Europe", "Asia"],
  },
  {
    slug: "lens-technology", name: "蓝思科技 (Lens Technology)", category: "防护玻璃 / 结构件", city: "长沙",
    products: ["防护玻璃", "金属结构件", "陶瓷外观件"], certs: ["ISO 9001", "IATF 16949"], exportMarkets: ["North America", "Europe"],
  },
  {
    slug: "sanhua", name: "三花智控 (Sanhua)", category: "制冷 / 汽车热管理", city: "绍兴",
    products: ["电子膨胀阀", "热管理组件", "制冷部件"], certs: ["ISO 9001", "IATF 16949"], exportMarkets: ["Europe", "North America"],
  },
];
