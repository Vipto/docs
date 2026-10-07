# Vipto Docs — Modern Confluence-Style Knowledge Platform

**Vipto Docs** is a production-ready, real-time documentation and team wiki platform inspired by the UX, architecture, and information hierarchy of **Atlassian Confluence**, redesigned with sleek, modern SaaS aesthetics specifically for **Vipto**.

---

## 🌟 Key Features

### 1. Workspaces & Spaces
* **Spaces**: Organizational containers (e.g., Engineering, Product, Design, Company).
* **Unlimited Nested Page Tree**: Hierarchical page organization with re-parenting, child-page creation, duplication, and deletion.
* **Space Settings & Access Controls**: Manage space keys, owners, icons, and descriptions.

### 2. Block-Based Document Editor
* **TipTap Rich Text Core**: Headings (H1, H2, H3), bold, italic, underline, strikethrough, inline code, highlights, and colors.
* **Complex Blocks**: Tables with dynamic row/column management, Task lists/Checklists, Code blocks with syntax highlighting, Blockquotes, and visual Callout boxes (info, tip, warning, danger).
* **Slash Commands (`/`)**: Type `/` anywhere to trigger an instant block insertion palette.
* **Dynamic Table of Contents**: Sticky right-side TOC generated automatically from headings with smooth scrolling.

### 3. Real-Time Collaboration & Auto-Save
* **Debounced Auto-Save**: Sub-second debounced synchronization to Cloud Firestore with zero data loss.
* **Save Status Indicator**: Clear state pills (`Saving...`, `All changes saved`, `Unsaved changes`).
* **Comments & Mentions**: Comment threads, reply trees, resolution states, and `@teammate` mentions.
* **Version History & Diffs**: View historical snapshots, compare visual text diffs against the live document, and restore past versions with 1 click.

### 4. Search, Discovery & Navigation
* **Global Search & Command Palette (`Ctrl + K` / `Cmd + K`)**: Instant full-text search with relevance ranking, match highlighting, and quick actions.
* **Starred / Favorites**: Pin frequently referenced documents.
* **Recent Pages**: Track your most recently viewed docs.
* **Clickable Breadcrumb Chains**: `Vipto > Space > Parent > Sub-document`.

### 5. Sharing, Exporting & Attachments
* **Permanent URLs**: Stable routing (`/spaces/:spaceKey/:pageId` and `/page/:pageId`).
* **Multi-Format Export**: Export any document to Markdown (`.md`), standalone formatted HTML (`.html`), or print-ready PDF (`.pdf`).
* **File Attachments**: Upload PDFs, spreadsheets, documents, and images directly to Firebase Storage.

### 6. Security, RBAC & Audit Trail
* **Role-Based Access Control**:
  * **👑 Owner**: Full workspace control.
  * **🛡️ Admin**: Manage spaces, members, and roles.
  * **✍️ Editor**: Create, edit, and comment on documentation.
  * **👀 Viewer**: Read-only documentation access.
* **Workspace Audit Trail**: Live logging of document creation, edits, deletions, space configurations, and member updates.
* **Security Rules**: Robust `firestore.rules` and `storage.rules`.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons
* **Editor**: TipTap 2 with StarterKit, Tables, Tasks, Callouts, and Custom Extensions
* **Backend**: Firebase Authentication, Cloud Firestore, Firebase Storage
* **Styling**: Tailwind CSS with dark mode tokens, typography scale, and glassmorphism

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vipto/vipto-docs.git
cd vipto-docs
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=AIzaSyCt9bOmfgoiYbxbPxhMMFPFmT7kEFL2-X0
VITE_FIREBASE_AUTH_DOMAIN=vipto-doc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vipto-doc
VITE_FIREBASE_STORAGE_BUCKET=vipto-doc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=768722502197
VITE_FIREBASE_APP_ID=1:768722502197:web:032c075b933fb85947a77c
VITE_FIREBASE_MEASUREMENT_ID=G-PLTH2LTM00
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Firebase Deployment & Rules

Deploy Firestore and Storage security rules:
```bash
# Deploy firestore rules & indexes
firebase deploy --only firestore

# Deploy storage rules
firebase deploy --only storage

# Deploy hosting
firebase deploy --only hosting
```

---

## 📂 Project Architecture

```
src/
├── components/         # Reusable atomic & composite components
│   ├── common/         # Avatar, Badge, Modal, SkeletonLoader, ShortcutsModal
│   ├── layout/         # AppLayout, TopNav, Sidebar, Breadcrumbs, TableOfContents
│   ├── spaces/         # SpaceCard, CreateSpaceModal, SpaceSettingsModal
│   ├── pages/          # PageTree, PageItem, PageHeader, ActionsMenu, MoveModal, ShareModal, ExportModal, HistoryDrawer
│   ├── comments/       # CommentsPanel, CommentItem, CommentThread
│   ├── search/         # GlobalSearchModal (Ctrl+K Command Palette)
│   ├── notifications/  # NotificationDropdown
│   └── templates/      # TemplatePickerModal, templateDefinitions
├── editor/             # TipTap DocumentEditor, EditorToolbar, SlashCommands, Callout extension
├── features/           # Feature workflows
├── firebase/           # Firebase initialization (Auth, Firestore, Storage)
├── hooks/              # useAuth, useTheme, useDebounce, useKeyboardShortcuts
├── pages/              # HomePage, SpaceDetailPage, PageDetailPage, SearchPage, SettingsPage, LoginPage, NotFoundPage
├── permissions/        # RBAC roles hierarchy and permission checks
├── services/           # Firestore & Storage services (pageService, spaceService, workspaceService, commentService, historyService, attachmentService, searchService, seedService)
├── types/              # Domain TypeScript interfaces
├── utils/              # formatters, exportHelpers, cn
├── App.tsx             # Root router
└── main.tsx            # React DOM mounting
```
