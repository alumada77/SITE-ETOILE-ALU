/**
 * Google Drive Image URL Converter & Fallback Helper
 * Handles Google Drive sharing links (e.g. drive.google.com/file/d/FILE_ID/view)
 * or folder links, and converts file IDs to direct viewable thumbnails.
 */

// Fallback high quality industrial craftsmanship photos
export const FALLBACK_IMAGES: Record<string, string> = {
  Aluminium: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'Fer & Forge': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  Inox: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  'Vitrerie & Façades': 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80',
  'Soudure & Structure': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
};

export function getDirectDriveImageUrl(url: string | undefined | null, category: string = 'default'): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  }

  const cleanUrl = url.trim();

  // Standard direct HTTP image links (e.g. unsplash, imgur, lh3)
  if (cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || cleanUrl.includes('images.unsplash.com') || cleanUrl.includes('googleusercontent.com')) {
    return cleanUrl;
  }

  // Google Drive File ID extraction
  // e.g. https://drive.google.com/file/d/1wJ2FqA-CMf5EFenH1-HrKJTCeZ7qSEjr/view?usp=sharing
  // or https://drive.google.com/uc?id=1wJ2FqA-CMf5EFenH1-HrKJTCeZ7qSEjr
  const fileIdMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                      cleanUrl.match(/id=([a-zA-Z0-9_-]+)/) ||
                      cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    // Return direct thumbnail / view link
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  // If it's a folder link or unparseable Drive link, fallback safely
  if (cleanUrl.includes('drive.google.com/drive/folders')) {
    return FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  }

  return cleanUrl;
}

export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/id=([a-zA-Z0-9_-]+)/) ||
                url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
