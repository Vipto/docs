import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Page, Space, SearchResult } from '@/types';
import { extractTextFromHtml } from '@/utils/formatters';
import { getLocalPages, getLocalSpaces } from './seedService';

export async function searchDocumentation(
  workspaceId: string,
  rawQuery: string,
  spaceIdFilter?: string
): Promise<SearchResult[]> {
  const searchTerm = rawQuery.trim().toLowerCase();
  if (!searchTerm) return [];

  const results: SearchResult[] = [];

  // Fetch all spaces
  const spaces = getLocalSpaces();
  const spacesMap = new Map<string, Space>();

  spaces.forEach((space) => {
    spacesMap.set(space.id, space);

    // Match space titles/descriptions
    if (!spaceIdFilter || spaceIdFilter === space.id) {
      if (
        space.name.toLowerCase().includes(searchTerm) ||
        space.key.toLowerCase().includes(searchTerm) ||
        (space.description && space.description.toLowerCase().includes(searchTerm))
      ) {
        results.push({
          id: space.id,
          title: space.name,
          spaceId: space.id,
          spaceName: space.name,
          spaceKey: space.key,
          snippet: space.description || `Space key: ${space.key}`,
          type: 'space',
          authorName: space.ownerName || 'Admin',
          updatedAt: space.updatedAt,
          matchScore: 10,
        });
      }
    }
  });

  // Fetch all pages
  let pages = getLocalPages();
  if (spaceIdFilter && spaceIdFilter !== 'all') {
    pages = pages.filter((p) => p.spaceId === spaceIdFilter);
  }

  pages.forEach((page) => {
    const title = page.title.toLowerCase();
    const plainContent = extractTextFromHtml(page.content).toLowerCase();
    const space = spacesMap.get(page.spaceId);

    const titleMatch = title.includes(searchTerm);
    const contentMatch = plainContent.includes(searchTerm);

    if (titleMatch || contentMatch) {
      let score = 0;
      let snippet = page.excerpt || '';

      if (titleMatch) {
        score += 20;
        if (title.startsWith(searchTerm)) score += 10;
      }

      if (contentMatch) {
        score += 5;
        const matchIndex = plainContent.indexOf(searchTerm);
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(plainContent.length, matchIndex + searchTerm.length + 60);
        snippet = (start > 0 ? '...' : '') + plainContent.substring(start, end).trim() + (end < plainContent.length ? '...' : '');
      }

      results.push({
        id: page.id,
        title: page.title,
        spaceId: page.spaceId,
        spaceName: space?.name || 'Documentation',
        spaceKey: space?.key || 'DOCS',
        snippet: snippet || 'No preview available',
        type: 'page',
        authorName: page.authorName || 'Ayush Kumar',
        updatedAt: page.updatedAt,
        matchScore: score,
      });
    }
  });

  // Sort by relevance score, then recent update
  return results.sort((a, b) => {
    if ((b.matchScore || 0) !== (a.matchScore || 0)) {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
