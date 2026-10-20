#!/usr/bin/env python3
"""Rewrites tagline / description / features for the Vartech products added on 2026-10-20.
The first import pasted the manufacturer's marketing text and all-caps catalogue headers. This replaces it with
plain, spec-based copy in the house style of the older Vartech pages. Only facts present in each product's own
specs or catalogue are used; where sources disagreed (228 LRD wattage) the figure is left out.
Also puts each category in a sensible display order. Re-runnable: it only touches the listed ids."""
import json, sys, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'data')

SOLDER_FIT = '936 A, 937, 236, 706 and 700'

COPY = {}
def c(file, id_, tag, desc, feats): COPY[(file, id_)] = (tag, desc, feats)

# ---------------------------------------------------------------- soldering stations
F = 'vartech-soldering-stations'
c(F, '936-a',
  '60 W temperature-controlled soldering station, 200 °C to 480 °C with ±2 °C stability, pointed tip supplied.',
  'The Vartech 936 A is a 60 W temperature-controlled soldering station for general electronics assembly and repair. Temperature is set between 200 °C and 480 °C with ±2 °C stability, and the 50 W iron heats quickly and recovers fast when it meets a cold joint. The temperature can be calibrated from the front panel, tips change easily, and the tip to ground resistance is below 2 Ω with an ESD-safe design. A pointed tip (I type) is supplied; other tip types are sold separately.',
  ['60 W station with a 50 W iron - suits general PCB assembly and repair',
   '200 °C to 480 °C temperature range with ±2 °C stability',
   'Fast heating and rapid thermal recovery',
   'Temperature calibrated directly from the front panel',
   'ESD-safe design - tip to ground resistance below 2 Ω, potential below 2 mV',
   'Easy tip replacement; pointed (I type) tip supplied',
   'Works with the Vartech tip range, sold separately'])
c(F, '936-ad',
  '70 W digital soldering station, 100 °C to 480 °C, with three temperature memories and a password lock.',
  'The Vartech 936 AD is a compact digital soldering station with a 70 W metal heating element and an LED temperature display. Temperature is adjustable from 100 °C to 480 °C with ±2 °C stability, and three memory channels store the temperatures you use most. A password stops the settings from being changed, the iron uses high-temperature silicone cable, and the tip to ground resistance is below 2 Ω. A pointed tip is supplied; other tips are sold separately.',
  ['70 W heating element - higher power than the 936 A for larger joints',
   '100 °C to 480 °C with ±2 °C stability',
   '3 memory channels to store set temperatures',
   'Password lock on the settings',
   'LED display with digital temperature calibration',
   'Split-design metal heater - low cost of consumables',
   'High-temperature silicone cable; ESD-safe design'])
c(F, '937-esd',
  '60 W digital soldering station with a ceramic heater, ±1 °C stability and a key-card lock on the temperature.',
  'The Vartech 937 ESD is a 60 W digital soldering station with a 50 W (24 V AC) iron and a ceramic heating element. Temperature is set with soft-touch up and down keys between 200 °C and 480 °C with ±1 °C stability. A key card must be inserted before the temperature can be changed, so the setting stays protected. Tip to ground resistance is below 2 Ω and potential below 2 mV. A pointed tip is supplied, and the 989 SMD hot tweezer is available separately as an attachment.',
  ['60 W station with a 50 W (24 V AC) iron',
   '200 °C to 480 °C with ±1 °C stability',
   'Ceramic heating element - fast heating and rapid thermal recovery',
   'Key-card lock - temperature cannot be changed without the card',
   'Soft-touch up/down keys for precise setting; digital display',
   'ESD-safe design - tip to ground resistance below 2 Ω',
   'Accepts the 989 SMD hot tweezer (sold separately)'])
c(F, '236-esd',
  '90 W lead-free digital soldering station, 80 °C to 480 °C, ceramic heater with PID control.',
  'The Vartech 236 ESD is a 90 W digital soldering station for lead-free work, where the higher melting point of the solder needs a fast, powerful heater. Temperature adjusts from 80 °C to 480 °C with ±2 °C stability. The sensor sits inside the ceramic heater and PID control keeps the tip steady, with fast heating and quick recovery under load. ESD-safe design, tip to ground resistance below 2 Ω. A pointed tip is supplied; other tips are sold separately.',
  ['90 W - for lead-free solder and larger joints',
   '80 °C to 480 °C with ±2 °C stability',
   'Ceramic heater with the temperature sensor inside it',
   'PID temperature control; digital display',
   'Fast heating and rapid thermal recovery',
   'ESD-safe design - tip to ground resistance below 2 Ω, potential below 2 mV',
   'Digital temperature calibration'])
c(F, '202-d',
  '80 W lead-free station with electromagnetic heating, a sensor at the tip, PIN lock and auto sleep, 80 °C to 480 °C.',
  'The Vartech 202 D is an 80 W lead-free digital soldering station with an electromagnetic heating element driven at 36 V AC, 400 kHz. The temperature sensor sits close to the tip and PID control holds 80 °C to 480 °C with ±2 °C stability. An LCD shows the temperature, a PIN code locks the station parameters, and the station sleeps and shuts off automatically when idle. Output power does not vary with fluctuations in the mains voltage.',
  ['80 W electromagnetic heating element, sensor close to the tip',
   '80 °C to 480 °C with ±2 °C stability; microcomputer PID control',
   'PIN-code lock on the station parameters',
   'Auto sleep and auto shut-off; temperature warning alarm',
   'Short-circuit, overheating and over-power protection',
   'Power output unaffected by mains voltage fluctuation',
   'ESD-safe design; digital temperature calibration'])
