import { HomeView } from "./home-view";
import { getNews, getIndicators, getIndustries, getCompanies, getPolicies, getPlaybooks, getFx } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [news, indicators, industries, companies, policies, playbooks, fx] = await Promise.all([
    getNews(), getIndicators(), getIndustries(), getCompanies(), getPolicies(), getPlaybooks(), getFx(),
  ]);
  return (
    <HomeView
      news={news} indicators={indicators} industries={industries}
      companies={companies} policies={policies} playbooks={playbooks} fx={fx}
    />
  );
}
