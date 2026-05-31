/* Shared data + helpers, ported from the DQ Payment Page design (data.jsx). */

export interface Plan {
  id: 'sp' | 'co';
  mode: string;
  modeIcon: string;
  name: string;
  price: number;
  note: string;
  canInstall: boolean;
  popular?: boolean;
  installEach?: number;
  sub: string;
  /** Stripe price id for the live checkout integration. */
  stripePriceId: string;
  /** Plan keyword sent to POST /api/sessions/create to select this price. */
  stripePlan: 'full' | 'installment';
}

export const PLANS: Record<'sp' | 'co', Plan> = {
  sp: {
    id: 'sp',
    mode: 'Self-paced',
    modeIcon: 'book-open',
    name: 'Self-paced access',
    // Fallback only — overridden by GET /api/products. Matches the live
    // "Self Learning" price (NZ$97.00 / price_1Tckj9L2NSYmkihOPRPBsJnk).
    price: 97,
    note: 'one-time',
    canInstall: false,
    sub: 'Curriculum, templates & community · lifetime access · learn at your own pace',
    stripePriceId: 'price_1Tckj9L2NSYmkihOPRPBsJnk', // NZ$97 "Self Learning"
    stripePlan: 'full',
  },
  co: {
    id: 'co',
    mode: '4-week cohort',
    modeIcon: 'users',
    popular: true,
    name: '4-week cohort',
    // Fallback only — overridden by GET /api/products. Matches the live
    // "Cohort" price (NZ$497.00 / price_1TckiJL2NSYmkihOBWzknNfl).
    price: 497,
    note: 'next intake Jun 2026',
    canInstall: false,
    sub: 'Everything in self-paced + 4 weeks of live sessions, the 30-day challenge & mentor feedback',
    stripePriceId: 'price_1TckiJL2NSYmkihOBWzknNfl', // NZ$497 "Cohort"
    stripePlan: 'installment',
  },
};

/** Stripe product the session is created against. */
export const PRODUCT_ID = 'prod_UbyfRuBJKm8F1o';

export const COUPONS: Record<string, number> = { DQ20: 0.2, TEAM10: 0.1 };

export interface IncludedItem {
  t: 'core' | 'bonus';
  l: string;
  d: string;
}