c(F, '722',
  '2-in-1 station: 90 W lead-free soldering plus 90 W vacuum de-soldering for through-hole parts, 200 °C to 480 °C.',
  'The Vartech 722 combines a 90 W soldering station and a 90 W vacuum de-soldering gun in one unit, for removing and refitting through-hole (PTH) components. A built-in diaphragm pump (600 mm Hg) pulls molten solder away through the nozzle. Both sections are digitally controlled from 200 °C to 480 °C with closed-loop temperature sensing, the 36 V heater is isolated from the mains, and a password protects the settings. The main unit is designed for lead-free soldering; lead-free de-soldering needs the lead-free de-soldering gun.',
  ['Soldering station and de-soldering gun in one unit, 90 W each',
   'Built-in diaphragm vacuum pump - 600 mm Hg',
   '200 °C to 480 °C with closed-loop sensor control and digital display',
   '36 V heater, fully isolated from the mains',
   'Password lock; auto sleep available as an option',
   'ESD-safe; tip to ground resistance 2 Ω or less, potential 2 mV or less',
   'Heat-resistant vacuum hose; suction nozzles designed for the gun'])
c(F, '201-b',
  '90 W de-soldering station with a built-in vacuum pump (600 mm Hg), digital temperature control 200 °C to 480 °C.',
  'The Vartech 201 B is a 90 W de-soldering station for lifting through-hole components off a board. A built-in diaphragm vacuum pump (600 mm Hg) removes the molten solder, and the heater is digitally controlled from 200 °C to 480 °C with a closed-loop sensor. The 36 V heater is isolated from the mains, the display shows the temperature, and a password protects the settings. ESD-safe, tip to ground resistance 2 Ω or less.',
  ['90 W de-soldering gun with a built-in diaphragm vacuum pump - 600 mm Hg',
   '200 °C to 480 °C with closed-loop sensor control and digital display',
   '36 V heater, fully isolated from the mains',
   'Password lock; auto sleep available as an option',
   'ESD-safe; tip to ground resistance 2 Ω or less, potential 2 mV or less',
   'Heat-resistant vacuum hose; suction nozzles designed for the gun'])

# ---------------------------------------------------------------- SMD re-work and tools
F = 'vartech-rework-stations'
c(F, '850-a',
  '270 W hot-air SMD re-work station, 100 °C to 420 °C, up to 24 L/min airflow, three nozzles supplied.',
  'The Vartech 850 A is a 270 W hot-air station for removing and refitting surface-mount components such as QFP and SOP packages. Temperature is adjustable from 100 °C to 420 °C and the air volume is linearly adjustable up to 24 L/min, from a low-noise pump in its own enclosure. Heating is quick and the station is ESD safe. Three nozzles are supplied; further nozzles and tips are sold separately.',
  ['270 W hot-air station - 100 °C to 420 °C',
   'Air volume linearly adjustable, up to 24 L/min',
   'Powerful start and rapid heating',
   'Suits QFP and SOP ICs',
   'Pump in its own enclosure for low noise',
   'ESD-safe; 3 nozzles supplied, more available separately'])
c(F, '850-d',
  '320 W digital hot-air SMD re-work station, 100 °C to 480 °C, PID closed loop, auto cooling and auto sleep.',
  'The Vartech 850 D is a 320 W digital hot-air re-work station for long hours of SMD work. A 3-digit display shows the temperature, which is held between 100 °C and 480 °C by a PID closed-loop thermocouple sensor and set with soft-touch up and down keys. The air volume is linearly adjustable up to 24 L/min from a low-noise diaphragm pump. Cooling is automatic: delivery is deferred at start-up and the station switches itself off once the temperature falls below 100 °C. Three nozzles are supplied.',
  ['320 W - 100 °C to 480 °C with PID closed-loop thermocouple control',
   '3-digit display; soft-touch up/down keys',
   'Air volume linearly adjustable, up to 24 L/min; low-noise diaphragm pump',
   'Suits BGA, CSP, QFP, PLCC, SOP and other surface-mount ICs',
   'Intelligent cooling, deferred air delivery and auto power-off below 100 °C',
   'Auto sleep function',
   '3 nozzles supplied, more available separately'])
c(F, '857-d',
  '580 W digital hot-air SMD station, 100 °C to 450 °C, up to 100 L/min airflow, handle sensor with auto standby.',
  'The Vartech 857 D is a 580 W digital hot-air re-work station with a 3-digit LED display. Temperature is adjustable from 100 °C to 450 °C and the air volume linearly up to 100 L/min, delivered by a double vortex blower as a soft rotating flow that is gentle on small parts. The heater reaches the set temperature in about 3 seconds, and the station stays stable when the supply voltage varies. A sensor in the handle starts the station when you pick it up and puts it on standby when it is left idle, and cooling is automatic. Noise is below 78 dB.',
  ['580 W - 100 °C to 450 °C with a 3-digit LED display',
   'Air volume linearly adjustable, up to 100 L/min',
   'Double vortex blower - soft rotating airflow, gentle on fragile parts',
   'Reaches the set temperature in about 3 seconds',
   'Handle sensor with auto standby and automatic cooling',
   'Stable when the supply voltage varies; noise below 78 dB'])
