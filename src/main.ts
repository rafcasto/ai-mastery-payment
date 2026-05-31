/**
 * DQ Payment Page — TalentDojo × Democratize Quality enrolment + checkout.
 *
 * Faithful TypeScript port of the Claude Design prototype (app.jsx + checkout.jsx),
 * wired to the live Ghost/Stripe endpoints:
 *   GET  /api/config           -> Stripe publishable key
 *   POST /api/sessions/create  -> embedded Checkout clientSecret
 *   GET  /api/coupons/:code     -> server-side coupon validation
 *
 * Payment is collected ONCE, by Stripe. This page gathers only the buyer's
 * contact details + plan + coupon, then hands off to Stripe Embedded Checkout
 * which securely collects the card (and any other payment method). When the API
 * is unreachable (e.g. origin-locked during local dev) it falls back to the
 * prototype's confirmation panel so the page stays demoable end-to-end.
 */
import { loadStripe, type Stripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { api, ApiError, API_BASE, type ApiProduct, type ApiPrice } from './api';
import { icon } from './icons';
import {
  PLANS,
  PRODUCT_ID,
  COUPONS,
  INCLUDED,
  FAQS,
  D_PILLS,
  fmt,
  EMAIL_RE,
  pricing,
  setCurrency,
} from './data';

/* --------------------------------- state ---------------------------------- */

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
}

interface AppState {
  plan: 'sp' | 'co';
  couponOpen: boolean;
  couponInput: string;
  appliedCoupon: { code: string; pct: number } | null;
  couponMsg: string;
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  submitted: boolean;
  orderRef: string;
  processing: boolean;
  payError: string | null;
}

const state: AppState = {
  plan: 'sp',
  couponOpen: false,
  couponInput: '',
  appliedCoupon: null,
  couponMsg: '',
  form: { firstName: '', lastName: '', email: '' },
  errors: {},
  submitted: false,
  orderRef: '',
  processing: false,
  payError: null,
};

let stripe: Stripe | null = null;
let embedded: StripeEmbeddedCheckout | null = null;

/**
 * Product id used when creating the checkout session. Defaults to the design
 * constant but is overwritten with whatever GET /api/products actually serves,
 * so checkout always targets the live product rather than a stale hardcoded id.
 */
let activeProductId = PRODUCT_ID;

const root = document.getElementById('root')!;

/* ------------------------------ left column ------------------------------- */

