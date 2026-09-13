// Presence records, extracted from the panel so the 3D site map, the register
// and the test suite all read one source. These are recorded observations at a
// point in time - a gate reader event or a staff confirmation - not live
// positions, and nothing downstream may present them as such.

export type PresenceStatus =
  | 'Recorded on campus'
  | 'Departure recorded'
  | 'Not recorded today'
  | 'Needs verification';
export type Pupil = {
  id: string;
  name: string;
  className: string;
  status: PresenceStatus;
  arrival: string;
  last: string;
  source: string;
  history: { text: string; time: string }[];
};
export const presenceSeed: Pupil[] = [
  [
    'ST-101',
    'Adam Hakim',
    '1 Amanah',
    'Recorded on campus',
    '07:18',
    '07:18',
    'Main gate · Card record',
  ],
  [
    'ST-102',
    'Sofia Tan',
    '1 Amanah',
    'Recorded on campus',
    '07:24',
    '07:40',
    'Teacher roll call',
  ],
  [
    'ST-103',
    'Aiman Faris',
    '2 Bestari',
    'Needs verification',
    '07:21',
    '10:12',
    'Exit record incomplete',
  ],
  [
    'ST-104',
    'Kavya Devi',
    '2 Bestari',
    'Departure recorded',
    '07:12',
    '10:10',
    'Approved early release',
  ],
  [
    'ST-105',
    'Daniel Wong',
    '3 Cekal',
    'Recorded on campus',
    '07:29',
    '07:40',
    'Teacher roll call',
  ],
  [
    'ST-106',
    'Nur Hana',
    '3 Cekal',
    'Not recorded today',
    '—',
    '—',
    'No attendance record',
  ],
  [
    'ST-107',
    'Amir Zaki',
    '1 Amanah',
    'Recorded on campus',
    '07:31',
    '07:31',
    'Main gate · Card record',
  ],
  [
    'ST-108',
    'Mei Lin',
    '2 Bestari',
    'Departure recorded',
    '07:16',
    '09:55',
    'Guardian handover',
  ],
  [
    'ST-109',
    'Irfan Azmi',
    '3 Cekal',
    'Needs verification',
    '07:35',
    '10:20',
    'Gate reader unavailable',
  ],
  [
    'ST-110',
    'Sara Imani',
    '1 Amanah',
    'Not recorded today',
    '—',
    '—',
    'No attendance record',
  ],
  [
    'ST-111',
    'Ravi Kumar',
    '2 Bestari',
    'Recorded on campus',
    '07:26',
    '07:40',
    'Teacher roll call',
  ],
  [
    'ST-112',
    'Alya Syafiqah',
    '3 Cekal',
    'Departure recorded',
    '07:19',
    '10:05',
    'Approved early release',
  ],
].map((r) => ({
  id: r[0],
  name: r[1],
  className: r[2],
  status: r[3] as PresenceStatus,
  arrival: r[4],
  last: r[5],
  source: r[6],
  history: [{ text: r[6], time: r[5] }],
}));
