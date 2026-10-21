"""Adds the Systems Tech (Systems & Controls) authorised-distributor range to the site: data json, images,
authorised-dealership pages (templated from the Vartech magnifiers pages), categories.json and registry edits.
Idempotent. Source: syscon-tech.com product pages (specs) and wp-content uploads (photos, logo).
Run from anywhere; set SRC_IMG to the folder holding the downloaded originals."""
import json, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
P = lambda *a: os.path.join(ROOT, *a)
SRC_IMG = os.environ.get('SRC_IMG', '/private/tmp/claude-501/-Users-hitesh-Desktop-CIE/f4a24a4f-5f9c-40a5-9415-ebbf4ea74f4b/scratchpad/syscon/img')
def rd(p): return open(p, encoding='utf-8').read()
def wr(p, s): open(p, 'w', encoding='utf-8').write(s)
BR = 'systems-tech'

CATS = {
 'handheld-tachometers': dict(
    name='Handheld Digital Tachometers', short='Handheld Tachometers', icon='gauge', emoji='⏱️',
    card='Contact, non-contact (photo) and combined contact + photo handheld digital tachometers with 5-digit LED display and min/max/last memory.',
    intro='CIE Instruments supplies the Systems Tech range of handheld digital tachometers - the HTM 590 contact type, the HTM 560 non-contact (photo) type and the HTM 890 combined photo and contact type - for RPM and surface speed checks on motors, fans, pumps, belts and machine shafts.',
    desc='Buy Systems Tech HTM 590, HTM 560 and HTM 890 handheld digital tachometers in India - contact, non-contact and photo + contact RPM meters. CIE Instruments is an authorised distributor, Howrah and Kolkata.',
    about=['All three handheld models share a micro-controller based design, a 5-digit red LED display, a quartz crystal time base and an accuracy of 0.05% + 1 digit. The last, maximum and minimum readings are stored automatically and can be recalled, and the unit runs on four AA cells with auto shut-off. Each comes in a padded carrying case.',
           'The HTM 590 measures by contact from 60 to 50,000 RPM and also reads surface speed from 6 to 5000 m/min using rubber contact tips. The HTM 560 reads 60 to 1,00,000 RPM without touching the shaft, from 75 mm to 300 mm away, using reflective tape. The HTM 890 combines both in one body: contact side for RPM and surface speed, photo side for non-contact RPM.']),
 'panel-tachometers': dict(
    name='Digital Panel Mount Tachometers', short='Panel Tachometers', icon='gauge', emoji='🎛️',
    card='96 x 48 mm panel mount digital RPM indicators with a choice of tachogenerator, magnetic pick-up, proximity or photo-reflective sensor.',
    intro='CIE Instruments supplies the Systems Tech TM-800 series of digital panel mount tachometers - the TM-801, TM-802, TM-803 and TM-804 - each supplied with its own speed sensor and a 3 metre shielded cable, for continuous RPM display on motors, mixers, pumps and other rotating machines.',
    desc='Buy Systems Tech digital panel mount tachometers in India - TM-801 (tachogenerator), TM-802 (magnetic pick-up), TM-803 (proximity switch) and TM-804 (photo-reflective). CIE Instruments, authorised distributor, Howrah.',
    about=['The four panel meters are identical in the display and electronics: a 5-digit 12.5 mm red LED display, 60 to 50,000 RPM range, 0.1 RPM resolution up to 1000 RPM and 1 RPM above, 0.05% + 1 count accuracy, a quartz crystal time base and 220 V AC, 50 Hz operation in a 96 mm square panel case.',
           'What differs is the sensor supplied with the meter: the TM-801 uses a digital tachogenerator (optical encoder) coupled to the shaft, the TM-802 a magnetic pick-up read against a 60-tooth pulsor wheel, the TM-803 an inductive proximity switch (PNP or NPN) and the TM-804 a photo-reflective probe working with reflective tape. The sensors are also listed separately under Tachometer Sensors.']),
 'tachometer-sensors': dict(
    name='Tachometer Sensors', short='Tachometer Sensors', icon='radio', emoji='📡',
    card='Digital tachogenerator, magnetic pick-up, proximity switch and photo-reflective speed sensors, with the stainless steel TM-802 5/8 UNF pick-up.',
    intro='CIE Instruments supplies Systems Tech speed sensors for tachometers and speed indicators - the TM-801 digital tachogenerator, the TM-802 magnetic pick-up, the TM-803 proximity switch, the TM-804 photo-reflective sensor and the TM-802 5/8 UNF stainless steel magnetic pick-up.',
    desc='Buy Systems Tech tachometer sensors in India - digital tachogenerator, magnetic pick-up, proximity switch, photo-reflective sensor and 5/8 UNF magnetic pick-up. CIE Instruments is an authorised distributor, Howrah.',
    about=['These are the sensors used with the TM-800 series panel tachometers, available on their own as replacements or for use with other speed indicators and data systems. Each gives a digital pulse output over a 3-core cable: 60 pulses per revolution for the tachogenerator and magnetic pick-up, 1 pulse per revolution for the proximity and photo-reflective types.',
           'The TM-802 5/8 UNF magnetic pick-up is a stainless steel (grade 304) epoxy-potted sensor that suits many existing machines as a replacement, with an operating temperature of -40 °C to +107 °C.']),
 'temperature-humidity-sensors': dict(
    name='Wireless Temperature & Humidity Sensors', short='Temp & Humidity Sensors', icon='thermometer', emoji='🌡️',
    card='WiFi enabled temperature sensor and 2-in-1 temperature and humidity sensor for refrigeration, cold storage and monitoring use.',
    intro='CIE Instruments supplies the Systems Tech TS-200 wireless temperature sensor and TS-201 2-in-1 temperature and humidity sensor for monitoring refrigerators, freezers, cold rooms and storage areas, with on-device alarms and remote alerts.',
    desc='Buy Systems Tech TS-200 wireless temperature sensor and TS-201 temperature and humidity sensor in India. CIE Instruments is an authorised distributor, Howrah and Kolkata.',
    about=['The TS-200 is a WiFi enabled temperature sensor with a flat ribbon probe and a double-sided sticker mount, covering -55 °C to +125 °C with 0.0625 °C resolution, an on-device audible and visual alarm, and a live feed that can be integrated through an API.',
           'The TS-201 adds humidity (0 to 100 %RH) to the temperature reading with +/- 0.2 °C and +/- 2 %RH accuracy, an OLED display, 200 samples of on-device storage, WhatsApp and email alerts on breaches, and Android and iOS apps for the dashboard.']),
}