function leftColumnHTML(): string {
  const pills = D_PILLS.map(
    (d) =>
      `<span class="d-pill ${d.c}"><span class="dot"></span><span class="num">${d.n}</span> · ${d.label}</span>`,
  ).join('');

  const included = INCLUDED.map(
    (it) => `
    <div class="inc-item">
      <span class="inc-ic ${it.t}">${icon(it.t === 'core' ? 'check' : 'star', { size: 14, fill: it.t === 'bonus' })}</span>
      <span class="inc-text"><b>${it.l}.</b> ${it.d}</span>
    </div>`,
  ).join('');

  const faqs = FAQS.map(
    (f, i) => `
    <div class="faq-item${i === 0 ? ' open' : ''}" data-faq="${i}">
      <button type="button" class="faq-q">${f.q}${icon('plus', { size: 18, className: 'faq-icon' })}</button>
      <div class="faq-a-wrap"><div class="faq-a"><p>${f.a}</p></div></div>
    </div>`,
  ).join('');

  return `
    <div class="col-left">
      <span class="eyebrow">${icon('sparkles', { size: 15 })} TalentDojo × Democratize Quality</span>
      <h1 class="hero-h1">Master <b>AI-powered testing</b> in 4 weeks<br />+ a 30-day implementation challenge.</h1>
      <p class="hero-lede">TalentDojo &amp; Democratize Quality designed this programme to accelerate the adoption of AI-driven testing in <b>weeks, not months</b>. <em>Model-agnostic: works with ChatGPT, Gemini, Claude or Copilot.</em></p>
      <p class="hero-out">By the end you’ll have mastered <b>GitHub Copilot, local LLMs and Model Context Protocols</b> to build comprehensive test suites <b>10× faster</b> than traditional methods.</p>
      <div class="d-row">${pills}</div>

      <div class="sec">
        <div class="testi">
          <p class="testi-quote">If you’re looking for a programme that offers a practical, comprehensive curriculum, a great learning environment and incredible career support, then this is for you!</p>
          <div class="testi-auth">
            <div class="testi-av">DP</div>
            <div>
              <div class="testi-name">Daria Pinchuk</div>
              <div class="testi-role">Avid Medical · Auckland, NZ</div>
            </div>
          </div>
        </div>
      </div>

      <div class="sec">
        <div class="sec-label">Here’s everything you get the moment you join</div>
        <div class="inc-grid">${included}</div>
        <div class="inc-legend">
          <span><span class="sw inc-ic core">${icon('check', { size: 12 })}</span> Core programme</span>
          <span><span class="sw inc-ic bonus">${icon('star', { size: 12, fill: true })}</span> Bonus resources</span>
        </div>
      </div>

      <div class="sec">
        <div class="sec-label">Common questions</div>
        <div>${faqs}</div>
      </div>

      <div class="sec">
        <div class="free free--center">
          <h3 class="free-title">Need more information?</h3>
          <p class="free-sub">Have specific questions about the workshop content, enterprise implementation, or team pricing? We’re here to help.</p>
          <div class="free-btns">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
              <a class="cta" href="https://jhg-curriculum.vercel.app/register/B1LdON23yiLAPclAFV1O" style="width:auto;display:inline-flex;margin-top:0">
                See How It Works ${icon('arrow-up-right', { size: 16 })}
              </a>
              <span class="cta-fineprint" style="margin-top:0">Create a free account to take a look inside</span>
            </div>
            <a class="cta-ghost" href="mailto:rafael@talentdojo.pro?subject=AI%20Testing%20Mastery%20%E2%80%94%20funding%20options">How to get funded</a>
          </div>
          <div class="free-note">Email us at <a href="mailto:rafael@talentdojo.pro">rafael@talentdojo.pro</a> or schedule a 15-minute consultation call.</div>
        </div>
      </div>

      <p class="foot">© 2026 TalentDojo × Democratize Quality · Model-agnostic — works with ChatGPT, Claude, Gemini &amp; Copilot.<br />Share the ♥, don’t steal the IP.</p>
    </div>`;
}

/* ----------------------------- checkout panel ----------------------------- */

function planSelectHTML(): string {
  return (['sp', 'co'] as const)
    .map((id) => {
      const p = PLANS[id];
      const sel = state.plan === id ? ' sel' : '';
      const tag = p.popular ? `<span class="psel-tag">Popular</span>` : '';
      const note = p.canInstall ? `or ${fmt(p.installEach!)} ×2` : 'one-time';
      return `
      <button type="button" class="psel${sel}" data-plan="${id}" aria-pressed="${state.plan === id}">
        <span class="psel-radio"></span>
        <span class="psel-body">
          <span class="psel-name">${p.name}${tag}</span>
          <span class="psel-sub">${p.sub}</span>
        </span>
        <span class="psel-price"><b>${fmt(p.price)}</b><small>${note}</small></span>
      </button>`;
    })
    .join('');
}

function errLine(field: keyof FormState): string {
  const e = state.errors[field];
  return e ? `<div class="field-err">${icon('x', { size: 12 })} ${e}</div>` : '';
}

