export const SITE = {
  name: 'Impact Financing Framework',
  url: 'https://impactfinancingframework.org',
  description:
    'A practical framework for market shaping and adjacent market and financial interventions, grounded in economic theory and organized around cost-effectiveness: two kinds of gap, the levers that last, and the payers that keep paying.',
  version: '2.0 (draft)',
  updated: 'November 2026',
  modified: '2026-11-02', // ISO date for structured data; update with each content release
  license: 'https://creativecommons.org/licenses/by/4.0/',
  year: 2026,
};

export const NAV = [
  { href: '/foundations/', label: 'Foundations' },
  { href: '/framework/', label: 'Framework' },
  { href: '/cost-effectiveness/', label: 'Cost-Effectiveness' },
  { href: '/cases/', label: 'Case Studies' },
  { href: '/instruments/', label: 'Instruments' },
  { href: '/diagnostic/', label: 'Diagnostic' },
  { href: '/glossary/', label: 'Glossary' },
];

// Sub-navigation shown on the framework's three layer pages.
export const FRAMEWORK_NAV = [
  { href: '/framework/', label: 'Two Landscapes' },
  { href: '/framework/mechanisms/', label: 'Mechanisms' },
  { href: '/framework/payers/', label: 'Payers and Buyers' },
  { href: '/framework/catalyst/', label: 'The Catalyst' },
];

// Reading order for the "Continue" link at the foot of each page.
export const SEQUENCE = [
  { href: '/', label: 'Home' },
  { href: '/foundations/', label: 'Foundations' },
  { href: '/framework/', label: 'The Framework' },
  { href: '/framework/mechanisms/', label: 'Mechanisms' },
  { href: '/framework/payers/', label: 'Payers and Buyers' },
  { href: '/framework/catalyst/', label: 'The Catalyst' },
  { href: '/cost-effectiveness/', label: 'Cost-Effectiveness' },
  { href: '/cases/', label: 'Case Studies' },
  { href: '/diagnostic/', label: 'The Diagnostic' },
];
