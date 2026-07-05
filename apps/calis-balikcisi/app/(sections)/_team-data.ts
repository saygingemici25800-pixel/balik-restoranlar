export type TeamMember = {
  id: string;
  name: string;
  role: string;
  poster: string;
  video: string;
};

const R2 = 'https://pub-0e98df07e9e945c780b0fbae31d2f1bc.r2.dev/ekip';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'kubra',
    name: 'Kübra',
    role: 'Rezervasyon Yönetimi & Misafir İlişkileri',
    poster: '/ekip/ekip-kubra.webp',
    video: `${R2}/ekip-kubra.mp4`,
  },
  {
    id: 'berkan',
    name: 'Berkan',
    role: 'Reyon / Servis',
    poster: '/ekip/ekip-berkan.webp',
    video: `${R2}/ekip-berkan.mp4`,
  },
  {
    id: 'kader',
    name: 'Kader',
    role: 'Servis',
    poster: '/ekip/ekip-kader.webp',
    video: `${R2}/ekip-kader.mp4`,
  },
  {
    id: 'mehmet',
    name: 'Mehmet',
    role: 'Garson',
    poster: '/ekip/ekip-mehmet.webp',
    video: `${R2}/ekip-mehmet.mp4`,
  },
  {
    id: 'sadik',
    name: 'Sadık',
    role: 'İşletme Müdürü',
    poster: '/ekip/ekip-sadik.webp',
    video: `${R2}/ekip-sadik.mp4`,
  },
  {
    id: 'akif-usta',
    name: 'Akif Usta',
    role: 'İşletme Sahibi',
    poster: '/ekip/ekip-akif-usta.webp',
    video: `${R2}/ekip-akif-usta.mp4`,
  },
];