def S(*pairs): return [{'label': a, 'value': b} for a, b in pairs]
HT_COMMON = [('Display', '5 digits, 10 mm (0.38 in) red LED'), ('Accuracy', '+/- 0.05% + 1 digit'), ('Sampling rate', '1 second'),
             ('Time base', 'Quartz crystal controlled'), ('Low battery', 'Indicated by "Lobat" on the display'),
             ('Memory recall', 'Last, Max and Min values stored automatically, recall up to 120 s'),
             ('Power source', '4 x 1.5 V AA batteries, auto shut-off'), ('Operating temperature', '0 °C to 60 °C (32 °F to 140 °F)'),
             ('Size', '70 x 200 x 40 mm (2.8 x 7.8 x 1.6 in)')]
HT_FEAT = ['Full digital, micro-controller based design', 'Quartz crystal time base, 0.05% + 1 digit accuracy',
           'Last, Max and Min readings stored and recalled automatically', 'Compact handheld body with padded carrying case']
PANEL_COMMON = [('Range', '60 RPM to 50,000 RPM'), ('Resolution', '0.1 RPM from 60 to 1000 RPM; 1 RPM from 1000 to 50,000 RPM'),
                ('Display', '5 digits, 12.5 mm (0.5 in) red LED'), ('Accuracy', '+/- 0.05% + 1 least count'), ('Sampling rate', '1 sample per second'),
                ('Time base', 'Quartz crystal controlled'), ('Power source', '220 V AC, 50 Hz +/- 10%'), ('Panel size', '96 x 48 x 130 mm (96 mm square)')]
PANEL_FEAT = ['Full digital, micro-controller design with auto-ranging', 'Quartz crystal time base', '5-digit 12.5 mm red LED display',
              '96 mm square panel mount case', 'Sensor and 3 metre shielded cable supplied']

