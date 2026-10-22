/* Clamp multimeter simulator for DCM 2250 TR and DCM 5410 TR. Set window.CLAMP_MODEL = '2250' | '5410' first. */
(function () {
  var M = window.CLAMP_MODEL, is5410 = M === '5410';
  var VI = window.VI, $ = VI.$, el = VI.el;
  var svg = $('vi-svg');
  var POS = is5410 ? ['off', 'ncv', 'a600', 'a60', 'v', 'lowz', 'hz', 'ohm', 'temp'] : ['off', 'ncv', 'a600', 'a60', 'vac', 'vdc', 'lowz', 'ohm', 'off'];
  var PNAME = is5410 ? ['OFF', 'NCV / Live', '600/1000 A', '60 A', 'V', 'Low-Z V', 'Hz %', 'Ω, diode, continuity, capacitance', '°C °F'] : ['OFF', 'NCV / Live', '600/1000 A AC', '6/60 A AC', 'V AC', 'V DC', 'Low-Z V AC', 'Ω, diode, continuity', 'OFF'];
  var dMain = VI.build($('lcd-main'), 4, 118, 716, 28, 22, 52, 5.6, 7);
  $('knob').style.transformOrigin = '216px 500px';
  var S;
  function fresh() {
    return { dial: 0, leads: 'none', hold: false, frozen: null, bl: false, torch: false, mm: 0, mmMax: null, mmMin: null, relOn: false, relRef: 0, inr: false, inrPeak: null,
      jaw: 'open', around: 'one', ltype: 'ac', amps: 12.5, dir: 1, zeroed: false, acdc: 'ac', vmode: 'ac',
      acv: 230, ghost: false, dcv: 12.6, pol: 1, ncvSrc: 'live', ncvDist: 6,
      ohmFn: 'R', rOhm: 1000, cap: 4.7e-6, contObj: 'wire', dioObj: 'si', freq: 50, duty: 50, hzFn: 'Hz', temp: 25, tunit: 'C' };
  }
  S = fresh();
  var DIODES = { si: ['Silicon diode, forward', .62], sch: ['Schottky diode, forward', .25], led: ['LED, forward', 1.82], rev: ['Silicon diode, reversed', Infinity], shrt: ['Shorted junction', 0] };
  var CONTS = { wire: ['Short wire', .4], long: ['Long cable run', 28], loose: ['Loose joint', 180], open: ['Broken conductor', Infinity] };
  var RES_U = [{ u: 'Ω', m: 1 }, { u: 'kΩ', m: 1e3 }, { u: 'MΩ', m: 1e6 }], CAP_U = [{ u: 'nF', m: 1e-9 }, { u: 'µF', m: 1e-6 }, { u: 'mF', m: 1e-3 }], HZ_U = [{ u: 'Hz', m: 1 }, { u: 'kHz', m: 1e3 }, { u: 'MHz', m: 1e6 }];
  var DOFF = .8;                                   // uncorrected DC-clamp offset, amps (5410), cleared by ZERO

  function fam() {
    var p = POS[S.dial];
    if (p === 'v') return S.vmode === 'ac' ? 'vac' : 'vdc';
    if (p === 'a600' || p === 'a60') return 'a';
    return p;
  }
  function ladder(v, units) {
    for (var i = 0; i < units.length; i++) {
      var sc = v / units[i].m;
      if (i > 0 && sc < 6) return { v: sc, d: 3, u: units[i].u };
      if (i > 0 && sc < 60) return { v: sc, d: 2, u: units[i].u };
      if (sc < 600) return { v: sc, d: i === 0 ? 1 : 1, u: units[i].u };
    }
    var l = units[units.length - 1]; return { v: v / l.m, d: 1, u: l.u };
  }
  function ladderFix(v, units) { var r = ladder(v, units); if (r.u === units[0].u && r.v >= 600) r = { v: v / units[1].m, d: 3, u: units[1].u }; return r; }
  function f4(v, d) {                              // -> {main, dp}
    var neg = v < 0, r = VI.blank(VI.digits(Math.abs(v), d, 4)), s = r.s;
    if (neg) { if (s.charAt(0) === ' ') s = '-' + s.slice(1); else return { main: '  OL', dp: -1 }; }
    return { main: s, dp: r.dp };
  }
  function ol() { return { main: '  OL', dp: -1, unit: '' }; }

  /* ---- measurements: return {raw, fmt(v) -> {main,dp,unit}} or a ready display ---- */
  function lead() { return S.leads === 'leads'; }
  function currentVal() {
    var closed = S.jaw === 'closed', I = 0;
    var dcMode = is5410 && S.acdc === 'dc';
    if (closed) {
      var base = S.around === 'one' ? S.amps : S.around === 'twin' ? S.amps * .0008 : S.amps * .012;
      if (dcMode) I = S.ltype === 'dc' ? base * S.dir : base * .002;
      else I = S.ltype === 'ac' ? base : 0;
    }
    if (dcMode && !S.zeroed) I += DOFF;
    return I;
  }
  function fmtCur(v) {
    var a = Math.abs(v), p = POS[S.dial];
    if (p === 'a60') {
      var lim = 60;
      if (a > lim) return ol();
      var r = f4(v, is5410 ? 2 : (a < 6 ? 3 : 2)); return { main: r.main, dp: r.dp, unit: 'A' };
    }
    if (a > 1000) return ol();
    var q = f4(v, a < 600 ? 1 : 0); return { main: q.main, dp: q.dp, unit: 'A' };
  }
  function fmtVac(v) { if (v > 750) return ol(); var r = f4(v, v < 6 ? 3 : v < 60 ? 2 : v < 600 ? 1 : 0); return { main: r.main, dp: r.dp, unit: 'V' }; }
  function fmtVdc(v) {
    var a = Math.abs(v); if (a > 1000) return ol();
    if (a < .6) { var m = f4(v * 1000, 1); return { main: m.main, dp: m.dp, unit: 'mV' }; }
    var r = f4(v, a < 6 ? 3 : a < 60 ? 2 : a < 600 ? 1 : 0); return { main: r.main, dp: r.dp, unit: 'V' };
  }
  function fmtLowz(v) { if (v > 300) return ol(); var r = f4(v, v < 6 ? 3 : v < 60 ? 2 : 1); return { main: r.main, dp: r.dp, unit: 'V' }; }
  function fmtRes(v) { if (v > 60e6) return ol(); var f = ladderFix(v, RES_U), r = f4(f.v, f.d); return { main: r.main, dp: r.dp, unit: f.u }; }
  function fmtCap(v) { if (v > .01) return ol(); var f = ladderFix(Math.max(v, 0), CAP_U), r = f4(f.v, f.d); return { main: r.main, dp: r.dp, unit: f.u }; }
  function fmtHz(v) { if (v > 10e6) return ol(); var f = ladderFix(v, HZ_U), r = f4(f.v, f.d); return { main: r.main, dp: r.dp, unit: f.u }; }
  function fmtDuty(v) { var r = f4(v, 1); return { main: r.main, dp: r.dp, unit: '%' }; }
  function fmtTemp(v) { var c = S.tunit === 'C' ? v : v * 9 / 5 + 32; if ((S.tunit === 'C' && (c > 1000 || c < -20)) || (S.tunit === 'F' && (c > 1832 || c < -4))) return ol(); var r = f4(c, Math.abs(c) < 1000 ? 1 : 0); return { main: r.main, dp: r.dp, unit: S.tunit === 'C' ? '°C' : '°F' }; }
  function fmtDio(v) { if (!isFinite(v)) return ol(); var r = f4(v, 3); return { main: r.main, dp: r.dp, unit: 'V' }; }
  function fmtCont(v) { if (!isFinite(v)) return ol(); var r = f4(v, 1); return { main: r.main, dp: r.dp, unit: 'Ω' }; }

  var ncvLevel = 0;
  function model() {
    var m = { off: false, main: '    ', dp: -1, unit: '', a: {}, beep: false, spec: '', raw: null, fmt: null, bars: 0, note: '' };
    var p = POS[S.dial], f = fam();
    if (p === 'off') { m.off = true; return m; }
    m.a.auto = true; m.a.apo = true;
    var v;
    function set(raw, fn) { m.raw = raw; m.fmt = fn; var d = fn(raw); m.main = d.main; m.dp = d.dp; m.unit = d.unit; }
    if (f === 'ncv') {
      var live = S.ncvSrc === 'live', L = live ? Math.max(0, Math.min(4, Math.ceil(4 * (1 - S.ncvDist / 14)))) : 0;
      if (S.ncvDist > 14) L = 0; ncvLevel = L; m.main = 'EF  '; m.bars = L; m.beep = false; m.spec = 'Non-contact voltage detection: the display, buzzer and LED respond to the electric field around a live conductor.'; return m;
    }
    if (f === 'a') {
      m.a[is5410 ? S.acdc : 'ac'] = true;
      if (is5410 && S.inr) m.a.inr = true;
      v = currentVal();
      if (is5410 && S.inr && S.inrPeak !== null) { set(S.inrPeak, fmtCur); }
      else set(v, fmtCur);
      m.spec = p === 'a60' ? (is5410 ? '60 A range, AC or DC (True-RMS).' : '6 A and 60 A ranges, AC True-RMS.') : '600 A and 1000 A ranges' + (is5410 ? ', AC or DC.' : ', AC True-RMS.');
    } else if (f === 'vac') {
      m.a.ac = true; v = lead() ? S.acv : 0; if (lead() && S.ghost) v = 90;
      set(v, fmtVac); m.spec = 'AC voltage 6 / 60 / 600 / 750 V, True-RMS. High input impedance, so it can pick up ghost voltages.';
    } else if (f === 'vdc') {
      m.a.dc = true; v = lead() ? S.dcv * S.pol : 0; set(v, fmtVdc); m.spec = 'DC voltage 600 mV / 6 / 60 / 600 / 1000 V.';
    } else if (f === 'lowz') {
      m.a.ac = true; v = lead() ? (S.ghost ? .05 : S.acv) : 0; set(v, fmtLowz); m.spec = 'Low-impedance AC volts 6 / 60 / 300 V, input impedance 3 kΩ or less. Ignores ghost voltage.';
    } else if (f === 'ohm') {
      var fn = S.ohmFn, open = !lead();
      if (fn === 'R') { v = open ? Infinity : S.rOhm; set(v, fmtRes); m.spec = 'Resistance 600 Ω to 60 MΩ.'; }
      else if (fn === 'cont') { m.a.cont = true; v = open ? Infinity : CONTS[S.contObj][1]; set(v, fmtCont); m.beep = isFinite(v) && v <= 50; m.spec = 'Continuity: the buzzer sounds at low resistance (50 Ω or less).'; }
      else if (fn === 'diode') { m.a.diode = true; v = open ? Infinity : DIODES[S.dioObj][1]; set(v, fmtDio); m.spec = 'Diode test.'; }
      else { v = open ? 0 : S.cap; set(v, fmtCap); m.spec = 'Capacitance ranges: 1 nF, 10 nF, 100 nF, 1 µF, 10 µF, 100 µF, 1 mF and 10 mF.'; }
    } else if (f === 'hz') {
      if (S.hzFn === 'Hz') { v = lead() ? S.freq : 0; set(v, fmtHz); m.spec = 'Frequency 10 Hz to 10 MHz.'; }
      else { v = lead() ? S.duty : 0; set(v, fmtDuty); m.spec = 'Duty cycle, per cent.'; }
    } else if (f === 'temp') {
      v = S.leads === 'probe' ? S.temp : Infinity; if (!isFinite(v)) { set(1e9, fmtTemp); m.main = '  OL'; m.dp = -1; m.unit = ''; } else set(v, fmtTemp);
      m.spec = 'K-type thermocouple, display range -20 °C to 1000 °C (-4 °F to 1832 °F). The supplied probe is rated to 250 °C.';
    }
    // MAX/MIN (2250) tracking
    if (!is5410 && S.mm && m.raw !== null && isFinite(m.raw) && m.fmt) {
      if (S.mmMax === null || m.raw > S.mmMax) S.mmMax = m.raw; if (S.mmMin === null || m.raw < S.mmMin) S.mmMin = m.raw;
      var ev = S.mm === 1 ? S.mmMax : S.mmMin, d2 = m.fmt(ev); m.main = d2.main; m.dp = d2.dp; m.unit = d2.unit; m.a[S.mm === 1 ? 'max' : 'min'] = true;
    }
    if (is5410 && S.relOn && m.raw !== null && isFinite(m.raw) && m.fmt && !(f === 'a' && S.inr && S.inrPeak !== null)) { var d3 = m.fmt(m.raw - S.relRef); m.main = d3.main; m.dp = d3.dp; m.unit = d3.unit; m.a.rel = true; }
    if (S.hold && S.frozen) { m.main = S.frozen.main; m.dp = S.frozen.dp; m.unit = S.frozen.unit; m.a.max = S.frozen.max; m.a.min = S.frozen.min; m.a.rel = S.frozen.rel; }
    return m;
  }

  /* ---- drawing ---- */
  function render() {
    var m = model(); S._m = m;
    if (S.hold && !S.frozen) S.frozen = { main: m.main, dp: m.dp, unit: m.unit, max: m.a.max, min: m.a.min, rel: m.a.rel };
    if (!S.hold) S.frozen = null;
    $('lcd-glass').setAttribute('fill', S.bl && !m.off ? 'url(#g-lcd-bl)' : 'url(#g-lcd)');
    VI.setDigits(dMain, m.off ? '    ' : m.main, m.off ? -1 : m.dp);
    $('lcd-unit').textContent = m.off ? '' : m.unit; $('lcd-unit').style.opacity = .92;
    ['auto', 'apo', 'ac', 'dc', 'max', 'min', 'rel', 'inr', 'diode', 'cont'].forEach(function (k) { var e = $('an-' + k); if (e) e.classList.toggle('on', !m.off && !!m.a[k]); });
    $('an-hold').classList.toggle('on', S.hold && !m.off);
    for (var b = 1; b <= 4; b++) $('bar' + b).classList.toggle('on', !m.off && m.bars >= b);
    $('knob').style.transform = 'rotate(' + (-24 * S.dial) + 'deg)';
    var dl = $('dial'); dl.setAttribute('aria-valuenow', S.dial); dl.setAttribute('aria-valuetext', PNAME[S.dial]);
    Array.prototype.forEach.call(document.querySelectorAll('.pos'), function (q) { q.classList.toggle('on', +q.getAttribute('data-i') === S.dial); });
    $('jaw-r').style.transform = S.jaw === 'open' ? 'rotate(17deg)' : 'rotate(0deg)';
    $('beam').setAttribute('opacity', S.torch ? .85 : 0); $('torch-led').setAttribute('fill', S.torch ? '#fff7a8' : '#d8d2a0');
    drawCond(); drawLeads(); panel(m);
    buzzState(m);
  }
  function drawCond() {
    var g = $('cond'), key = S.around + S.ltype + S.jaw + (is5410 ? S.acdc : '');
    if (g.getAttribute('data-k') === key) return; g.setAttribute('data-k', key); g.innerHTML = '';
    var cols = S.ltype === 'dc' ? ['#c8141f', '#17181b', '#c8141f'] : ['#c8141f', '#1f56d9', '#e6b800'];
    var pts = S.around === 'one' ? [[150, 138]] : S.around === 'twin' ? [[134, 138], [166, 138]] : [[150, 112], [132, 146], [168, 146]];
    pts.forEach(function (p, i) {
      el('circle', { cx: p[0], cy: p[1], r: 15, fill: cols[i], stroke: '#050607', 'stroke-width': 2.5, opacity: S.jaw === 'open' ? .55 : 1 }, g);
      el('circle', { cx: p[0], cy: p[1], r: 7.5, fill: '#d9a066', stroke: '#7a4a14' }, g);
    });
  }
  function drawLead(g, x, path, col) {
    el('path', { d: path, fill: 'none', stroke: '#050607', 'stroke-width': 10, 'stroke-linecap': 'round' }, g);
    el('path', { d: path, fill: 'none', stroke: col, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: x, cy: 848, r: 15, fill: col, stroke: '#050607', 'stroke-width': 3 }, g); el('circle', { cx: x, cy: 848, r: 6, fill: '#0b0c0e', opacity: .55 }, g);
  }
  function probe(g, x, y, col) { var c = el('g', { transform: 'translate(' + x + ' ' + y + ')' }, g); el('rect', { x: -9, y: -26, width: 18, height: 26, rx: 5, fill: col, stroke: '#050607', 'stroke-width': 2.5 }, c); el('path', { d: 'M-3 0 h6 l-2 22 h-2 z', fill: '#c9ccd2', stroke: '#050607', 'stroke-width': 1.5 }, c); }
  function tag(g, x, y, txt) { el('rect', { x: x - 46, y: y - 11, width: 92, height: 20, rx: 6, fill: '#0b1118', stroke: '#334155' }, g); var t = el('text', { x: x, y: y + 3, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: '#e2e8f0', 'font-family': 'Inter, system-ui, sans-serif' }, g); t.textContent = txt; }
  function drawLeads() {
    var g = $('leads'); if (g.getAttribute('data-k') === S.leads) return; g.setAttribute('data-k', S.leads); g.innerHTML = '';
    if (S.leads === 'leads') {
      drawLead(g, 114, 'M114 848 C 100 920 70 940 60 966', '#17181b'); probe(g, 60, 966, '#17181b'); tag(g, 60, 1000, 'black probe');
      drawLead(g, 214, 'M214 848 C 230 920 250 940 256 966', '#c8141f'); probe(g, 256, 966, '#c8141f'); tag(g, 256, 1000, 'red probe');
    } else if (S.leads === 'probe') {
      drawLead(g, 114, 'M114 848 C 120 920 150 950 164 962', '#e6b800'); drawLead(g, 214, 'M214 848 C 210 920 180 950 166 962', '#e6b800');
      el('circle', { cx: 165, cy: 972, r: 7, fill: '#bbb', stroke: '#050607', 'stroke-width': 2 }, g); tag(g, 165, 1000, 'K-type probe');
    }
  }

  /* ---- buzzer / NCV pattern ---- */
  function buzzState(m) {
    var on = false;
    if (m && !m.off) { if (m.beep) on = true; }
    S._cont = on; if (!on && !(POS[S.dial] === 'ncv' && ncvLevel > 0)) VI.buzz(false); else if (on) VI.buzz(true, 2400);
  }

  /* ---- panels ---- */
  function seg(id, items, cols) { return '<div class="vi-seg vi-seg--' + (cols || items.length) + '" id="' + id + '" role="radiogroup">' + items.map(function (i) { return '<button type="button" role="radio" data-v="' + i[0] + '">' + i[1] + (i[2] ? '<small>' + i[2] + '</small>' : '') + '</button>'; }).join('') + '</div>'; }
  var lastSig = '';
  function sigOf() { return fam() + '|' + (fam() === 'ohm' ? S.ohmFn : '') + '|' + (fam() === 'a' ? S.acdc + (S.inr ? 'i' : '') : ''); }
  function panel(m) {
    var sig = sigOf(); if (sig !== lastSig) { lastSig = sig; buildObj(); }
    syncObj();
    Array.prototype.forEach.call($('lead-seg').children, function (b) { b.setAttribute('aria-checked', b.getAttribute('data-v') === S.leads); });
    $('lead-note').textContent = S.leads === 'none' ? 'No leads fitted. Current, NCV and the jaw do not need them. Volts, resistance, frequency, temperature and so on do.' : S.leads === 'leads' ? 'Black probe in COM, red probe in VΩ.' : 'K-type thermocouple in the temperature input.';
    var h = '', f = fam(), p = POS[S.dial];
    if (m.off) h = '<p>The meter is <strong>OFF</strong>. Turn the dial to a function.</p>';
    else {
      var needsLeads = ['vac', 'vdc', 'lowz', 'ohm', 'hz'].indexOf(f) >= 0;
      if (needsLeads && S.leads !== 'leads') h += '<p class="warn"><strong>Test leads are not fitted.</strong> The inputs are open, so the display shows ' + (f === 'ohm' && S.ohmFn !== 'cap' ? 'OL' : '0') + '.</p>';
      if (f === 'temp' && S.leads !== 'probe') h += '<p class="warn"><strong>No temperature probe fitted</strong>, so the display shows OL.</p>';
      if (f === 'a') {
        if (S.jaw === 'open') h += '<p class="warn">The jaw is <strong>open</strong>, so no current is enclosed. Squeeze the trigger (or use the jaw control) to close it around one conductor.</p>';
        else if (S.around === 'twin') h += '<p class="warn">You have clamped <strong>both</strong> conductors of a twin cable. The currents cancel, so the meter reads about zero. Clamp one conductor only.</p>';
        else if (S.around === 'three') h += '<p class="warn">Clamped all <strong>three phases</strong> of a balanced load. The currents cancel to nearly zero. Clamp one phase.</p>';
        else if (!is5410 && S.ltype === 'dc') h += '<p class="warn">This is a <strong>DC</strong> current. The DCM 2250 TR measures AC current only, so it reads zero. The DCM 5410 TR does AC and DC.</p>';
        else if (is5410 && S.acdc === 'dc' && S.ltype === 'ac') h += '<p class="warn">The meter is in DC mode but the load is AC, so the reading is near zero. Press the orange SELECT button for AC.</p>';
        else if (is5410 && S.acdc === 'ac' && S.ltype === 'dc') h += '<p class="warn">The meter is in AC mode but the load is DC, so it reads about zero. Press the orange SELECT button for DC.</p>';
        else h += '<p>Measuring <strong>' + VI.eng(S.amps, 'A') + '</strong> ' + (S.ltype === 'dc' ? 'DC' : 'AC') + ' on one conductor' + (p === 'a60' && S.amps > 60 ? '. It is above the 60 A range, so the display shows <strong class="warn">OL</strong>. Use the 600/1000 A position' : '') + (p === 'a600' && S.amps > 1000 ? '. It is above 1000 A: <strong class="warn">OL</strong>' : '') + '.</p>';
        if (is5410 && S.acdc === 'dc' && !S.zeroed) h += '<p class="warn">DC mode shows an offset until you press <strong>ZERO</strong> with the jaw clamped on nothing.</p>';
        else if (is5410 && S.acdc === 'dc' && S.zeroed) h += '<p class="ok">Zeroed.</p>';
        if (is5410 && S.inr) h += S.inrPeak !== null ? '<p>Inrush captured: peak <strong>' + VI.eng(S.inrPeak, 'A') + '</strong>, about 6.5 times the running current. Hold ZERO/INR to leave inrush mode.</p>' : '<p>Inrush mode is on. Use <strong>Start the motor</strong> in step 2 to capture the starting surge.</p>';
      }
      if (f === 'vac') h += '<p>Measuring ' + (S.ghost ? 'a <strong>ghost voltage</strong> (induced, no real supply)' : '<strong>' + VI.eng(S.acv, 'V') + ' AC</strong>') + '.' + (S.ghost && lead() ? ' A high-impedance meter shows ~90 V on a dead cable. Switch to <strong>Low-Z</strong> to see it collapse.' : '') + '</p>';
      if (f === 'lowz') h += '<p>Low-impedance mode loads the circuit, so ghost voltage collapses and a real supply stays. ' + (S.ghost ? '<span class="ok">The ghost voltage is gone: the cable is dead.</span> ' : '') + '<span class="warn">Do not use Low-Z on a live circuit protected by an RCD: the load can trip it.</span></p>' + (S.acv > 300 && !S.ghost && lead() ? '<p class="warn">Over 300 V: OL.</p>' : '');
      if (f === 'vdc') h += '<p>Measuring <strong>' + VI.eng(S.dcv * S.pol, 'V') + '</strong> DC.' + (S.dcv > 1000 ? ' <span class="warn">Over 1000 V: OL. Disconnect.</span>' : '') + '</p>';
      if (f === 'ncv') h += S.ncvSrc === 'dead' ? '<p>The cable is <strong>dead</strong>: no field, no beep.</p>' : S.ncvDist > 14 ? '<p>Too far from the cable to sense it. Move closer.</p>' : '<p>Live conductor detected: the bars, buzzer and LED respond. Strength <strong>' + ncvLevel + ' of 4</strong>.</p>';
      if (f === 'ohm') h += S.ohmFn === 'R' ? '<p>Resistance <strong>' + VI.eng(S.rOhm, 'Ω') + '</strong>. Circuit must be dead.</p>' : S.ohmFn === 'cont' ? '<p>Continuity: <strong>' + CONTS[S.contObj][0] + '</strong>. ' + (m.beep ? '<span class="ok">Buzzer ON.</span>' : 'No buzzer.') + '</p>' : S.ohmFn === 'diode' ? '<p>Diode test: <strong>' + DIODES[S.dioObj][0] + '</strong>.</p>' : '<p>Capacitance <strong>' + VI.eng(S.cap, 'F') + '</strong>. Discharge the capacitor first.</p>';
      if (f === 'hz') h += '<p>' + (S.hzFn === 'Hz' ? 'Frequency <strong>' + VI.eng(S.freq, 'Hz') + '</strong>' : 'Duty cycle <strong>' + (+S.duty.toFixed(1)) + ' %</strong>') + '. Press SELECT to switch.</p>';
      if (f === 'temp') h += '<p>Temperature <strong>' + S.temp + ' °C</strong>. Press SELECT for °F.</p>';
      if (S.hold) h += '<p>Display is on <strong>HOLD</strong>.</p>';
    }
    $('status').innerHTML = h; $('spec').textContent = m.spec || '';
  }

  function buildObj() {
    var f = fam(), h = '', title = 'What are you measuring?';
    if (f === 'a') {
      title = 'Set up the conductor';
      h = '<div class="vi-slider" style="margin-top:0"><label>Jaw</label>' + seg('jaw-seg', [['open', 'Open'], ['closed', 'Closed round the conductor']], 2) + '</div>' +
        '<div class="vi-slider"><label>Clamped around</label>' + seg('around-seg', [['one', 'One conductor', 'correct'], ['twin', 'Twin cable', 'both wires'], ['three', 'Three phases', 'all three']], 3) + '</div>' +
        '<div class="vi-slider"><label>Load type</label>' + seg('ltype-seg', [['ac', 'AC (mains)'], ['dc', 'DC (battery, solar)']], 2) + '</div>' +
        (is5410 && S.acdc === 'dc' ? '<div class="vi-slider"><label>Current direction</label>' + seg('dir-seg', [['1', 'Forward'], ['-1', 'Reversed']], 2) + '</div>' : '') +
        VI.slider('s-amps', 'Load current (log scale)', 0, 1000, 1) +
        VI.qc('amps', [['4.3 A heater', 4.3], ['32 A motor', 32], ['120 A feeder', 120], ['450 A', 450], ['950 A', 950], ['1200 A (too high)', 1200]]) +
        (is5410 && S.inr ? '<div class="vi-slider"><button type="button" class="vi-btn" id="inr-start">Start the motor</button></div>' : '');
    } else if (f === 'vac' || f === 'lowz') {
      title = 'Set the AC source';
      h = '<div class="vi-slider" style="margin-top:0"><label>Source</label>' + seg('src-seg', [['real', 'Real supply'], ['ghost', 'Dead cable with ghost voltage']], 2) + '</div>' + VI.slider('s-acv', 'AC voltage (RMS)', 0, 800, 1) + VI.qc('acv', [['0 V', 0], ['12 V', 12], ['110 V', 110], ['230 V', 230], ['415 V', 415], ['750 V', 750], ['800 V (too high)', 800]]);
    } else if (f === 'vdc') {
      title = 'Set the DC source';
      h = '<div class="vi-slider" style="margin-top:0"><label>Polarity</label>' + seg('pol-seg', [['1', 'Red on +'], ['-1', 'Red on −']], 2) + '</div>' + VI.slider('s-dcv', 'DC voltage (log scale)', 0, 1000, 1) + VI.qc('dcv', [['50 mV', .05], ['1.5 V cell', 1.5], ['12.6 V battery', 12.6], ['48 V', 48], ['600 V', 600], ['1000 V', 1000], ['1100 V (too high)', 1100]]);
    } else if (f === 'ncv') {
      title = 'Find the live cable';
      h = '<div class="vi-opts">' + VI.opt('ncvSrc', 'live', 'Live 230 V cable', 'Energised, even inside the insulation') + VI.opt('ncvSrc', 'dead', 'Dead cable', 'Isolated and safe') + '</div>' + VI.slider('s-ncv', 'Distance from the cable (cm)', 0, 30, .5);
    } else if (f === 'ohm') {
      var fns = is5410 ? [['R', 'Ω'], ['cont', 'Continuity'], ['diode', 'Diode'], ['cap', 'Capacitance']] : [['R', 'Ω'], ['cont', 'Continuity'], ['diode', 'Diode']];
      title = 'Choose the component';
      h = '<div class="vi-slider" style="margin-top:0"><label>Function (also the orange SELECT button)</label>' + seg('fn-seg', fns, is5410 ? 4 : 3) + '</div>';
      if (S.ohmFn === 'R') h += VI.slider('s-r', 'Resistance (log scale)', 0, 1000, 1) + VI.qc('r', [['10 Ω', 10], ['470 Ω', 470], ['4.7 kΩ', 4700], ['100 kΩ', 1e5], ['1 MΩ', 1e6], ['22 MΩ', 22e6], ['100 MΩ (over)', 1e8]]);
      else if (S.ohmFn === 'cont') h += '<div class="vi-opts" style="margin-top:.7rem">' + Object.keys(CONTS).map(function (k) { return VI.opt('contObj', k, CONTS[k][0], isFinite(CONTS[k][1]) ? CONTS[k][1] + ' Ω' : 'Open circuit'); }).join('') + '</div>';
      else if (S.ohmFn === 'diode') h += '<div class="vi-opts" style="margin-top:.7rem">' + Object.keys(DIODES).map(function (k) { return VI.opt('dioObj', k, DIODES[k][0], isFinite(DIODES[k][1]) ? DIODES[k][1] + ' V drop' : 'Blocks: OL'); }).join('') + '</div>';
      else h += VI.slider('s-c', 'Capacitance (log scale)', 0, 1000, 1) + VI.qc('c', [['10 nF', 1e-8], ['470 nF', 4.7e-7], ['4.7 µF', 4.7e-6], ['470 µF', 4.7e-4], ['4700 µF', 4.7e-3]]);
    } else if (f === 'hz') {
      title = 'Set the signal';
      h = '<div class="vi-slider" style="margin-top:0"><label>Show</label>' + seg('hzfn-seg', [['Hz', 'Frequency'], ['duty', 'Duty cycle']], 2) + '</div>' + VI.slider('s-f', 'Frequency (log scale)', 0, 1000, 1) + VI.slider('s-duty', 'Duty cycle (%)', 5, 95, 1) + VI.qc('f', [['50 Hz mains', 50], ['400 Hz', 400], ['4 kHz PWM', 4000], ['20 kHz', 20000], ['1 MHz', 1e6]]);
    } else if (f === 'temp') {
      title = 'Set the temperature';
      h = '<div class="vi-slider" style="margin-top:0"><label>Show in</label>' + seg('tu-seg', [['C', '°C'], ['F', '°F']], 2) + '</div>' + VI.slider('s-t', 'Temperature (°C)', -50, 1100, 1) + VI.qc('t', [['Ice water 0 °C', 0], ['Room 25 °C', 25], ['Motor bearing 85 °C', 85], ['Oven 250 °C', 250], ['Furnace 900 °C', 900]]);
    } else h = '<p class="vi-note" style="margin:0">Turn the dial to a function to see what you can connect.</p>';
    $('obj-title').textContent = title; $('obj-panel').innerHTML = h;
  }
  function segSync(id, val) { var e = $(id); if (!e) return; Array.prototype.forEach.call(e.children, function (b) { b.setAttribute('aria-checked', b.getAttribute('data-v') === String(val)); }); }
  function syncObj() {
    segSync('jaw-seg', S.jaw); segSync('around-seg', S.around); segSync('ltype-seg', S.ltype); segSync('dir-seg', S.dir); segSync('src-seg', S.ghost ? 'ghost' : 'real'); segSync('pol-seg', S.pol); segSync('fn-seg', S.ohmFn); segSync('hzfn-seg', S.hzFn); segSync('tu-seg', S.tunit);
    Array.prototype.forEach.call(document.querySelectorAll('#obj-panel .vi-opt'), function (b) { b.setAttribute('aria-checked', S[b.getAttribute('data-g')] === b.getAttribute('data-k')); });
    var q = function (id) { return $(id); };
    if (q('s-amps')) { q('s-amps').value = VI.valToLog(S.amps, -1, 3.2); q('s-amps-o').textContent = VI.eng(S.amps, 'A'); }
    if (q('s-acv')) { q('s-acv').value = S.acv; q('s-acv-o').textContent = VI.eng(S.acv, 'V'); }
    if (q('s-dcv')) { q('s-dcv').value = VI.valToLog(S.dcv, -3, 3.05); q('s-dcv-o').textContent = VI.eng(S.dcv, 'V'); }
    if (q('s-ncv')) { q('s-ncv').value = S.ncvDist; q('s-ncv-o').textContent = S.ncvDist + ' cm'; }
    if (q('s-r')) { q('s-r').value = VI.valToLog(S.rOhm, -1, 8); q('s-r-o').textContent = VI.eng(S.rOhm, 'Ω'); }
    if (q('s-c')) { q('s-c').value = VI.valToLog(S.cap, -9, -1); q('s-c-o').textContent = VI.eng(S.cap, 'F'); }
    if (q('s-f')) { q('s-f').value = VI.valToLog(S.freq, 1, 7); q('s-f-o').textContent = VI.eng(S.freq, 'Hz'); q('s-duty').value = S.duty; q('s-duty-o').textContent = S.duty + ' %'; }
    if (q('s-t')) { q('s-t').value = S.temp; q('s-t-o').textContent = S.temp + ' °C'; }
  }

  /* ---- actions ---- */
  function resetMeasure() { S.hold = false; S.frozen = null; S.mm = 0; S.mmMax = S.mmMin = null; S.relOn = false; S.inrPeak = null; }
  function setDial(i) { i = Math.max(0, Math.min(8, i)); if (i === S.dial) return; S.dial = i; resetMeasure(); S.inr = false; VI.tick(900, .04, .025); render(); }
  function toggleJaw() { S.jaw = S.jaw === 'open' ? 'closed' : 'open'; S.frozen = null; S.hold = false; VI.tick(500, .05); render(); }
  function pressSelect() {
    VI.tick(700, .05); var f = POS[S.dial];
    if (is5410) {
      if (f === 'a600' || f === 'a60') { S.acdc = S.acdc === 'ac' ? 'dc' : 'ac'; S.zeroed = false; S.inr = false; S.inrPeak = null; }
      else if (f === 'v') S.vmode = S.vmode === 'ac' ? 'dc' : 'ac';
      else if (f === 'ohm') { var o = ['R', 'cont', 'diode', 'cap']; S.ohmFn = o[(o.indexOf(S.ohmFn) + 1) % 4]; }
      else if (f === 'hz') S.hzFn = S.hzFn === 'Hz' ? 'duty' : 'Hz';
      else if (f === 'temp') S.tunit = S.tunit === 'C' ? 'F' : 'C';
    } else if (f === 'ohm') { var o2 = ['R', 'cont', 'diode']; S.ohmFn = o2[(o2.indexOf(S.ohmFn) + 1) % 3]; }
    resetMeasure(); render();
  }
  function btnA_short() { VI.tick(700, .05); if (!is5410) { S.torch = !S.torch; render(); return; } if (POS[S.dial] === 'off') return; var m = S._m; if (S.relOn) S.relOn = false; else if (m && m.raw !== null && isFinite(m.raw)) { S.relOn = true; S.relRef = m.raw; } render(); }
  function btnA_long() { S.torch = !S.torch; VI.tick(1100, .05); render(); }
  function btnB_short() { VI.tick(700, .05); if (POS[S.dial] === 'off') return; S.hold = !S.hold; S.frozen = null; render(); }
  function btnB_long() { if (POS[S.dial] === 'off') return; S.bl = !S.bl; VI.tick(1100, .05); render(); }
  function btnC_short() {
    VI.tick(700, .05);
    if (!is5410) { if (POS[S.dial] === 'off') return; S.mm = (S.mm + 1) % 3; S.mmMax = S.mmMin = null; render(); return; }
    if ((POS[S.dial] === 'a600' || POS[S.dial] === 'a60') && S.acdc === 'dc') { S.zeroed = true; render(); }
  }
  function btnC_long() { if (!is5410) return; if (POS[S.dial] !== 'a600' && POS[S.dial] !== 'a60') return; if (S.acdc !== 'ac') return; S.inr = !S.inr; S.inrPeak = null; VI.tick(1100, .05); lastSig = ''; render(); }
  VI.wireButton($('btn-sel'), pressSelect);
  VI.wireButton($('btn-a'), btnA_short, is5410 ? btnA_long : null);
  VI.wireButton($('btn-b'), btnB_short, btnB_long);
  VI.wireButton($('btn-c'), btnC_short, is5410 ? btnC_long : null);
  VI.wireButton($('trigger'), toggleJaw);

  (function () {
    var dial = $('dial'), dragging = false;
    function ang(ev) { var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse()); if (Math.hypot(p.x - 216, p.y - 500) < 14) return null; var a = Math.atan2(p.x - 216, -(p.y - 500)) * 180 / Math.PI; if (a > 0) a -= 360; return a; }   // 0 to -360 counter-clockwise
    function go(ev) { var a = ang(ev); if (a === null) return; var i = Math.round(-a / 24); if (i > 8) i = (-a > 276) ? 0 : 8; setDial(Math.max(0, Math.min(8, i))); }
    dial.addEventListener('pointerdown', function (ev) { ev.preventDefault(); VI.ctx(); dragging = true; dial.classList.add('drag'); try { dial.setPointerCapture(ev.pointerId); } catch (e) {} go(ev); });
    dial.addEventListener('pointermove', function (ev) { if (dragging) go(ev); });
    function end() { dragging = false; dial.classList.remove('drag'); }
    dial.addEventListener('pointerup', end); dial.addEventListener('pointercancel', end);
    dial.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') { ev.preventDefault(); setDial(S.dial + 1); } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') { ev.preventDefault(); setDial(S.dial - 1); } });
    Array.prototype.forEach.call(document.querySelectorAll('.pos'), function (p) { p.addEventListener('click', function () { VI.ctx(); setDial(+p.getAttribute('data-i')); }); });
  })();
  document.addEventListener('keydown', function (ev) {
    if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName) || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var k = ev.key.toLowerCase();
    if (k === 'j') toggleJaw(); else if (k === 's') pressSelect(); else if (k === 'h') btnB_short(); else if (k === 'b') btnB_long(); else if (k === 'm' && !is5410) btnC_short(); else if (k === 'z' && is5410) btnC_short();
    else if (ev.key === 'ArrowDown' && !(ev.target && ev.target.id === 'dial')) setDial(S.dial + 1); else if (ev.key === 'ArrowUp' && !(ev.target && ev.target.id === 'dial')) setDial(S.dial - 1);
  });
  $('lead-seg').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.leads = b.getAttribute('data-v'); S.hold = false; S.frozen = null; VI.tick(600, .04); render(); });
  $('sound').addEventListener('change', function (e) { VI.sound = e.target.checked; if (!VI.sound) VI.buzz(false); });
  $('reset').addEventListener('click', function () { S = fresh(); lastSig = ''; $('leads').removeAttribute('data-k'); $('cond').removeAttribute('data-k'); render(); });

  var SEGMAP = { 'jaw-seg': function (v) { S.jaw = v; }, 'around-seg': function (v) { S.around = v; }, 'ltype-seg': function (v) { S.ltype = v; }, 'dir-seg': function (v) { S.dir = +v; }, 'src-seg': function (v) { S.ghost = v === 'ghost'; }, 'pol-seg': function (v) { S.pol = +v; }, 'fn-seg': function (v) { S.ohmFn = v; lastSig = ''; }, 'hzfn-seg': function (v) { S.hzFn = v; }, 'tu-seg': function (v) { S.tunit = v; } };
  $('obj-panel').addEventListener('click', function (e) {
    var sb = e.target.closest('.vi-seg button'); if (sb) { var id = sb.parentNode.id; if (SEGMAP[id]) { SEGMAP[id](sb.getAttribute('data-v')); S.hold = false; S.frozen = null; render(); } return; }
    var b = e.target.closest('.vi-opt'); if (b) { S[b.getAttribute('data-g')] = b.getAttribute('data-k'); S.hold = false; S.frozen = null; render(); return; }
    if (e.target.id === 'inr-start') { var I = S.amps * 6.5; S.inrPeak = I; VI.tick(300, .15, .04); render(); return; }
    var q = e.target.closest('[data-q]'); if (!q) return; var v = JSON.parse(q.getAttribute('data-val')), id2 = q.getAttribute('data-q');
    if (id2 === 'amps') S.amps = v; else if (id2 === 'acv') S.acv = v; else if (id2 === 'dcv') S.dcv = v; else if (id2 === 'r') S.rOhm = v; else if (id2 === 'c') S.cap = v; else if (id2 === 'f') S.freq = v; else if (id2 === 't') S.temp = v;
    S.hold = false; S.frozen = null; render();
  });
  $('obj-panel').addEventListener('input', function (e) {
    var id = e.target.id, v = +e.target.value; S.hold = false; S.frozen = null;
    if (id === 's-amps') S.amps = VI.logToVal(v, -1, 3.2); else if (id === 's-acv') S.acv = v; else if (id === 's-dcv') S.dcv = VI.logToVal(v, -3, 3.05); else if (id === 's-ncv') S.ncvDist = v;
    else if (id === 's-r') S.rOhm = VI.logToVal(v, -1, 8); else if (id === 's-c') S.cap = VI.logToVal(v, -9, -1); else if (id === 's-f') S.freq = VI.logToVal(v, 1, 7); else if (id === 's-duty') S.duty = v; else if (id === 's-t') S.temp = v;
    render();
  });

  /* ---- scenarios ---- */
  var SCEN = is5410 ? [
    ['Solar string, 9 A DC', function () { S.dial = 3; S.acdc = 'dc'; S.ltype = 'dc'; S.amps = 9.2; S.jaw = 'closed'; }],
    ['Motor starting surge (INR)', function () { S.dial = 2; S.acdc = 'ac'; S.amps = 45; S.jaw = 'closed'; S.inr = true; }],
    ['Clamp both wires', function () { S.dial = 3; S.around = 'twin'; S.amps = 8; S.jaw = 'closed'; }],
    ['12.6 V battery', function () { S.dial = 4; S.vmode = 'dc'; S.leads = 'leads'; S.dcv = 12.6; }],
    ['Ghost voltage vs Low-Z', function () { S.dial = 4; S.vmode = 'ac'; S.leads = 'leads'; S.ghost = true; }],
    ['PWM duty cycle', function () { S.dial = 6; S.leads = 'leads'; S.freq = 4000; S.duty = 25; S.hzFn = 'duty'; }],
    ['Bearing temperature', function () { S.dial = 8; S.leads = 'probe'; S.temp = 85; }],
    ['Capacitor, 470 µF', function () { S.dial = 7; S.leads = 'leads'; S.ohmFn = 'cap'; S.cap = 4.7e-4; }]
  ] : [
    ['Motor feeder, 32 A', function () { S.dial = 3; S.amps = 32; S.jaw = 'closed'; }],
    ['Clamp both wires (reads zero)', function () { S.dial = 3; S.around = 'twin'; S.amps = 8; S.jaw = 'closed'; }],
    ['DC current: wrong tool', function () { S.dial = 3; S.ltype = 'dc'; S.amps = 10; S.jaw = 'closed'; }],
    ['Big feeder, 450 A', function () { S.dial = 2; S.amps = 450; S.jaw = 'closed'; }],
    ['Ghost voltage vs Low-Z', function () { S.dial = 4; S.leads = 'leads'; S.ghost = true; }],
    ['Find the live cable (NCV)', function () { S.dial = 1; S.ncvSrc = 'live'; S.ncvDist = 6; }],
    ['Continuity check', function () { S.dial = 7; S.leads = 'leads'; S.ohmFn = 'cont'; S.contObj = 'wire'; }]
  ];
  $('scen').innerHTML = SCEN.map(function (s, i) { return '<button type="button" class="vi-chip" data-s="' + i + '">' + s[0] + '</button>'; }).join('');
  $('scen').addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (!b) return; VI.ctx(); var bl = S.bl, tc = S.torch; S = fresh(); S.bl = bl; S.torch = tc; SCEN[+b.getAttribute('data-s')][1](); lastSig = ''; $('leads').removeAttribute('data-k'); $('cond').removeAttribute('data-k'); VI.tick(900, .05); render(); });

  /* ---- loop: NCV pattern, flashing LED ---- */
  function frame(ts) {
    var led = $('ncv-led');
    if (POS[S.dial] === 'ncv' && ncvLevel > 0) {
      var period = 900 - 170 * ncvLevel, on = (ts % period) < period * .5;
      led.setAttribute('fill', on ? '#ff3030' : '#4a1010'); VI.buzz(on, 1800 + ncvLevel * 150);
    } else { led.setAttribute('fill', '#4a1010'); if (!S._cont) VI.buzz(false); }
    requestAnimationFrame(frame);
  }
  render(); requestAnimationFrame(frame);
})();
