/**
 * Kementerian Pendidikan Tinggi (KPT) view: the smart-campus audit of 38
 * Malaysian universities, global benchmarks, the capability gap and
 * aggregate hostel-integrity figures from EzVision pilots.
 *
 * Audit rows come from the EzVision Campus System Spec (26 Oct 2026), which
 * checked public web pages in English and Malay. "Unknown" means no public
 * evidence, not proof of absence. Every row links to the page it came from.
 *
 * The ministry sees no footage, images, plates, camera IDs or names. Counts
 * from 1 to 4 are suppressed.
 */
import { cameras, pilotCameras, uptimeDaily } from './um';
import { hostelWeekly, precisionByModule, ackTimes, pilotKpis } from './alerts';

export type InstitutionType = 'Public (UA)' | 'Private (IPTS)';
export type Maturity =
  | 'High'
  | 'Medium–High'
  | 'Medium'
  | 'Low–Medium'
  | 'Low'
  | 'Unknown';

export type StateId =
  | 'Perlis'
  | 'Kedah'
  | 'Pulau Pinang'
  | 'Perak'
  | 'Kelantan'
  | 'Terengganu'
  | 'Pahang'
  | 'Selangor'
  | 'WP Kuala Lumpur'
  | 'WP Putrajaya'
  | 'Negeri Sembilan'
  | 'Melaka'
  | 'Johor'
  | 'Sabah'
  | 'Sarawak'
  | 'WP Labuan';

/** Tile-grid map of Malaysia: [column, row]. Schematic, not geographic. */
export const stateTiles: Record<StateId, [number, number]> = {
  Perlis: [0, 0],
  Kedah: [1, 0],
  Kelantan: [2, 0],
  'Pulau Pinang': [0, 1],
  Perak: [1, 1],
  Terengganu: [2, 1],
  Selangor: [0, 2],
  Pahang: [1, 2],
  'WP Kuala Lumpur': [0, 3],
  'WP Putrajaya': [1, 3],
  'Negeri Sembilan': [0, 4],
  Melaka: [1, 4],
  Johor: [1, 5],
  'WP Labuan': [4, 0],
  Sabah: [5, 0],
  Sarawak: [4, 1],
};

export type Vehicles =
  | 'Plate recognition'
  | 'Plate recognition (likely)'
  | 'RFID or stickers'
  | 'Cards or app'
  | 'Not stated';

export type Institution = {
  id: string;
  acronym: string;
  name: string;
  type: InstitutionType;
  state: StateId;
  city: string;
  deployed: string;
  maturity: Maturity;
  /** Confirmed live AI or vision security system. */
  ai: boolean;
  /** CCTV policy that already asks for video analytics. */
  policyAnalytics: boolean;
  /** Any AI at hostels: none confirmed anywhere; Taylor's claims it. */
  hostelAi: 'None found' | 'Claimed, no detail';
  vehicles: Vehicles;
  /** Facial recognition in use: sensitive data under the amended PDPA. */
  faceRecognition: boolean;
  evidence: { label: string; url: string }[];
  /** EzVision connection, if any. */
  ezvision: 'Pilot (demo)' | null;
};

const I = (
  id: string,
  acronym: string,
  name: string,
  type: InstitutionType,
  state: StateId,
  city: string,
  maturity: Maturity,
  deployed: string,
  evidence: [string, string][],
  extra: Partial<Institution> = {},
): Institution => ({
  id,
  acronym,
  name,
  type,
  state,
  city,
  maturity,
  deployed,
  evidence: evidence.map(([label, url]) => ({ label, url })),
  ai: false,
  policyAnalytics: false,
  hostelAi: 'None found',
  vehicles: 'Not stated',
  faceRecognition: false,
  ezvision: null,
  ...extra,
});

const UA = 'Public (UA)' as const;
const IPTS = 'Private (IPTS)' as const;
const NONE =
  'No public evidence found beyond network deals or sticker systems.';