DATA = {
 'handheld-tachometers': [
  dict(id='htm-590', model='HTM 590', name='Contact Type Digital Tachometer', images=['htm-590.webp'],
       tagline='Handheld contact tachometer, 60 to 50,000 RPM and 6 to 5000 m/min surface speed, 5-digit LED display.',
       description='The Systems Tech HTM 590 is a handheld contact type digital tachometer. Pressed against the end of a rotating shaft with a rubber contact tip, it reads speed from 60 to 50,000 RPM, and with the peripheral tip it reads surface speed from 6 to 5000 m/min. A 5-digit red LED display, quartz crystal time base and automatic last, maximum and minimum memory make it a dependable service and maintenance tool for motors, fans, pumps and belts. It is supplied with male, female and peripheral rubber contact tips, reflective tape, a padded carrying case and a user manual.',
       features=HT_FEAT + ['Contact RPM and surface speed (m/min) measurement'],
       specs=S(('Range', '60 RPM to 50,000 RPM; 6 m/min to 5000 m/min (surface speed)'), ('Resolution', '0.1 RPM up to 1000 RPM, 1 RPM above; 0.01 m/min up to 100 m/min, 0.1 m/min above'),
               *HT_COMMON, ('Battery life', '90 hrs alkaline | 30 hrs carbon-zinc'), ('Weight', '320 g including batteries'),
               ('Standard accessories', 'Male rubber contact tip x 2, female rubber contact tip x 2, peripheral rubber contact tip, reflective tape, padded carrying case, user manual'))),
  dict(id='htm-560', model='HTM 560', name='Non-Contact Type Digital Tachometer', images=['htm-560.webp'],
       tagline='Handheld photo tachometer, 60 to 1,00,000 RPM from 75 to 300 mm away, 5-digit LED display.',
       description='The Systems Tech HTM 560 is a handheld non-contact digital tachometer that reads speed with a light beam, so there is nothing to touch on the rotating part. A strip of reflective tape is fixed on the shaft, the unit is held 75 mm to 300 mm away, and it reads from 60 up to 1,00,000 RPM with 0.1 RPM resolution up to 1000 RPM. It has a 5-digit red LED display, quartz crystal time base, automatic last, maximum and minimum memory, and comes with reflective tape and a padded carrying case.',
       features=HT_FEAT + ['Non-contact measurement from 75 mm to 300 mm using reflective tape'],
       specs=S(('Range', '60 RPM to 1,00,000 RPM'), ('Resolution', '0.1 RPM up to 1000 RPM; 1 RPM above 1000 RPM'), ('Measuring distance', '75 mm (3 in) to 300 mm (12 in)'),
               *HT_COMMON, ('Battery life', '90 hrs alkaline | 30 hrs carbon-zinc'), ('Weight', '270 g including batteries'),
               ('Standard accessories', 'Reflective tape 1000 x 12 mm x 1, padded carrying case'))),
  dict(id='htm-890', model='HTM 890', name='Photo Contact Digital Tachometer', images=['htm-890.webp'],
       tagline='Two-in-one handheld tachometer: contact side to 50,000 RPM and surface speed, photo side to 1,00,000 RPM.',
       description='The Systems Tech HTM 890 combines a contact tachometer and a photo (non-contact) tachometer in one handheld body. The contact side reads 60 to 50,000 RPM and surface speed from 6 to 5000 m/min using rubber contact tips; the photo side reads 60 to 1,00,000 RPM from 75 mm to 300 mm using reflective tape. It has a 5-digit red LED display, quartz crystal time base, automatic last, maximum and minimum memory, and is supplied with contact tips, reflective tape, a padded carrying case and a user manual - a single tool for motor and machine performance checks.',
       features=HT_FEAT + ['Contact side and photo side in one instrument', 'Surface speed (m/min) on the contact side'],
       specs=S(('Range', '60 RPM to 50,000 RPM (contact side); 6 m/min to 5000 m/min (surface speed); 60 RPM to 1,00,000 RPM (photo side)'),
               ('Resolution', '0.1 RPM up to 1000 RPM, 1 RPM above; 0.01 m/min up to 100 m/min, 0.1 m/min above'), ('Measuring distance', '75 mm (3 in) to 300 mm (12 in), photo side'),
               *HT_COMMON, ('Battery life', 'Contact side: 90 hrs alkaline, 30 hrs carbon-zinc. Photo side: 24 hrs alkaline, 12 hrs carbon-zinc'), ('Weight', '320 g including batteries'),
               ('Standard accessories', 'Male rubber contact tip x 2, female rubber contact tip x 2, peripheral rubber contact tip, reflective tape 1000 x 12 mm, padded carrying case, user manual'))),
 ],
 'panel-tachometers': [
  dict(id='tm-801', model='TM-801', name='Digital Panel Mount Tachometer with Digital Tachogenerator', images=['tm-801.webp'],
       tagline='96 mm square panel RPM indicator, 60 to 50,000 RPM, supplied with a 60 PPR digital tachogenerator.',
       description='The Systems Tech TM-801 is a digital panel mount tachometer supplied with a digital tachogenerator (optical encoder). The tachogenerator is coupled to the shaft of the drive, gives 60 pulses per revolution (TTL compatible) and the meter converts this to a 5-digit RPM reading from 60 to 50,000 RPM. It is used to monitor motors, mixers, pumps and other rotary equipment, and is supplied with the tachogenerator, a 3 metre shielded cable with connectors and an instruction manual.',
       features=PANEL_FEAT + ['Digital tachogenerator, 60 PPR, face mounting, 65 mm housing, 10 mm stainless steel shaft'],
       specs=S(*PANEL_COMMON, ('Sensor', 'Digital tachogenerator (optical encoder), 60 PPR, TTL compatible'), ('Standard accessories', 'Tachogenerator sensor with 3.0 m shielded cable and connectors, instruction manual'))),
  dict(id='tm-802', model='TM-802', name='Digital Panel Mount Tachometer with Magnetic Pick-up', images=['tm-802.webp'],
       tagline='96 mm square panel RPM indicator, 60 to 50,000 RPM, supplied with a magnetic pick-up sensor.',
       description='The Systems Tech TM-802 is a digital panel mount tachometer supplied with a magnetic pick-up. The probe is mounted 1.5 to 2.0 mm from a 60-tooth pulsor disc or wheel on the rotating shaft and generates 60 pulses per revolution as ferrous teeth pass it. The meter shows speed from 60 to 50,000 RPM on a 5-digit LED display. It is supplied with the pick-up, a 3 metre shielded cable with connectors and an instruction manual.',
       features=PANEL_FEAT + ['Magnetic pick-up, 16 mm threaded probe with locknuts, 60 teeth pulsor wheel'],
       specs=S(*PANEL_COMMON, ('Sensor', 'Magnetic pick-up, 60 PPR, 16 mm dia x 70 mm brass or stainless steel probe'), ('Mounting distance', '1.5 to 2.0 mm from the pulsor wheel'), ('Standard accessories', 'Magnetic pick-up sensor with 3.0 m shielded cable and connectors, instruction manual'))),
  dict(id='tm-803', model='TM-803', name='Digital Panel Mount Tachometer with Proximity Switch', images=['tm-803.webp'],
       tagline='96 mm square panel RPM indicator, 60 to 50,000 RPM, supplied with an inductive proximity switch sensor.',
       description='The Systems Tech TM-803 is a digital panel mount tachometer supplied with an inductive proximity switch (PNP or NPN). The 18 mm threaded probe is mounted 3.0 to 5.0 mm from a bolt, tooth or pulsor disc on the rotating shaft and gives one pulse per revolution, which the meter converts to RPM from 60 to 50,000 on a 5-digit LED display. It is supplied with the sensor, a 3 metre shielded cable with connectors and an instruction manual.',
       features=PANEL_FEAT + ['Inductive proximity switch, PNP or NPN, 18 mm threaded probe'],
       specs=S(*PANEL_COMMON, ('Sensor', 'Inductive proximity switch, PNP or NPN, 1 PPR, LS-TTL compatible, 18 mm dia x 70 mm brass probe'), ('Mounting distance', '3.0 to 5.0 mm from the target'), ('Standard accessories', 'Proximity switch sensor with 3.0 m shielded cable and connectors, instruction manual'))),
  dict(id='tm-804', model='TM-804', name='Digital Panel Mount Tachometer with Photo-Reflective Sensor', images=['tm-804.webp'],
       tagline='96 mm square panel RPM indicator, 60 to 50,000 RPM, supplied with a photo-reflective probe and reflective tape.',
       description='The Systems Tech TM-804 is a digital panel mount tachometer supplied with a photo-reflective probe. A light beam from the probe is aligned with a reflective strip applied to the rotating shaft or disc at a distance of 4 to 12 inches, and the meter times the reflected pulses to show RPM from 60 to 50,000 on a 5-digit LED display. It suits applications where nothing can be fitted to the shaft but a strip of tape. It is supplied with the probe, a 3 metre shielded cable, 12 x 1000 mm reflective tape and an instruction manual.',
       features=PANEL_FEAT + ['Photo-reflective probe, 22 mm threaded, works at 4 to 12 inches'],
       specs=S(*PANEL_COMMON, ('Sensor', 'Photo-reflective probe, 22 mm x 70 mm chrome plated brass'), ('Sensing distance', '4 in to 12 in (approx. 100 to 300 mm) from the reflector'), ('Standard accessories', 'Photo-reflective sensor with 3.0 m shielded cable, 12 x 1000 mm reflective tape, instruction manual'))),
 ],
 'tachometer-sensors': [
  dict(id='tm-801-tachogenerator', model='TM-801 TG', name='Digital Tachogenerator', images=['tm-801-tachogenerator.webp'],
       tagline='Optical encoder type digital tachogenerator, 60 pulses per revolution, 6 V DC, face or servo mounting.',
       description='The Systems Tech digital tachogenerator is an optical encoder that uses a photo-interrupter and a rotating disc to give a digital pulse output of 60 pulses per revolution, LS-TTL compatible, proportional to speed. Housed in a machined aluminium body with a 10 mm stainless steel shaft on two ball bearings, it is coupled to the shaft of the drive and connected to a panel instrument such as the TM-801, or to any data processing system, through a 3-core cable.',
       features=['60 pulses per revolution, LS-TTL compatible', 'Machined aluminium housing, SS-304 shaft on two ball bearings', 'Servo or face mounting with 3 x M4 screws', '10 kHz output at 10,000 RPM'],
       specs=S(('Supply voltage', '6 V DC (regulated)'), ('Supply current', '50 to 70 mA'), ('Output type', 'Digital pulse output'), ('Output pulse rate', '60 PPR'), ('Output pulse amplitude', 'Same as supply voltage'), ('Output frequency', '10 kHz at 10,000 RPM'),
               ('Outlet cable', '2 to 3 m, three cores with connector'), ('Shaft', '10 mm dia, 23 mm extension, stainless steel SS-304'), ('Mounting', 'Servo or face, 3 screws M4 on 48 mm PCD'), ('Overall size', 'Body dia 62 mm, depth 80 mm (excluding shaft and connector gland)'), ('Weight (approx.)', '300 g'))),
  dict(id='tm-802-magnetic-pickup', model='TM-802 MPU', name='Magnetic Pick-up Sensor', images=['tm-802-magnetic-pickup.webp'],
       tagline='Threaded M16 magnetic pick-up, 60 pulses per revolution, 6 V DC, brass or stainless steel body.',
       description='The Systems Tech magnetic pick-up generates a digital pulse output of 60 pulses per revolution (LS-TTL compatible) as ferrous or magnetic teeth pass the sensing face, and sends it over a 3-core cable to a panel tachometer such as the TM-802. Magnetic pick-ups of this type are widely used in tachometers, speedometers and engine control systems. The body is a machined brass or stainless steel threaded housing fixed with two M16 locknuts.',
       features=['60 pulses per revolution, LS-TTL compatible', 'Machined brass or stainless steel threaded body with two locknuts', 'M16 face mounting, 18 mm body dia x 80 mm', '10 kHz output at 10,000 RPM'],
       specs=S(('Supply voltage', '6 V DC (regulated)'), ('Supply current', '50 to 70 mA'), ('Output type', 'Digital pulse output'), ('Output pulse rate', '60 PPR'), ('Output pulse amplitude', 'Same as supply voltage'), ('Output frequency', '10 kHz at 10,000 RPM'),
               ('Outlet cable', '2 to 3 m, three cores'), ('Body', 'Machined brass or stainless steel threaded housing with two locknuts'), ('Mounting', 'Face, two M16 locknuts'), ('Overall size', 'Body dia 18 mm, length 80 mm'), ('Weight (approx.)', '100 g'))),
  dict(id='tm-803-proximity-switch', model='TM-803 PS', name='Proximity Switch Sensor', images=['tm-803-proximity-switch.webp'],
       tagline='Inductive PNP or NPN proximity sensor, 1 pulse per revolution, 5 to 24 V DC, with LED indicator.',
       description='The Systems Tech proximity switch sensor is an inductive type, either PNP or NPN, that switches an internal oscillator on and off as a metal target passes. It gives a digital output of one pulse per revolution (LS-TTL compatible) over a 3-wire cable, with a green LED at the back to show activity. The 18 mm threaded brass probe is mounted 3.0 to 5.0 mm from a bolt, tooth or pulsor disc fixed on the rotating shaft.',
       features=['Inductive type, PNP or NPN', '1 pulse per revolution, LS-TTL compatible', 'Green LED indicator at the back', 'M18 threaded brass probe with two locknuts'],
       specs=S(('Supply voltage', '5 V to 24 V DC (regulated)'), ('Supply current', '50 to 70 mA'), ('Output type', 'Digital pulse output, 3-wire'), ('Output pulse rate', '1 PPR'), ('Output pulse amplitude', 'Same as supply voltage'), ('Signal indicator', 'Green LED at the back'),
               ('Outlet cable', '2 to 3 m, three cores'), ('Body', 'Machined brass or stainless steel threaded housing with two locknuts'), ('Mounting', 'Face, two M18 locknuts'), ('Sensing distance', '3.0 to 5.0 mm'), ('Overall size', 'Body dia 18 mm, length 65 mm'), ('Weight (approx.)', '100 g'))),
  dict(id='tm-804-photo-reflective', model='TM-804 PR', name='Photo-Reflective Sensor', images=['tm-804-photo-reflective.webp'],
       tagline='Photo-reflective speed probe, 1 pulse per revolution, 5 V DC, works at 4 to 12 inches with reflective tape.',
       description='The Systems Tech photo-reflective sensor uses a bright light source, a lens and a photo receiver in a threaded chrome plated brass probe. The beam is aligned with a reflector applied to the rotating shaft or disc at a distance of 4 to 12 inches, and each pass of the reflector gives one pulse per revolution over a 3-wire cable. It is used with panel tachometers such as the TM-804 or any speed measuring system that accepts a digital pulse.',
       features=['Photo-reflective, 4 in to 12 in working distance', '1 pulse per revolution', 'Threaded M22 chrome plated brass probe', 'Optical lens focuses the beam on the reflector'],
       specs=S(('Supply voltage', '5 V DC (regulated)'), ('Supply current', '125 mA'), ('Output type', 'Digital pulse output, 3-wire'), ('Output pulse rate', '1 PPR'), ('Output pulse amplitude', '+50 mV to 5 V'), ('Output frequency', '20 kHz at 10,000 RPM'),
               ('Outlet cable', '2 to 3 m, three cores with connector'), ('Sensing distance', '4 in to 12 in from the reflector'), ('Mounting', 'Face, two M22 locknuts'), ('Overall size', 'Body dia 22 mm, length 75 mm'), ('Weight (approx.)', '150 g'))),
  dict(id='tm-802-unf-magnetic-pickup', model='TM-802 UNF', name='5/8 UNF Magnetic Pick-up Sensor', images=['tm-802-unf-magnetic-pickup.webp'],
       tagline='Stainless steel 5/8 - 18 UNF magnetic pick-up, -40 °C to +107 °C, replacement for many makes.',
       description='The Systems Tech TM-802 5/8 UNF magnetic pick-up is a 5/8 - 18 UNF - 2A sensor in a grade 304 stainless steel case, compatible as a replacement with many other makes of pick-up. It is potted in insulating epoxy, operates from -40 °C to +107 °C and resists moisture, gases, petroleum lubricants, fuels, salts, mild acids and alkalis. Output is a digital pulse signal over a 3 m, 3-core sheathed cable, and it mounts on the face with locknuts.',
       features=['5/8 - 18 UNF - 2A configuration, compatible replacement for many brands', 'Stainless steel (Grade 304) case, epoxy potted', 'Operating temperature -40 °C to +107 °C', 'Resists moisture, gases, petroleum lubricants, fuels, salts, mild acids and alkalis'],
       specs=S(('Configuration', '5/8 - 18 UNF - 2A MPU'), ('Case material', 'Stainless steel (Grade 304)'), ('Potting material', 'Elantas insulating epoxy Debofil 60 + Hardener 758'), ('Operating temperature', '-40 °C to +107 °C'),
               ('Inductance', '520 mH +/- 50 mH (nominal)'), ('High pot test', '500 V RMS (lead wires to case)'), ('Signal', '18 V P-P max (tested with 60-tooth gear, 1 mm air gap, 1000 RPM)'), ('Supply voltage', '6 V DC (regulated)'), ('Supply current', '50 to 70 mA'),
               ('Output type', 'Digital pulse output'), ('Mounting', 'Face mount using locknuts'), ('Weight', '150 g'), ('Cable', '3 m insulated, 3-core sheathed'))),
 ],
 'temperature-humidity-sensors': [
  dict(id='ts-200', model='TS-200', name='Wireless Temperature Sensor', images=['ts-200.webp'],
       tagline='WiFi enabled temperature sensor, -55 °C to +125 °C, on-device alarm, stick-on mounting.',
       description='The Systems Tech TS-200 is a wireless, WiFi enabled temperature sensor for monitoring refrigeration units and similar equipment. A flat ribbon probe measures from -55 °C to +125 °C with 0.0625 °C resolution, and the unit sticks on the outside of the equipment with a double-sided sticker. It sounds a 70 dB audible alarm and flashes an alarm icon when the maximum or minimum threshold is crossed, and live readings can be integrated into other systems through the API. A LoRaWAN version is also available.',
       features=['Wireless, WiFi enabled (LoRaWAN version also available)', 'Double-sided sticker for mounting on the outside of a refrigeration unit', 'Audible and visual alarm on maximum or minimum temperature', 'Real-time updates with API integration', 'Power from micro USB, 5 V'],
       specs=S(('Sensor range', 'Non-dust-proof probe: -40 °C to +125 °C; dust-proof probe: -55 °C to +125 °C'), ('Accuracy', '+/- 0.5 °C from -25 °C to +85 °C (standard probe); +/- 0.5 °C from -10 °C to +85 °C (dust-proof probe)'), ('Resolution', '0.0625 °C'),
               ('Power', '5 V DC micro USB (USB version, max 30 mA); 2200 mAh rechargeable battery (Li-Ion version only); 2 x AA alkaline (non-rechargeable versions)'), ('Sensor cable', '50 cm flat ribbon cable'), ('Processor', '32-bit, 80 MHz, 2.4 GHz WiFi'),
               ('Measurement interval', '60 s'), ('Transmission trigger', 'Temperature change of +/- 1 °C'), ('Alarm thresholds', 'Max and min configurable (defaults 30 °C and -20 °C)'), ('Alarm', 'Audio 70 dB (min) sweep tone, flashing screen with alarm icon'))),
  dict(id='ts-201', model='TS-201', name='Temperature and Humidity 2-in-1 Sensor', images=['ts-201.webp'],
       tagline='Wireless temperature and humidity sensor, -40 °C to +125 °C and 0 to 100 %RH, WhatsApp and email alerts.',
       description='The Systems Tech TS-201 is a plug-and-use wireless sensor that logs temperature and humidity together, for cold storage of drugs and vaccines, cold rooms, refrigerators and freezers. It shows readings on an OLED display with an 80 dB alarm, stores 200 samples on the device, and sends WhatsApp and email alerts on breaches. Readings, downloadable reports and thresholds are managed from Android and iOS apps, across several locations. An optional 8 hour battery backup is available.',
       features=['Temperature and humidity in one sensor', 'OLED display with on-device audio and visual alarm', 'WhatsApp and email alerts on breaches, downloadable and automated reports', 'Android and iOS apps for alerts and dashboard', 'Works with existing refrigerators, freezers and cold rooms'],
       specs=S(('Working range', '-40 °C to +125 °C; 0% to 100% RH'), ('Accuracy', '+/- 0.2 °C and +/- 2% RH'), ('Long term drift', '< 0.02 °C/year and < 0.25 %RH/year'), ('Display', 'OLED, 80 dB alarm'), ('Power supply', '5 V DC micro USB'), ('Battery backup', 'Optional, 8 hours'), ('Data storage', '200 samples on the device'))),
 ],
}
# which source png feeds which image
IMGMAP = {
 'handheld-tachometers': {'htm-590.webp': 'Group-631.png', 'htm-560.webp': 'Group-632.png', 'htm-890.webp': 'Group-634.png'},
 'panel-tachometers': {'tm-801.webp': 'Model-Number-–-TM-801.png', 'tm-802.webp': 'Model-Number-–-TM-802.png', 'tm-803.webp': 'Model-Number-–-TM-803-1.png', 'tm-804.webp': 'Model-Number-–-TM-804.png'},
 'tachometer-sensors': {'tm-801-tachogenerator.webp': 'Digital-Tachogenerator-1.png', 'tm-802-magnetic-pickup.webp': 'Magnetic-Pickup-1.png', 'tm-803-proximity-switch.webp': 'Proximity-Switch-Sensor-1.png',
                        'tm-804-photo-reflective.webp': 'Photo-Reflective-Sensor-1.png', 'tm-802-unf-magnetic-pickup.webp': 'IMG4-scaled.png'},
 'temperature-humidity-sensors': {'ts-200.webp': 'Group-622.png', 'ts-201.webp': 'Group-735.png'},
}