c(F, '861-dw',
  '1000 W lead-free hot-air SMD station, 100 °C to 500 °C, three programmable channels, 1 to 120 L/min airflow.',
  'The Vartech 861 DW is a 1000 W hot-air re-work station for lead-free SMD work. Temperature is adjustable from 100 °C to 500 °C and the airflow from 1 to 120 L/min. Three programmable channels (CH1, CH2, CH3) each store a temperature and an airflow setting. A closed-loop sensor with microcomputer zero-trigger control keeps the temperature steady regardless of airflow, a brushless vortex fan gives step-less airflow adjustment, and a ceramic heater is used. Password and key lock protect the settings, and a magnetic switch in the stand puts the station to sleep when the handle is placed on it.',
  ['1000 W - 100 °C to 500 °C, closed-loop sensor control',
   '3 programmable channels, each with its own temperature and airflow',
   'Airflow 1 to 120 L/min, step-less, from a brushless vortex fan',
   'Password protection and key lock',
   'Magnetic switch in the stand starts sleep mode automatically; parameters can be set while asleep',
   'Ceramic heater with auto cooling; digital display'])
c(F, '700-esd',
  '2-in-1 station: 270 W hot-air SMD re-work and a 50 W soldering iron, switched independently, ESD safe.',
  'The Vartech 700 ESD puts a 270 W hot-air SMD re-work section and a 50 W soldering section in one unit. The hot air runs from 100 °C to 420 °C with airflow up to 24 L/min; the soldering iron runs from 200 °C to 480 °C with ±2 °C stability. The two sections have separate switches, so they can be used together or one at a time, and the pump is enclosed for low noise. It is built for long hours on an assembly or repair line. Three nozzles and a pointed tip are supplied.',
  ['Hot air and soldering iron in one unit, switched separately or used together',
   'Hot-air section: 270 W, 100 °C to 420 °C, up to 24 L/min',
   'Soldering section: 50 W, 200 °C to 480 °C, ±2 °C stability',
   'Air volume linearly adjustable; pump enclosed for low noise',
   'ESD-safe',
   '3 nozzles and a pointed tip supplied'])
c(F, '706',
  '2-in-1 station: 580 W hot-air SMD re-work and a 50 W soldering iron, with a digital display.',
  'The Vartech 706 puts a 580 W hot-air section and a 50 W soldering section in one unit. The hot air runs from 100 °C to 450 °C with airflow up to 50 L/min from a brushless vortex fan, the LED display shows temperature to 1 °C, and a closed-loop sensor controls the heat. The soldering iron runs from 200 °C to 480 °C with ±2 °C stability. The sections have separate switches so they can run together or singly, and automatic cooling protects the hot-air handle and the heating element. Three nozzles and a pointed tip are supplied.',
  ['Hot-air section: 580 W, 100 °C to 450 °C, up to 50 L/min',
   'Soldering section: 50 W, 200 °C to 480 °C, ±2 °C stability',
   'LED display with 1 °C resolution; closed-loop sensor control',
   'Separate switches - use together or separately',
   'Automatic cooling protects the hot-air handle and heater; auto sleep',
   'ESD-safe; 3 nozzles and a pointed tip supplied'])
c(F, '989',
  'SMD hot tweezer for the Vartech 937 station: 50 W ceramic heater, 200 °C to 400 °C.',
  'The Vartech 989 is a hot tweezer attachment that plugs into a Vartech 937 soldering station (the earlier 936 ESD stations also work; the 936 A and 936 AD do not). Two 25 W ceramic heaters heat the twin tips together, so a surface-mount resistor, capacitor or SOP package can be lifted or fitted by touching both sides at once, without heating the parts around it. The temperature range is 200 °C to 400 °C.',
  ['Attachment for the Vartech 937 station - not compatible with the 936 A or 936 AD',
   '50 W (2 × 25 W, 24 V AC) ceramic heater',
   '200 °C to 400 °C',
   'Twin tips heat the component directly, leaving neighbouring parts alone',
   'For removing and fitting SMD resistors, capacitors and SOP parts',
   'Light handle; ESD-safe, tip to ground resistance below 2 Ω; different tips available'])
c(F, '853-esd',
  '460 W pre-heater for BGA re-work, 120 °C to 250 °C, hot or cool air.',
  'The Vartech 853 ESD is a 460 W temperature-controlled pre-heater that warms the underside of a board during BGA re-work, so the hot-air station has less heat to add from above. It reaches 250 °C in about 10 seconds, holds the output temperature with a built-in sensor, and can blow either hot or cool air to pre-heat or to cool a chip. Used together with a hot-air re-work station, it handles BGA and other flat ICs.',
  ['460 W, 120 °C to 250 °C',
   'Reaches 250 °C in about 10 seconds',
   'Built-in temperature sensor for a stable output',
   'Hot or cool air selectable - pre-heat or cool a chip',
   'Used with a re-work station for BGA and other flat ICs'])