const PLAIN = 'Access cards, guards and plain CCTV only.';

export const institutions: Institution[] = [
  I(
    'umpsa',
    'UMPSA',
    'Universiti Malaysia Pahang Al-Sultan Abdullah',
    UA,
    'Pahang',
    'Pekan',
    'High',
    'Intelligent Operation Centre at Pekan: AI, IoT and analytics for security, traffic and energy, with phased smart CCTV (May 2026). Guards added to hostels after a January 2025 incident; hostel CCTV “under consideration”.',
    [
      ['IOC news', 'https://news.umpsa.edu.my/print/pdf/node/10705'],
      ['Hostel incident', 'https://news.umpsa.edu.my/print/pdf/node/9085'],
    ],
    { ai: true, policyAnalytics: true },
  ),
  I(
    'um',
    'UM',
    'Universiti Malaya',
    UA,
    'WP Kuala Lumpur',
    'Kuala Lumpur',
    'Medium',
    'Facial recognition at the library entrance (live); auxiliary police; “Integrated Surveillance” in the Smart Sustainable Campus 2022–2030 roadmap.',
    [
      [
        'Library',
        'https://umcms.um.edu.my/sites/um-library/news/facial-recognition-technology-is-now-live-at-the-library-entrance',
      ],
      [
        'Roadmap',
        'https://ebook.um.edu.my/jtm/SmartCampus/files/basic-html/page4.html',
      ],
    ],
    { ai: true, faceRecognition: true, ezvision: 'Pilot (demo)' },
  ),
  I(
    'usm',
    'USM',
    'Universiti Sains Malaysia',
    UA,
    'Pulau Pinang',
    'Gelugor',
    'Medium',
    'CCTV policy creates a central control room (SMRC) with “video analytics” (2017, reviewed 2019); no proof the analytics run.',
    [
      [
        'CCTV policy',
        'https://security.usm.my/index.php/lain-lain/polisi?download=9%3Apolisi-cctv',
      ],
    ],
    { policyAnalytics: true },
  ),
  I(
    'upm',
    'UPM',
    'Universiti Putra Malaysia',
    UA,
    'Selangor',
    'Serdang',
    'Medium',
    'Plate-recognition barrier (“Palang Automatik LPRS”) likely live; Huawei campus-network MoU (2015). Unverified: the page blocked automated reading.',
    [['APSeC', 'https://apsec.upm.edu.my/berita/palang_automatik_lprs-85278']],
    { vehicles: 'Plate recognition (likely)' },
  ),
  I(
    'utm',
    'UTM',
    'Universiti Teknologi Malaysia',
    UA,
    'Johor',
    'Skudai',
    'Low–Medium',
    'RFID vehicle stickers, e-Pelekat 2.0 (2025); Perodua smart-mobility pilot (January 2026).',
    [
      [
        'Sticker procedure',
        'https://registrar.utm.my/quality/wp-content/uploads/sites/393/2025/09/03-Prosedur-Pengurusan-Pelekat-Kenderaan-Pindaan-A.pdf',
      ],
    ],
    { vehicles: 'RFID or stickers' },
  ),
  I(
    'unisza',
    'UniSZA',
    'Universiti Sultan Zainal Abidin',
    UA,
    'Terengganu',
    'Kuala Nerus',
    'Low–Medium',
    'Aimetis video management with motion and perimeter analytics on 40+ cameras across 3 campuses (2011).',
    [
      [
        'asmag',
        'https://www.asmag.com/mobile/article_detail_amp.aspx?aid=12175',
      ],
    ],
  ),
  I(
    'uitm',
    'UiTM',
    'Universiti Teknologi MARA',
    UA,
    'Selangor',
    'Shah Alam',
    'Low',
    'Huawei smart-campus MoU (networks, 2020); CCTV used after the fact to check a viral Puncak Alam hostel-intrusion claim (April 2024).',
    [
      [
        'SAYS',
        'https://says.com/my/seismik/polis-bantuan-sahkan-tiada-kelibat-geng-jubah-hitam-yang-didakwa-tular-ceroboh-kolej-uitm',
      ],
    ],
  ),
  I(
    'ukm',
    'UKM',
    'Universiti Kebangsaan Malaysia',
    UA,
    'Selangor',
    'Bangi',
    'Low',
    '40 CCTV cameras per building at one faculty (FKAB); Beam e-scooters.',
    [['FKAB', 'https://www.ukm.my/fkab/?p=1317']],
  ),
  I(
    'uthm',
    'UTHM',
    'Universiti Tun Hussein Onn Malaysia',
    UA,
    'Johor',
    'Batu Pahat',
    'Low',
    'Draft CCTV policy: central control room (CMCC), PTZ, video analytics and traffic flow.',
    [
      [
        'Draft policy',
        'https://keselamatan.uthm.edu.my/images/peraturan-keselamatan/POLISI_CCTV_UTHM.pdf',
      ],
    ],
    { policyAnalytics: true },
  ),
  I(
    'umk',
    'UMK',
    'Universiti Malaysia Kelantan',
    UA,
    'Kelantan',
    'Kota Bharu',
    'Low',
    'Face, plate and thermal “Smart Security & Surveillance” planned for 2020–22; no proof it was delivered.',
    [
      [
        'Smart campus plan',
        'https://ditec.umk.edu.my/download/Inisiatif%20Kampus%20Pintar_edited_2607%20(2).pdf',
      ],
    ],
  ),
  I(
    'ums',
    'UMS',
    'Universiti Malaysia Sabah',
    UA,
    'Sabah',
    'Kota Kinabalu',
    'Low',
    'Central CCTV unit; Huawei campus network (2017).',
    [
      [
        'CCTV unit',
        'https://www.ums.edu.my/keselamatanv2/en/about-us/administration/intelligence-section/cctv-units',
      ],
    ],
  ),
  I(
    'upsi',
    'UPSI',
    'Universiti Pendidikan Sultan Idris',
    UA,
    'Perak',
    'Tanjong Malim',
    'Low',
    'CCTV unit enforces traffic and college rules (2024).',
    [['CCTV function', 'https://keselamatan.upsi.edu.my/cctv-function/']],
  ),
  I(
    'iium',
    'IIUM',
    'International Islamic University Malaysia',
    UA,
    'Selangor',
    'Gombak',
    'Low',
    'Control room; lift-CCTV training (July 2026); gate plate recognition is a 2025 research prototype only.',
    [
      [
        'OSeM',
        'https://office.iium.edu.my/osem/2026/07/20/latihan-tatacara-penggunaan-cctv-lift-di-osem-iium/',
      ],
      ['Paper', 'https://journal.ump.edu.my/mekatronika/article/view/12064'],
    ],
  ),
  I(
    'unimap',
    'UniMAP',
    'Universiti Malaysia Perlis',
    UA,
    'Perlis',
    'Arau',
    'Low',
    'RFID gateless vehicle entry, a research system under test (2021).',
    [
      [
        'Paper',
        'https://ammarzakaria.unimap.edu.my/pdf/2021/Smart-Gateless-System-using-RFID-Technology-in-Universiti-Malaysia-PerlisJournal-of-Physics-Conference-Series.pdf',
      ],
    ],
    { vehicles: 'RFID or stickers' },
  ),
  I(
    'unimas',
    'UNIMAS',
    'Universiti Malaysia Sarawak',
    UA,
    'Sarawak',
    'Kota Samarahan',
    'Low',
    'e-Sticker; 2026 “Smart, Green & Inclusive Campus” priority with no camera plan.',
    [
      [
        'VC address 2026',
        'https://www.unimas.my/media/attachments/2026/02/13/amanat-nc-2026-website-3-2.pdf',
      ],
    ],
    { vehicles: 'RFID or stickers' },
  ),
  I(
    'upnm',
    'UPNM',
    'Universiti Pertahanan Nasional Malaysia',
    UA,
    'WP Kuala Lumpur',
    'Sungai Besi',
    'Low',
    'CCTV control unit; online vehicle stickers.',
    [
      [
        'Security Division',
        'https://pendaftar.upnm.edu.my/index.php/jabatan/bahagian-keselamatan',
      ],
    ],
    { vehicles: 'RFID or stickers' },
  ),
  I(
    'uum',
    'UUM',
    'Universiti Utara Malaysia',
    UA,
    'Kedah',
    'Sintok',
    'Unknown',
    NONE,
    [],
  ),
  I(
    'usim',
    'USIM',
    'Universiti Sains Islam Malaysia',
    UA,
    'Negeri Sembilan',
    'Nilai',
    'Unknown',
    NONE,
    [],
  ),
  I(
    'umt',
    'UMT',
    'Universiti Malaysia Terengganu',
    UA,
    'Terengganu',
    'Kuala Nerus',
    'Unknown',
    NONE,
    [],
  ),
  I(
    'utem',
    'UTeM',
    'Universiti Teknikal Malaysia Melaka',
    UA,
    'Melaka',
    'Durian Tunggal',
    'Unknown',
    NONE,
    [],
  ),
  I(
    'apu',
    'APU',
    'Asia Pacific University of Technology & Innovation',
    IPTS,
    'WP Kuala Lumpur',
    'Bukit Jalil',
    'High',
    'APSPark plate-recognition parking with pre-registered vehicles and cashless APCard; residence access cards; 24/7 security.',
    [
      ['Parking', 'https://www.apu.edu.my/campus-parking'],
      ['Residence', 'https://www.apu.edu.my/apu-on-campus-residence'],
    ],
    { ai: true, vehicles: 'Plate recognition' },
  ),
  I(
    'sunway',
    'Sunway',
    'Sunway University',
    IPTS,
    'Selangor',
    'Bandar Sunway',
    'Medium–High',
    'Facial recognition at library entry and exit, replacing cards (2019, still in use).',
    [
      [
        'SAYS',
        'https://says.com/my/lifestyle/sunway-university-implements-facial-recognition-system-for-entrance-to-library-so-canggih',
      ],
      [
        'Business Today 2023',
        'https://www.businesstoday.com.my/2023/04/19/sunway-library-enters-a-new-chapter-in-technology/',
      ],
    ],
    { ai: true, faceRecognition: true },
  ),
  I(
    'taylors',
    'Taylor’s',
    'Taylor’s University',
    IPTS,
    'Selangor',
    'Subang Jaya',
    'Medium',
    'Residence FAQ claims “AI-CCTV surveillance covering all floors and entrances”; turnstiles, 24-hour guards. A claim with no detail.',
    [
      [
        'Residence FAQ',
        'https://residence.taylors.edu.my/about-us/frequently-asked-questions',
      ],
    ],
    { hostelAi: 'Claimed, no detail' },
  ),
  I(
    'nottingham',
    'UNM',
    'University of Nottingham Malaysia',
    IPTS,
    'Selangor',
    'Semenyih',
    'Medium',
    '300+ CCTV cameras; ID-card residence doors; app-based parking permits (2023).',
    [
      [
        'Accommodation handbook',
        'https://www.nottingham.edu.my/Study/Documents/Accommodation/Digital-Accommodation-Handbook-2023.pdf',
      ],
    ],
    { vehicles: 'Cards or app' },
  ),
  I(
    'xmum',
    'XMUM',
    'Xiamen University Malaysia',
    IPTS,
    'Selangor',
    'Sepang',
    'Medium',
    'Campus e-card for doors, library and payments; privacy notice already covers CCTV and biometric data; visitors register by hand.',
    [
      ['e-card', 'https://linc.xmu.edu.my/campus-id-ecard/'],
      ['PDP notice', 'https://www.xmu.edu.my/PDP-Notice'],
    ],
    { vehicles: 'Cards or app' },
  ),
  I(
    'msu',
    'MSU',
    'Management and Science University',
    IPTS,
    'Selangor',
    'Shah Alam',
    'Low–Medium',
    'ID-card parking gates; Touch ’n Go visitor parking.',
    [['Parking', 'https://www.msu.edu.my/msu-parking-area.php']],
    { vehicles: 'Cards or app' },
  ),
  I(
    'hwum',
    'HWUM',
    'Heriot-Watt University Malaysia',
    IPTS,
    'WP Putrajaya',
    'Putrajaya',
    'Low–Medium',
    'Cashless parking run by KLCC Parking Management.',
    [['Transport', 'https://www.hw.ac.uk/malaysia/campus/transport']],
    { vehicles: 'Cards or app' },
  ),
  I(
    'curtin-my',
    'Curtin',
    'Curtin University Malaysia',
    IPTS,
    'Sarawak',
    'Miri',
    'Low',
    'Residence cards; CCTV reviewed after incidents; guard-house visitor log; stickers and clamping (2025).',
    [
      [
        'Residence rules',
        'https://www.curtin.edu.my/study/wp-content/uploads/sites/2/2025/03/Residence-rules-and-regulations.pdf',
      ],
    ],
    { vehicles: 'RFID or stickers' },
  ),
  I(
    'utar',
    'UTAR',
    'Universiti Tunku Abdul Rahman',
    IPTS,
    'Perak',
    'Kampar',
    'Low',
    'Guarded gates, numbered stickers, visitor passes, clamping.',
    [['Vehicle stickers', 'https://dsa.kpr.utar.edu.my/Vehicle-Stickers.php']],
    { vehicles: 'RFID or stickers' },
  ),
  I(
    'mmu',
    'MMU',
    'Multimedia University',
    IPTS,
    'Selangor',
    'Cyberjaya',
    'Low',
    PLAIN,
    [['Accommodation', 'https://www.mmu.edu.my/accommodation/']],
  ),
  I(
    'uniten',
    'UNITEN',
    'Universiti Tenaga Nasional',
    IPTS,
    'Selangor',
    'Kajang',
    'Low',
    PLAIN,
    [],
  ),
  I(
    'inti',
    'INTI',
    'INTI International University',
    IPTS,
    'Negeri Sembilan',
    'Nilai',
    'Low',
    PLAIN,
    [['Accommodation', 'https://newinti.edu.my/accommodation/']],
  ),
  I(
    'mahsa',
    'MAHSA',
    'MAHSA University',
    IPTS,
    'Selangor',
    'Jenjarom',
    'Low',
    PLAIN,
    [],
  ),
  I(
    'swinburne',
    'Swinburne',
    'Swinburne University of Technology Sarawak',
    IPTS,
    'Sarawak',
    'Kuching',
    'Low',
    PLAIN,
    [],
  ),
  I(
    'ucsi',
    'UCSI',
    'UCSI University',
    IPTS,
    'WP Kuala Lumpur',
    'Cheras',
    'Low',
    PLAIN,
    [],
  ),
  I(
    'monash-my',
    'Monash',
    'Monash University Malaysia',
    IPTS,
    'Selangor',
    'Bandar Sunway',
    'Unknown',
    'No public evidence found.',
    [],
  ),
  I(
    'utp',
    'UTP',
    'Universiti Teknologi PETRONAS',
    IPTS,
    'Perak',
    'Seri Iskandar',
    'Unknown',
    'No public evidence found.',
    [],
  ),
  I(
    'segi',
    'SEGi',
    'SEGi University',
    IPTS,
    'Selangor',
    'Kota Damansara',
    'Unknown',
    'No public evidence found.',
    [],
  ),
];

