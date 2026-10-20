// Structured selection data for the Vartech DC power supply finder.
// Every value here was read from src/data/vartech-dc-power-supplies.json (specs + features).
// v / i are the per-channel maximums of the MAIN variable output(s).
// ch = number of outputs on the unit (aux/fixed rails count).
// sp = main channels can be run in series (2x voltage) or parallel (2x current) inside the unit.
// cap = total output power cap in W for auto-ranging units (V x I must stay under it).

export type PsKind = 'linear' | 'smps' | 'prog' | 'auto';

export interface PsRow {
  id: string;
  kind: PsKind;
  v: number;
  i: number;
  ch: number;
  aux?: string;
  sp?: boolean;
  cap?: number;
  pc?: string;      // PC interface as shipped
  prog?: boolean;   // memories / list mode / programmable
  ovp?: boolean;    // adjustable OVP / OCP protection listed
}

const SR_USB = 'USB (RS232 / RS485 on request)';

export const psRows: PsRow[] = [
  // Linear, transformer-based
  { id: '3005-b',    kind: 'linear', v: 30,  i: 5,  ch: 1 },
  { id: '3010',      kind: 'linear', v: 30,  i: 10, ch: 1 },
  { id: '3020',      kind: 'linear', v: 30,  i: 20, ch: 1 },
  { id: '6005',      kind: 'linear', v: 60,  i: 5,  ch: 1 },
  { id: '6010',      kind: 'linear', v: 60,  i: 10, ch: 1 },
  { id: '3010-2',    kind: 'linear', v: 30,  i: 10, ch: 2, sp: true },
  { id: '6005-2',    kind: 'linear', v: 60,  i: 5,  ch: 2, sp: true },
  { id: '3005-3-d2', kind: 'linear', v: 30,  i: 5,  ch: 3, sp: true, aux: '5 V / 3 A fixed' },
  { id: '3005-4',    kind: 'linear', v: 30,  i: 5,  ch: 4, aux: '2 x 2.2-15 V / 1 A variable' },
  { id: 'pps-3005-3', kind: 'linear', v: 30, i: 5,  ch: 3, aux: '2.5 / 3.3 / 5 V, 3 A selectable', pc: 'USB (optional)', prog: true, ovp: true },

  // SMPS, slim and bench
  { id: '3005-s',    kind: 'smps',   v: 30,  i: 5,  ch: 1, ovp: true },
  { id: '3010-s',    kind: 'smps',   v: 30,  i: 10, ch: 1, ovp: true },
  { id: '6005-s',    kind: 'smps',   v: 60,  i: 5,  ch: 1, ovp: true },
  { id: '3010-s2',   kind: 'smps',   v: 30,  i: 10, ch: 2, sp: true },
  { id: '6010-s',    kind: 'smps',   v: 60,  i: 10, ch: 1 },
  { id: '10005-s',   kind: 'smps',   v: 100, i: 5,  ch: 1 },
  { id: '20005-s',   kind: 'smps',   v: 200, i: 5,  ch: 1, ovp: true },
  { id: '20010-s',   kind: 'smps',   v: 200, i: 10, ch: 1, ovp: true },

  // SMPS with PC interface (SR series)
  { id: '3020-sr',   kind: 'smps',   v: 30,  i: 20, ch: 1, pc: SR_USB,   ovp: true },
  { id: '3030-sr',   kind: 'smps',   v: 30,  i: 30, ch: 1, pc: SR_USB,   ovp: true },
  { id: '3040-sr',   kind: 'smps',   v: 30,  i: 40, ch: 1, pc: SR_USB,   ovp: true },
  { id: '5020-sr',   kind: 'smps',   v: 50,  i: 20, ch: 1, pc: SR_USB,   ovp: true },
  { id: '5030-sr',   kind: 'smps',   v: 50,  i: 30, ch: 1, pc: SR_USB,   ovp: true },
  { id: '6010-sr',   kind: 'smps',   v: 60,  i: 10, ch: 1, pc: 'RS232',  ovp: true },
  { id: '6020-sr',   kind: 'smps',   v: 60,  i: 20, ch: 1, pc: SR_USB,   ovp: true },
  { id: '10010-sr',  kind: 'smps',   v: 100, i: 10, ch: 1, pc: 'RS232',  ovp: true },
  { id: '12005-sr',  kind: 'smps',   v: 120, i: 5,  ch: 1, pc: SR_USB,   ovp: true },
  { id: '15003-sr',  kind: 'smps',   v: 150, i: 3,  ch: 1, pc: SR_USB,   ovp: true },
  { id: '20010-sr',  kind: 'smps',   v: 200, i: 10, ch: 1, pc: 'RS232',  ovp: true },

  // Programmable SMPS (PPS-S)
  { id: 'pps-3005-s',  kind: 'prog', v: 30,  i: 5,  ch: 1, pc: 'USB', prog: true, ovp: true },
  { id: 'pps-3010-s',  kind: 'prog', v: 30,  i: 10, ch: 1, pc: 'USB', prog: true, ovp: true },
  { id: 'pps-3020-s',  kind: 'prog', v: 30,  i: 20, ch: 1, pc: 'USB', prog: true, ovp: true },
  { id: 'pps-3610-s',  kind: 'prog', v: 36,  i: 10, ch: 1, pc: 'USB', prog: true, ovp: true },
  { id: 'pps-6005-s',  kind: 'prog', v: 60,  i: 5,  ch: 1, pc: 'USB', prog: true, ovp: true },
  { id: 'pps-6010-s',  kind: 'prog', v: 60,  i: 10, ch: 1, pc: 'USB', prog: true, ovp: true },
  { id: 'pps-10003-s', kind: 'prog', v: 100, i: 3,  ch: 1, pc: 'USB', prog: true, ovp: true },

  // Auto-ranging programmable
  { id: 'ppsa-100w-8005-s', kind: 'auto', v: 80, i: 5, ch: 1, cap: 100, pc: 'RS232 / RS485', prog: true, ovp: true },
];