c(F, '800-l',
  'Large PCB holding fixture for BGA re-work, takes boards up to 305 mm.',
  'The Vartech 800 L is a fixture that holds a printed circuit board during BGA re-work. A 850-series hot-air station connects at the top and the 853 pre-heater sits below the board, and the Vartech 381 A vacuum pickup can be used to lift and hold the component. The fixture is 400 × 300 × 117 mm with an adjustable height and takes boards up to 305 mm. The smaller 800 S is available for small boards.',
  ['Holds the PCB steady for BGA re-work',
   'Fixture 400 × 300 × 117 mm; boards up to 305 mm, open on one side',
   'Height adjustable',
   'Hot-air station mounts above; 853 pre-heater sits below the board',
   'Works with the 381 A vacuum pickup; smaller 800 S available for small boards'])
c(F, '493-esd',
  'Bench-top solder fume extractor, 16 W, about 1 m³/min, replaceable carbon filter.',
  'The Vartech 493 ESD is a bench-top fume extractor that draws solder fumes away from the work area. The adjustable-angle head moves about 1 m³ of air a minute (0.93 to 1.07 m³/min) from a low-noise fan using 16 W. The replaceable filter combines urethane with activated carbon and must be changed periodically depending on use; two spare filters are supplied with the unit. It is an anti-static (ESD-safe) type.',
  ['Draws fumes away at 0.93 to 1.07 m³/min; 16 W',
   'Adjustable angle, easy to place or move',
   'Low-noise fan',
   'Replaceable urethane and activated-carbon filter - 3 filters supplied in total',
   'Anti-static (ESD-safe) construction'])

# ---------------------------------------------------------------- soldering irons
F = 'vartech-soldering-irons'
def iron(id_, w, note, feats_extra=()):
    c(F, id_, f'{w} W soldering iron with a nichrome heater for 230 V mains, 2-pin plug.',
      f'The Vartech SI-{w}W is a {w} W soldering iron with a nichrome heating element, for 230 V mains with a 2-pin plug. {note} Different tips and bits are available separately.',
      [f'{w} W rating, 230 V supply, 2-pin plug', 'Nichrome heating element', 'Interchangeable tips and bits available'] + list(feats_extra))
iron('si-25w', 25, 'At 25 W it suits fine electronics work and small joints.')
iron('si-30w', 30, 'At 30 W it suits light PCB work and small joints.')
iron('si-50w', 50, 'At 50 W it is a general-purpose size for PCB and wiring work.')
iron('si-60w', 60, 'At 60 W it handles general PCB work and thicker wire and terminals.')
iron('si-80w', 80, 'At 80 W it has the power for larger joints, thick wire and terminals. A regular tip is supplied.', ['Regular tip supplied'])
iron('si-100w', 100, 'At 100 W it is the most powerful iron in the range, for heavy wire, lugs and large joints. A regular tip is supplied.', ['Regular tip supplied'])
c(F, 'si-25ws',
  '25 W slim soldering iron with a long-life ceramic heating element, 230 V mains.',
  'The Vartech SI-25WS is a slim-bodied 25 W soldering iron with a ceramic heating element, for 230 V mains with a 2-pin plug. The slim body is comfortable for fine work and the ceramic heater heats quickly and holds its temperature. Different tips and bits are available separately.',
  ['25 W, 230 V supply, 2-pin plug', 'Ceramic heating element - rapid heating, good temperature stability', 'Slim body for fine work', 'Interchangeable tips and bits available'])

# ---------------------------------------------------------------- magnifying lamps
F = 'vartech-magnifiers'
USE = 'inspecting micro components and densely populated PCBs'
c(F, '268-l', 'LED magnifying lamp with a 90 mm lens and a 12 dioptre inset lens, tilting lens, folding arms, table top.',
  f'The Vartech 268 L is a table-top LED magnifying lamp with a 90 mm round lens (3 dioptre) and a small built-in 12 dioptre lens for closer inspection. The lens tilts and rotates, a lid protects it when not in use, and the folding arms reach out to 450 mm. It runs from 220 V mains and weighs about 1 kg. A compact lamp for {USE}.',
  ['90 mm lens, 3 dioptre, with a built-in 12 dioptre small lens', 'Lens tilts and rotates; lid protects the lens', 'Folding arms, adjustable extent 450 mm', 'LED lighting, 220 V mains', 'About 1 kg'])
c(F, '8093', 'Magnifying lamp with a 100 mm lens, 12 W circular CFL light, tilting lens, folding arms, table top.',
  f'The Vartech 8093 is a table-top magnifying lamp with a 100 mm round lens (3 dioptre), a built-in 12 dioptre small lens and a 12 W circular CFL tube. The lens tilts and rotates and has a lid, and the folding arms extend to 450 mm. It runs from 220 V mains and weighs about 1.75 kg. For {USE}; the LED versions are the 8093 LED and the dimmable 8093 LD.',
  ['100 mm lens, 3 dioptre, with a built-in 12 dioptre small lens', '12 W circular CFL lamp', 'Lens tilts and rotates; lid protects the lens', 'Folding arms, adjustable extent 450 mm', 'About 1.75 kg'])
c(F, '8093-led', 'LED magnifying lamp with a 100 mm lens, 40 LEDs, tilting lens, folding arms, table top.',
  f'The Vartech 8093 LED is the LED version of the 8093: a table-top lamp with a 100 mm round lens (3 dioptre), a built-in 12 dioptre small lens and 40 LEDs drawing 6 W. The lens tilts and rotates and has a lid, and the folding arms extend to 450 mm. It runs from 220 V mains and weighs about 1.75 kg. For {USE}.',
  ['100 mm lens, 3 dioptre, with a built-in 12 dioptre small lens', '40 LEDs, 6 W', 'Lens tilts and rotates; lid protects the lens', 'Folding arms, adjustable extent 450 mm', 'About 1.75 kg'])