# ---- extra gallery photos (syscon-tech.com product galleries; scratchpad gal/<wooId>_<k>.png). Left out: the last image on handheld, panel
# and TM-802/TM-804 sensor galleries (a poster carrying Systems Tech phone, email and website) and two infographics with Make in India / ZED badges.
GAL_IMG = os.environ.get('GAL_IMG', os.path.join(os.path.dirname(SRC_IMG), 'gal'))
GAL = {  # our id: (woo id, [gallery indices to use])
 'htm-590': (2333, [1, 2, 4, 5]), 'htm-560': (2369, [1, 2, 3, 4, 6, 7]), 'htm-890': (2360, [1, 2, 3, 4, 5, 6, 7]),
 'tm-801': (2378, [1, 2, 3, 4, 5, 6, 7, 8]), 'tm-802': (2380, [1, 2, 3, 4, 5, 6, 7, 8]), 'tm-803': (2384, [1, 2, 3, 4, 5, 6, 7, 8]),
 'tm-804': (2385, [1, 2, 3, 4, 5, 6, 7, 8]), 'tm-801-tachogenerator': (2376, [1, 2, 3]), 'tm-802-magnetic-pickup': (2370, [1, 2, 3, 4, 5]),
 'tm-803-proximity-switch': (2372, [1, 2]), 'tm-804-photo-reflective': (2374, [1, 2, 3, 4, 5]), 'ts-200': (2387, [1, 2, 3]),
}
GALSRC = {}
for slug, items in DATA.items():
    for it in items:
        if it['id'] in GAL:
            wid, idxs = GAL[it['id']]
            base = it['images'][0][:-5]
            for n, k in enumerate(idxs, start=2):
                fn = f'{base}-{n}.webp'; it['images'].append(fn); GALSRC[(slug, fn)] = os.path.join(GAL_IMG, f'{wid}_{k}.png')