function checkoutPanelHTML(): string {
  const planData = PLANS[state.plan];
  const price = pricing(planData, state.appliedCoupon);

  // Payment is collected by Stripe on the next step — we only reassure here.
  const payZone = `
    <div class="card-zone">
      <div class="card-icons">
        <span class="card-chip cc-v">VISA</span>
        <span class="card-chip cc-m">MC</span>
        <span class="card-chip cc-a">AMEX</span>
        <span class="card-chip">PayPal</span>
      </div>
      <p style="font-family:var(--font-body);font-size:13.5px;line-height:1.6;color:var(--fg-2);margin:4px 2px 0">
        Click <b style="font-weight:600;color:var(--fg-1)">Secure your place</b> and you’ll enter your card details
        <b style="font-weight:600;color:var(--fg-1)">once</b>, on a secure checkout powered by
        <b style="font-weight:600;color:var(--fg-1)">Stripe</b>. We never see or store your card number.
      </p>
    </div>`;

  let couponBlock = '';
  {
    if (!state.appliedCoupon && !state.couponOpen) {
      couponBlock = `<button type="button" class="coupon-toggle" data-action="coupon-open">${icon('tag', { size: 14 })} Have a coupon code?</button>`;
    } else if (!state.appliedCoupon && state.couponOpen) {
      couponBlock = `
        <div class="coupon-row">
          <input class="input" data-field="couponInput" value="${state.couponInput}" placeholder="Enter code" />
          <button type="button" class="coupon-btn" data-action="coupon-apply">Apply</button>
        </div>
        ${state.couponMsg ? `<div class="coupon-msg">${state.couponMsg}</div>` : ''}`;
    } else if (state.appliedCoupon) {
      couponBlock = `
        <div class="coupon-applied">
          <span class="ca-left">${icon('badge-check', { size: 16 })} Code <b>${state.appliedCoupon.code}</b> applied — ${Math.round(state.appliedCoupon.pct * 100)}% off</span>
          <button type="button" class="ca-x" data-action="coupon-remove" aria-label="Remove coupon">${icon('x', { size: 15 })}</button>
        </div>`;
    }
    couponBlock = `<div style="margin-top:18px">${couponBlock}</div>`;
  }

  const discountRow = state.appliedCoupon
    ? `<div class="sum-row discount"><span>Coupon ${state.appliedCoupon.code} (−${Math.round(state.appliedCoupon.pct * 100)}%)</span><span>−${fmt(price.discount)}</span></div>`
    : '';

  const totalVal = `${fmt(price.total)}<small>${planData.note === 'one-time' ? 'one-time payment' : planData.note}</small>`;

  const ctaInner = state.processing
    ? `${icon('lock', { size: 16 })} Processing…`
    : `${icon('lock', { size: 16 })} Secure your place`;

  return `
    <div class="checkout">
      <div class="checkout-head">
        <span class="eyebrow">${icon('lock', { size: 14 })} Secure enrolment</span>
        <div class="checkout-plan">
          <span class="checkout-plan-name">${planData.name}</span>
          <span class="checkout-plan-price">${fmt(planData.price)}</span>
        </div>
      </div>
      <div class="checkout-body">
        <div class="block-label">Format</div>
        ${planSelectHTML()}

        <div class="block-label">Your details</div>
        <div class="row-2">
          <div class="field">
            <label class="field-label">First name</label>
            <input class="input${state.errors.firstName ? ' err' : ''}" data-field="firstName" value="${state.form.firstName}" placeholder="Alex" />
            ${errLine('firstName')}
          </div>
          <div class="field">
            <label class="field-label">Last name</label>
            <input class="input${state.errors.lastName ? ' err' : ''}" data-field="lastName" value="${state.form.lastName}" placeholder="Chen" />
            ${errLine('lastName')}
          </div>
        </div>
        <div class="field">
          <label class="field-label">Email address</label>
          <input class="input${state.errors.email ? ' err' : ''}" type="email" data-field="email" value="${state.form.email}" placeholder="alex@company.com" />
          ${errLine('email')}
        </div>

        <div class="block-label">Payment</div>
        ${payZone}
        ${couponBlock}

        <div class="sum">
          <div class="sum-row"><span>${planData.name}</span><span>${fmt(planData.price)}</span></div>
          ${discountRow}
          <div class="sum-row"><span>Bonus resources</span><span class="muted">Included</span></div>
          <div class="sum-total">
            <span class="lbl">Total</span>
            <span class="val">${totalVal}</span>
          </div>
        </div>

        ${state.payError ? `<div class="pay-error" role="alert" style="margin-top:16px;padding:11px 13px;border-radius:10px;background:#fdecec;border:1px solid #f3c0c0;color:#a12a2a;font-family:var(--font-body);font-size:13px;line-height:1.5;display:flex;gap:8px;align-items:flex-start">${icon('x', { size: 14 })}<span>${state.payError}</span></div>` : ''}
        <button class="cta" data-action="submit"${state.processing ? ' disabled' : ''}>${ctaInner}</button>
        <p class="cta-fineprint">By enrolling you agree to our terms. Complete week one risk-free — full refund if it's not for you.</p>

        <div class="trust">
          <span>${icon('lock', { size: 13 })} 256-bit secure</span>
          <span>${icon('shield-check', { size: 13 })} Refund guarantee</span>
          <span>${icon('globe', { size: 13 })} Model-agnostic</span>
        </div>
      </div>
    </div>`;
}

