import { buildDocx } from "@/lib/export/markdown-to-docx";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { markdown = "", title = "China MOS 报告" }: { markdown?: string; title?: string } = await req.json();
  if (!markdown.trim()) return new Response("empty", { status: 400 });

  const buf = await buildDocx(markdown, title);
  const filename = encodeURIComponent(`${title}.docx`);
  return new Response(new Uint8Array(buf), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "content-disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
