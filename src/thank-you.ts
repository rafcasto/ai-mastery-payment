/**
 * Thank-you / payment-confirmation page — AI Enable Testing Workshop
 * TalentDojo × Democratize Quality
 *
 * Runs after a successful Stripe payment. Fires the confetti burst and
 * keeps the spinner on the "First time here?" access option animated.
 */

(function confetti() {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return;

  const colors = [
    '#C8243A',
    '#E97A1F',
    '#EAB308',
    '#2E7D32',
    '#1B7B8A',
    '#40CFDE',
    '#8B3FBF',
  ];

  const host = document.getElementById('confetti');
  if (!host) return;

  for (let i = 0; i < 28; i++) {
    const p = document.createElement('i');
    const angle = Math.PI * (0.15 + Math.random() * 0.7) * -1;
    const dist = 70 + Math.random() * 90;
    p.style.setProperty(
      '--dx',
      Math.cos(angle) * dist * (Math.random() < 0.5 ? -1 : 1) + 'px',
    );
    p.style.setProperty(
      '--dy',
      Math.sin(angle) * dist - 10 + 'px',
    );
    p.style.setProperty(
      '--dr',
      Math.random() * 720 - 360 + 'deg',
    );
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 120 + 'ms';
    if (Math.random() < 0.4) p.style.borderRadius = '50%';
    host.appendChild(p);
  }
})();