export const institutionById = (id: string) =>
  institutions.find((i) => i.id === id);

export const maturityLevels: Maturity[] = [
  'High',
  'Medium–High',
  'Medium',
  'Low–Medium',
  'Low',
  'Unknown',
];
export const maturityScore: Record<Maturity, number> = {
  High: 4,
  'Medium–High': 3.5,
  Medium: 3,
  'Low–Medium': 2,
  Low: 1,
  Unknown: 0,
};

export const auditMethod =
  'Public web pages in English and Malay, opened and checked on 26 Oct 2026. Some university pages blocked automated reading (UPM, UTeM, UniSZA, UMS), and Malaysian news sites search poorly. “Unknown” means no public evidence, not proof of absence; confirm by calling the security office.';

/** Headline findings of the audit, derived from the rows above. */
export const auditTotals = (() => {
  const pub = institutions.filter((i) => i.type === UA);
  const priv = institutions.filter((i) => i.type === IPTS);
  return {
    audited: institutions.length,
    public: pub.length,
    private: priv.length,
    aiPublic: pub.filter((i) => i.ai).length,
    aiPrivate: priv.filter((i) => i.ai).length,
    ai: institutions.filter((i) => i.ai).length,
    /** No institution shows confirmed AI at hostels. */
    hostelAi: 0,
    hostelClaims: institutions.filter(
      (i) => i.hostelAi === 'Claimed, no detail',
    ).length,
    policyAnalytics: institutions.filter((i) => i.policyAnalytics).length,
    faceRecognition: institutions.filter((i) => i.faceRecognition).length,
    stickers: institutions.filter((i) => i.vehicles === 'RFID or stickers')
      .length,
    plates: institutions.filter((i) => i.vehicles.startsWith('Plate')).length,
    unknown: institutions.filter((i) => i.maturity === 'Unknown').length,
  };
})();