c(F, '8093-ld', 'Dimmable LED magnifying lamp with a 100 mm lens, 40 LEDs and a touch dimmer, table top.',
  f'The Vartech 8093 LD is a dimmable version of the 8093 LED, with 40 LEDs (7 W) controlled by a touch dimmer so the light can be set to suit the work. The 100 mm round lens is 3 dioptre with a built-in 12 dioptre small lens, tilts and rotates, and sits on folding arms that extend to 450 mm. It runs from 220 V mains and weighs about 1.75 kg. For {USE}.',
  ['Touch dimmer - adjustable brightness', '40 LEDs, 7 W', '100 mm lens, 3 dioptre, with a built-in 12 dioptre small lens', 'Lens tilts and rotates', 'Folding arms, adjustable extent 450 mm', 'About 1.75 kg'])
c(F, '228-l-ii', 'LED magnifying lamp with a 125 mm lens, table clamp, folding arms with external springs, 5 or 8 dioptre.',
  f'The Vartech 228 L II is a table-clamp LED magnifying lamp with a 125 mm round lens, 9 W of SMD LEDs (56 pieces) and folding arms with external springs. The lens is 5 or 8 dioptre, chosen when ordering. The arms reach 43 + 43 cm (86 cm in total) and the lamp weighs about 2 kg. It is the lighter, more economical model of the 228 L, for {USE}.',
  ['125 mm lens, 5 or 8 dioptre (chosen when ordering)', '9 W, 56 SMD LEDs; 220 V mains', 'Table clamp mounting', 'Folding arms with external springs - 43 + 43 cm', 'About 2 kg'])
c(F, '228-l', 'LED magnifying lamp with a 125 mm lens, table clamp, sturdy folding arms, 5 or 8 dioptre.',
  f'The Vartech 228 L is a table-clamp LED magnifying lamp with a 125 mm round lens, 9 W of SMD LEDs (56 pieces) and sturdy folding arms that reach 46 + 46 cm (92 cm in total). The lens is 5 or 8 dioptre, chosen when ordering. It weighs about 3 kg. A stronger-built alternative to the 228 L II, for {USE}.',
  ['125 mm lens, 5 or 8 dioptre (chosen when ordering)', '9 W, 56 SMD LEDs; 220 V mains', 'Table clamp mounting', 'Sturdy folding arms - 46 + 46 cm', 'About 3 kg'])
c(F, '228-al', 'LED magnifying lamp with a 127 mm lens on a vertical rod and heavy metal base, 5 dioptre.',
  f'The Vartech 228 AL is a desk-top LED magnifying lamp with a 127 mm round lens (5 dioptre), 9 W of SMD LEDs (56 pieces) and a vertical rod on a heavy metal base. It needs no clamp, so it can sit anywhere on the bench. It runs from 220 V mains and weighs about 5.25 kg. For {USE}.',
  ['127 mm lens, 5 dioptre', '9 W, 56 SMD LEDs; 220 V mains', 'Vertical rod on a heavy metal base - no clamp needed', 'About 5.25 kg'])
c(F, '228-bl', 'LED magnifying lamp with a 127 mm lens on folding arms and a heavy metal base, 5 dioptre.',
  f'The Vartech 228 BL is a desk-top LED magnifying lamp with a 127 mm round lens (5 dioptre), 9 W of SMD LEDs (56 pieces) and folding arms on a heavy metal base, so the lens can be positioned over the work. It runs from 220 V mains and weighs about 6 kg. For {USE}.',
  ['127 mm lens, 5 dioptre', '9 W, 56 SMD LEDs; 220 V mains', 'Folding arms on a heavy metal base', 'About 6 kg'])
c(F, '228-lx', 'LED magnifying lamp with a 7 inch round lens, 84 SMD LEDs, table clamp, 5 dioptre.',
  f'The Vartech 228 LX is a table-clamp magnifying lamp with a large 7 inch round lens (5 dioptre) and 84 SMD LEDs (12 W, about 910 lumens, 6000 to 7000 K). The wide lens shows a larger area at once than the 125 mm models. It runs from 220 V mains and weighs about 5 kg. For {USE}.',
  ['7 inch round lens, 5 dioptre', '84 SMD LEDs, 12 W, 910 lumens, 6000 to 7000 K', 'Table clamp mounting', '220 V mains; about 5 kg'])
c(F, '228-lxd', 'Dimmable LED magnifying lamp with a 7 inch round lens, touch dimmer and warm/cool light selector.',
  f'The Vartech 228 LXD adds dimming and a choice of light colour to the 7 inch lens format. It has a 7 inch round lens (5 dioptre) and 72 SMD LEDs (12 W) with a touch dimmer and a selector for warm or cool white light, on a table clamp with folding arm. It runs from 220 V mains and weighs about 5 kg. For {USE}.',
  ['7 inch round lens, 5 dioptre', '72 SMD LEDs, 12 W, with touch dimmer', 'Warm or cool white light selector', 'Table clamp with folding arm', '220 V mains; about 5 kg'])
