import JSZip from 'jszip';
import { sanitizePath } from './paths';

export interface ZipValidationResult {
  isValid: boolean;
  error?: string;
  filesCount: number;
  totalUncompressedBytes: number;
}

const MAX_ZIP_FILES = 500;
const MAX_TOTAL_UNCOMPRESSED_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_SINGLE_FILE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates a JSZip object against path traversal and zip-bomb attacks before extraction.
 */
export async function validateZipArchive(zip: JSZip): Promise<ZipValidationResult> {
  let filesCount = 0;
  let totalUncompressedBytes = 0;

  const entries: JSZip.JSZipObject[] = [];
  zip.forEach((_, fileObj) => {
    if (!fileObj.dir) {
      entries.push(fileObj);
    }
  });

  if (entries.length === 0) {
    return {
      isValid: false,
      error: 'Arsip ZIP tidak memiliki file yang dapat diekstrak.',
      filesCount: 0,
      totalUncompressedBytes: 0,
    };
  }

  if (entries.length > MAX_ZIP_FILES) {
    return {
      isValid: false,
      error: `Arsip ZIP memiliki terlalu banyak file (${entries.length} > batas ${MAX_ZIP_FILES}).`,
      filesCount: entries.length,
      totalUncompressedBytes: 0,
    };
  }

  for (const entry of entries) {
    // Check path traversal in filename
    const name = entry.name;
    if (name.includes('..') || name.startsWith('/') || /^[a-zA-Z]:/.test(name)) {
      return {
        isValid: false,
        error: `Deteksi keamanan: Path traversal tidak diizinkan pada arsip (${name}).`,
        filesCount,
        totalUncompressedBytes,
      };
    }

    // Inspect file size approximation from internal header if available
    const uncompressedSize = (entry as any)._data?.uncompressedSize || 0;
    if (uncompressedSize > MAX_SINGLE_FILE_BYTES) {
      return {
        isValid: false,
        error: `File "${name}" melebihi batas ukuran maksimal (10MB).`,
        filesCount,
        totalUncompressedBytes,
      };
    }

    totalUncompressedBytes += uncompressedSize;
    if (totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
      return {
        isValid: false,
        error: 'Total ukuran arsip yang diekstrak melebihi batas keamanan (50MB).',
        filesCount,
        totalUncompressedBytes,
      };
    }

    filesCount++;
  }

  return {
    isValid: true,
    filesCount,
    totalUncompressedBytes,
  };
}
