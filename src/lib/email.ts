import "server-only";

// Optional transactional email via Resend (https://resend.com). This is a no-op
// unless RESEND_API_KEY and ALERT_FROM_EMAIL are set, so in-app notifications
// work out of the box and email is a drop-in upgrade — no code change needed.
export async function sendPolicyAlertEmail(
  to: string, name: string, policyTitle: string, summary: string, url: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const body = `
    <p>你好 ${name}，</p>
    <p>你订阅的关键词匹配到一条新政策：</p>
    <h3>${policyTitle}</h3>
    ${summary ? `<p>${summary}</p>` : ""}
    ${url ? `<p><a href="${url}">查看原文 →</a></p>` : ""}
    <hr/>
    <p style="color:#888;font-size:12px">China MOS 政策订阅提醒 · 可在「我的空间」管理订阅</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: `【政策提醒】${policyTitle}`, html: body }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