c(F, '228-lrd', 'Dimmable LED magnifying lamp with a 7.5 x 6.2 inch rectangular lens, warm/cool light, table clamp.',
  f'The Vartech 228 LRD has a large rectangular lens (7.5 × 6.2 inch, 5 dioptre) that covers a wide strip of the board. 144 LEDs give warm and cool white light, selectable and dimmable, and the lamp mounts on a table clamp with a folding arm. It runs from 220 V mains and weighs about 5 kg. For {USE}.',
  ['7.5 × 6.2 inch rectangular lens, 5 dioptre', '144 LEDs, warm and cool white light, dimmable', 'Table clamp with folding arm', '220 V mains; about 5 kg'])
c(F, '228-blr', 'LED magnifying lamp with a 7.5 x 6.2 inch rectangular lens on a heavy desk-top base, 5 dioptre.',
  f'The Vartech 228 BLR is the desk-top version of the rectangular-lens lamp: a 7.5 × 6.2 inch lens (5 dioptre), 56 LEDs (9 W) and folding arms on a heavy base. It needs no clamp and runs from 220 V mains. It weighs about 7 kg. For {USE}.',
  ['7.5 × 6.2 inch rectangular lens, 5 dioptre', '56 LEDs, 9 W', 'Folding arms on a heavy desk-top base - no clamp needed', '220 V mains; about 7 kg'])

# ---------------------------------------------------------------- soldering spares and accessories
F = 'vartech-soldering-accessories'
def bit(id_, label, kind, extra=()):
    c(F, id_, f'{kind} soldering bit for the Vartech {SOLDER_FIT} stations.',
      f'A {kind.lower()} soldering bit (tip), supplied singly, to fit the Vartech {SOLDER_FIT} stations. Tips wear with use, so keep spares for the shapes you use most.',
      [f'{kind} tip, pack of 1', f'Fits the {SOLDER_FIT} stations'] + list(extra))
bit('t-i', 'T-I', 'Pointed (I type)')
bit('t-j', 'T-J', 'Bent pointed (J type)')
bit('t-b', 'T-B', 'Pencil (T-B, blunted)')
bit('t-lb', 'T-LB', 'Long pencil (T-LB, blunted)')
bit('t-k', 'T-K', 'Knife (K type, 8 mm)')
bit('t-sk', 'T-SK', 'Small knife (K type, 4 mm)')
bit('t-1-2-ld', 'T-1.2 LD', 'Long double-sided pointed (T-1.2 LD)')
c(F, 't-c-series', f'Single-sided spade soldering bits, 0.5C to 5C, for the Vartech {SOLDER_FIT} stations.',
  f'The T-C series is a range of single-sided spade soldering bits, sold singly in sizes from 0.5C to 5C. Choose the size from the dropdown. They fit the Vartech {SOLDER_FIT} stations.',
  ['Single-sided spade type', 'Sizes 0.5C, 0.8C, 1C, 2C, 3C, 4C and 5C - choose from the dropdown', f'Fits the {SOLDER_FIT} stations', 'Pack of 1'])
c(F, 't-d-series', f'Double-sided chisel soldering bits in several sizes for the Vartech {SOLDER_FIT} stations.',
  f'The T-D series is a range of double-sided chisel soldering bits, sold singly in a choice of sizes. Choose the size from the dropdown. They fit the Vartech {SOLDER_FIT} stations.',
  ['Double-sided chisel type', 'Several sizes - choose from the dropdown', f'Fits the {SOLDER_FIT} stations', 'Pack of 1'])
def elem(id_, part, fits, kind, where, extra=''):
    c(F, id_, f'{kind} for the Vartech {fits}.', f'Replacement {kind.lower()} for the Vartech {fits}. It fits {where}.{extra}',
      [f'Part no. {part}', f'Fits the {fits}', 'Pack of 1'])
elem('a-1321a', 'A 1321 A', '936 A, 706 and 700 soldering stations', 'Heating element', 'inside the soldering iron')
elem('h1901r', 'H1901R', '936 AD soldering station', 'Heating element', 'inside the soldering iron')
elem('a-1321', 'A 1321', '937 and 236 soldering stations', 'Ceramic heating element', 'inside the soldering iron')
elem('a-1146', 'A 1146', '850 A and 700 series SMD re-work stations', 'Heating element (coil)', 'inside the hot-air handle')
elem('he-857a', 'HE-857 A', '857 D and 706 series SMD re-work stations', 'Heating element (coil)', 'inside the hot-air handle')
c(F, '907a', 'Complete replacement soldering iron for the Vartech 936 A, 706 and 700 stations.',
  'The 907A is a complete soldering iron assembly that replaces the iron of a Vartech 936 A, 706 or 700 station. It includes the heating element, pointed tip, barrel, nut, grip, cord and connector.',
  ['Fits the 936 A, 706 and 700 stations', 'Includes heating element, pointed tip, barrel, nut, grip, cord and connector', 'Part no. 907A'])
c(F, 'b-936', 'Barrel for the Vartech 936, 706 and 700 soldering stations.', 'Replacement barrel for the Vartech 936, 706 and 700 soldering stations, supplied singly.',
  ['Part no. B-936', 'Fits the 936, 706 and 700 stations', 'Pack of 1 (barrel only)'])
c(F, 'b-936ad', 'Barrel with vents for the Vartech 936 AD soldering station.', 'Replacement vented barrel for the Vartech 936 AD soldering station, supplied singly.',
  ['Part no. B-936AD', 'Fits the 936 AD station', 'Pack of 1 (barrel only)'])
