import { PageTemplate } from '@/types';

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    title: 'Blank Document',
    description: 'Start with a completely clean slate for flexible writing.',
    icon: 'file',
    category: 'General',
    content: '<p>Start typing here, or type <code>/</code> for Confluence blocks...</p>',
  },
  {
    id: 'prd',
    title: 'Product Requirements Document (PRD)',
    description: 'Define feature goals, target persona, user stories, KPIs, and release milestones.',
    icon: 'target',
    category: 'Product',
    content: `<h1>PRD: [Feature / Project Name]</h1>
<div class="vipto-properties-card">
  <div class="vipto-properties-header">Document Metadata</div>
  <div class="vipto-properties-grid">
    <div class="vipto-property-item"><div class="vipto-property-label">Owner</div><div class="vipto-property-value">Product Lead</div></div>
    <div class="vipto-property-item"><div class="vipto-property-label">Status</div><div class="vipto-property-value"><span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold text-xs">In Review</span></div></div>
    <div class="vipto-property-item"><div class="vipto-property-label">Target Date</div><div class="vipto-property-value">Q4 2026</div></div>
    <div class="vipto-property-item"><div class="vipto-property-label">Squad</div><div class="vipto-property-value">Core Platform</div></div>
  </div>
</div>
<h2>1. Executive Summary & Problem</h2>
<p>Provide a clear 2-3 sentence overview of what problem this solves for Vipto users and how it aligns with company OKRs.</p>
<div class="callout callout-info" data-callout="info">
  <p><strong>Success Criteria:</strong> 40%+ weekly active adoption within 3 weeks of release.</p>
</div>
<h2>2. User Stories & Acceptance Criteria</h2>
<table>
  <thead>
    <tr>
      <th>User Story</th>
      <th>Acceptance Criteria</th>
      <th>Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>As a user, I want real-time page collaboration</td>
      <td>All edits sync across active viewers with &lt; 200ms latency</td>
      <td>P0</td>
    </tr>
    <tr>
      <td>As an admin, I want granular space permissions</td>
      <td>Admins can restrict edit rights per squad member</td>
      <td>P1</td>
    </tr>
  </tbody>
</table>
<h2>3. Key Risks & Dependencies</h2>
<ul data-type="taskList">
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Complete backend security review with Infrastructure squad</p></div></li>
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Validate database indexing with DBA squad</p></div></li>
</ul>`,
  },
  {
    id: 'tech_design',
    title: 'Technical Design Document (RFC)',
    description: 'Propose and debate complex technical architectures, schema migrations, and APIs.',
    icon: 'code',
    category: 'Engineering',
    content: `<h1>RFC: [Architecture / Service Proposal]</h1>
<p><strong>Author:</strong> [Engineer Name] &bull; <strong>Reviewers:</strong> [Architects / Leads] &bull; <strong>State:</strong> Proposed</p>
<h2>1. Context & Motivation</h2>
<p>Why are we making this architectural change or introducing this new service?</p>
<h2>2. Proposed Architecture</h2>
<pre><code class="language-bash">Client (React) -> Load Balancer -> Microservices -> Firestore / PostgreSQL</code></pre>
<div class="vipto-columns-2" data-columns="2">
  <div class="vipto-column-cell">
    <p><strong>Key Advantages:</strong></p>
    <ul>
      <li>Sub-millisecond query caching</li>
      <li>Zero database connection overhead</li>
    </ul>
  </div>
  <div class="vipto-column-cell">
    <p><strong>Trade-offs:</strong></p>
    <ul>
      <li>Eventual consistency on read replicas</li>
      <li>Requires careful security rules</li>
    </ul>
  </div>
</div>
<h2>3. Rollout & Rollback Plan</h2>
<p>Phase 1: Internal canary deploy (5%). Phase 2: Staged rollout (25% -> 100%).</p>`,
  },
  {
    id: 'meeting_notes',
    title: 'Meeting Notes & Action Items',
    description: 'Capture agenda, attendees, discussion highlights, and assigned action tasks.',
    icon: 'checklist',
    category: 'General',
    content: `<h1>Meeting: [Topic / Sync Name]</h1>
<p><strong>Date:</strong> [Date] &bull; <strong>Leader:</strong> [Name] &bull; <strong>Scribe:</strong> [Name]</p>
<h2>Attendees</h2>
<ul>
  <li>Ayush Kumar</li>
  <li>Product Squad Lead</li>
  <li>Engineering Lead</li>
</ul>
<h2>Agenda & Discussion Points</h2>
<blockquote>
  <p>Summarize the key decisions and insights discussed during this sync.</p>
</blockquote>
<h2>Action Items</h2>
<ul data-type="taskList">
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p><strong>[Ayush]:</strong> Publish updated API documentation (Due: Friday)</p></div></li>
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p><strong>[Tech Lead]:</strong> Benchmark query indexing latency (Due: Monday)</p></div></li>
</ul>`,
  },
  {
    id: 'postmortem',
    title: 'Incident Postmortem / RCA',
    description: 'Blameless root cause analysis, timeline, impact assessment, and prevention items.',
    icon: 'shield',
    category: 'Engineering',
    content: `<h1>Postmortem: [Incident Summary - Date]</h1>
<div class="callout callout-danger" data-callout="danger">
  <p><strong>Severity:</strong> P1 Critical &bull; <strong>Duration:</strong> 18 minutes &bull; <strong>Impact:</strong> 4.2% API mutation requests failed</p>
</div>
<h2>1. Incident Timeline</h2>
<table>
  <thead>
    <tr><th>Time (UTC)</th><th>Event</th><th>Actor</th></tr>
  </thead>
  <tbody>
    <tr><td>14:02</td><td>Alert triggered for elevated HTTP 500 error rates</td><td>PagerDuty</td></tr>
    <tr><td>14:08</td><td>On-call engineer identified connection pool exhaustion</td><td>On-Call</td></tr>
    <tr><td>14:20</td><td>Scaled connection pool & verified traffic restored</td><td>DevOps</td></tr>
  </tbody>
</table>
<h2>2. Root Cause Analysis (5 Whys)</h2>
<p>Detailed analysis of what triggered the outage and why existing alerts did not catch it earlier.</p>
<h2>3. Corrective & Preventative Actions</h2>
<ul data-type="taskList">
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Add connection pool utilization alert threshold at 75%</p></div></li>
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Update auto-scaling configuration policies</p></div></li>
</ul>`,
  },
  {
    id: 'design_system',
    title: 'Design System Component Spec',
    description: 'Document anatomy, states, accessibility guidelines, and props for UI components.',
    icon: 'layers',
    category: 'Design',
    content: `<h1>Component: [Component Name]</h1>
<p><strong>Package:</strong> <code>@vipto/ui</code> &bull; <strong>Status:</strong> Ready for Dev</p>
<h2>1. Overview & Anatomy</h2>
<p>Describe component use case, design guidelines, and behavioral requirements.</p>
<div class="callout callout-tip" data-callout="tip">
  <p>Always verify contrast ratio meets WCAG AA (4.5:1 minimum) in both Light and Dark themes.</p>
</div>
<h2>2. Interactive States & Props</h2>
<table>
  <thead>
    <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>variant</code></td><td>'primary' | 'secondary' | 'ghost'</td><td>'primary'</td><td>Visual hierarchy styling</td></tr>
    <tr><td><code>size</code></td><td>'sm' | 'md' | 'lg'</td><td>'md'</td><td>Padding and font scale</td></tr>
    <tr><td><code>disabled</code></td><td>boolean</td><td>false</td><td>Disables interactions</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'weekly_update',
    title: 'Weekly Squad Update',
    description: 'Share wins, blockers, and next week priorities with company stakeholders.',
    icon: 'chart',
    category: 'Operations',
    content: `<h1>Weekly Update: Week of [Date]</h1>
<p><strong>Squad:</strong> [Squad Name] &bull; <strong>Author:</strong> [Name]</p>
<h2>Highlights & Key Wins</h2>
<ul>
  <li>Shipped new Confluence-grade rich editor experience to all internal teams.</li>
  <li>Completed zero-downtime migration to Firestore indexes.</li>
</ul>
<h2>Blockers & Risks</h2>
<blockquote>
  <p>No active blockers. On track for scheduled milestone release.</p>
</blockquote>
<h2>Top Priorities for Next Week</h2>
<ul data-type="taskList">
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Conduct teammate onboarding walkthrough session</p></div></li>
</ul>`,
  },
];

const CUSTOM_TEMPLATES_KEY = 'vipto_custom_templates';

export const getCustomTemplates = (): PageTemplate[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomTemplate = (template: PageTemplate): void => {
  const existing = getCustomTemplates();
  const filtered = existing.filter((t) => t.id !== template.id);
  filtered.push(template);
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered));
};

export const getAllTemplates = (): PageTemplate[] => {
  return [...PAGE_TEMPLATES, ...getCustomTemplates()];
};
