import { mediaUrl } from '@/lib/media';

/** Ekip: sahibi ve müdürden başlar. Video adresi `mediaUrl` ile (yerel kopya varsa oradan). */
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  poster: string;
  video: string;
};

const ekip = (slug: string) => mediaUrl(`ekip/${slug}.mp4`);

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'akif-usta',
    name: 'Akif Usta',
    role: 'İşletme Sahibi',
    poster: '/ekip/ekip-akif-usta.webp',
    video: ekip('ekip-akif-usta'),
  },
  {
    id: 'sadik',
    name: 'Sadık',
    role: 'İşletme Müdürü',
    poster: '/ekip/ekip-sadik.webp',
    video: ekip('ekip-sadik'),
  },
  {
    id: 'kubra',
    name: 'Kübra',
    role: 'Rezervasyon Yönetimi & Misafir İlişkileri',
    poster: '/ekip/ekip-kubra.webp',
    video: ekip('ekip-kubra'),
  },
  {
    id: 'berkan',
    name: 'Berkan',
    role: 'Reyon / Servis',
    poster: '/ekip/ekip-berkan.webp',
    video: ekip('ekip-berkan'),
  },
  {
    id: 'kader',
    name: 'Kader',
    role: 'Servis',
    poster: '/ekip/ekip-kader.webp',
    video: ekip('ekip-kader'),
  },
  {
    id: 'mehmet',
    name: 'Mehmet',
    role: 'Garson',
    poster: '/ekip/ekip-mehmet.webp',
    video: ekip('ekip-mehmet'),
  },
];
