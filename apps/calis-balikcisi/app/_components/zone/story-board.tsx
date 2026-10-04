'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { BoardAction, BoardContent } from '@/lib/zone/board-content';
import { useZoneStore } from '@/lib/zone/store';

/**
 * Pano kartının içeriği (docs/zone-3d-modul.md bölüm 7.4, `StoryBoard`): görseller, metin,
 * bilgiler (iletişim) ve eylemler. Form/talep YOK.
 *
 * Site içi bağlantı Zone'u KAPATIR (`exit`): kapanmadan gezinilirse perde ve kaydırma kilidi
 * açık kalır. Arama bağlantısı Zone'u açık bırakır; harita/WhatsApp yeni sekmede açılır.
 */

const actionClass = (primary?: boolean) =>
  primary
    ? 'inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm uppercase tracking-[0.14em] text-bg transition-colors hover:bg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg'
    : 'inline-flex items-center gap-2 rounded-full border border-accent px-5 py-2.5 text-sm uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg';

function Action({ action }: { action: BoardAction }) {
  const exit = useZoneStore((s) => s.exit);
  if (action.kind === 'internal') {
    return (
      <Link
        href={action.href}
        onClick={(e) => {
          // Yeni sekme/pencere (Cmd/Ctrl/Shift/orta tık) bu sayfadan çıkmaz: Zone açık kalır.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          exit();
        }}
        className={actionClass(action.primary)}
        data-testid="board-action"
      >
        {action.label}
        <span aria-hidden="true">→</span>
      </Link>
    );
  }
  const external = action.kind === 'external';
  return (
    <a
      href={action.href}
      className={actionClass(action.primary)}
      data-testid="board-action"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {action.label}
      {external ? <span aria-hidden="true">↗</span> : null}
    </a>
  );
}

export function StoryBoard({ content }: { content: BoardContent }) {
  const [first, ...rest] = content.images;
  return (
    <div data-testid="story-board" className="flex flex-col gap-6">
      {first ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
          <Image src={first.src} alt={first.alt} fill sizes="(max-width: 768px) 92vw, 680px" className="object-cover" />
        </div>
      ) : null}
      {rest.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {rest.map((img) => (
            <div key={img.src} className="relative aspect-[3/4] overflow-hidden rounded-sm">
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 30vw, 220px" className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      {content.paragraphs.map((p) => (
        <p key={p} className="text-base leading-relaxed text-fg md:text-lg">
          {p}
        </p>
      ))}

      {content.facts ? (
        <dl className="grid gap-4">
          {content.facts.map((f) => (
            <div key={f.label}>
              <dt className="text-xs uppercase tracking-[0.2em] text-accent">{f.label}</dt>
              <dd className="mt-1 text-base text-fg">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {content.actions ? (
        <div className="flex flex-wrap gap-3">
          {content.actions.map((a) => (
            <Action key={a.href} action={a} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