def webp(src, dst, maxw=900):
    from PIL import Image
    im = Image.open(src).convert('RGBA')
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)))
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    bg.convert('RGB').save(dst, 'WEBP', quality=86, method=6)

# ---- data + images
for slug, items in DATA.items():
    wr(P('src/data', f'{BR}-{slug}.json'), json.dumps(items, indent=2, ensure_ascii=False) + '\n')
    d = P('public/images', BR, slug); os.makedirs(d, exist_ok=True)
    for out, srcname in IMGMAP[slug].items():
        if not os.path.exists(f'{d}/{out}'): webp(os.path.join(SRC_IMG, srcname), f'{d}/{out}')
    for (sl, fn), fp in GALSRC.items():
        if sl == slug and not os.path.exists(f'{d}/{fn}'): webp(fp, f'{d}/{fn}')
logo = P('public/images', BR, 'systems-tech-logo.webp')
if not os.path.exists(logo):
    from PIL import Image
    im = Image.open(os.path.join(SRC_IMG, 'Logo-new.png')).convert('RGBA'); im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    im.save(logo, 'WEBP', quality=92, method=6)

# ---- pages (templated from the Vartech magnifiers pages)
TAIL = ("CIE Instruments (Cambridge Instruments &amp; Engg. Co., Howrah) is an authorised distributor of Systems Tech tachometers and sensors for India. "
        "We supply them to factories, motor and pump service workshops, power plants, test labs, colleges and OEMs across India - "
        "including Kolkata, Howrah, Bhubaneswar, Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Ahmedabad, Pune, Lucknow and Chandigarh.")
