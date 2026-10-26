/**
 * Official logo files in public/logos, keyed by institution id.
 *
 * The files could not be downloaded in the environment that built this demo
 * (the hosts were blocked; see docs/research/logo-sources.md). To add one,
 * place the official file in public/logos (for example `um.svg`) and set its
 * entry here. `UniversityLogo` then renders it instead of the acronym crest.
 *
 * Universiti Malaya's logo was supplied by EzGIG: `um.png` is the crest cut
 * from the supplied lockup, `um-lockup.png` the full crest-and-wordmark.
 */
/** Full horizontal lockups (crest and wordmark), where supplied. */
export const logoLockups: Record<string, string> = {
  um: 'um-lockup.png',
};

export const logoFiles: Record<string, string | null> = {
  kpt: null,
  umpsa: null,
  um: 'um.png',
  usm: null,
  upm: null,
  utm: null,
  unisza: null,
  uitm: null,
  ukm: null,
  uthm: null,
  umk: null,
  ums: null,
  upsi: null,
  iium: null,
  unimap: null,
  unimas: null,
  upnm: null,
  uum: null,
  usim: null,
  umt: null,
  utem: null,
  apu: null,
  sunway: null,
  taylors: null,
  nottingham: null,
  xmum: null,
  msu: null,
  hwum: null,
  'curtin-my': null,
  utar: null,
  mmu: null,
  uniten: null,
  inti: null,
  mahsa: null,
  swinburne: null,
  ucsi: null,
  'monash-my': null,
  utp: null,
  segi: null,
};
