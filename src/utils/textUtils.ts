export const stripHtml = (html: string): string => {
  if (!html) return '';

  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';

  return text.trim();
};

export const cleanText = (text: string): string => {
  if (!text) return '';

  let cleaned = stripHtml(text);

  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-zA-Z]+;/g, '')
    .replace(/&#\d+;/g, '');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
};

export const isValidHeadline = (headline: string): boolean => {
  if (!headline) return false;

  const cleaned = cleanText(headline);

  if (cleaned.length < 10) return false;

  if (cleaned.includes('<') || cleaned.includes('>') || cleaned.includes('src=')) {
    return false;
  }

  if (cleaned.startsWith('<') || cleaned.includes('</div>') || cleaned.includes('<img')) {
    return false;
  }

  const htmlTagPattern = /<[^>]+>/;
  if (htmlTagPattern.test(cleaned)) {
    return false;
  }

  return true;
};

export const cleanMarkdown = (text: string): string => {
  if (!text) return '';

  return text
    .replace(/^##\s+.*$/gm, '')     // Remove markdown headers (##)
    .replace(/\*\*/g, '')            // Remove bold markdown (**)
    .replace(/\*/g, '')              // Remove italic markdown (*)
    .replace(/^\s*[\r\n]/gm, '')     // Remove empty lines
    .trim();
};