def page(slug, c, kind):
    src = rd(P('src/pages/authorised-dealership/magnifiers', 'index.astro' if kind == 'index' else '[product].astro'))
    full = f"Systems Tech {c['name']}"
    esc = lambda t: t.replace('&', '&amp;')
    src = src.replace('vartech-magnifiers.json', f'{BR}-{slug}.json').replace("'vartech-magnifiers'", f"'{BR}-{slug}'").replace('vartech-magnifiers', f'{BR}-{slug}')
    src = src.replace('/images/vartech/magnifiers/', f'/images/{BR}/{slug}/').replace('/downloads/vartech/magnifiers/', f'/downloads/{BR}/{slug}/')
    src = src.replace('/images/vartech/vartech-logo.avif', f'/images/{BR}/systems-tech-logo.webp')
    src = src.replace('vartech-logo', 'systems-tech-logo')
    src = src.replace('`vartech/magnifiers/', f'`{BR}/{slug}/')
    src = src.replace('Vartech Magnifying Lamps', full).replace('Vartech® Magnifying Lamps', f"Systems Tech {c['name']}")
    src = src.replace('magnifiers', slug)
    src = src.replace('Vartech', 'Systems Tech').replace('Vartech®', 'Systems Tech')
    src = src.replace('Systems Tech®', 'Systems Tech')
    src = src.replace(f'>{full}</h1>', f">{esc(full)}</h1>").replace(f"Systems Tech {c['name']}</p>", f"Systems Tech {esc(c['name'])}</p>")
    if kind == 'index':
        src = re.sub(r"const pageTitle = '.*?';", f"const pageTitle = '{full} - Authorised Distributor India | CIE Instruments';", src)
        src = re.sub(r"const pageDesc =\s*'.*?';", "const pageDesc =\n  " + json.dumps(c['desc'], ensure_ascii=False).replace('"', "'", 1)[:-1] + "';", src, flags=re.S)
        src = re.sub(r'(<p class="mt-3 text-muted max-w-2xl leading-relaxed">\s*).*?(\s*</p>)', lambda m: m.group(1) + c['intro'] + m.group(2), src, count=1, flags=re.S)
        paras = c['about'] + [TAIL, 'For pricing and availability, <a href="/contact/" class="text-ink hover:underline font-medium">contact our team</a> or enquire via WhatsApp.']
        body = '\n'.join(f'        <p>\n          {t}\n        </p>' for t in paras)
        src = re.sub(r'(<div class="space-y-4 text-sm text-muted leading-relaxed">\n).*?(\n      </div>\n      <div class="mt-8 pt-6)', lambda m: m.group(1) + body + m.group(2), src, flags=re.S)
    return src