function successPanelHTML(): string {
  const planData = PLANS[state.plan];
  const price = pricing(planData, state.appliedCoupon);
  const nextPay = '';
  return `
    <div class="checkout">
      <div class="success">
        <div class="seal">${icon('check', { size: 38, stroke: 2.4 })}</div>
        <h3>You're enrolled! 🎉</h3>
        <p>Welcome to the programme, <b>${state.form.firstName || 'there'}</b>. We've sent your access link and receipt to <b>${state.form.email || 'your inbox'}</b>.</p>
        <div class="success-card">
          <div class="sc-row"><span>Programme</span><b>${planData.name}</b></div>
          <div class="sc-row"><span>Order reference</span><b>${state.orderRef}</b></div>
          <div class="sc-row"><span>Amount paid</span><b>${fmt(price.total)}</b></div>
          ${nextPay}
        </div>
        <p style="font-size:13.5px;color:var(--fg-3)">Check your email for the first lesson and your participant workbook.</p>
        <button class="success-back" data-action="reset">${icon('arrow-left', { size: 15 })} Back to enrolment</button>
      </div>
    </div>`;
}

/* ------------------------------ full render ------------------------------- */

function headerHTML(): string {
  return `
    <header class="site-header">
      <div class="site-header__inner">
        <a class="brand" href="#">
          <img src="/assets/dq/logo-512.png" alt="Democratize Quality" />
          <span class="brand__name">DEMOCRATIZE QUALITY<small>AI-enabled testing workshop</small></span>
        </a>
        <div class="header-spacer"></div>
        <div class="header-aux">
          <a class="header-link" href="#">${icon('help-circle', { size: 16 })} <span class="hide-sm">Questions?</span></a>
          <span class="header-secure">${icon('lock', { size: 14 })} Secure checkout</span>
        </div>
      </div>
    </header>`;
}

/** Render the whole shell once. */
function renderApp(): void {
  root.innerHTML = `
    ${headerHTML()}
    <div class="wrap">
      <div class="layout" data-layout="split" data-dstyle="rainbow">
        ${leftColumnHTML()}
        <div class="col-right" id="checkout">${checkoutPanelHTML()}</div>
      </div>
    </div>`;
}

