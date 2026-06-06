/* Parking Lot Management System — Frontend Logic */

const BASE = window.location.pathname.replace(/\/[^/]*$/, '');

// ── CLOCK ──────────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// ── TOAST ──────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = type === 'error' ? 'error' : '';
  t.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = 'none'; }, 3500);
}

// ── FETCH SLOTS ────────────────────────────────────────────────────
async function loadSlots() {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('spinning');
  try {
    const resp = await fetch(BASE + '/api/slots');
    const slots = await resp.json();
    renderSlots(slots);
    updateStats(slots);
  } catch (e) {
    showToast('Failed to load slots. Is Tomcat running?', 'error');
  } finally {
    btn.classList.remove('spinning');
  }
}

// ── RENDER GRID ────────────────────────────────────────────────────
function renderSlots(slots) {
  const grid = document.getElementById('slotsGrid');
  grid.innerHTML = '';
  slots.forEach(slot => {
    const card = document.createElement('div');
    card.className = `slot-card ${slot.status}`;
    card.dataset.id = slot.id;

    const icon = slot.status === 'empty' ? '🟢' : '🔴';
    const statusText = slot.status === 'empty' ? 'AVAILABLE' : 'OCCUPIED';
    const carInfo = slot.status === 'occupied'
      ? `<div class="slot-car-info">${slot.carNumber || ''}</div>` : '';

    card.innerHTML = `
      <div class="slot-indicator">${icon}</div>
      <div class="slot-number">${slot.slotNumber}</div>
      <div class="slot-status">${statusText}</div>
      ${carInfo}
    `;
    card.addEventListener('click', () => openSlotModal(slot));
    grid.appendChild(card);
  });
}

// ── STATS ──────────────────────────────────────────────────────────
function updateStats(slots) {
  const total    = slots.length;
  const occupied = slots.filter(s => s.status === 'occupied').length;
  const empty    = total - occupied;
  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statEmpty').textContent    = empty;
  document.getElementById('statOccupied').textContent = occupied;
}

// ── OPEN MODAL ─────────────────────────────────────────────────────
function openSlotModal(slot) {
  if (slot.status === 'empty') {
    openCheckInModal(slot);
  } else {
    openCheckOutModal(slot);
  }
}

// ── CHECK-IN MODAL ─────────────────────────────────────────────────
function openCheckInModal(slot) {
  document.getElementById('ciSlotId').value = slot.id;
  document.getElementById('ciSlotNum').textContent = slot.slotNumber;
  document.getElementById('ciCarNumber').value = '';
  document.getElementById('ciCarOwner').value = '';
  document.getElementById('ciCarType').value = 'Sedan';
  document.getElementById('checkinResult').innerHTML = '';
  document.getElementById('modalCheckin').classList.add('open');
}

// ── CHECK-OUT MODAL ────────────────────────────────────────────────
function openCheckOutModal(slot) {
  document.getElementById('coSlotId').value = slot.id;
  document.getElementById('coSlotNum').textContent = slot.slotNumber;
  document.getElementById('coCarNumber').textContent  = slot.carNumber || '-';
  document.getElementById('coCarOwner').textContent   = slot.carOwner  || '-';
  document.getElementById('coCarType').textContent    = slot.carType   || '-';
  document.getElementById('coCheckIn').textContent    = slot.checkInTime ? new Date(slot.checkInTime).toLocaleString('en-IN') : '-';
  document.getElementById('checkoutResult').innerHTML = '';
  document.getElementById('modalCheckout').classList.add('open');
}

// ── CLOSE MODALS ───────────────────────────────────────────────────
document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) closeAllModals();
  });
});
function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
  loadSlots();
}

