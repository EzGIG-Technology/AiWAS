// Test bundle: built with Vite in SSR mode so node:test can import the
// TypeScript modules and render React views to strings.
export { default as Home } from '../app/page';
export { DemoProvider } from '../app/_lib/store';
export { UmWorkspace, umAccess, umTitles } from '../app/_views/um/workspace';
export { KptWorkspace, kptTitles } from '../app/_views/kpt/workspace';
export { AppsWorkspace } from '../app/_views/apps/workspace';
export * as media from '../app/_data/media';
export * as um from '../app/_data/um';
export * as kpt from '../app/_data/kpt';
export * as personas from '../app/_data/personas';
export { logoFiles } from '../app/_data/logos';