c(F, 'b-937', 'Barrel with vents for the Vartech 937 and 236 soldering stations.', 'Replacement vented barrel for the Vartech 937 and 236 soldering stations, supplied singly.',
  ['Part no. B-937', 'Fits the 937 and 236 stations', 'Pack of 1 (barrel only)'])
c(F, 'nu-936', 'Nut for the Vartech 936 A, 936 AD, 937, 236, 706 and 700 soldering stations.', 'Replacement nut for the iron of the Vartech 936 A, 936 AD, 937, 236, 706 and 700 soldering stations, supplied singly.',
  ['Part no. Nu-936', 'Fits the 936 A, 936 AD, 937, 236, 706 and 700 stations', 'Pack of 1 (nut only)'])
c(F, '191-ad', 'Soldering tip thermometer, 0 °C to 800 °C, 3½ digits, °C and °F, with max hold.',
  'The Vartech 191 AD is a thermometer for checking the temperature of a soldering iron tip. It reads from 0 °C to 800 °C on a 3½-digit display in °C or °F and has a max-hold function. An external sensor socket takes the supplied bead-type probe for measurements away from the instrument.',
  ['0 °C to 800 °C, 3½-digit display, °C and °F', 'Max hold', 'External sensor input with a bead-type probe', 'For checking soldering tip temperature'])
c(F, '192', 'Soldering tester that measures tip temperature, leakage voltage and ground resistance.',
  'The Vartech 192 checks the three things that matter on a soldering iron: tip temperature, leakage voltage and ground resistance. Temperature resolution is 1 °C or 1 °F. Use it to confirm that a station is holding its temperature and that the tip is safely grounded for ESD-sensitive work.',
  ['Measures tip temperature, leakage voltage and ground resistance', '1 °C / 1 °F temperature resolution', 'Checks the tip is safe for ESD-sensitive work'])
c(F, 'ps-cables-5a', 'Pair of power supply leads, banana plug to crocodile clip, 5 A, 53 cm.',
  'A red and black pair of leads with banana plugs at one end and crocodile clips at the other, for connecting a bench power supply to a circuit. Rated 5 A maximum, 53 cm long end to end.',
  ['Banana plug to crocodile clip', 'Red and black pair', '5 A maximum', '53 cm end to end'])

# ---------------------------------------------------------------- other categories (added the same day)
F = 'vartech-dc-power-supplies'
c(F, '15003-s', '0–150 V, 0–3 A SMPS bench power supply with CV/CC operation and four-digit displays.',
  'The Vartech 15003 S is a compact SMPS-based DC regulated power supply with a single output of 0–150 V and 0–3 A. It switches automatically between constant voltage and constant current, uses coarse and fine controls for voltage and current, and shows both on four-digit displays. Over voltage, over current, over temperature and over power protection are built in; the over voltage limit is adjustable and the over current limit is fixed at 105% of the maximum current. A temperature-controlled fan cools it.',
  ['0–150 V, 0–3 A, single output', 'Auto CV/CC switching; coarse and fine controls', 'Four-digit displays', 'Over voltage, over current, over temperature and over power protection', 'Adjustable OVP; OCP fixed at 105% of maximum current', 'Temperature-controlled cooling fan; compact, lightweight'])
c(F, '20005-sr', '0–200 V, 0–5 A SMPS bench power supply with CV/CC operation, presetting and RS232 PC interface.',
  'The Vartech 20005 SR is an SMPS-based DC regulated power supply with a single output of 0–200 V and 0–5 A and an RS232 PC interface. It operates in constant voltage or constant current, with voltage and current preset before the output is switched on, and shows both on four-digit displays. Over voltage, over current, over temperature and over power protection are built in. Low ripple and noise and good stability suit industrial test work.',
  ['0–200 V, 0–5 A, single output', 'Auto CV/CC switching; voltage and current can be preset', 'Output on/off switch', 'Four-digit displays', 'RS232 PC interface', 'Over voltage, over current, over temperature and over power protection'])
F = 'vartech-function-generators'
c(F, 'spa-100k', 'Two-channel power amplifier module for signal generators, 100 kHz, 40 V p-p, 1 A.',
  'The Vartech SPA-100K is a power amplifier module that boosts the output of a signal generator so it can drive loads a generator cannot. It has two channels (10 W each, maximum), a 100 kHz bandwidth and an output of 40 V p-p at up to 1 A. Use it when a load needs more current than the generator output can supply.',
  ['2 channels - 10 W × 2 maximum', '100 kHz frequency', 'Output 40 V p-p, 1 A', 'Drives loads that need more power than a generator provides'])
c(F, 'spa-10m', 'Two-channel power amplifier module for signal generators, 10 MHz, 25 V p-p, 0.5 A.',
  'The Vartech SPA-10M is a power amplifier module that boosts the output of a signal generator for loads that need more drive. It has two channels (5 W each, maximum), a 10 MHz bandwidth and an output of 25 V p-p at up to 0.5 A, so it suits higher-frequency work than the SPA-100K.',
  ['2 channels - 5 W × 2 maximum', '10 MHz frequency', 'Output 25 V p-p, 0.5 A', 'Higher frequency than the SPA-100K'])
