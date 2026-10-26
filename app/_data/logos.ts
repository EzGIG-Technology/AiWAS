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
  um: 'um.png',
  usm: null,
  ukm: null,
  upm: null,
  utm: null,
  uitm: null,
  iium: null,
  uum: null,
  unimas: null,
  ums: null,
  upsi: null,
  usim: null,
  umt: null,
  uthm: null,
  utem: null,
  umpsa: null,
  unimap: null,
  unisza: null,
  umk: null,
  upnm: null,
  taylors: null,
  'monash-my': null,
  sunway: null,
  ucsi: null,
  mmu: null,
  uniten: null,
  utp: null,
  apu: null,
};