export const INCLUDED: IncludedItem[] = [
  {
    t: 'core',
    l: 'The Mastering AI Testing Curriculum',
    d: '30 days of video lessons, real examples and practical modules — everything you need to master AI-driven testing.',
  },
  {
    t: 'core',
    l: 'Course Guide',
    d: 'A daily downloadable checklist to track your progress and make sure you’re implementing every learning as you move through the course.',
  },
  {
    t: 'core',
    l: 'Slack Community',
    d: 'A private community of AI test pioneers with channels for different topics, platforms & tools — connect with likeminded engineers and join community-curated experiences.',
  },
  {
    t: 'core',
    l: '30 days of AI prompt templates',
    d: 'Each day includes a ready-to-use template and walkthrough to build your prompt engineering skills.',
  },
  {
    t: 'core',
    l: 'Rapid-Fire Intros',
    d: 'As a member of the TalentDojo & Democratize Quality community, use our rapid-fire introduction system to serendipitously meet other test engineers.',
  },
  {
    t: 'bonus',
    l: 'Lifetime access',
    d: 'To the AI Testing Mastery curriculum, complete template library, and exclusive community for continuous learning and peer support.',
  },
  {
    t: 'bonus',
    l: 'The AI Test Automation Starter Kit ($297 value)',
    d: 'A complete setup package: pre-configured VS Code environment, GitHub Copilot settings, Ollama configurations, and production-ready test templates across UI, API, accessibility and performance testing.',
  },
  {
    t: 'bonus',
    l: 'AI Prompt Engineering for Testers ($199 value)',
    d: 'An advanced mini-course revealing the exact prompt patterns that generate enterprise-grade test code in minutes instead of hours — with proven prompts for common testing scenarios.',
  },
  {
    t: 'bonus',
    l: 'The Enterprise AI Testing Playbook ($249 value)',
    d: 'A step-by-step guide for rolling out AI testing across your organisation — security frameworks, compliance checklists, team training materials and executive buy-in templates.',
  },
  {
    t: 'bonus',
    l: 'Leave market-ready',
    d: 'Walk away with a production-ready AI testing environment, automated test suites you built yourself, enterprise-grade security, your own template library, and proven strategies to accelerate your testing career.',
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: 'Do I need prior AI experience to join this workshop?',
    a: 'No prior AI experience needed. You bring hands-on testing experience — we take you from there to working confidently with GitHub Copilot, local LLMs and Model Context Protocols.',
  },
  {
    q: 'What tools do I need for the workshop?',
    a: 'Just your usual machine. We help you set up VS Code, GitHub Copilot and Ollama as part of the Starter Kit — and everything is model-agnostic, so it also works with ChatGPT, Claude or Gemini.',
  },
  {
    q: 'Is this workshop live or pre-recorded?',
    a: 'Both. Core lessons are pre-recorded so you can learn at your own pace, with live sessions across the four weeks for Q&A, walkthroughs and feedback on your work.',
  },
  {
    q: 'How does the 30-day challenge work?',
    a: 'Each day you get one small, real-workflow task and a ready-to-use prompt template. Thirty days in, AI-assisted testing is simply how you work — not a thing you have to remember to do.',
  },
  {
    q: 'What if I can’t attend the live session?',
    a: 'Every live session is recorded and posted in the community, so you never miss anything — catch up whenever it suits and bring your questions to the next one.',
  },
  {
    q: 'Is this suitable for enterprise teams?',
    a: 'Yes. The Enterprise AI Testing Playbook gives you security frameworks, compliance checklists and executive buy-in templates. Team cohorts with custom pricing and a dedicated mentor session are available — just ask.',
  },
  {
    q: 'What’s your refund policy?',
    a: 'Complete week one and if the framework isn’t delivering value, we’ll refund you in full — no questions asked.',
  },
];

export interface DPill {
  c: string;
  n: string;
  label: string;
}

export const D_PILLS: DPill[] = [
  { c: 'd1', n: 'D1', label: 'Delegation' },
  { c: 'd2', n: 'D2', label: 'Description' },
  { c: 'd3', n: 'D3', label: 'Discernment' },
  { c: 'd4', n: 'D4', label: 'Diligence' },
];

export const CTA_THEMES: Record<string, { hover: string; halo: string }> = {
  '#7BC8A4': { hover: '#6BB893', halo: '0 8px 20px rgb(123 200 164 / 35%)' },
  '#1B7B8A': { hover: '#155F6B', halo: '0 8px 20px rgb(27 123 138 / 30%)' },
  '#2B8FA3': { hover: '#237486', halo: '0 8px 20px rgb(43 143 163 / 32%)' },
};

/** Active display currency — overridden once /api/products loads. */
export let CURRENCY = 'NZD';
export function setCurrency(c: string): void {
  CURRENCY = (c || 'NZD').toUpperCase();
}

const CURRENCY_SYMBOL: Record<string, string> = {
  NZD: 'NZ$', AUD: 'A$', USD: '$', CAD: 'C$', GBP: '£', EUR: '€',
};

export const fmt = (n: number): string => {
  const sym = CURRENCY_SYMBOL[CURRENCY] ?? CURRENCY + ' ';
  return sym + Math.round(n).toLocaleString('en-NZ');
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Pricing {
  base: number;
  discount: number;
  total: number;
}

export function pricing(
  planData: Plan,
  appliedCoupon: { code: string; pct: number } | null,
): Pricing {
  const base = planData.price;
  const discount = appliedCoupon ? Math.round(base * appliedCoupon.pct) : 0;
  return { base, discount, total: base - discount };
}
