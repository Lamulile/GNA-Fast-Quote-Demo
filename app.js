const state = {
  step: 1,
  extracted: structuredClone(window.GNA_DEMO_DATA.extracted),
  materialLines: [],
  labourRates: [
    { name: 'Brickwork Labour', unit: 'per m²', rate: 90, basis: 'wallArea', qty: 180 },
    { name: 'Plastering Labour', unit: 'per m²', rate: 75, basis: 'wallArea', qty: 180 },
    { name: 'Roofing Labour', unit: 'per m²', rate: 85, basis: 'roofArea', qty: 205 },
    { name: 'Painting Labour', unit: 'per m²', rate: 55, basis: 'wallArea', qty: 180 },
    { name: 'Tiling Labour', unit: 'per m²', rate: 95, basis: 'floorArea', qty: 120 },
    { name: 'Plumbing Labour', unit: 'per point', rate: 120, basis: 'plumbingPoints', qty: 18 },
    { name: 'Electrical Labour', unit: 'per point', rate: 110, basis: 'electricalPoints', qty: 34 },
    { name: 'General Labour', unit: 'per day', rate: 350, basis: 'days', qty: 20 }
  ],
  additionalCosts: [
    { name: 'Site Supervision', amount: 1500 },
    { name: 'Project Management Fee', amount: 2000 },
    { name: 'Subcontractor Allowance', amount: 3000 }
  ],
  totals: {}
};

