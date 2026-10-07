import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export function formatDate(dateStringOrDate: string | Date | undefined): string {
  if (!dateStringOrDate) return '';
  try {
    const date = typeof dateStringOrDate === 'string' ? parseISO(dateStringOrDate) : dateStringOrDate;
    if (isNaN(date.getTime())) return '';
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, yyyy · h:mm a');
  } catch {
    return '';
  }
}

export function formatRelativeTime(dateStringOrDate: string | Date | undefined): string {
  if (!dateStringOrDate) return '';
  try {
    const date = typeof dateStringOrDate === 'string' ? parseISO(dateStringOrDate) : dateStringOrDate;
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function extractTextFromHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function getFileIcon(fileType: string): string {
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('image')) return 'image';
  if (type.includes('word') || type.includes('doc')) return 'docx';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return 'xlsx';
  if (type.includes('presentation') || type.includes('powerpoint')) return 'pptx';
  if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return 'zip';
  return 'file';
}