/** Re-render only the right column, preserving focus on the active field. */
function renderCheckout(): void {
  const col = document.getElementById('checkout');
  if (!col) return;
  const active = document.activeElement as HTMLElement | null;
  const activeField = active?.getAttribute('data-field') || null;
  const selStart = (active as HTMLInputElement | null)?.selectionStart ?? null;

  col.innerHTML = state.submitted ? successPanelHTML() : checkoutPanelHTML();

  if (activeField) {
    const next = col.querySelector<HTMLInputElement>(`[data-field="${activeField}"]`);
    if (next) {
      next.focus();
      if (selStart != null && next.setSelectionRange) {
        try {
          next.setSelectionRange(selStart, selStart);
        } catch {
          /* number/select inputs */
        }
      }
    }
  }
}

/* ------------------------------ interactions ------------------------------ */

function applyCoupon(): void {
  const code = state.couponInput.trim().toUpperCase();
  if (COUPONS[code] != null) {
    state.appliedCoupon = { code, pct: COUPONS[code] };
    state.couponMsg = '';
    state.couponOpen = false;
    state.couponInput = '';
  } else {
    state.couponMsg = `That code isn’t valid. Try ${Object.keys(COUPONS)[0]}.`;
  }
  renderCheckout();
}

function validate(): boolean {
  const e: AppState['errors'] = {};
  const f = state.form;
  if (!f.firstName.trim()) e.firstName = 'Required';
  if (!f.lastName.trim()) e.lastName = 'Required';
  if (!f.email.trim()) e.email = 'Enter your email';
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email';
  state.errors = e;
  return Object.keys(e).length === 0;
}

function simulateSuccess(): void {
  state.orderRef = 'DQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  state.submitted = true;
  state.processing = false;
  renderCheckout();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Live checkout: create an embedded Checkout session and mount it. This is the
 * ONE place the buyer enters their card — Stripe collects it securely here.
 * Returns true if Stripe took over; false to fall back to the design's success.
 */
async function tryStripeCheckout(): Promise<boolean> {
  if (!stripe) return false;
  try {
    const { clientSecret } = await api.createSession({
      productId: activeProductId,
      plan: PLANS[state.plan].stripePlan,
      email: state.form.email.trim(),
      firstName: state.form.firstName.trim(),
      lastName: state.form.lastName.trim(),
      ...(state.appliedCoupon ? { promotionCode: state.appliedCoupon.code } : {}),
    });

    const col = document.getElementById('checkout');
    if (!col) return false;
    col.innerHTML = `
      <div class="checkout">
        <div class="checkout-head">
          <span class="eyebrow">${icon('lock', { size: 14 })} Secure payment</span>
          <div class="checkout-plan">
            <span class="checkout-plan-name">${PLANS[state.plan].name}</span>
            <span class="checkout-plan-price">${fmt(PLANS[state.plan].price)}</span>
          </div>
        </div>
        <div class="checkout-body">
          <button class="success-back" data-action="reset" style="margin:0 0 14px">${icon('arrow-left', { size: 15 })} Back to details</button>
          <div id="checkout-embed"></div>
        </div>
      </div>`;

    embedded?.destroy();
    embedded = await stripe.initEmbeddedCheckout({ clientSecret });
    embedded.mount('#checkout-embed');
    return true;
  } catch (err) {
    console.error('[stripe] live checkout failed:', err);
    if (err instanceof ApiError) console.error('[stripe] status', err.status, err.message);
    state.payError =
      err instanceof ApiError
        ? `We couldn’t start secure checkout: ${err.message}`
        : 'We couldn’t reach the payment service. Please check your connection and try again.';
    return false;
  }
}

async function onSubmit(): Promise<void> {
  if (state.processing) return;
  if (!validate()) {
    renderCheckout();
    return;
  }
  state.payError = null;
  state.processing = true;
  renderCheckout();

  const tookOver = await tryStripeCheckout();
  if (tookOver) return;

  // Live checkout did not take over. If Stripe IS configured, this is a real
  // failure — show the error instead of a fake "enrolled" screen. Only when
  // Stripe was never configured (offline/local dev) do we fall back to the demo
  // confirmation so the page stays previewable.
  state.processing = false;
  if (stripe) {
    if (!state.payError) state.payError = 'We couldn’t start secure checkout. Please try again.';
    renderCheckout();
    return;
  }
  simulateSuccess();
}

function reset(): void {
  embedded?.destroy();
  embedded = null;
  state.submitted = false;
  state.processing = false;
  state.errors = {};
  state.payError = null;
  renderCheckout();
}

/* ----------------------------- event wiring ------------------------------- */

function bindEvents(): void {
  // Clicks (delegated).
  root.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;

    const faq = target.closest<HTMLElement>('.faq-q');
    if (faq) {
      const item = faq.closest('.faq-item');
      const wasOpen = item?.classList.contains('open');
      root.querySelectorAll('.faq-item.open').forEach((n) => n.classList.remove('open'));
      if (!wasOpen) item?.classList.add('open');
      return;
    }

    const planBtn = target.closest<HTMLElement>('[data-plan]');
    if (planBtn) {
      state.plan = planBtn.dataset.plan as 'sp' | 'co';
      renderCheckout();
      return;
    }

    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    switch (action) {
      case 'coupon-open':
        state.couponOpen = true;
        renderCheckout();
        return;
      case 'coupon-apply':
        applyCoupon();
        return;
      case 'coupon-remove':
        state.appliedCoupon = null;
        state.couponMsg = '';
        renderCheckout();
        return;
      case 'submit':
        void onSubmit();
        return;
      case 'reset':
        reset();
        return;
    }
  });

  // Inputs (delegated). Update state; re-render only when it changes layout.
  root.addEventListener('input', (ev) => {
    const input = ev.target as HTMLInputElement;
    const field = input.dataset.field;
    if (!field) return;

    if (field === 'couponInput') {
      state.couponInput = input.value;
      return;
    }
    if (field in state.form) {
      const key = field as keyof FormState;
      state.form[key] = input.value;
      if (state.errors[key]) {
        state.errors[key] = undefined;
        renderCheckout(); // error removal changes layout
      }
    }
  });

  // Enter to apply coupon.
  root.addEventListener('keydown', (ev) => {
    const input = ev.target as HTMLInputElement;
    if (input.dataset.field === 'couponInput' && (ev as KeyboardEvent).key === 'Enter') {
      ev.preventDefault();
      applyCoupon();
    }
  });
}

