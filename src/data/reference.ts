// Reference hub data: standards directory and the "which instrument for which job" matrix.
// Rules for this file:
//  - Listing a standard is NOT a claim that any CIE or Vartech model is certified to it.
//    The only conformance statements on the site are the ones already in the Indian standards guide.
//  - No clause text, no limits quoted from memory. Standards are summarised by scope only.
//  - Every guide / tool / category slug here is checked against the real data at build time (see pages).

export type StandardGroup = 'Insulation and HV' | 'Earthing' | 'Wiring and installation' | 'Instrument safety and ratings' | 'Relays and protection' | 'Calibration and accuracy';

export interface Standard {
  code: string;
  title: string;
  issuer: 'BIS (India)' | 'IEC' | 'IEEE' | 'BSI (UK)' | 'ISO/IEC';
  group: StandardGroup;
  covers: string;
  instruments: string;
  guide?: string;
  tool?: string;
  category?: string;
  note?: string; // status or edition caution, shown on the card
}

export const standardGroups: StandardGroup[] = ['Insulation and HV', 'Earthing', 'Wiring and installation', 'Instrument safety and ratings', 'Relays and protection', 'Calibration and accuracy'];

export const standards: Standard[] = [
  { code: 'IS 2992', title: 'Insulation resistance testers, hand operated (magneto generator type)', issuer: 'BIS (India)', group: 'Insulation and HV',
    covers: 'Construction and accuracy of hand-operated magneto generator insulation testers, the classic hand-cranked megger.',
    instruments: 'Hand-driven insulation testers',
    note: 'The 1987 edition is the one manufacturers still cite. BIS lists it as reaffirmed in 2015; check the BIS catalogue for its current status. Electronic insulation testers fall under a separate standard (IS 10656).', guide: 'indian-standards-insulation-earth-oil-testers', category: 'insulation-testers-hand' },
  { code: 'IEEE 43', title: 'Recommended practice for testing insulation resistance of electric machinery', issuer: 'IEEE', group: 'Insulation and HV',
    covers: 'How to test and interpret insulation resistance and polarization index on windings of rotating machines rated 750 W or more.',
    note: 'The 2013 edition is listed by IEEE as inactive-reserved since 2024, though it is still widely cited. Check the IEEE site for the current status.',
    instruments: 'Insulation testers with 500 V to 5 kV ranges', guide: 'polarization-index-vs-dielectric-absorption-ratio', tool: 'motor-minimum-insulation-resistance', category: 'motor-operated-insulation' },
  { code: 'IS 6792', title: 'Insulating liquids: determination of the breakdown voltage at power frequency, test method', issuer: 'BIS (India)', group: 'Insulation and HV',
    covers: 'The breakdown voltage test for transformer oil: test cell, electrode gap and procedure.',
    note: 'The current edition (IS 6792:2023) is identical to IEC 60156:2018. Older editions were titled as a method for the electric strength of insulating oils.',
    instruments: 'Oil BDV test sets', guide: 'transformer-oil-bdv-standards-compared', category: 'oil-test-sets' },
  { code: 'IEC 60156', title: 'Insulating liquids: determination of the breakdown voltage at power frequency, test method', issuer: 'IEC', group: 'Insulation and HV',
    covers: 'The IEC method for the breakdown voltage of insulating liquids, widely used outside India and in export specifications.',
    instruments: 'Oil BDV test sets', guide: 'transformer-oil-bdv-test', category: 'oil-test-sets' },

  { code: 'IS 3043', title: 'Code of practice for earthing', issuer: 'BIS (India)', group: 'Earthing',
    covers: 'Design, installation and maintenance of earthing systems. It tells you what to achieve; an earth tester proves it.',
    instruments: 'Earth testers', guide: 'how-low-should-earth-resistance-be', tool: 'earth-rod-resistance-calculator', category: 'earth-tester' },
  { code: 'IS 9223', title: 'Portable earth resistance meters', issuer: 'BIS (India)', group: 'Earthing',
    covers: 'Accuracy and construction expected of portable earth resistance meters.',
    instruments: 'Analog and digital earth testers',
    note: 'The 1989 edition is still cited by manufacturers, but BIS records show it as withdrawn and point to IS/IEC 61557-5 (resistance to earth) for current practice. Check the BIS catalogue before quoting it in a tender.', guide: 'indian-standards-insulation-earth-oil-testers', category: 'earth-tester' },
  { code: 'IEEE 81', title: 'Guide for measuring earth resistivity, ground impedance and earth surface potentials of a grounding system', issuer: 'IEEE', group: 'Earthing',
    covers: 'Field methods for soil resistivity (including the Wenner four-pin method) and ground system measurements.',
    instruments: 'Earth testers with four-terminal capability', guide: 'soil-resistivity-wenner-vs-schlumberger', tool: 'soil-resistivity-wenner-calculator', category: 'earth-tester' },

  { code: 'IS 732', title: 'Code of practice for electrical wiring installations', issuer: 'BIS (India)', group: 'Wiring and installation',
    covers: 'Wiring practice for buildings, including the tests carried out on a finished installation.',
    instruments: 'Insulation testers, earth testers, multimeters', guide: 'how-to-megger-test-house-wiring', category: 'digital-insulation-testers' },
  { code: 'IEC 60364-6', title: 'Low-voltage electrical installations, Part 6: verification', issuer: 'IEC', group: 'Wiring and installation',
    covers: 'Initial and periodic verification of low-voltage installations, including insulation resistance tests.',
    instruments: 'Insulation testers, continuity and earth testers', guide: 'bs-7671-iec-60364-initial-verification-instruments', tool: 'insulation-test-voltage-selector', category: 'digital-insulation-testers' },
  { code: 'BS 7671', title: 'Requirements for electrical installations (IET Wiring Regulations)', issuer: 'BSI (UK)', group: 'Wiring and installation',
    covers: 'The UK wiring regulations, often named in specifications from UK-linked projects.',
    instruments: 'Installation testers', guide: 'bs-7671-iec-60364-initial-verification-instruments' },

  { code: 'IEC 61010-1', title: 'Safety requirements for measurement, control and laboratory equipment', issuer: 'IEC', group: 'Instrument safety and ratings',
    covers: 'General safety requirements for test and measurement equipment, including the CAT I to CAT IV measurement categories.',
    instruments: 'Multimeters, clamp meters and other hand-held instruments', guide: 'what-is-cat-rating', category: 'multimeters' },
  { code: 'IEC 61557', title: 'Electrical safety in low voltage distribution systems up to 1000 V AC and 1500 V DC: equipment for testing, measuring or monitoring of protective measures (series)', issuer: 'IEC', group: 'Instrument safety and ratings',
    covers: 'Performance requirements for installation testers, split into parts for insulation, earth resistance, loop impedance and more.',
    instruments: 'Installation testers, insulation and earth testers', guide: 'bs-7671-iec-60364-initial-verification-instruments', category: 'digital-insulation-testers' },
  { code: 'IEC 60529', title: 'Degrees of protection provided by enclosures (IP code)', issuer: 'IEC', group: 'Instrument safety and ratings',
    covers: 'The two-digit IP code for dust and water ingress.',
    instruments: 'Any instrument used outdoors or on a plant floor', guide: 'ip-rating-explained' },

  { code: 'IEC 60255', title: 'Measuring relays and protection equipment (series)', issuer: 'IEC', group: 'Relays and protection',
    covers: 'Requirements and tests for protection relays, including the inverse-time characteristics used by IDMT relays.',
    instruments: 'Relay test sets', guide: 'idmt-relay-curves-explained', category: 'relay-test-sets' },

  { code: 'IS 1248', title: 'Direct acting indicating analogue electrical measuring instruments and their accessories (multi-part)', issuer: 'BIS (India)', group: 'Calibration and accuracy',
    covers: 'Accuracy classes and tests for analogue panel and portable meters, split into parts for ammeters and voltmeters, wattmeters, ohmmeters and more.',
    note: 'The 2021 parts are aligned with the IEC 60051 series.',
    instruments: 'Analog meters and indicators', guide: 'indian-standards-insulation-earth-oil-testers' },
  { code: 'ISO/IEC 17025', title: 'Competence of testing and calibration laboratories', issuer: 'ISO/IEC', group: 'Calibration and accuracy',
    covers: 'The standard that laboratories (including NABL-accredited ones) are assessed against. It governs a lab, not an instrument.',
    instruments: 'Calibration certificates and traceability', guide: 'nabl-vs-manufacturer-calibration' },
];