for slug, c in CATS.items():
    d = P('src/pages/authorised-dealership', slug); os.makedirs(d, exist_ok=True)
    wr(f'{d}/index.astro', page(slug, c, 'index')); wr(f'{d}/[product].astro', page(slug, c, 'product'))

# ---- categories.json
cj = P('src/data/categories.json'); cats = json.load(open(cj)); have = {x['id'] for x in cats}
for slug, c in CATS.items():
    cid = f'{BR}-{slug}'
    if cid in have: continue
    cats.append({'id': cid, 'brand': BR, 'name': c['name'], 'shortName': c['short'], 'eyebrow': f"Systems Tech · {c['name']}", 'description': c['card'], 'icon': c['emoji'],
                 'metaTitle': f"Systems Tech {c['name']} | CIE Instruments, India", 'metaDesc': c['desc'], 'seoContent': [re.sub(r'&amp;', '&', t) for t in c['about'][:2]], 'relatedArticles': []})
json.dump(cats, open(cj, 'w'), indent=2, ensure_ascii=False)

# ---- registries
def camel(slug): return 'systemsTech' + ''.join(w.title() for w in slug.split('-'))
def patch(path, edits):
    s = rd(P(path)); o = s
    for a, b in edits:
        if b.strip() in s: continue
        assert a in s, (path, a)
        s = s.replace(a, a + b, 1)
    if s != o: wr(P(path), s)
new = list(CATS)
imp = lambda rel, slug: f"import {camel(slug)} from '{rel}data/{BR}-{slug}.json';\n"
patch('src/pages/products/[category]/index.astro', [
  ("import vartechSolderingAccessories from '../../../data/vartech-soldering-accessories.json';\n", ''.join(imp('../../../', s) for s in new)),
  ("  'vartech-soldering-accessories': vartechSolderingAccessories,\n", ''.join(f"  '{BR}-{s}': {camel(s)},\n" for s in new))])
patch('src/components/EnquiryForm.astro', [
  ("import vartechDcPowerSupplies from '../data/vartech-dc-power-supplies.json';\n", ''.join(imp('../', s) for s in new)),
  ("  'vartech-dc-power-supplies':    vartechDcPowerSupplies.map(p => ({ id: p.id, model: p.model, name: p.name })),\n", ''.join(f"  '{BR}-{s}': {camel(s)}.map(p => ({{ id: p.id, model: p.model, name: p.name }})),\n" for s in new))])
