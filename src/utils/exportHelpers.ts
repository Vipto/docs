import { Page } from '@/types';
import { extractTextFromHtml } from './formatters';

export function exportToMarkdown(page: Page): void {
  // Convert HTML to simple markdown
  let md = `# ${page.title}\n\n`;
  md += `*Author: ${page.authorName} | Last Updated: ${page.updatedAt}*\n\n---\n\n`;

  let content = page.content;
  // Replace headers
  content = content.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  content = content.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  content = content.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  // Replace formatting
  content = content.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  content = content.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  content = content.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  content = content.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  content = content.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  content = content.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  content = content.replace(/<blockquote.*?>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');
  content = content.replace(/<li><p>(.*?)<\/p><\/li>/gi, '* $1\n');
  content = content.replace(/<li>(.*?)<\/li>/gi, '* $1\n');
  content = content.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
  content = content.replace(/<hr\s*\/?>/gi, '---\n\n');
  content = content.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');
  // Strip remaining HTML tags
  const cleanContent = content.replace(/<[^>]+>/g, '');

  md += cleanContent;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${page.slug || 'document'}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToHtml(page: Page): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${page.title} - Vipto Docs</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 860px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1 { font-size: 2.25rem; font-weight: 800; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 24px; color: #111827; }
    h2 { font-size: 1.5rem; font-weight: 700; margin-top: 32px; margin-bottom: 16px; color: #1f2937; }
    h3 { font-size: 1.25rem; font-weight: 600; margin-top: 24px; margin-bottom: 12px; color: #374151; }
    p { margin-bottom: 16px; }
    pre { background-color: #1e293b; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
    code { background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: monospace; color: #4f46e5; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 16px; margin-left: 0; color: #4b5563; font-style: italic; background: #f8fafc; padding: 12px 16px; border-radius: 0 8px 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; }
    th { background-color: #f8fafc; font-weight: 600; }
    ul, ol { padding-left: 24px; margin-bottom: 16px; }
    li { margin-bottom: 6px; }
    .meta { font-size: 0.875rem; color: #6b7280; margin-bottom: 30px; }
    .callout { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 16px 0; }
  </style>
</head>
<body>
  <h1>${page.title}</h1>
  <div class="meta">
    <span>Author: ${page.authorName}</span> &bull; 
    <span>Last updated: ${new Date(page.updatedAt).toLocaleDateString()}</span>
  </div>
  <div class="content">
    ${page.content}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${page.slug || 'document'}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPdf(page: Page): void {
  // Use a dedicated print-friendly popout window for high-fidelity PDF generation
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export as PDF');
    return;
  }

  const printHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${page.title} - Vipto Docs</title>
  <style>
    @media print {
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
        color: #111;
        padding: 20px;
        margin: 0;
      }
      h1 { font-size: 26pt; margin-bottom: 8pt; color: #1e1b4b; border-bottom: 2pt solid #4f46e5; padding-bottom: 6pt; }
      h2 { font-size: 18pt; margin-top: 18pt; margin-bottom: 8pt; color: #312e81; }
      h3 { font-size: 14pt; margin-top: 14pt; margin-bottom: 6pt; }
      p { margin-bottom: 10pt; font-size: 11pt; }
      pre { background: #f1f5f9; border: 1pt solid #cbd5e1; padding: 10pt; border-radius: 4pt; font-size: 9pt; }
      code { font-family: monospace; font-size: 9.5pt; }
      blockquote { border-left: 3pt solid #4f46e5; padding-left: 10pt; margin: 10pt 0; color: #475569; }
      table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
      th, td { border: 1pt solid #cbd5e1; padding: 6pt 8pt; text-align: left; font-size: 10pt; }
      th { background-color: #f8fafc; font-weight: bold; }
      .header-meta { font-size: 9pt; color: #64748b; margin-bottom: 20pt; }
      .footer { margin-top: 30pt; font-size: 8pt; color: #94a3b8; border-top: 1pt solid #e2e8f0; padding-top: 6pt; }
    }
  </style>
</head>
<body>
  <h1>${page.title}</h1>
  <div class="header-meta">
    <strong>Vipto Docs</strong> &bull; Author: ${page.authorName} &bull; Last updated: ${new Date(page.updatedAt).toLocaleString()}
  </div>
  <div>
    ${page.content}
  </div>
  <div class="footer">
    Exported from Vipto Docs on ${new Date().toLocaleDateString()}
  </div>
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 500);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
}

export function copyPageLink(spaceKey: string, pageId: string): Promise<void> {
  const url = `${window.location.origin}/spaces/${spaceKey}/${pageId}`;
  return navigator.clipboard.writeText(url);
}