function zar(n){ return 'R ' + Number(n || 0).toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function num(n){ return Number(n || 0); }

function go(step){
  state.step = step;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${step}`).classList.add('active');
  document.querySelectorAll('.step').forEach(s => s.classList.toggle('active', Number(s.dataset.step) === step));
  if(step >= 3) recalculate();
}

document.querySelectorAll('.step').forEach(btn => btn.addEventListener('click', () => go(Number(btn.dataset.step))));

document.getElementById('fileInput').addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  document.getElementById('fileStatus').innerHTML = `Selected: <b>${f.name}</b> • ${Math.round(f.size/1024)} KB • sample extraction rules applied for demo`;
});

function renderExtractedForm(){
  const x = state.extracted;
  const fields = [
    ['Project Name', 'projectName', 'text'],
    ['Client Name', 'clientName', 'text'],
    ['Site Address', 'siteAddress', 'text'],
    ['Ground Floor UFL (m²)', 'groundFloorUFL', 'number'],
    ['First Floor UFL (m²)', 'firstFloorUFL', 'number'],
    ['Grand Total Area (m²)', 'grandTotalArea', 'number'],
    ['Garage Area (m²)', 'garageArea', 'number'],
    ['Scale', 'scale', 'text']
  ];
  document.getElementById('extractedForm').innerHTML = fields.map(([label,key,type])=>`
    <label>${label}<input type="${type}" value="${x[key]}" data-extract="${key}" /></label>
  `).join('');
  document.querySelectorAll('[data-extract]').forEach(input=>{
    input.addEventListener('input', e=>{
      const key = e.target.dataset.extract;
      state.extracted[key] = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      recalculate();
    });
  });
  const doors = state.extracted.doors.reduce((s,d)=>s+d.qty,0);
  const windows = state.extracted.windows.reduce((s,w)=>s+w.qty,0);
  document.getElementById('scheduleSummary').innerHTML = [
    `${doors} doors detected`, `${windows} windows detected`, `${state.extracted.rooms.length} room labels`, `${state.extracted.grandTotalArea} m² total area`
  ].map(x=>`<span class="chip">${x}</span>`).join('');
}

function buildMaterialLines(){
  const items = window.GNA_DEMO_DATA.selectedItems;
  const x = state.extracted;
  const totalArea = num(x.grandTotalArea);
  const floorArea = num(x.groundFloorUFL) + num(x.firstFloorUFL);
  const roofArea = Math.round(totalArea * 0.72);
  const doorCount = x.doors.reduce((s,d)=>s+d.qty,0);
  const windowCount = x.windows.reduce((s,w)=>s+w.qty,0);
  const lines = [];
  function add(label, key, qty, source, multiplier=1){
    const it = items[key];
    if(!it) return;
    lines.push({ label, code: it.productCode, description: it.description, sheet: it.sheet, qty: Math.round(qty * 100)/100, unit: it.unit, rate: it.price * multiplier, total: qty * it.price * multiplier, source });
  }
  add('Walling - stock bricks', 'bricks', Math.round(totalArea * 48), 'Grand total area x demo brick factor');
  add('Cement allowance', 'cement', Math.ceil(totalArea * 0.18), 'Grand total area x cement factor');
  add('Ready mix concrete', 'concrete', Math.ceil(floorArea * 0.045), 'Floor area x slab allowance');
  add('DPC allowance', 'dpc', Math.ceil(totalArea / 45), 'Floor area / roll allowance');
  add('Reinforcing Y-bar', 'reinforcing', Math.ceil(totalArea * 0.35), 'Demo structural allowance');
  add('Brick force', 'brickforce', Math.ceil(totalArea * 0.25), 'Demo wall reinforcement allowance');
  add('Roof tiles', 'roofTile', Math.ceil(roofArea * 10.5), 'Estimated roof area x tiles per m²');
  add('Undertile woven', 'underTile', Math.ceil(roofArea / 45), 'Roof area / 45m² roll');
  add('Ceiling plasterboard', 'plasterboard', Math.ceil(totalArea / 3.6), 'Ceiling area / board coverage');
  add('Rhinolite plaster', 'rhinolite', Math.ceil(totalArea / 28), 'Ceiling area / bag allowance');
  add('Standard internal doors', 'standardDoor', Math.max(doorCount-4, 1), 'Door schedule count');
  add('Hardwood/stable doors', 'stableDoor', 4, 'Door schedule allowance');
  add('Typical 900x900 windows', 'window900', Math.ceil(windowCount * 0.35), 'Window schedule mapping');
  add('Typical 1200x1200 windows', 'window1200', Math.ceil(windowCount * 0.35), 'Window schedule mapping');
  add('Typical 1500x1200 windows', 'window1500', Math.ceil(windowCount * 0.30), 'Window schedule mapping');
  state.materialLines = lines;
}

function renderMaterialTable(){
  const table = document.getElementById('materialTable');
  if(!table) return;
  table.innerHTML = `<thead><tr><th>Source</th><th>Product Code</th><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${state.materialLines.map(l=>`
    <tr><td>${l.sheet}</td><td>${l.code}</td><td>${l.description}</td><td class="num">${l.qty}</td><td class="num">${zar(l.rate)}</td><td class="num">${zar(l.total)}</td></tr>`).join('')}</tbody>`;
}

function renderLabourForm(){
  document.getElementById('labourForm').innerHTML = state.labourRates.map((l,i)=>`
    <div class="labour-row">
      <strong>${l.name}</strong>
      <select data-labour-unit="${i}"><option ${l.unit==='per m²'?'selected':''}>per m²</option><option ${l.unit==='per point'?'selected':''}>per point</option><option ${l.unit==='per day'?'selected':''}>per day</option></select>
      <input data-labour-rate="${i}" type="number" value="${l.rate}" step="5" />
    </div>
  `).join('') + state.additionalCosts.map((c,i)=>`
    <div class="labour-row">
      <strong>${c.name}</strong><span>fixed</span><input data-extra-cost="${i}" type="number" value="${c.amount}" step="100" />
    </div>
  `).join('');
  document.querySelectorAll('[data-labour-rate]').forEach(input=>input.addEventListener('input',e=>{state.labourRates[+e.target.dataset.labourRate].rate=Number(e.target.value);recalculate();}));
  document.querySelectorAll('[data-labour-unit]').forEach(select=>select.addEventListener('change',e=>{state.labourRates[+e.target.dataset.labourUnit].unit=e.target.value;recalculate();}));
  document.querySelectorAll('[data-extra-cost]').forEach(input=>input.addEventListener('input',e=>{state.additionalCosts[+e.target.dataset.extraCost].amount=Number(e.target.value);recalculate();}));
}

function calculateTotals(){
  buildMaterialLines();
  const materialSubtotal = state.materialLines.reduce((s,l)=>s+l.total,0);
  const labourTrade = state.labourRates.reduce((s,l)=>s+(l.qty*l.rate),0);
  const extras = state.additionalCosts.reduce((s,c)=>s+c.amount,0);
  const labourSubtotal = labourTrade + extras;
  const transport = Number(document.getElementById('transport')?.value || 5000);
  const markupPct = Number(document.getElementById('markup')?.value || 15);
  const vatPct = Number(document.getElementById('vat')?.value || 15);
  const subtotalBeforeMarkup = materialSubtotal + labourSubtotal + transport;
  const markup = subtotalBeforeMarkup * (markupPct/100);
  const subtotal = subtotalBeforeMarkup + markup;
  const vat = subtotal * (vatPct/100);
  const grandTotal = subtotal + vat;
  state.totals = {materialSubtotal, labourTrade, extras, labourSubtotal, transport, markupPct, markup, vatPct, vat, subtotal, grandTotal};
}

function renderLabourSummary(){
  const el = document.getElementById('labourSummary');
  if(!el) return;
  el.innerHTML = state.labourRates.map(l=>`<div class="summary-line"><span>${l.name}</span><b>${zar(l.qty*l.rate)}</b></div>`).join('') +
    `<div class="summary-line"><span>Additional Costs</span><b>${zar(state.totals.extras)}</b></div><div class="summary-line total"><span>Total Labour Cost</span><b>${zar(state.totals.labourSubtotal)}</b></div>`;
}

function renderQuoteSummary(){
  const t = state.totals;
  const el = document.getElementById('quoteSummary');
  if(el) el.innerHTML = `
    <div class="summary-line"><span>Material Cost</span><b>${zar(t.materialSubtotal)}</b></div>
    <div class="summary-line"><span>Labour Cost</span><b>${zar(t.labourSubtotal)}</b></div>
    <div class="summary-line"><span>Transport / Location Allowance</span><b>${zar(t.transport)}</b></div>
    <div class="summary-line"><span>Mark-up (${t.markupPct}%)</span><b>${zar(t.markup)}</b></div>
    <div class="summary-line"><span>VAT (${t.vatPct}%)</span><b>${zar(t.vat)}</b></div>
    <div class="summary-line total"><span>Grand Total</span><b>${zar(t.grandTotal)}</b></div>`;
  const q = document.getElementById('quotePreview');
  if(q) q.innerHTML = quoteHTML(false);
}

function quoteHTML(forPrint=false){
  const x = state.extracted, t = state.totals;
  return `<div class="quote-doc ${forPrint?'print-quote':''}">
    <div class="${forPrint?'print-header':''}">
      <div><div class="qbrand">GNA</div><div class="smallbrand">FAST QUOTE</div></div>
      <div style="text-align:right"><h2>QUOTE</h2><p>Reference: GNA-DEMO-001<br/>Date: ${new Date().toLocaleDateString('en-ZA')}</p></div>
    </div>
    <p><b>Project:</b> ${x.projectName}<br/><b>Client:</b> ${x.clientName}<br/><b>Site:</b> ${x.siteAddress}</p>
    <table class="${forPrint?'print-table':''}"><thead><tr><th>Description</th><th style="text-align:right">Amount (ZAR)</th></tr></thead><tbody>
      <tr><td>Material Cost</td><td style="text-align:right">${zar(t.materialSubtotal)}</td></tr>
      <tr><td>Labour Cost</td><td style="text-align:right">${zar(t.labourSubtotal)}</td></tr>
      <tr><td>Transport / Location Allowance</td><td style="text-align:right">${zar(t.transport)}</td></tr>
      <tr><td>Mark-up (${t.markupPct}%)</td><td style="text-align:right">${zar(t.markup)}</td></tr>
      <tr><td>VAT (${t.vatPct}%)</td><td style="text-align:right">${zar(t.vat)}</td></tr>
    </tbody></table>
    <div class="${forPrint?'print-total':'quote-total'}">Grand Total: ${zar(t.grandTotal)}</div>
    <h3>Assumptions</h3><ul><li>Quote based on uploaded plan and confirmed extracted quantities.</li><li>Pricing is calculated from the supplied Excel pricing data.</li><li>Final measurements must be confirmed before work starts.</li></ul>
    <h3>Exclusions</h3><ul><li>Items not visible or not shown on the supplied plan are excluded.</li><li>Municipal approvals, engineering changes and abnormal site conditions excluded.</li></ul>
  </div>`;
}

function printQuote(){
  recalculate();
  document.getElementById('printArea').innerHTML = quoteHTML(true);
  setTimeout(()=>window.print(), 100);
}

function recalculate(){
  calculateTotals();
  renderMaterialTable();
  renderLabourSummary();
  renderQuoteSummary();
}

renderExtractedForm();
renderLabourForm();
recalculate();