F = 'vartech-oscilloscopes'
c(F, 'ss-5100ds4', '100 MHz four-channel digital storage oscilloscope, 1 GS/s, 7 inch TFT display, USB, probes included.',
  'The Vartech SS-5100DS4 is a 100 MHz digital storage oscilloscope with four channels, 1 GS/s sampling and a 7 inch TFT display. Vertical sensitivity runs from 500 µV to 10 V per division, a USB interface connects it to a PC, and probes are supplied. Four channels let you compare several signals at once, which helps on power electronics, motor drives and digital buses.',
  ['100 MHz bandwidth, 4 channels', '1 GS/s sampling rate', '500 µV to 10 V / div vertical sensitivity', '7 inch TFT display', 'USB interface', 'Probes included'])

# ---------------------------------------------------------------- display order per category
ORDER = {
  'vartech-soldering-stations': ['936-a', '936-ad', '937-esd', '236-esd', '202-d', '722', '201-b'],
  'vartech-rework-stations': ['850-a', '850-d', '857-d', '861-dw', '700-esd', '706', '989', '853-esd', '800-l', '493-esd'],
  'vartech-soldering-irons': ['si-25w', 'si-25ws', 'si-30w', 'si-50w', 'si-60w', 'si-80w', 'si-100w'],
  'vartech-magnifiers': ['268-l', '8093', '8093-led', '8093-ld', '228-l-ii', '228-l', '228-al', '228-bl', '228-lx', '228-lxd', '228-lrd', '228-blr'],
  'vartech-soldering-accessories': ['191-ad', '192', 't-i', 't-j', 't-b', 't-lb', 't-k', 't-sk', 't-1-2-ld', 't-c-series', 't-d-series',
                                    'a-1321a', 'h1901r', 'a-1321', 'a-1146', 'he-857a', '907a', 'b-936', 'b-936ad', 'b-937', 'nu-936', 'ps-cables-5a'],
}


import re
def tidy(v):
    """House-style clean-up of spec values pasted from the catalogues: proper degree sign, 'to' for ranges, units, times sign."""
    v = v.replace('º', '°').replace('℃', '°C')
    v = re.sub(r'±\s+', '±', v)
    v = re.sub(r'(\d(?:\s?°[CF])?)\s*~\s*(\d)', r'\1 to \2', v)
    v = re.sub(r'(\d)\s-\s(\d)', r'\1 to \2', v)
    v = re.sub(r'\bApprx\b', 'approx.', v)
    v = re.sub(r'\bKgs?\b\.?', 'kg', v)
    v = re.sub(r'\bgms\.?', 'g', v)
    v = re.sub(r'\bMtrs\.?', 'm', v)
    v = re.sub(r'(?<=\d)\s?\*\s?(?=\d)', ' × ', v)
    v = re.sub(r'\bM3\s*/\s*min\.?', 'm³/min', v)
    v = re.sub(r'\bPcs\.?,?', 'pcs', v)
    v = v.replace('L.E.D.s', 'LEDs').replace('L.E.D.', 'LED').replace('S.M.D.', 'SMD').replace('Lumens', 'lumens')
    v = re.sub(r'^Φ\s*(\d+)\s*mm$', r'\1 mm', v)
    v = v.replace('Pointed Bit as standard. All other Tips must be purchased separately', 'Pointed tip. Other tips are sold separately.')
    v = re.sub(r'\((\d+)\s*pcs\.?\s*SMD LEDs?\)', r'(\1 SMD LEDs)', v)
    v = v.replace('KHz', 'kHz').replace('S.Iron', 'iron')
    v = re.sub(r'(?<=\d)\s?x\s?(?=\d)', ' × ', v)
    v = re.sub(r'<\s*(\d+)\s*(Ω|mV)', r'<\1 \2', v)
    v = re.sub(r'(\bkg)\.$', r'\1', v)
    v = re.sub(r'(\d)(W)\b', r'\1 \2', v)
    v = re.sub(r'\s{2,}', ' ', v).strip()
    return v

BAD = ['trusted', 'unparalleled', 'flagship', 'india\'s', 'original', 'best ', 'japanese', 'superior', 'perfect', 'noxious', 'must have', 'popular']

def main(write=True):
    files = sorted({f for f, _ in COPY})
    seen = set()
    for f in files:
        p = os.path.join(D, f + '.json')
        data = json.load(open(p, encoding='utf8'))
        byid = {x['id']: x for x in data}
        for (ff, i), (tag, desc, feats) in COPY.items():
            if ff != f: continue
            assert i in byid, f'{f}: unknown id {i}'
            x = byid[i]
            x['tagline'], x['description'], x['features'] = tag, desc, feats
            for sp in x.get('specs', []): sp['value'] = tidy(str(sp['value']))
            blob = (tag + desc + ' '.join(feats)).lower()
            for b in BAD: assert b not in blob, (i, b)
            assert '—' not in blob, i
            seen.add((f, i))
        cat = 'vartech-' + f.split('vartech-')[1]
        if cat in ORDER:
            order = ORDER[cat]
            assert set(order) == set(byid), f'{cat}: order mismatch {set(byid) ^ set(order)}'
            data = [byid[i] for i in order]
        if write:
            json.dump(data, open(p, 'w', encoding='utf8'), indent=2, ensure_ascii=False)
            open(p, 'a').write('\n')
    print('rewrote', len(seen), 'products in', len(files), 'files')

if __name__ == '__main__':
    main(write='--dry' not in sys.argv)
