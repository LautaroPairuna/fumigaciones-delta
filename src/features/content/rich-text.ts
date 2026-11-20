export type RichBlock = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

const LIST_ITEM = /^-\s+/;

export function parseRichText(source: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  for (const chunk of source.trim().split(/\n\s*\n/)) {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    let paragraph: string[] = [];
    let list: string[] = [];
    const flushParagraph = () => {
      if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    };
    const flushList = () => {
      if (list.length) blocks.push({ type: "list", items: list });
      list = [];
    };
    for (const line of lines) {
      if (LIST_ITEM.test(line)) {
        flushParagraph();
        list.push(line.replace(LIST_ITEM, ""));
      } else {
        flushList();
        paragraph.push(line);
      }
    }
    flushParagraph();
    flushList();
  }
  return blocks;
}
