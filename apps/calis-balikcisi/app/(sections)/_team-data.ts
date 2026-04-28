export type TeamMember = {
  id: number;
  name: string;
  role: string;
  quote: string;
  imageSrc: string;
  thumbnailSrc: string;
};

const PLACEHOLDER_IMAGE = '';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'Mehmet Usta',
    role: 'Baş Aşçı',
    quote:
      'Ateşle konuşmayı öğrenmek yıllar alır. Balık, saygıdır.',
    imageSrc: PLACEHOLDER_IMAGE,
    thumbnailSrc: PLACEHOLDER_IMAGE,
  },
  {
    id: 2,
    name: 'Ali Ağabey',
    role: 'Balıkçı',
    quote:
      'Her sabah deniz bana ne verirse, biz onu paylaşırız.',
    imageSrc: PLACEHOLDER_IMAGE,
    thumbnailSrc: PLACEHOLDER_IMAGE,
  },
  {
    id: 3,
    name: 'Ayşe Teyze',
    role: 'Mezeci',
    quote:
      'Yıllardır aynı taşla öğütüyorum fesleğeni. Tat, sabırdır.',
    imageSrc: PLACEHOLDER_IMAGE,
    thumbnailSrc: PLACEHOLDER_IMAGE,
  },
  {
    id: 4,
    name: 'Ekrem',
    role: 'Garson Şef',
    quote: 'Masanın hikayesini, yüzlerde okurum.',
    imageSrc: PLACEHOLDER_IMAGE,
    thumbnailSrc: PLACEHOLDER_IMAGE,
  },
  {
    id: 5,
    name: 'Fatma Hanım',
    role: 'Tatlıcı',
    quote:
      'Sakız yapmak için sadece reçete değil, kol kuvveti de ister.',
    imageSrc: PLACEHOLDER_IMAGE,
    thumbnailSrc: PLACEHOLDER_IMAGE,
  },
];