/** What the pattern means, in the audit's own words. */
export const patterns = [
  {
    title: 'Policies promise analytics that do not exist',
    text: 'USM, UTHM and UMPSA wrote “video analytics” into CCTV policy years ago. Few campuses can show it running.',
  },
  {
    title: 'Vehicles use RFID stickers, not plate recognition',
    text: 'UTM, UPNM, UNIMAS and UniMAP run stickers; only APU confirms plate recognition, and UPM probably does.',
  },
  {
    title: 'Big-vendor deals are networks, not security',
    text: 'Huawei (UPM, UMS, UiTM) and TM ONE (UUM) sold Wi-Fi and data centres. No campus security analytics deal is public.',
  },
  {
    title: 'Incidents bring guards first, cameras later',
    text: 'UMPSA (2025) and UiTM Puncak Alam (2024) show the trigger is a hostel incident.',
  },
  {
    title: 'No hostel AI anywhere',
    text: 'No Malaysian university, public or private, shows AI at hostels. Taylor’s claims “AI-CCTV” in residences, with no detail.',
  },
];

// ----------------------------------------------------- global benchmarks --

export const leaders = [
  {
    university: 'ITS Surabaya (Indonesia)',
    deployed:
      '76 face-access terminals; 10 radar plate cameras that send speeding notices over 40 km/h; 42 barriers that open only when rider face and plate match; command centre with a map video wall.',
    vendor: 'Hikvision',
    year: '2025',
    result: 'Vendor reports motorcycle theft and speeding fell (no figures).',
    url: 'https://internationalsecurityjournal.com/its-surabaya-hikvision-campus/',
  },
  {
    university: 'NTU (Singapore)',
    deployed:
      'New CCTV with video analytics, 24/7 Security Command Centre; halls and staff housing first.',
    vendor: 'Certis',
    year: '2024',
    result: 'Goals only, no results published.',
    url: 'https://www.ntu.edu.sg/news/detail/ntu-to-ramp-up-tech-use-for-safety-and-security-needs-appoints-certis-as-campus-security-provider',
  },
  {
    university: 'NTU, NUS, SMU, SUTD (Singapore)',
    deployed:
      'Anti-voyeurism: motion alarms in hall toilets, CCTV at restroom entrances only, controlled toilet access.',
    vendor: 'Not named',
    year: '2021',
    result: 'Layered measures; no cameras inside.',
    url: 'https://www.sutd.edu.sg/news-listing/spore-universities-polys-explore-motion-sensors-and-other-tech-devices-to-deter-voyeurs/',
  },
  {
    university: 'Arizona State (US)',
    deployed:
      'Real Time Analysis Center: 3,000–4,000+ cameras, plate readers, body cams, live 911 transcription.',
    vendor: 'Genetec',
    year: '2023',
    result:
      'Property and bike theft “decreased significantly”; national awards.',
    url: 'https://news.asu.edu/b/20251017-asu-police-real-time-analysis-center-earns-national-recognition',
  },
  {
    university: 'Binghamton (US)',
    deployed:
      '1,635 cameras, 4,800+ readers, plate readers, crowd-gathering analytics, evidence management.',
    vendor: 'Genetec',
    year: '2025',
    result: 'Faster incident response (not quantified).',
    url: 'https://www.securitysystemsnews.com/article/binghamton-university-unifies-campus-safety-tools-with-genetec',
  },
  {
    university: 'Michigan State, Grand Canyon (US)',
    deployed:
      'MSU: ~3,000 cameras in a 24/7 operations centre with clothing and direction search; GCU: 500+ AI cameras linked to dispatch.',
    vendor: 'Genetec, Verkada',
    year: '2025',
    result: '“Force multiplier”; no metrics.',
    url: 'https://edtechmagazine.com/higher/article/2026/05/real-time-security-centers-keep-watchful-eye-campus-activity',
  },
  {
    university: 'Chung-Ang (South Korea)',
    deployed:
      'Cloud cameras; search by clothing, vehicle or plate; cross-camera timeline; face blur.',
    vendor: 'Verkada',
    year: 'n/a',
    result: 'Tracked one suspect across campus with police.',
    url: 'https://www.verkada.com/customers/chung-ang-university/',
  },
  {
    university: 'Curtin (Australia)',
    deployed:
      'AI that learns “normal” scenes and flags anomalies to operators.',
    vendor: 'icetana',
    year: '10+ years; renewed 2026',
    result: 'Licences more than doubled; contract renewed to 2029.',
    url: 'https://www.techpartner.news/news/curtin-university-renews-contract-with-icetana-ai-625029',
  },
  {
    university: 'Boston College (US)',
    deployed: '16 AI walk-through weapons screeners at the stadium and arena.',
    vendor: 'Evolv',
    year: '2023',
    result: 'Events only.',
    url: 'https://ir.evolvtechnology.com/news-events/press-releases/detail/164/boston-college-using-evolv-for-weapons-detection-screening',
  },
  {
    university: 'Tsinghua, XJTU, Zhejiang (China)',
    deployed: 'Face scan at enrolment, labs and smart classrooms.',
    vendor: 'Uniview',
    year: '~2019',
    result:
      'Followed by the Ministry of Education’s 2019 pledge to curb face recognition in schools.',
    url: 'https://thechinaproject.com/2019/09/06/china-to-curb-facial-recognition-technology-in-schools/',
  },
  {
    university: 'KAUST (Saudi Arabia)',
    deployed:
      '15.4 km perimeter with automatic intrusion detection; CCTV and drones with a published privacy notice.',
    vendor: 'SightLogix, Geutebruck',
    year: '2009',
    result: 'Old project.',
    url: 'https://www.kaust.edu.sa/privacy-notice/cctv-and-drones',
  },
];