patch('src/utils/categoryIcons.ts', [("  'vartech-dc-power-supplies': 'battery',\n", ''.join(f"  '{BR}-{s}': '{CATS[s]['icon']}',\n" for s in new))])

# ---- shared components / pages
def sub(path, a, b, count=1):
    s = rd(P(path))
    if b in s: return
    assert a in s, (path, a)
    wr(P(path), s.replace(a, b, count))
# ProductCard: related-product cards for Systems Tech categories
sub('src/components/ProductCard.astro', "(image.startsWith('vartech/') ?", "((image.startsWith('vartech/') || image.startsWith('systems-tech/')) ?")
sub('src/components/ProductCard.astro', "const detailHref = categoryId.startsWith('vartech-')",
    "const detailHref = categoryId.startsWith('systems-tech-')\n  ? u(`/authorised-dealership/${categoryId.replace('systems-tech-', '')}/${id}/`)\n  : categoryId.startsWith('vartech-')")
sub('src/components/ProductCard.astro', "const isVartech = categoryId.startsWith('vartech-');", "const isVartech = categoryId.startsWith('vartech-');\nconst isSystemsTech = categoryId.startsWith('systems-tech-');")
sub('src/components/ProductCard.astro', "      {isVartech ? (", "      {isSystemsTech ? (\n        <Badge variant=\"emerald\" class=\"absolute top-3 left-3\">Systems Tech</Badge>\n      ) : isVartech ? (")
# search index
patch('src/utils/searchData.ts', [("import vPS   from '../data/vartech-dc-power-supplies.json';\n", ''.join(imp('../', x) for x in new))])
sub('src/utils/searchData.ts', "brand: 'cie'|'vartech';", "brand: 'cie'|'vartech'|'systems-tech';")
sub('src/utils/searchData.ts', "  ),\n];\n\nexport const suggestions", "  ),\n  ...systemsTechSections.flatMap(({ slug, label, items }) =>\n    (items as any[]).map(p => ({\n      id: p.id, model: p.model, name: p.name, tagline: p.tagline || '',\n      category: label, brand: 'systems-tech' as const,\n      href: u(`/authorised-dealership/${slug}/${p.id}/`),\n      image: p.images?.[0] ? u(`/images/systems-tech/${slug}/${p.images[0]}`) : '',\n    }))\n  ),\n];\n\nexport const suggestions")
sub('src/utils/searchData.ts', "export const searchIndex: Entry[] = [", "const systemsTechSections: { slug: string; label: string; items: any[] }[] = [\n" + ''.join(f"  {{ slug: '{x}', label: '{CATS[x]['short']}', items: {camel(x)} }},\n" for x in new) + "];\n\nexport const searchIndex: Entry[] = [")
# Search UI: add a Systems Tech group
s = rd(P('src/components/Search.astro'))
if "systems-tech" not in s:
    s = s.replace("const vt  = aiMentionedProducts.filter(p => p.brand === 'vartech');", "const vt  = aiMentionedProducts.filter(p => p.brand === 'vartech');\n      const st  = aiMentionedProducts.filter(p => p.brand === 'systems-tech');")
    s = s.replace("const vt  = items.filter(p => p.brand === 'vartech');", "const vt  = items.filter(p => p.brand === 'vartech');\n      const st  = items.filter(p => p.brand === 'systems-tech');")
    s = s.replace("const vt  = items.filter(i => i.brand === 'vartech');", "const vt  = items.filter(i => i.brand === 'vartech');\n  const st  = items.filter(i => i.brand === 'systems-tech');")
    s = s.replace("      if (vt.length)  html += section('Vartech - Authorised Distributor', 'text-emerald-600', vt, q, !!cie.length);", "      if (vt.length)  html += section('Vartech - Authorised Distributor', 'text-emerald-600', vt, q, !!cie.length);\n      if (st.length)  html += section('Systems Tech - Authorised Distributor', 'text-emerald-600', st, q, !!(cie.length || vt.length));")
    s = s.replace("  if (vt.length)  html += section('Vartech - Authorised Distributor', 'text-emerald-600', vt, q, !!cie.length);\n\n  catalogDiv", "  if (vt.length)  html += section('Vartech - Authorised Distributor', 'text-emerald-600', vt, q, !!cie.length);\n  if (st.length)  html += section('Systems Tech - Authorised Distributor', 'text-emerald-600', st, q, !!(cie.length || vt.length));\n\n  catalogDiv")
    wr(P('src/components/Search.astro'), s)
# AI search backend
patch('src/pages/api/search.ts', [("import vPS from '../../data/vartech-dc-power-supplies.json';\n", ''.join(imp('../../', x) for x in new))])
sub('src/pages/api/search.ts', "\n{\n  const byModel = new Map<string, RichProduct>();", "\nconst systemsTechSections = [\n" + ''.join(f"  {{ label: '{CATS[x]['short']}', slug: '{x}', items: {camel(x)} }},\n" for x in new) + """];
for (const { label, slug, items } of systemsTechSections) {
  for (const p of items as any[]) {
    allProducts.push({
      model: p.model, name: p.name, category: label,
      brand: 'Systems Tech (CIE authorised distributor)',
      tagline: p.tagline || '',
      description: (p.description || '').slice(0, 200),
      specs: (p.specs || []).map((s: any) => `${s.label}: ${s.value}`).join(' | '),
      apps: (p.features || []).slice(0, 5).join(' | '),
      options: '',
      orderNote: '',
      url: `https://www.cieinstruments.in/authorised-dealership/${slug}/${p.id}/`,
    });
  }
}

{
  const byModel = new Map<string, RichProduct>();""")
print('shared done')
