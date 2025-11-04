/* @kvoip-woulz proprietary */
import { type FileService } from 'src/engine/core-modules/file/services/file.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

/**
 * Normalizes a file path by removing any existing tokens and URL prefixes.
 * Handles paths that may already be signed (contain tokens) or have full URLs.
 * Signed paths have format: folder/token/filename
 * This extracts: folder/filename (removing tokens)
 */
export const normalizeFilePath = (path: string): string => {
  // Remove any full URL prefix (e.g., "https://example.com/files/" or "/files/")
  let normalizedPath = path.replace(/^https?:\/\/[^\/]+/, ''); // Remove protocol and domain
  normalizedPath = normalizedPath.replace(/^\/files\//, ''); // Remove /files/ prefix

  // Split path into segments
  const parts = normalizedPath.split('/').filter((part) => part.length > 0);

  if (parts.length === 0) {
    return path;
  }

  // Find the last segment (should be the filename)
  const filename = parts[parts.length - 1];

  // Check if any segment looks like a JWT token (long base64 strings with dots)
  // JWT tokens have format: header.payload.signature (base64url encoded)
  // They're typically > 50 chars and contain dots
  const tokenIndices: number[] = [];

  for (let i = 0; i < parts.length - 1; i++) {
    // Check if segment looks like a JWT token (has dots and is long enough)
    // Also check for long base64-like strings without dots (fallback)
    const part = parts[i];
    const hasDots = part.includes('.');
    const isLongEnough = part.length > 50;
    const looksLikeBase64 = /^[A-Za-z0-9_\.-]+$/.test(part); // Allow dots in base64url

    // A token is likely if: (has dots and is long) OR (very long base64 without dots)
    const looksLikeJWT =
      (hasDots && isLongEnough && looksLikeBase64) ||
      (!hasDots && part.length > 100 && /^[A-Za-z0-9_-]+$/.test(part));

    if (looksLikeJWT) {
      tokenIndices.push(i);
    }
  }

  // If we found tokens, reconstruct path without them
  if (tokenIndices.length > 0) {
    // Get all non-token segments (excluding filename)
    const folderParts = parts.filter(
      (_, index) => !tokenIndices.includes(index) && index < parts.length - 1,
    );

    // Reconstruct as folder/filename
    return folderParts.length > 0
      ? `${folderParts.join('/')}/${filename}`
      : filename;
  }

  // No tokens found, return as-is
  return normalizedPath;
};

/**
 * Signs and normalizes the attachmentUrl if present.
 * Returns a full signed URL ready for use.
 */
export const signAttachmentUrl = (
  attachmentUrl: string | null | undefined,
  workspaceId: string,
  fileService: FileService,
  configService: TwentyConfigService,
): string | null => {
  if (!attachmentUrl) {
    return null;
  }

  // Normalize the path to remove any existing tokens or URL prefixes
  const normalizedPath = normalizeFilePath(attachmentUrl);

  const signedPath = fileService.signFileUrl({
    url: normalizedPath,
    workspaceId,
  });

  return `${configService.get('SERVER_URL')}/files/${signedPath}`;
};