export const governanceLessons = [
  {
    title: 'UCLA dropped face recognition',
    text: 'In 2020, after a test falsely matched 58 athletes and staff to mugshots.',
    url: 'https://www.securitysales.com/news/ucla-abandons-facial-recognition-plan/108162/',
  },
  {
    title: 'China cracked down on classroom attention tracking',
    text: 'Classroom “attentiveness” tracking drew a Ministry of Education pledge to curb face recognition in schools.',
    url: 'https://thechinaproject.com/2019/09/06/china-to-curb-facial-recognition-technology-in-schools/',
  },
  {
    title: 'Edinburgh publishes the template',
    text: 'A privacy impact assessment for every camera, privacy masking, 30-day retention, named viewer roles, logged access and quarterly audits.',
    url: 'https://estates.ed.ac.uk/sites/default/files/2024-08/CCTV%20Protocol%20.pdf',
  },
];

/** Capability gap: leaders vs Malaysian campuses vs EzVision today. */
export const capabilityGap = [
  {
    capability: 'Command centre with live alerts',
    leaders: 'Standard (ASU, MSU, NTU, ITS)',
    public: 'UMPSA only; others watch screens',
    private: 'None',
    ezvision: 'Console exists (ParqOS, Condo)',
  },
  {
    capability: 'Plate recognition at gates',
    leaders: 'Standard',
    public: 'UPM likely; others RFID stickers',
    private: 'APU only',
    ezvision: 'Live',
  },
  {
    capability: 'Hostel entry analytics',
    leaders: 'NTU halls first; ITS face gates',
    public: 'None',
    private: 'Taylor’s claims only',
    ezvision: 'Build (this spec)',
  },
  {
    capability: 'Fight, bullying, vape alerts',
    leaders: 'Verkada fight; nobody does vape',
    public: 'None',
    private: 'None',
    ezvision: 'PoC (AIWAS)',
  },
  {
    capability: 'Search by clothing or plate',
    leaders: 'Standard',
    public: 'None',
    private: 'None',
    ezvision: 'Build',
  },
  {
    capability: 'Face recognition',
    leaders: 'Common in China and ITS; dropped at UCLA',
    public: 'UM library',
    private: 'Sunway library',
    ezvision: 'Opt-in only',
  },
  {
    capability: 'Published privacy rules',
    leaders: 'Edinburgh template',
    public: 'CCTV policies at USM, UTHM, UMPSA',
    private: 'XMUM privacy notice',
    ezvision: 'Ship as standard',
  },
];

