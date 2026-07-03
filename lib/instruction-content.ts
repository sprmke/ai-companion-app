const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function isHtmlInstruction(content: string): boolean {
  return HTML_TAG_PATTERN.test(content.trim());
}

/** Converts legacy plain-text instructions to HTML for the editor. */
export function toEditorHtml(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';
  if (isHtmlInstruction(trimmed)) return trimmed;

  return trimmed
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n').map(escapeHtml).join('<br>');
      return `<p>${lines}</p>`;
    })
    .join('');
}

/** Plain text for AI prompts, previews, and validation. */
export function instructionToPlainText(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';
  if (!isHtmlInstruction(trimmed)) return trimmed;

  if (typeof document === 'undefined') {
    return trimmed
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const root = document.createElement('div');
  root.innerHTML = trimmed;

  const blockTags = new Set([
    'P',
    'DIV',
    'LI',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'BLOCKQUOTE',
    'TR',
  ]);

  const lines: string[] = [];

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.replace(/\s+/g, ' ') ?? '';
      if (text) lines.push(text);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName;

    if (tag === 'BR') {
      lines.push('');
      return;
    }

    if (tag === 'UL' || tag === 'OL') {
      el.querySelectorAll(':scope > li').forEach((li, index) => {
        const bullet = tag === 'OL' ? `${index + 1}. ` : '• ';
        const text = li.textContent?.trim() ?? '';
        if (text) lines.push(`${bullet}${text}`);
      });
      return;
    }

    Array.from(el.childNodes).forEach((child) => walk(child));

    if (blockTags.has(tag)) {
      lines.push('');
    }
  };

  Array.from(root.childNodes).forEach((child) => walk(child));

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isInstructionEmpty(content: string | undefined): boolean {
  return !instructionToPlainText(content ?? '').trim();
}

export function instructionPreviewText(
  content: string,
  maxLength = 280
): string {
  const plain = instructionToPlainText(content);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}