// ── SUBMIT CHECK-IN ────────────────────────────────────────────────
document.getElementById('formCheckin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const slotId    = document.getElementById('ciSlotId').value;
  const carNumber = document.getElementById('ciCarNumber').value.trim().toUpperCase();
  const carOwner  = document.getElementById('ciCarOwner').value.trim();
  const carType   = document.getElementById('ciCarType').value;

  if (!carNumber || !carOwner) { showToast('Please fill all fields', 'error'); return; }

  const btn = e.submitter;
  btn.disabled = true; btn.textContent = 'PROCESSING...';

  try {
    const form = new URLSearchParams({ slotId, carNumber, carOwner, carType });
    const resp = await fetch(BASE + '/api/checkin', { method: 'POST', body: form });
    const data = await resp.json();

    if (data.success) {
      renderToken(data);
      showToast(`✅ Check-in successful — Slot ${data.slotNumber}`);
    } else {
      showToast(data.error || 'Check-in failed', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'CHECK IN';
  }
});

// ── RENDER TOKEN ───────────────────────────────────────────────────
function renderToken(data) {
  const container = document.getElementById('checkinResult');
  container.innerHTML = `
    <hr class="divider">
    <div class="token-card" id="tokenPrint">
      <div class="token-title">🅿 PARKING TOKEN</div>
      <img class="token-qr" src="data:image/png;base64,${data.qrCode}" alt="QR Code">
      <div class="token-detail"><span class="token-key">SLOT</span><span class="token-val">${data.slotNumber}</span></div>
      <div class="token-detail"><span class="token-key">CAR NO.</span><span class="token-val">${data.carNumber}</span></div>
      <div class="token-detail"><span class="token-key">OWNER</span><span class="token-val">${data.carOwner}</span></div>
      <div class="token-detail"><span class="token-key">TYPE</span><span class="token-val">${data.carType}</span></div>
      <div class="token-detail"><span class="token-key">CHECK-IN</span><span class="token-val">${new Date().toLocaleString('en-IN')}</span></div>
    </div>
    <button class="btn btn-print" onclick="printToken()">🖨 PRINT TOKEN</button>
  `;
}

function printToken() {
  const content = document.getElementById('tokenPrint').outerHTML;
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>Parking Token</title>
    <style>
      body { font-family: monospace; padding: 20px; background: #fff; color: #000; }
      .token-card { border: 2px solid #000; padding: 20px; max-width: 320px; margin: auto; text-align: center; }
      .token-title { font-size: 1.3rem; font-weight: bold; margin-bottom: 15px; }
      .token-qr { width: 180px; filter: none; }
      .token-detail { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding: 6px 0; font-size: 0.85rem; }
      .token-key { color: #555; }
    </style>
    </head><body>${content}</body></html>
  `);
  win.document.close();
  win.print();
}

// ── SUBMIT CHECK-OUT ───────────────────────────────────────────────
document.getElementById('btnCheckout').addEventListener('click', async () => {
  const slotId = document.getElementById('coSlotId').value;
  const btn = document.getElementById('btnCheckout');
  btn.disabled = true; btn.textContent = 'PROCESSING...';

  try {
    const form = new URLSearchParams({ slotId });
    const resp = await fetch(BASE + '/api/checkout', { method: 'POST', body: form });
    const data = await resp.json();

    if (data.success) {
      renderReceipt(data);
      showToast(`✅ Check-out — ₹${data.fare} collected`);
    } else {
      showToast(data.error || 'Checkout failed', 'error');
    }
  } catch (err) {
    showToast('Network error: ' + err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'CONFIRM CHECKOUT';
  }
});

// ── RENDER RECEIPT ─────────────────────────────────────────────────
function renderReceipt(data) {
  const container = document.getElementById('checkoutResult');
  const hours = data.hoursCharged;
  const mins  = data.minutesParked;
  container.innerHTML = `
    <hr class="divider">
    <div class="receipt-fare">
      <div class="receipt-fare-label">TOTAL FARE</div>
      <div class="receipt-fare-amount">₹${data.fare}</div>
      <div class="receipt-duration">${mins} min parked · ${hours} hr charged · ₹100/hr first, ₹50/hr after</div>
    </div>
    <div class="token-card" style="margin-top:1rem">
      <div class="token-detail"><span class="token-key">SLOT</span><span class="token-val">${data.slotNumber}</span></div>
      <div class="token-detail"><span class="token-key">CAR NO.</span><span class="token-val">${data.carNumber}</span></div>
      <div class="token-detail"><span class="token-key">OWNER</span><span class="token-val">${data.carOwner}</span></div>
      <div class="token-detail"><span class="token-key">CHECK-IN</span><span class="token-val">${data.checkInTime ? new Date(data.checkInTime).toLocaleString('en-IN') : '-'}</span></div>
      <div class="token-detail"><span class="token-key">CHECKOUT</span><span class="token-val">${new Date().toLocaleString('en-IN')}</span></div>
    </div>
    <button class="btn btn-print" style="margin-top:1rem" onclick="window.print()">🖨 PRINT RECEIPT</button>
  `;
  document.getElementById('btnCheckout').style.display = 'none';
}

// ── REFRESH BUTTON ─────────────────────────────────────────────────
document.getElementById('refreshBtn').addEventListener('click', loadSlots);

// ── INIT ───────────────────────────────────────────────────────────
loadSlots();
setInterval(loadSlots, 30000); // auto-refresh every 30 seconds
