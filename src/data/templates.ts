// Free printable test report forms. PDFs live in the cie-downloads repo (templates/), served via downloadUrl().
// Generators: catalogues/_build/gen_report_forms.py and gen_report_forms2.py. Bump TEMPLATE_V when a PDF or thumbnail changes.
export const TEMPLATE_V = '6';

export interface TemplateForm {
  slug: string;
  file: string;
  pages: number;
  name: string;
  seoTitle: string;
  seoDesc: string;
  std: string;
  summary: string;
  inside: string[];
  checks: string;
  faqs: [string, string][];
  links: [string, string][];
  product: { label: string; href: string };
}

export const templates: TemplateForm[] = [
  {
    slug: 'insulation-resistance-test-report',
    file: 'CIE-Insulation-Resistance-Test-Report-Form.pdf',
    pages: 2,
    name: 'Insulation Resistance Test Report',
    seoTitle: 'Insulation Resistance Test Report Format (Free PDF, IEEE 43)',
    seoDesc: 'Free printable insulation resistance (megger) test report format with timed readings, temperature correction, DAR and PI worksheet and IEEE 43-2013 limits. A4 PDF, no sign-up.',
    std: 'IEEE 43-2013 timed test',
    summary: 'Print it, fill it in on site and hand it over. Page 1 is the report form. Page 2 gives you the formulas, the temperature factor table and the limits, so you can work out every result by hand.',
    inside: [
      'Timed readings at 15 s, 30 s, 45 s, 60 s and 10 min for up to 6 connections, with columns for Kt, IR at 40 °C, DAR and PI',
      'An evaluation table that checks each connection against the minimum IR and minimum PI',
      'A ready temperature factor table, Kt = 0.5^((40 - T) / 10), from 0 to 90 °C in 5 °C steps',
      'Minimum IR by winding class (kV + 1, 100 or 5 MΩ), minimum PI by thermal class, and recommended test voltage by rated kV',
      'DAR and PI guide bands, clearly marked as guides rather than standard limits',
    ],
    checks: 'Kt values are calculated from the formula shown, and the formulas were checked against independent calculations. Limits are IEEE 43-2013 as commonly quoted, so check them against your edition.',
    faqs: [
      ['What is a good PI value for a motor?', 'IEEE 43-2013 gives a minimum polarization index of 1.5 for thermal class A and 2.0 for classes B, F and H. A PI above about 2 to 4 is generally read as good, but the form marks those bands as guides, not standard limits.'],
      ['Why correct insulation resistance to 40 °C?', 'Insulation resistance falls as temperature rises, roughly halving every 10 °C. Correcting each reading to a common temperature lets you compare tests taken on different days. The form includes the factor table.'],
    ],
    links: [['PI and DAR calculator', '/tools/pi-dar-calculator/'], ['Motor minimum IR check', '/tools/motor-minimum-insulation-resistance/'], ['IR temperature correction', '/tools/ir-temperature-correction-calculator/']],
    product: { label: 'See CIE insulation testers', href: '/products/digital-insulation-testers/' },
  },
  {
    slug: 'earth-resistance-test-report',
    file: 'CIE-Earth-Resistance-Test-Report-Form.pdf',
    pages: 2,
    name: 'Earth Resistance and Soil Resistivity Report',
    seoTitle: 'Earth Resistance Test Report Format (Free PDF, Fall of Potential)',
    seoDesc: 'Free printable earth electrode resistance test report with a fall-of-potential plateau graph and a Wenner soil resistivity worksheet. A4 PDF, no sign-up.',
    std: 'IEEE 81 fall-of-potential and Wenner methods',
    summary: 'Page 1 is the electrode test with a printed graph for plotting the plateau. Page 2 is the Wenner soil resistivity worksheet with a depth correction table and a single-rod estimate.',
    inside: [
      'Fall-of-potential readings at 10 to 90 % of the E to C distance, with the 52, 62 and 72 % plateau check rows marked',
      'A printed graph with the 52, 62 and 72 % positions drawn on it, so a flat region is easy to see',
      'Result boxes for the plateau check, the spacing check, the seasonal factor and the pass or fail against your permitted value',
      'A Wenner worksheet for up to 8 spacings, with a depth correction factor table for b / a from 0.01 to 0.30',
      'The Dwight single-rod formula with a worked example, for comparing an estimate with your measurement',
    ],
    checks: 'The depth correction factors are calculated from the exact Wenner relation, which reduces to 2πaR when the probe depth is zero. The 5 % plateau tolerance and 5 × L spacing are practical guides, not limits from a standard.',
    faqs: [
      ['What is the 62 % rule in earth testing?', 'In the fall-of-potential method the potential spike is placed at 62 % of the distance from the electrode to the current spike. The reading there is close to the true resistance when the soil is uniform. The form also records 52 % and 72 % to check that the readings agree.'],
      ['How do I know the earth test is valid?', 'If the readings at 52, 62 and 72 % agree closely (the form uses 5 % as a practical guide), you are on the flat part of the curve and the test is good. If they do not, move the current spike further out and repeat.'],
    ],
    links: [['Earth resistance testing guide', '/blog/earth-resistance-testing-guide/'], ['Soil resistivity calculator', '/tools/soil-resistivity-wenner-calculator/'], ['Earth rod resistance calculator', '/tools/earth-rod-resistance-calculator/']],
    product: { label: 'See CIE earth testers', href: '/products/earth-tester/' },
  },
  {
    slug: 'relay-test-report',
    file: 'CIE-Relay-Injection-Test-Report-Form.pdf',
    pages: 3,
    name: 'Overcurrent Relay Secondary Injection Report',
    seoTitle: 'Overcurrent Relay Test Report Format (Free PDF, IEC 60255-151)',
    seoDesc: 'Free printable overcurrent relay secondary injection test report with pickup, drop-off, IDMT operating times and a log-log plot sheet. A4 PDF, no sign-up.',
    std: 'IEC 60255-151 inverse-time characteristics',
    summary: 'A commissioning form for phase overcurrent relays, with a plot sheet and a reference page that gives the expected operating time for any TMS.',
    inside: [
      'Settings, CT ratio and the working to turn primary settings into secondary injection currents',
      'Pickup, drop-off, six timing points and the high-set element, each with expected, measured and result columns',
      'Tolerance boxes for you to fill from the relay datasheet. The form assumes none',
      'Base operating times at TMS = 1 for the standard, very, extremely and long-time inverse curves, so expected time = base × TMS',
      'An eight-item checklist, a sign-off block and a log-log plot sheet for expected against measured times',
    ],
    checks: 'Base times are calculated from t = k / ((I / Is)^α - 1) and the formula was checked against independent calculations. The constants are from IEC 60255-151, so confirm your relay uses the same characteristic.',
    faqs: [
      ['How do I calculate the expected operating time of an IDMT relay?', 'Use t = TMS × k / ((I / Is)^α − 1), with k and α from the curve. The reference page lists base times at TMS = 1 for standard, very, extremely and long-time inverse curves, so you multiply by your TMS.'],
      ['Does the form include relay tolerances?', 'No. Pickup, timing and reset tolerances differ by relay, so the form leaves boxes for you to fill from the relay datasheet instead of assuming a value.'],
    ],
    links: [['How to choose a relay test set', '/blog/how-to-choose-a-relay-test-set/'], ['Relay test sets', '/products/relay-test-sets/']],
    product: { label: 'See CIE relay test sets', href: '/products/relay-test-sets/' },
  },
  {
    slug: 'transformer-oil-bdv-test-report',
    file: 'CIE-Transformer-Oil-BDV-Test-Report-Form.pdf',
    pages: 2,
    name: 'Transformer Oil BDV Test Report',
    seoTitle: 'Transformer Oil BDV Test Report Format (Free PDF)',
    seoDesc: 'Free printable transformer oil BDV (breakdown voltage) test report: six breakdowns per sample, mean, standard deviation, limits and procedure. A4 PDF, no sign-up.',
    std: 'Dielectric strength of insulating oil, IEC 60156 style',
    summary: 'Record up to four oil samples on one sheet: six breakdown voltages each, with mean, lowest, highest, spread and a pass or fail against the limit for your voltage class. Page 2 has the procedure and the calculations.',
    inside: [
      'Sample and transformer details: ID, rating, oil type, where the sample was drawn, oil temperature, electrode gap and voltage rise rate',
      'A table for six breakdowns on each of up to four samples, with rows for mean, lowest, highest, standard deviation and spread',
      'A limit row and a pass or fail row, with the limit left for you to fill from your specification',
      'Visual checks, oil condition options and a retest date',
      'A worked example, the test sequence (sampling, rest, rate, repeats) and commonly quoted guide values by voltage class',
    ],
    checks: 'Mean, standard deviation and spread are calculated from the formulas on page 2, and the worked example was checked against an independent calculation. The guide thresholds are common field practice marked as guides: take the binding limit from your specification, IEC 60422 or IS 1866.',
    faqs: [
      ['How many breakdowns are taken in a BDV test?', 'The usual test takes six breakdowns on one filling of the cell, with the voltage raised at about 2 kV per second and a short rest between breakdowns, and reports the mean. Follow the standard your specification names.'],
      ['What is the minimum BDV for transformer oil?', 'It depends on the voltage class and your specification. Commonly quoted field values for in-service oil with a 2.5 mm gap are 30 kV or more up to 72.5 kV class, 40 kV or more up to 170 kV, and 50 kV or more above that. The form leaves the limit box for your own value.'],
    ],
    links: [['Transformer oil BDV test guide', '/blog/transformer-oil-bdv-test/'], ['BDV standards compared', '/blog/transformer-oil-bdv-standards-compared/'], ['How to test a transformer', '/blog/how-to-test-a-transformer/']],
    product: { label: 'See CIE oil BDV testers', href: '/products/oil-test-sets/' },
  },
  {
    slug: 'transformer-insulation-resistance-test-report',
    file: 'CIE-Transformer-Insulation-Resistance-Test-Report-Form.pdf',
    pages: 2,
    name: 'Transformer Insulation Resistance (Megger) Report',
    seoTitle: 'Transformer Insulation Resistance Test Report Format (Free PDF)',
    seoDesc: 'Free printable transformer megger test report: HV, LV and HV-LV insulation resistance at 15 s, 60 s and 10 min with DAR, PI and temperature correction. A4 PDF.',
    std: 'HV to LV, winding to earth, core to earth',
    summary: 'The standard set of transformer megger tests on one page, with a worksheet that corrects each reading to 20 °C and calculates DAR and PI.',
    inside: [
      'Transformer details: make, rating, vector group, HV and LV voltage, oil and winding temperature, ambient and weather',
      'Readings at 15 s, 60 s and 10 min for HV to LV and earth, LV to HV and earth, HV and LV to earth, HV to LV, tertiary and core to earth',
      'Columns for the temperature factor, IR60 at 20 °C, DAR and PI, plus an evaluation table against your acceptance value',
      'A temperature factor table from 10 to 80 °C, the formulas and a worked example',
      'Guide values clearly marked as rules of thumb, and method notes on isolation, guard use and discharge',
    ],
    checks: 'Temperature factors are calculated from K20 = 2^((T − 20) / 10), the usual halving per 10 °C rule referred to 20 °C. For oil-filled units the real slope can differ, so use the manufacturer or IEEE C57.152 table where you have one. The 1 MΩ per kV rule is a guide, not a standard limit.',
    faqs: [
      ['Which tests make up a transformer megger test?', 'The usual set is HV to LV and earth, LV to HV and earth, HV and LV to earth, and sometimes HV to LV with the guard terminal used. Core to earth is also checked with the core earth link removed.'],
      ['What test voltage do I use on a transformer?', 'It is commonly 5 kV DC for HV windings and 1 kV DC for LV windings, or 500 V for windings below 1 kV. Use the voltage your specification or the manufacturer gives.'],
    ],
    links: [['What is a megger', '/blog/what-is-a-megger/'], ['How to test a transformer', '/blog/how-to-test-a-transformer/'], ['PI and DAR calculator', '/tools/pi-dar-calculator/']],
    product: { label: 'See CIE insulation testers', href: '/products/digital-insulation-testers/' },
  },
  {
    slug: 'cable-insulation-resistance-test-report',
    file: 'CIE-Cable-Insulation-Resistance-Test-Report-Form.pdf',
    pages: 2,
    name: 'Cable Insulation Resistance Test Report',
    seoTitle: 'Cable Insulation Resistance Test Report Format (Free PDF)',
    seoDesc: 'Free printable cable megger test report: core-to-earth and core-to-core insulation resistance, per-kilometre normalisation, test voltage guide and BS 7671 minimums. A4 PDF.',
    std: 'Core to earth and core to core, DC test',
    summary: 'A one-page megger record for power and control cables, with a per-kilometre column so cables of different lengths can be compared, and a reference page for test voltage and minimum values.',
    inside: [
      'Cable details: type and size, rated voltage, length, installation, conductor temperature and humidity',
      'Nine ready test lines: each core to earth, core to core, neutral and armour or sheath, with 1 minute and optional 10 minute readings and PI',
      'A per-kilometre column (IR × length in km) so you can compare a 100 m run with a 1 km run',
      'Before-and-after checks, a result block and a sign-off',
      'Page 2: test voltage by cable rating, BS 7671 LV minimums, what common patterns of readings usually mean, and method notes',
    ],
    checks: 'The per-kilometre conversion and PI are simple ratios with a worked example. The BS 7671 minimums are 0.5 MΩ at 250 V and 1 MΩ at 500 V or 1000 V. The test voltage table and 1 MΩ per kV idea are common practice guides, so use your cable specification where it states a value.',
    faqs: [
      ['What is the minimum insulation resistance for a cable?', 'For LV installation circuits BS 7671 asks for at least 1 MΩ at 500 V for circuits up to 500 V. That is a minimum for installations, and a healthy new power cable usually reads far higher, in the thousands of MΩ. Many sites also compare with the factory test and the previous test.'],
      ['Why does insulation resistance fall with cable length?', 'A longer cable has more insulation in parallel, so more leakage paths. That is why the form includes a per-kilometre column, so different lengths can be compared fairly.'],
    ],
    links: [['Insulation resistance testing guide', '/blog/insulation-resistance-testing-guide/'], ['Insulation test voltage selector', '/tools/insulation-test-voltage-selector/'], ['Megger test guide', '/blog/what-is-a-megger/']],
    product: { label: 'See CIE insulation testers', href: '/products/digital-insulation-testers/' },
  },
  {
    slug: 'micro-ohm-contact-resistance-test-report',
    file: 'CIE-Low-Resistance-Micro-Ohm-Test-Report-Form.pdf',
    pages: 2,
    name: 'Micro-Ohm Contact Resistance Test Report',
    seoTitle: 'Contact Resistance Test Report Format, Micro-Ohm (Free PDF)',
    seoDesc: 'Free printable low-resistance (micro-ohm) test report for busbar joints, lugs and contacts, with baseline comparison, 20 °C correction and phase deviation. A4 PDF.',
    std: 'Four-wire Kelvin low-resistance measurement',
    summary: 'Ten test lines for joints, lugs and contacts, with correction to 20 °C, percentage change against a baseline and a phase comparison box.',
    inside: [
      'Equipment details: panel, rated current, conductor material, temperature, instrument and test current used',
      'Ten test lines with measured value, value corrected to 20 °C, baseline, change in percent, maximum allowed and result',
      'A phase comparison block with deviation from the lowest phase',
      'Formulas for copper and aluminium correction, change against baseline and joint heating (P = I²R), with worked examples',
      'Guide bands, common causes of a high reading and method notes on four-terminal connection and test current',
    ],
    checks: 'Temperature corrections use the usual coefficients of 0.00393 for copper and 0.00403 for aluminium near 20 °C, and the worked example was checked. The deviation bands are commonly quoted practice, not limits from a standard. For circuit breaker contacts, standards usually call for a DC test current of 100 A or more, so check that your instrument is suitable for the item.',
    faqs: [
      ['What is a good contact resistance for a busbar joint?', 'There is no single value. The reading depends on size, material and design, so compare with the factory or last test, or with similar joints in the same run. A reading much above the others is the warning sign.'],
      ['Why use four wires to measure micro-ohms?', 'A four-terminal (Kelvin) connection puts the current leads outside the voltage leads, so the resistance of the leads and clips is not included in the reading. That is essential when the value you want is in micro-ohms.'],
    ],
    links: [['Continuity, insulation and contact resistance', '/blog/continuity-vs-insulation-vs-contact-resistance/'], ['Electrical panel testing', '/blog/electrical-panel-testing/']],
    product: { label: 'See the CIE micro-ohm meter', href: '/products/digital-earth-micro-ohm/' },
  },
  {
    slug: 'earth-pit-test-register',
    file: 'CIE-Earth-Pit-Test-Register.pdf',
    pages: 2,
    name: 'Earth Pit Test and Maintenance Register',
    seoTitle: 'Earth Pit Test Report Format and Register (Free PDF)',
    seoDesc: 'Free printable earth pit test register: 14 pits per sheet with reading, limit, pass or fail, maintenance done and next test date, plus a visit checklist. A4 PDF.',
    std: 'Annual earth pit testing record',
    summary: 'A register for sites with many earth pits: one line each for location, type, measured resistance, limit, result, maintenance and next test date, with a checklist for each visit.',
    inside: [
      'A 14-line register with pit number, location, type, reading, limit, pass or fail, water, salt or fix done, and next test due',
      'A summary block for pits tested, passed, failed and not accessible, and sign-off lines',
      'Commonly quoted earth resistance targets by type of installation, shown as guides',
      'An eight-point visit checklist covering the cover, water pipe, fill, connections, test link and marking',
      'Method notes on testing one pit, seasonal change, clamp readings and test frequency',
    ],
    checks: 'The earth resistance targets (0.5, 1, 2, 5 and 10 Ω) are commonly quoted from IS 3043 and similar references, written as guides: use the strictest value that applies to the equipment on the pit. The register does not include a calculation, so there are no numbers to verify beyond that.',
    faqs: [
      ['How often should earth pits be tested?', 'At least once a year, and at the driest time of year if you can, because resistance rises in dry weather. Test again after earth faults and after any work near the pit.'],
      ['What earth resistance is acceptable?', 'It depends on the installation. Commonly quoted targets are about 0.5 Ω for large power stations, 1 Ω for major substations, 2 Ω for small substations and 5 Ω for general electrical earthing. Always use the strictest value in your specification.'],
    ],
    links: [['Earth pit testing and maintenance in India', '/blog/earth-pit-testing-maintenance-india/'], ['How low should earth resistance be', '/blog/how-low-should-earth-resistance-be/'], ['Earth electrode test form', '/templates/earth-resistance-test-report/']],
    product: { label: 'See CIE earth testers', href: '/products/earth-tester/' },
  },
  {
    slug: 'hipot-test-report',
    file: 'CIE-AC-Hipot-Withstand-Test-Report-Form.pdf',
    pages: 2,
    name: 'AC Hi-Pot Withstand Test Report',
    seoTitle: 'Hi-Pot Test Report Format, AC Withstand Test (Free PDF)',
    seoDesc: 'Free printable AC hi-pot (high-voltage withstand) test report with test voltage, hold time, leakage current, IR before and after, and a capacitive load check. A4 PDF.',
    std: 'Power-frequency dielectric withstand test',
    summary: 'A report form for AC high-voltage withstand tests, with a capacitive current check so you know before you start whether your test set can supply the load.',
    inside: [
      'Equipment details, basis for the test voltage, test set and trip current setting',
      'Eight test lines with IR before, test voltage, hold time, leakage current, trip or flashover, IR after and result',
      'A capacitive current check: expected current I = 2πfCV against the test set rating',
      'Page 2: commonly used test voltages, the largest capacitive load a 25 mA or 50 mA set can carry at 1 to 5 kV, and a safe test sequence',
      'Safety notes, discharge and earthing steps',
    ],
    checks: 'The maximum load table is calculated from I = 2πfCV at 50 Hz and was checked against an independent calculation. Test voltages on page 2 are common practice shown as guides: take the test voltage from the equipment standard or the manufacturer. The 28 kV for 12 kV figure and similar MV values are shown for reference only.',
    faqs: [
      ['What test voltage should I use for a hi-pot test on a motor?', 'For a routine factory test the common formula is twice the rated voltage plus 1000 V for one minute (IEC 60034-1), with 1500 V as the minimum. In-service re-tests commonly use a lower percentage. Use the standard or manufacturer value for your machine.'],
      ['Why does a hi-pot test set trip on a long cable?', 'A cable behaves like a capacitor, so it draws a capacitive current even when the insulation is perfect. If that current is above the test set rating, the set trips. The form calculates the expected current and the table on page 2 shows the largest load each rating can carry.'],
    ],
    links: [['Electrical panel testing', '/blog/electrical-panel-testing/'], ['How to test motor windings', '/blog/how-to-test-motor-windings/'], ['Insulation test voltage selector', '/tools/insulation-test-voltage-selector/']],
    product: { label: 'See the CIE HV test set', href: '/products/hv-phase-sequence/' },
  },
];

export const bySlug = (slug: string) => templates.find(t => t.slug === slug)!;
