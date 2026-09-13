export const mapAreas = [
  {
    id: 'gate',
    name: 'Main gate',
    x: 70,
    y: 510,
    w: 190,
    h: 85,
    kind: 'Access',
  },
  {
    id: 'canteen',
    name: 'Canteen',
    x: 650,
    y: 330,
    w: 205,
    h: 130,
    kind: 'Dining',
  },
  {
    id: 'corridor',
    name: 'Block A corridor',
    x: 110,
    y: 230,
    w: 415,
    h: 75,
    kind: 'Learning',
  },
  {
    id: 'courtyard',
    name: 'Courtyard',
    x: 290,
    y: 335,
    w: 305,
    h: 180,
    kind: 'Public space',
  },
  {
    id: 'hall',
    name: 'Assembly hall',
    x: 630,
    y: 105,
    w: 220,
    h: 175,
    kind: 'Assembly',
  },
  {
    id: 'perimeter',
    name: 'East perimeter',
    x: 890,
    y: 110,
    w: 65,
    h: 440,
    kind: 'Boundary',
  },
  {
    id: 'classrooms',
    name: 'Block A classrooms',
    x: 110,
    y: 115,
    w: 415,
    h: 85,
    kind: 'Learning',
  },
  {
    id: 'library',
    name: 'Library',
    x: 110,
    y: 335,
    w: 130,
    h: 100,
    kind: 'Learning',
  },
  {
    id: 'office',
    name: 'School office',
    x: 285,
    y: 550,
    w: 170,
    h: 65,
    kind: 'Administration',
  },
  {
    id: 'field',
    name: 'Sports field',
    x: 630,
    y: 505,
    w: 220,
    h: 115,
    kind: 'Sport',
  },
  {
    id: 'toilets',
    name: 'Toilets · no cameras',
    x: 530,
    y: 125,
    w: 65,
    h: 75,
    kind: 'Private space',
  },
];
export function clusterCounts(count: number) {
  if (!Number.isInteger(count) || count < 0)
    throw new Error('Invalid observation count');
  const n = count > 45 ? 3 : count > 12 ? 2 : 1;
  return Array.from(
    { length: n },
    (_, i) => Math.floor(count / n) + (i < count % n ? 1 : 0),
  );
}
export function mapDots(
  count: number,
  width: number,
  height: number,
  seed = 0,
) {
  return Array.from({ length: count }, (_, i) => ({
    x: 12 + (((i * 37 + seed * 13) % 97) / 97) * (width - 24),
    y: 30 + (((i * 53 + seed * 7) % 89) / 89) * (height - 44),
  }));
}