/** PDPA points that matter to a ministry overseeing campus cameras. */
export const pdpaPoints = [
  {
    title: 'Biometric data is sensitive personal data',
    text: 'Under the PDPA Amendment Act 2024, face features need explicit consent. UM and Sunway run library face recognition today.',
  },
  {
    title: 'DPO and breach notification from 1 June 2025',
    text: 'Controllers must appoint a data protection officer and notify breaches. Fines reach RM1,000,000.',
  },
  {
    title: 'Processors carry security duties directly',
    text: 'Vendors such as EzGIG are now accountable for the security of what they process, not only the university.',
  },
];
export const pdpaUrl =
  'https://www.dataprotectionreport.com/2025/01/new-horizons-in-data-protection-malaysias-personal-data-protection-amendment-act-2024/';

// ------------------------------------------------- EzVision aggregates --

/** Counts from 1 to 4 are shown as "<5" so no small group can be singled out. */
export const suppress = (n: number) =>
  n > 0 && n < 5 ? '<5' : n.toLocaleString();

/**
 * Aggregate hostel-integrity figures from EzVision pilots. Only UM reports,
 * and only as totals: no blocks, cameras, footage or people.
 */
export const pilotAggregates = {
  reporting: institutions.filter((i) => i.ezvision).length,
  blocks: 2,
  cameras: pilotCameras.length,
  weekly: hostelWeekly.map((w) => ({
    week: w.week,
    confirmed: w.a + w.b,
    falseAlarms: w.falseA + w.falseB,
  })),
  precision: (() => {
    const h = precisionByModule.find((p) => p.module === 'hostel')!;
    return Math.round((h.confirmed / (h.confirmed + h.false)) * 100);
  })(),
  ackP50: ackTimes.at(-1)!.p50,
  uptime: uptimeDaily.at(-1)!.pilot,
  campusCameras: cameras.length,
  kpis: pilotKpis,
};

export const kptExclusionLine =
  'No footage, images, plates, camera IDs or personal names reach the ministry, and counts from 1 to 4 are suppressed.';
