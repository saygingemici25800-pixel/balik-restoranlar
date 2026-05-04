import type { Metadata } from 'next';
import { Inter_Tight, Spectral } from 'next/font/google';
import { TABLES_BY_ID, ZONE_LABEL } from '../_data/tables';
import type { Zone } from '../_types/reservation';
import styles from './_styles/onay.module.css';
import { OnayContent } from './_components/onay-content';

const spectral = Spectral({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-spectral',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter-tight',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Talebiniz alındı — Çalış Balıkçısı',
  description: 'Rezervasyon talebiniz alındı.',
};

const TR_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function formatTrDate(iso: string): string {
  const m = DATE_RE.exec(iso);
  if (!m) return iso;
  const day = parseInt(m[3]!, 10);
  const monthIdx = parseInt(m[2]!, 10) - 1;
  const month = TR_MONTHS[monthIdx] ?? '';
  return `${day} ${month}`.trim();
}

function buildRequestNo(iso: string, tableId: string): string {
  const m = DATE_RE.exec(iso);
  const safeTable = tableId || 'XX';
  if (!m) return `CB-${safeTable}`;
  const yy = m[1]!.slice(2);
  return `CB-${yy}-${m[2]}-${m[3]}-${safeTable}`;
}

function pickZone(value: string | undefined): Zone {
  return value === 'indoor' ? 'indoor' : 'sea';
}

type SearchParams = {
  table?: string;
  zone?: string;
  date?: string;
  time?: string;
  people?: string;
  name?: string;
};

export default function OnayPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const tableId = searchParams.table ?? '';
  const zone = pickZone(searchParams.zone);
  const date = searchParams.date ?? '';
  const time = searchParams.time ?? '';
  const peopleRaw = parseInt(searchParams.people ?? '', 10);
  const people = Number.isFinite(peopleRaw) && peopleRaw > 0 ? peopleRaw : 0;
  const name = searchParams.name?.trim() ?? '';

  const tableMeta = tableId ? TABLES_BY_ID[tableId] : undefined;
  const tableLabel = tableMeta?.label ?? (tableId ? `Masa ${tableId}` : 'Masa');
  const zoneLabel = ZONE_LABEL[zone];
  const formattedDate = formatTrDate(date);
  const requestNo = buildRequestNo(date, tableId);

  return (
    <div
      data-rezervasyon
      className={`${styles.onayRoot} ${spectral.variable} ${interTight.variable}`}
    >
      <OnayContent
        tableLabel={tableLabel}
        zoneLabel={zoneLabel}
        formattedDate={formattedDate}
        time={time}
        people={people}
        name={name}
        requestNo={requestNo}
      />
    </div>
  );
}
