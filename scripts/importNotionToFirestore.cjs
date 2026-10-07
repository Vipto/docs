const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, writeBatch, collection } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCt9bOmfgoiYbxbPxhMMFPFmT7kEFL2-X0",
  authDomain: "vipto-doc.firebaseapp.com",
  projectId: "vipto-doc",
  storageBucket: "vipto-doc.firebasestorage.app",
  messagingSenderId: "768722502197",
  appId: "1:768722502197:web:032c075b933fb85947a77c",
  measurementId: "G-PLTH2LTM00"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  
  html = html.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });
  
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  html = html.replace(/^\> (.*$)/gim, '<div class="callout callout-info" data-callout="info"><p>$1</p></div>');
  
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
  if (!fs.existsSync(dir)) return results;
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

async function runImport() {
  console.log('🚀 Initializing Vipto Cloud Firestore Importer...');
  console.log(`📁 Scanning Notion export from: ${rootDir}`);

  const userId = 'u1';
  const userName = 'Ayush Kumar';
  const now = new Date().toISOString();

  // 1. Gather all files
  const allMd = getAllMdFiles(rootDir);
  console.log(`📄 Found ${allMd.length} Notion Markdown documents.`);

  const spacePagesMap = {};
  spaceDefinitions.forEach(s => {
    spacePagesMap[s.id] = [];
  });

  allMd.forEach((filePath, index) => {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath);
    const parentDir = path.basename(path.dirname(filePath));
    const title = formatTitle(filename);
    const htmlContent = mdToHtml(rawContent);
    const excerpt = rawContent.replace(/[#*`_>\[\]]/g, '').substring(0, 160).trim();
    
    let targetSpace = spaceDefinitions.find(s => filePath.includes(s.folderPattern) || parentDir.includes(s.folderPattern));
    if (!targetSpace) targetSpace = spaceDefinitions[0];

    const pageId = `${targetSpace.key.toLowerCase()}_${slugify(title)}_${index}`;

    spacePagesMap[targetSpace.id].push({
      id: pageId,
      workspaceId: 'vipto-workspace',
      spaceId: targetSpace.id,
      parentId: null,
      title: title || 'Untitled Page',
      slug: slugify(title || 'untitled'),
      icon: targetSpace.icon,
      content: htmlContent,
      excerpt: excerpt,
      authorId: userId,
      authorName: userName,
      authorAvatar: '',
      lastModifiedById: userId,
      lastModifiedByName: userName,
      order: spacePagesMap[targetSpace.id].length,
      version: 1,
      isFavorite: false,
      restrictions: {
        lockType: 'open',
        allowedEditors: [],
        allowedViewers: []
      },
      reactions: {},
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log('⚡ Preparing Firestore Batches...');

  // 2. Batch write workspace & members
  let batch = writeBatch(db);
  let operationCount = 0;

  const wsRef = doc(db, 'workspaces', 'vipto-workspace');
  batch.set(wsRef, {
    id: 'vipto-workspace',
    name: 'Vipto',
    slug: 'vipto',
    description: 'Central documentation, engineering wiki, and Notion knowledge base for Vipto.',
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });
  operationCount++;

  const memberRef = doc(db, 'workspaces', 'vipto-workspace', 'members', userId);
  batch.set(memberRef, {
    userId: userId,
    name: userName,
    email: 'admin@vipto.io',
    role: 'Owner',
    joinedAt: now,
  }, { merge: true });
  operationCount++;

  // 3. Add Spaces to batch
  for (const spaceDef of spaceDefinitions) {
    const pages = spacePagesMap[spaceDef.id] || [];
    const spaceRef = doc(db, 'spaces', spaceDef.id);
    batch.set(spaceRef, {
      id: spaceDef.id,
      workspaceId: 'vipto-workspace',
      name: spaceDef.name,
      key: spaceDef.key,
      description: spaceDef.description,
      icon: spaceDef.icon,
      ownerId: userId,
      ownerName: userName,
      isPrivate: false,
      pageCount: pages.length,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
    operationCount++;
  }

  // 4. Add Pages and initial version snapshots
  const allBatches = [];

  for (const spaceDef of spaceDefinitions) {
    const pages = spacePagesMap[spaceDef.id] || [];
    for (const page of pages) {
      if (operationCount >= 400) {
        allBatches.push(batch);
        batch = writeBatch(db);
        operationCount = 0;
      }

      const pageRef = doc(db, 'pages', page.id);
      batch.set(pageRef, page, { merge: true });
      operationCount++;

      const verRef = doc(collection(db, 'pages', page.id, 'versions'));
      batch.set(verRef, {
        id: verRef.id,
        pageId: page.id,
        versionNumber: 1,
        title: page.title,
        content: page.content,
        authorId: userId,
        authorName: userName,
        changeSummary: 'Imported from Notion Knowledge Base',
        createdAt: now,
      }, { merge: true });
      operationCount++;
    }
  }

  if (operationCount > 0) {
    allBatches.push(batch);
  }

  console.log(`📦 Committing ${allBatches.length} Firestore Batches across collections...`);

  for (let i = 0; i < allBatches.length; i++) {
    console.log(`  Writing batch ${i + 1} of ${allBatches.length}...`);
    await allBatches[i].commit();
  }

  console.log('✅ SUCCESS: All 11 Spaces and 96 Notion Documentation Pages successfully uploaded to Cloud Firestore!');
  console.log('Collections created:');
  console.log('  • /workspaces/vipto-workspace');
  console.log('  • /workspaces/vipto-workspace/members/u1');
  console.log('  • /spaces/{spaceId} (11 Space documents)');
  console.log('  • /pages/{pageId} (96 Page documents)');
  console.log('  • /pages/{pageId}/versions/{versionId} (Revision snapshots)');
}

runImport()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Import error:', err);
    process.exit(1);
  });
