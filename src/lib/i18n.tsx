"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "zh" | "en" | "fr";

type Dict = Record<string, { zh: string; en: string; fr: string }>;

// Central UI dictionary. AI output language is derived from the active lang.
export const dict: Dict = {
  "brand": { zh: "China MOS", en: "China MOS", fr: "China MOS" },
  "brand.full": {
    zh: "中国市场操作系统",
    en: "China Market Operating System",
    fr: "Système d'exploitation du marché chinois",
  },
  "nav.home": { zh: "首页", en: "Home", fr: "Accueil" },
  "nav.search": { zh: "AI 全局搜索", en: "AI Search", fr: "Recherche IA" },
  "nav.companies": { zh: "企业情报", en: "Companies", fr: "Entreprises" },
  "nav.industries": { zh: "行业情报", en: "Industries", fr: "Industries" },
  "nav.cities": { zh: "城市情报", en: "Cities", fr: "Villes" },
  "nav.supply": { zh: "供应链", en: "Supply Chain", fr: "Chaîne d'appro." },
  "nav.policy": { zh: "政策法规", en: "Policy", fr: "Politiques" },
  "nav.playbooks": { zh: "攻略中心", en: "Playbooks", fr: "Playbooks" },
  "nav.graph": { zh: "知识图谱", en: "Knowledge Graph", fr: "Graphe de connaissances" },
  "nav.consultant": { zh: "AI 咨询顾问", en: "AI Consultant", fr: "Consultant IA" },
  "nav.reports": { zh: "报告生成", en: "Reports", fr: "Rapports" },
  "nav.workspace": { zh: "咨询工作台", en: "Workspace", fr: "Espace de travail" },
  "nav.opportunities": { zh: "商机中心", en: "Opportunities", fr: "Opportunités" },
  "nav.compare": { zh: "对比分析", en: "Compare", fr: "Comparer" },
  "nav.groups.intel": { zh: "情报", en: "Intelligence", fr: "Intelligence" },
  "nav.groups.ai": { zh: "AI 工具", en: "AI Tools", fr: "Outils IA" },
  "nav.groups.collab": { zh: "协作", en: "Collaboration", fr: "Collaboration" },

  "hero.title": { zh: "中国市场操作系统", en: "China Market Operating System", fr: "Système d'exploitation du marché chinois" },
  "hero.l1": { zh: "了解中国。", en: "Understand China.", fr: "Comprendre la Chine." },
  "hero.l2": { zh: "进入中国。", en: "Enter China.", fr: "Entrer en Chine." },
  "hero.l3": { zh: "深耕中国。", en: "Grow in China.", fr: "Se développer en Chine." },
  "search.placeholder": {
    zh: "搜索企业、行业、城市、产业链、政策、供应商，或提任何商业问题…",
    en: "Search companies, industries, cities, supply chains, policy, suppliers — or ask anything…",
    fr: "Rechercher entreprises, industries, villes, chaînes, politiques, fournisseurs…",
  },
  "search.ask": { zh: "AI 提问", en: "Ask AI", fr: "Demander à l'IA" },
  "search.thinking": { zh: "AI 正在分析…", en: "AI is analyzing…", fr: "L'IA analyse…" },
  "common.viewAll": { zh: "查看全部", en: "View all", fr: "Tout voir" },
  "common.sources": { zh: "数据来源", en: "Sources", fr: "Sources" },
  "common.export": { zh: "导出", en: "Export", fr: "Exporter" },
  "common.generate": { zh: "生成", en: "Generate", fr: "Générer" },
  "common.aiSummary": { zh: "AI 总结", en: "AI Summary", fr: "Résumé IA" },
  "common.chatWith": { zh: "与该主题 AI 对话", en: "Chat with AI", fr: "Discuter avec l'IA" },

  "home.news": { zh: "今日中国商业新闻", en: "Today in China Business", fr: "Actualités Chine" },
  "home.indicators": { zh: "中国经济指标", en: "Economic Indicators", fr: "Indicateurs économiques" },
  "home.hotIndustries": { zh: "热门行业", en: "Hot Industries", fr: "Industries en vogue" },
  "home.hotCompanies": { zh: "热门企业", en: "Trending Companies", fr: "Entreprises tendance" },
  "home.policy": { zh: "最新政策", en: "Latest Policy", fr: "Dernières politiques" },
  "home.playbooks": { zh: "最近 Playbooks", en: "Recent Playbooks", fr: "Playbooks récents" },
  "home.map": { zh: "产业热力图", en: "Industry Heatmap", fr: "Carte thermique" },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "zh",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useLang();
  return (key: string) => dict[key]?.[lang] ?? key;
}

export const langLabels: Record<Lang, string> = { zh: "中文", en: "English", fr: "Français" };
