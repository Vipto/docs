const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'vipto-notion-export');

function formatTitle(filename) {
  let clean = filename.replace(/\s+[a-f0-9]{32}\.md$/i, '').replace(/\.md$/i, '');
  clean = clean.replace(/_/g, ' ').replace(/-/g, ' ');
  return clean
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .trim();
}

function mdToHtml(md) {
  let html = md;
  
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Code blocks
  html = html.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Formatting
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  html = html.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');
  
  // Task lists
  html = html.replace(/^- \[x\] (.*$)/gim, '<li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>$1</p></div></li>');
  html = html.replace(/^- \[ \] (.*$)/gim, '<li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>$1</p></div></li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  
  const pLines = html.split('\n\n');
  html = pLines.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<block') || trimmed.startsWith('<div') || trimmed.startsWith('<li')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');
  
  return html;
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function getAllMdFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMdFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

const spaceDefinitions = [
  {
    id: 'space_start_here',
    name: 'Start Here',
    key: 'START',
    icon: '🚀',
    description: 'Onboarding, team mission, squad responsibilities, and system walkthrough.',
    folderPattern: 'Start Here'
  },
  {
    id: 'space_learn_vipto',
    name: 'Learn Vipto',
    key: 'LEARN',
    icon: '💡',
    description: 'Vipto user and seller apps, business model, user journeys, and seller FAQs.',
    folderPattern: 'Learn Vipto'
  },
  {
    id: 'space_seller_acq',
    name: 'Seller Acquisition Strategy',
    key: 'ACQ',
    icon: '🎯',
    description: 'Acquisition goals, target locations, seller qualification criteria, and funnels.',
    folderPattern: 'Seller Acquisition Strategy'
  },
  {
    id: 'space_seller_disc',
    name: 'Seller Discovery',
    key: 'DISC',
    icon: '🔍',
    description: 'Google Maps and Instagram research guidelines, duplicate checking, and lead checklist.',
    folderPattern: 'Seller Discovery'
  },
  {
    id: 'space_prod_comm',
    name: 'Product Communication',
    key: 'COMM',
    icon: '💬',
    description: 'Outreach SOPs, WhatsApp & Instagram message templates, objection handling.',
    folderPattern: 'Product Communication'
  },
  {
    id: 'space_prod_crm',
    name: 'Product CRM',
    key: 'CRM',
    icon: '📊',
    description: 'CRM pipeline stages, lead database, HubSpot introduction, and lead assignment.',
    folderPattern: 'Product Crm'
  },
  {
    id: 'space_analytics',
    name: 'Product Analytics & Experiment',
    key: 'ANLY',
    icon: '📈',
    description: 'Funnel definitions, weekly reports, metrics, seller feedback, and experimentation backlog.',
    folderPattern: 'Product Analytics & Experiment'
  },
  {
    id: 'space_ops',
    name: 'Product Operation & Squads',
    key: 'OPS',
    icon: '⚙️',
    description: 'Squads (Google Maps, WhatsApp, Instagram, Onboarding, Analytics), standups, and retrospectives.',
    folderPattern: 'Product Operation and Development'
  },
  {
    id: 'space_learning_mod',
    name: 'Learning Modules',
    key: 'MOD',
    icon: '🎓',
    description: 'Competitive research, CRM fundamentals, VoC feedback loops, growth loops, and A/B testing.',
    folderPattern: 'Learning module'
  },
  {
    id: 'space_intern_rsrch',
    name: 'Intern & Global Research',
    key: 'RSRCH',
    icon: '🔬',
    description: 'Global competitor research, CSV import research, seller data management, and team principles.',
    folderPattern: 'Intern'
  },
  {
    id: 'space_teams',
    name: 'Teams',
    key: 'TEAM',
    icon: '👥',
    description: 'Team Google Maps, Team Instagram, and team working directories.',
    folderPattern: 'Teams'
  }
];

const allMd = getAllMdFiles(rootDir);
console.log(`Processing ${allMd.length} markdown files...`);

const spacePagesMap = {};
spaceDefinitions.forEach(s => {
  spacePagesMap[s.id] = [];
});

const pages = [];
const now = '2026-10-07T12:00:00.000Z';

allMd.forEach((filePath, index) => {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const parentDir = path.basename(path.dirname(filePath));
  const title = formatTitle(filename);
  const htmlContent = mdToHtml(rawContent);
  const excerpt = rawContent.replace(/[#*`_>\[\]]/g, '').substring(0, 160).trim();
  
  let targetSpace = spaceDefinitions.find(s => filePath.includes(s.folderPattern) || parentDir.includes(s.folderPattern));
  if (!targetSpace) {
    targetSpace = spaceDefinitions[0];
  }

  const pageId = `${targetSpace.key.toLowerCase()}_${slugify(title)}_${index}`;
  
  const pageObj = {
    id: pageId,
    workspaceId: 'vipto-workspace',
    spaceId: targetSpace.id,
    parentId: null,
    title: title || 'Untitled Page',
    slug: slugify(title || 'untitled'),
    icon: targetSpace.icon,
    content: htmlContent,
    excerpt: excerpt,
    authorId: 'u1',
    authorName: 'Ayush Kumar',
    authorAvatar: '',
    lastModifiedById: 'u1',
    lastModifiedByName: 'Ayush Kumar',
    order: spacePagesMap[targetSpace.id].length,
    version: 1,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };

  spacePagesMap[targetSpace.id].push(pageObj);
  pages.push(pageObj);
});

// Update pageCount in spaces without folderPattern
const spacesWithCount = spaceDefinitions.map(s => ({
  id: s.id,
  workspaceId: 'vipto-workspace',
  name: s.name,
  key: s.key,
  description: s.description,
  icon: s.icon,
  ownerId: 'u1',
  ownerName: 'Ayush Kumar',
  isPrivate: false,
  pageCount: (spacePagesMap[s.id] || []).length,
  createdAt: now,
  updatedAt: now,
}));

// Generate TypeScript code
const tsContent = `// Auto-generated from Notion Export (vipto-notion-export)
import { Space, Page } from '@/types';

export const NOTION_SPACES: Space[] = ${JSON.stringify(spacesWithCount, null, 2)};

export const NOTION_PAGES: Page[] = ${JSON.stringify(pages, null, 2)};
`;

const outputPath = path.join(__dirname, '..', 'src', 'services', 'seedNotionData.ts');
fs.writeFileSync(outputPath, tsContent, 'utf-8');
console.log(`✅ Created src/services/seedNotionData.ts with ${spacesWithCount.length} spaces and ${pages.length} pages!`);
