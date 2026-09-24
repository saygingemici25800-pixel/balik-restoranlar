import { promises as fs } from 'node:fs';
import path from 'node:path';
import { get, put } from '@vercel/blob';
import { blobAuth, isBlobEnabled } from './blob-auth';
import { buildSeedContent } from './seed';
import { siteContentSchema, type SiteContent } from './types';

const BLOB_PATHNAME = 'site-content.json';
const LOCAL_PATH = path.join(process.cwd(), '.data', 'content.json');

export type ContentSource = 'blob' | 'local';

// ok    : storage'dan okundu
// empty : storage'da henüz dosya yok -> _data.ts seed'i (hata değil)
// error : okunamadı/bozuk -> seed döner ama YAZMA KİLİTLİ olmalı, aksi halde
//         geçici bir hatada seed gerçek verinin üzerine yazılır.
export type ReadResult =
  | { status: 'ok'; source: ContentSource; content: SiteContent }
  | { status: 'empty'; source: ContentSource; content: SiteContent }
  | {
      status: 'error';
      source: ContentSource;
      content: SiteContent;
      error: string;
    };

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function parseContent(raw: string): SiteContent {
  const result = siteContentSchema.safeParse(JSON.parse(raw));
  if (!result.success) {
    throw new Error(`site-content.json şemaya uymuyor: ${result.error.message}`);
  }
  return result.data;
}

async function readBlobRaw(): Promise<string | null> {
  const res = await get(BLOB_PATHNAME, {
    access: 'private',
    useCache: false,
    ...blobAuth(),
  });
  if (!res) return null;
  if (res.statusCode !== 200) {
    throw new Error(`Blob beklenmeyen yanıt: ${res.statusCode}`);
  }
  return new Response(res.stream).text();
}

async function readLocalRaw(): Promise<string | null> {
  try {
    return await fs.readFile(LOCAL_PATH, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function readContent(): Promise<ReadResult> {
  const source: ContentSource = isBlobEnabled() ? 'blob' : 'local';
  try {
    const raw = source === 'blob' ? await readBlobRaw() : await readLocalRaw();
    if (raw === null) {
      return { status: 'empty', source, content: buildSeedContent() };
    }
    return { status: 'ok', source, content: parseContent(raw) };
  } catch (err) {
    console.error(`[content] ${source} okunamadı:`, err);
    return {
      status: 'error',
      source,
      content: buildSeedContent(),
      error: errorMessage(err),
    };
  }
}

// Doğrular, updatedAt'i damgalar ve yazar. Hata yutulmaz: loglanır ve fırlatılır.
export async function writeContent(content: SiteContent): Promise<SiteContent> {
  const next = siteContentSchema.parse({
    ...content,
    updatedAt: new Date().toISOString(),
  });
  const body = JSON.stringify(next, null, 2);
  const source: ContentSource = isBlobEnabled() ? 'blob' : 'local';

  try {
    if (source === 'blob') {
      await put(BLOB_PATHNAME, body, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        ...blobAuth(),
      });
    } else {
      await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
      await fs.writeFile(LOCAL_PATH, body, 'utf8');
    }
  } catch (err) {
    console.error(`[content] ${source} yazılamadı:`, err);
    throw err;
  }
  return next;
}
