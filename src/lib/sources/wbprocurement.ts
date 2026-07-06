// World Bank Procurement Notices API — keyless. Real, live international tender
// notices (Invitation for Bids, Requests for Expression of Interest, Contract
// Awards) for World Bank-financed projects worldwide.
// Note: the API does not reliably filter by country, so this is a *global*
// international-tender feed, labelled as such in the UI. China's domestic tenders
// have no open API — the UI pairs this feed with a directory of official Chinese
// procurement platforms.

const UA = "ChinaMOS/0.1 (contact@example.com)";

export type Tender = {
  id: string;
  title: string;
  type: string;       // Invitation for Bids / Request for EOI / Contract Award …
  country: string;
  noticeDate: string;
  deadline: string;   // may be empty for awards
  url: string;
};

export async function getTenders(limit = 10): Promise<Tender[] | null> {
  const url = `https://search.worldbank.org/api/v2/procnotices?format=json&rows=${limit}&order=desc&sort=noticedate`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, accept: "application/json" } });
    if (!res.ok) return null;
    const j = await res.json();
    const rows: Record<string, string>[] = j.procnotices ?? [];
    return rows.map((r) => ({
      id: r.id,
      title: r.bid_description || r.notice_title || r.project_name || "(untitled)",
      type: r.notice_type || "Notice",
      country: r.project_ctry_name || "",
      noticeDate: r.noticedate || "",
      deadline: (r.submission_deadline_date || "").slice(0, 10),
      url: `https://projects.worldbank.org/en/projects-operations/procurement-detail/${r.id}`,
    })).filter((t) => t.id && t.title);
  } catch {
    return null;
  }
}