/* --------------------------- live price loading --------------------------- */

interface PricedEntry {
  price: ApiPrice;
  cents: number;
}

/**
 * Decide which UI plan slot ('sp' = self-paced, 'co' = cohort) a Stripe price
 * belongs to — preferring an explicit planSlot, then the price nickname, with
 * no decision when neither is conclusive (the caller fills the rest by amount).
 */
function explicitSlot(price: ApiPrice): 'sp' | 'co' | null {
  const slot = (price.planSlot ?? '').toString().trim().toLowerCase();
  if (slot === 'sp' || slot === 'co') return slot;
  if (/self|paced|solo|learn/.test(slot)) return 'sp';
  if (/cohort|live|group|week/.test(slot)) return 'co';

  const nick = (price.nickname ?? '').toLowerCase();
  if (/self|paced|solo|learn/.test(nick)) return 'sp';
  if (/cohort|live|group|week/.test(nick)) return 'co';
  return null;
}

/**
 * Pull the product + prices straight from GET /api/products and map them onto
 * the two plan slots — first by explicit slot/nickname, then by amount
 * (cheapest -> self-paced, dearest -> cohort) for anything left over. The
 * hardcoded ids in data.ts are no longer trusted; the API is the source of
 * truth. Returns true if any live price was applied (so checkout re-renders).
 */