export type JobGroup = 'Insulation and earthing' | 'Electrical and power' | 'Electronics bench' | 'Process and environment';
export const jobGroups: JobGroup[] = ['Insulation and earthing', 'Electrical and power', 'Electronics bench', 'Process and environment'];

export interface Job {
  group: JobGroup;
  job: string;
  instrument: string;
  look: string;
  category: string;
  guide: string;
  tool?: string;
  standard?: string;
}

export const jobs: Job[] = [
  { group: 'Insulation and earthing', job: 'Test a low-voltage motor winding', instrument: 'Insulation tester (megger)', look: 'A 500 V or 1000 V range and a readable scale into the gigaohm region', category: 'insulation-testers-hand', guide: 'insulation-resistance-testing-guide', tool: 'motor-minimum-insulation-resistance', standard: 'IEEE 43' },
  { group: 'Insulation and earthing', job: 'Trend an HT motor, generator or transformer', instrument: 'Motor-operated insulation tester', look: 'A 2.5 kV or 5 kV range and steady motor-driven voltage for 10-minute PI readings', category: 'motor-operated-insulation', guide: 'polarization-index-vs-dielectric-absorption-ratio', tool: 'pi-dar-calculator', standard: 'IEEE 43' },
  { group: 'Insulation and earthing', job: 'Test house or office wiring', instrument: 'Digital insulation tester', look: 'A 500 V range, a guard-free simple layout and a clear digital reading', category: 'digital-insulation-testers', guide: 'how-to-megger-test-house-wiring', tool: 'insulation-test-voltage-selector', standard: 'IS 732' },
  { group: 'Insulation and earthing', job: 'Test a long cable or submersible pump motor', instrument: 'Insulation tester', look: 'Enough range for long-cable leakage and a rugged, field-friendly body', category: 'insulation-testers-hand', guide: 'submersible-pump-motor-borewell-cable-testing' },
  { group: 'Insulation and earthing', job: 'Check an earth pit', instrument: 'Earth tester', look: 'A range matched to your target resistance and enough spike cable for the layout', category: 'earth-tester', guide: 'earth-pit-testing-maintenance-india', tool: 'earth-rod-resistance-calculator', standard: 'IS 3043' },
  { group: 'Insulation and earthing', job: 'Measure soil resistivity before designing an earth grid', instrument: 'Four-terminal earth tester', look: 'Four terminals for the Wenner method and a low range with fine resolution', category: 'earth-tester', guide: 'soil-resistivity-wenner-vs-schlumberger', tool: 'soil-resistivity-wenner-calculator', standard: 'IEEE 81' },
  { group: 'Insulation and earthing', job: 'Check busbar joints, contacts and bonding', instrument: 'Micro-ohm meter', look: 'A high test current, four-wire (Kelvin) leads and a milli-ohm or micro-ohm range', category: 'digital-earth-micro-ohm', guide: 'micro-ohm-meter-guide' },
  { group: 'Insulation and earthing', job: 'Test transformer oil', instrument: 'Oil BDV test set', look: 'An adjustable electrode gap, a suitable voltage range and a clear trip indication', category: 'oil-test-sets', guide: 'transformer-oil-bdv-test', standard: 'IS 6792' },
  { group: 'Insulation and earthing', job: 'Withstand test on HV equipment', instrument: 'HV test set', look: 'The rated test voltage, a duty cycle that suits your test time and proper interlocks', category: 'hv-phase-sequence', guide: 'hv-dielectric-withstand-testing-guide' },
  { group: 'Insulation and earthing', job: 'Commission a protection relay', instrument: 'Relay test set', look: 'Current and voltage range for your relays, single or three phase, and timing accuracy', category: 'relay-test-sets', guide: 'how-to-choose-a-relay-test-set', standard: 'IEC 60255' },

  { group: 'Electrical and power', job: 'Check phase sequence before connecting a motor', instrument: 'Phase sequence indicator', look: 'A simple, visible indication and a voltage range for your supply', category: 'phase-sequence-indicators', guide: 'phase-sequence-testing' },
  { group: 'Electrical and power', job: 'Measure current without opening the circuit', instrument: 'Clamp meter', look: 'True RMS, enough jaw opening for your cable or busbar, and the right CAT rating', category: 'clamp-meters', guide: 'how-to-choose-a-clamp-meter', tool: 'three-phase-power-calculator', standard: 'IEC 61010-1' },
  { group: 'Electrical and power', job: 'Find small leakage currents', instrument: 'Leakage clamp meter', look: 'A milliamp-level range and resolution on a clamp that can enclose both conductors', category: 'vartech-clamp-meters', guide: 'vartech-v-2002-plus-leakage-clamp-meter-guide' },
  { group: 'Electrical and power', job: 'Measure DC current in a solar or battery system', instrument: 'DC-capable clamp meter', look: 'DC current measurement, not just AC, and a CAT rating for the system voltage', category: 'vartech-clamp-meters', guide: 'dc-current-clamp-meter-solar-battery' },
  { group: 'Electrical and power', job: 'Check a three-phase motor for imbalance', instrument: 'Clamp meter', look: 'True RMS and a stable reading on each phase in turn', category: 'clamp-meters', guide: 'how-to-check-three-phase-imbalance' },
  { group: 'Electrical and power', job: 'General troubleshooting: voltage, continuity, resistance', instrument: 'Digital multimeter', look: 'True RMS, the right CAT rating, a continuity buzzer and enough digits for your work', category: 'multimeters', guide: 'how-to-choose-a-multimeter', tool: 'multimeter-accuracy-calculator', standard: 'IEC 61010-1' },

  { group: 'Electronics bench', job: 'Look at a waveform', instrument: 'Oscilloscope', look: 'Bandwidth well above your signal, enough sample rate and the right channel count', category: 'vartech-oscilloscopes', guide: 'how-to-choose-an-oscilloscope', tool: 'oscilloscope-bandwidth-calculator' },
  { group: 'Electronics bench', job: 'Generate a test signal', instrument: 'Function generator', look: 'The waveforms and frequency range you need, and amplitude and offset control', category: 'vartech-function-generators', guide: 'how-to-choose-a-vartech-function-generator' },
  { group: 'Electronics bench', job: 'Measure an inductor, capacitor or resistor', instrument: 'LCR meter', look: 'Test frequencies that match the part, and basic accuracy for your tolerance', category: 'vartech-lcr-meters', guide: 'how-to-choose-a-vartech-lcr-meter', tool: 'resistor-colour-code-calculator' },
  { group: 'Electronics bench', job: 'Power a circuit on the bench', instrument: 'DC power supply', look: 'Voltage and current rating with headroom, adjustable current limit and low ripple', category: 'vartech-dc-power-supplies', guide: 'how-to-choose-a-vartech-dc-power-supply' },
  { group: 'Electronics bench', job: 'Test a battery or power supply under load', instrument: 'DC electronic load', look: 'Voltage, current and power rating above the source, plus the CC, CV, CR and CP modes you need', category: 'vartech-dc-loads', guide: 'how-to-choose-a-vartech-dc-electronic-load' },

  { group: 'Process and environment', job: 'Check or simulate a 4-20 mA loop', instrument: 'Process calibrator', look: 'Source and measure for mA, V and the sensor types you use', category: 'vartech-calibrators', guide: 'loop-calibrator-vs-process-calibrator' },
  { group: 'Process and environment', job: 'Check lighting levels', instrument: 'Lux meter', look: 'A range covering your spaces and a sensor with good cosine response', category: 'vartech-lux-meters', guide: 'how-to-choose-a-vartech-lux-meter' },
  { group: 'Process and environment', job: 'Measure workplace noise', instrument: 'Sound level meter', look: 'A-weighting, a suitable dB range and fast and slow time weighting', category: 'vartech-sound-level-meters', guide: 'vartech-v-6700-b-sound-level-meter-guide' },
  { group: 'Process and environment', job: 'Measure air flow', instrument: 'Anemometer', look: 'A velocity range for your ducts or vents, and a way to log or hold readings', category: 'vartech-anemometers', guide: 'vartech-v-6250-b-anemometer-guide' },
  { group: 'Process and environment', job: 'Measure temperature', instrument: 'Digital thermometer', look: 'The sensor type, range and probe style for your process', category: 'vartech-thermometers', guide: 'how-to-choose-a-vartech-thermometer' },
];
