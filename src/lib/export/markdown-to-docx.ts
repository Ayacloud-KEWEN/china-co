import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

// Split a line into runs, honoring **bold** markers.
function inlineRuns(text: string): TextRun[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((seg, i) => new TextRun({ text: seg, bold: i % 2 === 1 }));
}

// Convert a Markdown report (as produced by the AI) into a docx Document.
export function markdownToParagraphs(md: string): Paragraph[] {
  const out: Paragraph[] = [];
  for (const raw of md.split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (line.trim() === "") { out.push(new Paragraph({ text: "" })); continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const heading = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][level - 1];
      out.push(new Paragraph({ heading, children: inlineRuns(h[2]) }));
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      out.push(new Paragraph({ bullet: { level: 0 }, children: inlineRuns(bullet[1]) }));
      continue;
    }
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (numbered) {
      out.push(new Paragraph({ numbering: { reference: "num", level: 0 }, children: inlineRuns(numbered[1]) }));
      continue;
    }
    out.push(new Paragraph({ children: inlineRuns(line) }));
  }
  return out;
}

export async function buildDocx(markdown: string, title: string): Promise<Buffer> {
  const body: Paragraph[] = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: title, bold: true, size: 32 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `China MOS · ${new Date().toISOString().slice(0, 10)}`, color: "888888", size: 18 })] }),
    new Paragraph({ text: "" }),
    ...markdownToParagraphs(markdown),
  ];

  const doc = new Document({
    numbering: {
      config: [{ reference: "num", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }] }],
    },
    styles: {
      default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
    },
    sections: [{ children: body }],
  });

  return Packer.toBuffer(doc);
}
