/* Shared helpers for the CIE virtual instruments (window.VI). */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var VI = { NS: NS };
  VI.$ = function (id) { return document.getElementById(id); };
  VI.el = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  /* ---- audio ---- */
  var AC = null, bo = null, bg = null;
  VI.sound = true;
  VI.ctx = function () { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (AC.state === 'suspended') AC.resume(); return AC; };
  VI.tick = function (f, dur, vol) {
    if (!VI.sound) return; var a = VI.ctx(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.value = vol || .03;
    o.connect(g); g.connect(a.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + dur); o.stop(a.currentTime + dur + .02);
  };
  VI.buzz = function (on, freq) {
    if (on && VI.sound) {
      var a = VI.ctx(); if (!a) return;
      if (!bo) { bo = a.createOscillator(); bg = a.createGain(); bo.type = 'square'; bg.gain.value = .035; bo.connect(bg); bg.connect(a.destination); bo.start(); }
      bo.frequency.value = freq || 2400;
    } else if (bo) { try { bo.stop(); } catch (e) {} bo.disconnect(); bg.disconnect(); bo = null; }
  };

  /* ---- seven segment ---- */
  var SEGMAP = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g', ' ': '', 'L': 'def', 'O': 'abcdef', 'E': 'adefg', 'r': 'eg', 'n': 'ceg', 'o': 'cdeg', 'P': 'abefg', 'A': 'abcefg', 'F': 'aefg', 't': 'defg', 'U': 'bcdef', 'C': 'adef', 'H': 'bcefg', 'u': 'cde', 'd': 'bcdeg', 'b': 'cdefg', 'c': 'deg', 'S': 'acdfg' };
  function poly(pts, parent, cls) { return VI.el('polygon', { 'class': cls || 'seg', points: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') }, parent); }
  VI.build = function (parent, n, x0, y0, pitch, w, h, t, skew, cls) {
    var g = VI.el('g', { transform: 'translate(' + x0 + ' ' + y0 + ') skewX(' + (-(skew || 0)) + ')' }, parent), out = [], gap = t * .55, mid = h / 2;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var x = i * pitch, s = {};
        var H = function (cy) { var xa = x + gap, xb = x + w - gap; return poly([[xa, cy], [xa + t / 2, cy - t / 2], [xb - t / 2, cy - t / 2], [xb, cy], [xb - t / 2, cy + t / 2], [xa + t / 2, cy + t / 2]], g, cls); };
        var V = function (cx, ya, yb) { return poly([[cx, ya], [cx + t / 2, ya + t / 2], [cx + t / 2, yb - t / 2], [cx, yb], [cx - t / 2, yb - t / 2], [cx - t / 2, ya + t / 2]], g, cls); };
        var u0 = t * .5 + gap * .7, u1 = mid - gap * .7, l0 = mid + gap * .7, l1 = h - t * .5 - gap * .7;
        s.a = H(t / 2); s.d = H(h - t / 2); s.g = H(mid);
        s.f = V(x + t / 2, u0, u1); s.b = V(x + w - t / 2, u0, u1); s.e = V(x + t / 2, l0, l1); s.c = V(x + w - t / 2, l0, l1);
        s.dp = VI.el('circle', { 'class': cls || 'seg', cx: x + w + t * .75, cy: h - t * .35, r: t * .55 }, g);
        out.push(s);
      })(i);
    }
    return out;
  };
  VI.setDigits = function (d, str, dp) {
    for (var i = 0; i < d.length; i++) {
      var on = SEGMAP[str.charAt(i) || ' '] || '';
      'abcdefg'.split('').forEach(function (k) { d[i][k].classList.toggle('on', on.indexOf(k) >= 0); });
      d[i].dp.classList.toggle('on', i === dp);
    }
  };

  /* ---- formatting ---- */
  VI.digits = function (v, d, n) {          // n-digit zero padded
    n = n || 4; var s = Math.abs(v).toFixed(d).replace('.', ''); while (s.length < n) s = '0' + s; if (s.length > n) s = s.slice(-n);
    return { s: s, dp: d > 0 ? n - 1 - d : -1 };
  };
  VI.blank = function (r) {                 // suppress leading zeros (keep one digit before dp)
    var s = r.s, keep = r.dp >= 0 ? r.dp : s.length - 1, out = '';
    for (var i = 0; i < s.length; i++) out += (i < keep && s.charAt(i) === '0' && /^0*$/.test(s.slice(0, i + 1))) ? ' ' : s.charAt(i);
    return { s: out, dp: r.dp };
  };
  VI.eng = function (v, base) {
    if (!isFinite(v)) return 'open';
    var p = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n']];
    var a = Math.abs(v); if (a === 0) return '0 ' + base;
    for (var i = 0; i < p.length; i++) if (a >= p[i][0]) return (+(v / p[i][0]).toPrecision(3)) + ' ' + p[i][1] + base;
    return (+(v / 1e-9).toPrecision(3)) + ' n' + base;
  };
  VI.logToVal = function (v, lo, hi) { return Math.pow(10, lo + (hi - lo) * v / 1000); };
  VI.valToLog = function (x, lo, hi) { return Math.round(1000 * (Math.log10(x) - lo) / (hi - lo)); };

  /* ---- insulation test objects (shared by DIT-5000 and CIE/444) ---- */
  VI.OBJS = {
    'motor-ok':   { name: 'Healthy motor winding', desc: 'Clean, dry winding. Resistance keeps climbing as the test runs.', r60: 3000, n: .5, vk: 0, tau: 3 },
    'motor-damp': { name: 'Damp, dirty winding', desc: 'Moisture gives a low reading that barely rises.', r60: 45, n: .05, vk: .15, tau: 1.5 },
    'cable-aged': { name: 'Aged cable', desc: 'Still serviceable but absorbing less.', r60: 600, n: .25, vk: .05, tau: 4 },
    'cable-new':  { name: 'New XLPE cable, 100 m', desc: 'Excellent insulation. Reads off the top of the lower ranges.', r60: 60000, n: .35, vk: 0, tau: 6 },
    'surface':    { name: 'Cable end with dirty surface', desc: 'Surface leakage hides a good cable. Add the GUARD lead and watch the reading jump.', r60: 12, n: .08, vk: .1, tau: 2, guard: { r60: 4000, n: .45 } },
    'fault':      { name: 'Earth fault (failed insulation)', desc: 'A near short to earth. The tester cannot hold its voltage.', r60: .05, n: 0, vk: 0, tau: .5 },
    'open':       { name: 'Nothing connected', desc: 'Open leads. Reads overrange.', r60: Infinity, n: 0, vk: 0, tau: 1 }
  };
  VI.Rt = function (o, V, t) {              // insulation resistance in MΩ after t seconds at V volts
    if (!isFinite(o.r60)) return Infinity;
    if (t < 1) return NaN;
    return o.r60 * Math.pow(500 / V, o.vk || 0) * Math.pow(Math.max(t, 1) / 60, o.n);
  };

  /* ---- panel helpers ---- */
  VI.opt = function (group, key, name, desc) { return '<button type="button" class="vi-opt" role="radio" data-g="' + group + '" data-k="' + key + '"><strong>' + name + '</strong><span>' + desc + '</span></button>'; };
  VI.slider = function (id, label, min, max, step) { return '<div class="vi-slider"><label for="' + id + '">' + label + '<output id="' + id + '-o"></output></label><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '"></div>'; };
  VI.qc = function (id, items) { return '<div class="vi-qc">' + items.map(function (i) { return '<button type="button" data-q="' + id + '" data-val=\'' + JSON.stringify(i[1]) + '\'>' + i[0] + '</button>'; }).join('') + '</div>'; };
  VI.badge = function (c, t) { return '<span class="vi-badge ' + c + '">' + t + '</span>'; };

  /* press / long-press wiring for SVG buttons. fn(isLong) */
  VI.wireButton = function (e, onShort, onLong, longMs) {
    var timer = null, long = false, active = false;
    e.addEventListener('pointerdown', function (ev) { ev.preventDefault(); active = true; long = false; e.classList.add('down'); VI.ctx(); if (onLong) timer = setTimeout(function () { long = true; onLong(); }, longMs || 750); });
    function up(cancel) { if (!active) return; active = false; e.classList.remove('down'); clearTimeout(timer); if (!cancel && !long && onShort) onShort(); }
    e.addEventListener('pointerup', function () { up(false); });
    e.addEventListener('pointerleave', function () { up(true); });
    e.addEventListener('pointercancel', function () { up(true); });
    e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); if (!ev.repeat) { e.classList.add('down'); if (onShort) onShort(); } } });
    e.addEventListener('keyup', function () { e.classList.remove('down'); });
  };
  /* common settings card wiring: #speed-seg (optional), #sound, #reset */
  window.VI = VI;
})();