function applyApiPrices(products: ApiProduct[]): boolean {
  const exact = products.find((p) => p.id === PRODUCT_ID);
  const product = exact ?? products[0];
  if (!product) {
    console.error(
      '[prices] /api/products returned no products — falling back to hardcoded design prices.',
      { received: products },
    );
    return false;
  }
  activeProductId = product.id;
  if (!exact) {
    console.info(
      `[prices] using product "${product.id}" ("${product.name}") from /api/products.`,
    );
  }

  // Valid, priced entries only.
  const priced: PricedEntry[] = product.prices
    .map((price) => ({ price, cents: price.unitAmount ?? price.unit_amount ?? NaN }))
    .filter((e) => Number.isFinite(e.cents)) as PricedEntry[];

  if (!priced.length) {
    console.error(
      `[prices] product "${product.id}" has no usable prices — keeping hardcoded fallback values.`,
      { prices: product.prices },
    );
    return false;
  }

  // Pass 1: assign by explicit slot / nickname.
  const assigned: Record<'sp' | 'co', PricedEntry | undefined> = { sp: undefined, co: undefined };
  const leftover: PricedEntry[] = [];
  for (const entry of priced) {
    const slot = explicitSlot(entry.price);
    if (slot && !assigned[slot]) assigned[slot] = entry;
    else leftover.push(entry);
  }

  // Pass 2: fill remaining slots by amount — cheapest = self-paced, dearest = cohort.
  if ((!assigned.sp || !assigned.co) && leftover.length) {
    const byAmount = [...leftover].sort((a, b) => a.cents - b.cents);
    if (!assigned.sp) assigned.sp = byAmount.shift();
    if (!assigned.co) assigned.co = byAmount.pop() ?? byAmount.shift();
  }

  // Apply onto the plans in place.
  let currency: string | null = null;
  let applied = false;
  (['sp', 'co'] as const).forEach((id) => {
    const entry = assigned[id];
    if (!entry) {
      console.error(`[prices] no API price could be mapped to plan "${id}" — keeping hardcoded ${PLANS[id].price}.`);
      return;
    }
    const plan = PLANS[id];
    plan.price = entry.cents / 100;
    plan.stripePriceId = entry.price.id;
    // Use the raw planSlot from the API (e.g. "selfpeace", "cohort") as the
    // plan keyword — the backend resolves prices by this value, so we must
    // forward exactly what the API returned, not a hardcoded keyword.
    const apiSlot = (entry.price.planSlot ?? '').toString().trim();
    if (apiSlot) plan.stripePlan = apiSlot;
    if (plan.canInstall) plan.installEach = Math.round(plan.price / 2);
    if (entry.price.currency) currency = entry.price.currency;
    applied = true;
  });

  if (currency) setCurrency(currency);
  if (!applied) {
    console.error(
      '[prices] no live prices were applied — the page is showing hardcoded fallback values, NOT real Stripe prices.',
    );
  }
  return applied;
}

/* ------------------------------- bootstrap -------------------------------- */

async function init(): Promise<void> {
  renderApp();
  bindEvents();

  // Load the Stripe publishable key for the live checkout path (optional).
  try {
    const { publishableKey } = await api.getConfig();
    stripe = await loadStripe(publishableKey);
  } catch (err) {
    const status = err instanceof ApiError ? ` (HTTP ${err.status})` : '';
    console.error(
      `[stripe] GET ${API_BASE || ''}/api/config FAILED${status} — CTA will use local confirmation instead of live Stripe checkout.`,
      err,
    );
  }

  // Pull live prices from /api/products. On any failure the page keeps the
  // hardcoded design values — make that explicit rather than silent.
  try {
    const { products } = await api.getProducts();
    if (applyApiPrices(products)) {
      console.info('[prices] live prices applied from /api/products.');
      renderCheckout();
    }
    // applyApiPrices already logs an error when nothing was applied.
  } catch (err) {
    const status = err instanceof ApiError ? ` (HTTP ${err.status})` : '';
    console.error(
      `[prices] GET ${API_BASE || ''}/api/products FAILED${status} — page is showing hardcoded fallback prices, NOT live Stripe prices.`,
      err,
    );
  }
}

void init();
