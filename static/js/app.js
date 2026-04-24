/**
 * HousePrice Pro — Frontend Engineer
 * Smooth animations, form state management, API integration
 */

// ─── STATE ─────────────────────────────────────────────────────────────────
const state = {
  mainroad:        'yes',
  prefarea:        'no',
  guestroom:       'no',
  basement:        'no',
  hotwaterheating: 'no',
  airconditioning: 'no',
};

// ─── TOGGLE SWITCHES ───────────────────────────────────────────────────────
document.querySelectorAll('.toggle-item').forEach(item => {
  const key = item.dataset.key;
  const sw  = item.querySelector('.toggle-switch');

  // Initialise from data-val
  state[key] = item.dataset.val;
  if (state[key] === 'yes') sw.classList.add('active');

  item.addEventListener('click', () => {
    state[key] = state[key] === 'yes' ? 'no' : 'yes';
    sw.classList.toggle('active', state[key] === 'yes');
    item.dataset.val = state[key];
  });
});

// ─── RADIO CARDS ────────────────────────────────────────────────────────────
document.querySelectorAll('.radio-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

// ─── FORMAT HELPERS ─────────────────────────────────────────────────────────
function formatINR(n) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function countUp(el, target, duration = 900) {
  const start = performance.now();
  const startVal = 0;
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    const current = Math.round(startVal + (target - startVal) * ease);
    el.textContent = formatINR(current);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── SPECTRUM BAR ────────────────────────────────────────────────────────────
const MIN_PRICE = 2_000_000;
const MAX_PRICE = 15_000_000;

function positionSpectrum(price) {
  const pct = Math.max(0, Math.min(100, ((price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100));
  document.getElementById('spectrumFill').style.width = pct + '%';
  document.getElementById('spectrumMarker').style.left = `calc(${pct}% - 8px)`;
}

// ─── INSIGHTS GENERATOR ─────────────────────────────────────────────────────
function generateInsights(data, price) {
  const ins = [];
  const ppsf = price / parseFloat(data.area);

  if (ppsf > 2000) ins.push('Premium price-per-sqft — this is a high-value locality property.');
  else if (ppsf < 800) ins.push('Excellent value — price per sqft is below market average.');

  if (data.airconditioning === 'yes' && data.hotwaterheating === 'yes')
    ins.push('Dual climate control systems significantly boost valuation.');

  if (data.prefarea === 'yes')
    ins.push('Preferred area location adds a notable location premium.');

  if (parseInt(data.bedrooms) >= 4)
    ins.push('4+ bedroom properties command higher demand in this market.');

  if (data.furnishingstatus === 'furnished')
    ins.push('Fully furnished status adds immediate move-in value.');

  if (parseInt(data.parking) >= 2)
    ins.push('Multiple parking spaces are a rarity and boost resale value.');

  if (ins.length === 0) ins.push('This property has average market indicators.');

  return ins.slice(0, 4);
}

// ─── TOAST ──────────────────────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ─── PREDICT ────────────────────────────────────────────────────────────────
async function predict() {
  const btn = document.getElementById('predictBtn');

  // Gather inputs
  const area      = parseFloat(document.getElementById('area').value);
  const bedrooms  = parseInt(document.getElementById('bedrooms').value);
  const bathrooms = parseInt(document.getElementById('bathrooms').value);
  const stories   = parseInt(document.getElementById('stories').value);
  const parking   = parseInt(document.getElementById('parking').value);
  const furnishing = document.querySelector('.radio-card.active input')?.value || 'semi-furnished';

  // Validation
  if (!area || area < 100) return showToast('Please enter a valid area (minimum 100 sq ft)');
  if (bedrooms < 1)        return showToast('At least 1 bedroom required');
  if (bathrooms < 1)       return showToast('At least 1 bathroom required');

  const payload = {
    area, bedrooms, bathrooms, stories, parking,
    furnishingstatus: furnishing,
    ...state
  };

  // Loading state
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const resp = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await resp.json();

    if (!result.success) throw new Error(result.error || 'Prediction failed');

    showResult(result, payload);
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// ─── SHOW RESULT ─────────────────────────────────────────────────────────────
function showResult(result, payload) {
  document.getElementById('resultPlaceholder').classList.add('hidden');
  const content = document.getElementById('resultContent');
  content.classList.remove('hidden');

  // Price count-up animation
  const priceEl = document.getElementById('priceValue');
  countUp(priceEl, result.price);

  // Range
  document.getElementById('priceRange').textContent =
    `Range: ${formatINR(result.price_low)} – ${formatINR(result.price_high)}`;

  // Tier badge
  const tierBadge = document.getElementById('priceTierBadge');
  tierBadge.className = `price-tier tier-${result.tier}`;
  tierBadge.textContent = result.tier_label;

  // Metrics
  document.getElementById('metricSqft').textContent = `₹${result.price_per_sqft.toLocaleString('en-IN')}/sq`;
  document.getElementById('metricTier').textContent = result.tier_label;

  // Spectrum
  setTimeout(() => positionSpectrum(result.price), 100);

  // Insights
  const insights = generateInsights(payload, result.price);
  const ul = document.getElementById('insightList');
  ul.innerHTML = insights.map(i => `<li>${i}</li>`).join('');

  // Smooth scroll on mobile
  if (window.innerWidth < 900) {
    document.getElementById('resultContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─── RESET ───────────────────────────────────────────────────────────────────
document.getElementById('resetBtn')?.addEventListener('click', () => {
  document.getElementById('resultContent').classList.add('hidden');
  document.getElementById('resultPlaceholder').classList.remove('hidden');
  if (window.innerWidth < 900) {
    document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
  }
});

// ─── PREDICT BUTTON ──────────────────────────────────────────────────────────
document.getElementById('predictBtn').addEventListener('click', predict);

// Enter key on inputs
document.querySelectorAll('input[type="number"]').forEach(inp => {
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') predict();
  });
});

// ─── LOAD MODEL META ─────────────────────────────────────────────────────────
fetch('/api/model-info')
  .then(r => r.json())
  .then(meta => {
    const r2pct = Math.round(meta.r2_score * 100);
    const statEl = document.getElementById('statR2');
    if (statEl) statEl.textContent = r2pct + '%';
  })
  .catch(() => {});

console.log('🏠 HousePrice Pro loaded. Ready for predictions.');
