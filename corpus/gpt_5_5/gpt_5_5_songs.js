// First-party Strudel sketches for Restrudel corpus experiments.
// Each export is a standalone Strudel pattern string.

export const gpt55_song_01_glass_delta = `
setcpm(132/4)

$: n("0 2 4 7 9 7 4 2").scale("d:minor").s("sawtooth")
  .lpf("<700 1100 1800 900>").resonance(6).gain(.55).release(.18)

$: s("bd ~ sd ~ bd bd sd ~").bank("tr909").gain(.8)

$: s("hh*8").bank("tr909").gain(.22).hpf(5000).room(.2)
`;

export const gpt55_song_02_late_ferry = `
setcpm(118/4)

$: note("c3 eb3 g3 bb3 g3 eb3").s("supersaw")
  .lpf("900 1300 1700 1200").gain(.45).attack(.04).release(.35).room(.35)

$: n("0 ~ 2 3 5 ~ 3 2").scale("c:minor").s("triangle")
  .lpf(600).gain(.35).delay(.25)

$: s("bd ~ ~ sd ~ bd ~ sd").bank("linn9000").gain(.75)
`;

export const gpt55_song_03_copper_steps = `
setcpm(140/4)

$: s("bd*4").bank("tr909").gain(.85)

$: s("~ hh ~ hh ~ oh hh hh").bank("tr909").gain(.24).hpf(6500)

$: n("0 0 3 5 7 5 3 2").scale("f:dorian").s("square")
  .lpf("<350 500 900 650>").resonance(8).gain(.5).release(.1)

$: n("7 ~ 10 9 ~ 5 3 ~").scale("f:dorian").s("sine").gain(.2).room(.7)
`;

export const gpt55_song_04_soft_machine_room = `
setcpm(104/4)

$: note("a2 c3 e3 g3 e3 c3").s("sawtooth")
  .lpf(500).gain(.42).attack(.02).release(.28)

$: note("e4 ~ g4 a4 ~ c5 b4 g4").s("triangle")
  .gain(.25).room(.6).delay(.33)

$: s("bd ~ ~ ~ sd ~ ~ ~").bank("rolandtr808").gain(.72)

$: s("hh*16").bank("rolandtr808").gain(.12).hpf(7000)
`;

export const gpt55_song_05_amber_uart = `
setcpm(126/4)

$: n("0 3 5 7 10 7 5 3").scale("g:minor").s("pulse")
  .lpf("<400 800 1200 700>").resonance(7).gain(.45).release(.12)

$: s("bd bd sd ~ bd ~ sd ~").bank("tr909").gain(.8)

$: note("d5 c5 bb4 g4 f4 g4 bb4 c5").s("sine")
  .gain(.22).delay(.5).room(.45)
`;

export const gpt55_song_06_blue_error_lamp = `
setcpm(96/4)

$: note("f2 ab2 c3 eb3 c3 ab2").s("supersaw")
  .lpf(750).gain(.48).attack(.08).release(.65).room(.5)

$: n("0 ~ 7 5 3 ~ 5 7").scale("f:minor").s("sawtooth")
  .lpf("300 450 800 1200").gain(.3)

$: s("bd ~ cp ~ ~ bd sd ~").bank("linn9000").gain(.68)
`;

export const gpt55_song_07_split_horizon = `
setcpm(150/4)

$: s("bd*4").bank("tr909").gain(.82)

$: s("hh*8 oh ~ hh*4").bank("tr909").gain(.2).hpf(6000).room(.15)

$: n("0 1 0 3 5 3 7 5").scale("a:phrygian").s("square")
  .lpf("<250 450 900 600>").resonance(9).gain(.46).release(.08)

$: n("12 ~ 10 8 7 ~ 5 3").scale("a:phrygian").s("triangle").gain(.18).delay(.25)
`;

export const gpt55_song_08_tiny_orbitals = `
setcpm(112/4)

$: note("g3 b3 d4 f4 e4 d4 b3").s("sawtooth")
  .lpf(1000).gain(.4).attack(.03).release(.3).room(.3)

$: note("d5 ~ e5 g5 ~ b4 a4").s("sine").gain(.22).delay(.375).room(.5)

$: s("bd ~ ~ sd ~ bd ~ ~").bank("rolandtr808").gain(.7)

$: s("~ hh hh ~ hh ~ oh ~").bank("rolandtr808").gain(.18).hpf(5000)
`;

export const gpt55_song_09_redshift_bass = `
setcpm(134/4)

$: n("0 0 0 5 3 0 7 5").scale("e:minor").s("sawtooth")
  .lpf("<300 420 650 500>").resonance(10).gain(.55).release(.09)

$: s("bd ~ sd ~ bd bd ~ sd").bank("tr909").gain(.82)

$: s("hh*16").bank("tr909").gain(.16).hpf(7200)

$: note("b4 a4 g4 e4 g4 a4").s("triangle").gain(.2).room(.4).delay(.25)
`;

export const gpt55_song_10_night_bus_cache = `
setcpm(122/4)

$: note("bb2 db3 f3 ab3 f3 db3").s("supersaw")
  .lpf("<650 900 1400 1000>").gain(.42).attack(.05).release(.5).room(.45)

$: n("0 2 ~ 3 5 ~ 7 5").scale("bb:minor").s("square")
  .lpf(700).gain(.32).delay(.25)

$: s("bd ~ ~ sd bd ~ sd ~").bank("linn9000").gain(.72)
`;

export const gpt55_song_11_rusted_lighthouse = `
setcpm(108/4)

$: note("d3 f3 a3 c4 a3 f3").s("triangle")
  .gain(.35).attack(.08).release(.7).room(.65)

$: note("a4 ~ c5 d5 ~ f5 e5 c5").s("sawtooth")
  .lpf(1200).gain(.25).delay(.4)

$: s("bd ~ sd ~ ~ bd ~ sd").bank("rolandtr808").gain(.7)

$: s("~ hh ~ hh oh ~ hh ~").bank("rolandtr808").gain(.16).hpf(5500)
`;

export const gpt55_song_12_pixel_tide = `
setcpm(145/4)

$: n("0 4 7 11 7 4 2 0").scale("c:minor").s("square")
  .lpf("<500 900 1500 700>").resonance(6).gain(.42).release(.1)

$: s("bd*4").bank("tr909").gain(.8)

$: s("~ hh hh oh ~ hh sd hh").bank("tr909").gain(.2).hpf(6500)

$: note("g4 bb4 c5 eb5 d5 c5").s("sine").gain(.2).delay(.25).room(.45)
`;

export const gpt55_song_13_mirror_pollen = `
setcpm(100/4)

$: note("e3 g3 b3 d4 b3 g3").s("supersaw")
  .lpf(850).gain(.38).attack(.06).release(.6).room(.55)

$: note("b4 ~ d5 e5 ~ g5 fs5 d5").s("triangle")
  .gain(.22).delay(.5)

$: s("bd ~ ~ ~ sd ~ bd ~").bank("linn9000").gain(.68)
`;

export const gpt55_song_14_terminal_rain = `
setcpm(128/4)

$: n("0 2 3 7 5 3 2 0").scale("d:dorian").s("sawtooth")
  .lpf("<420 780 1100 680>").resonance(8).gain(.5).release(.11)

$: s("bd ~ sd ~ bd ~ sd bd").bank("tr909").gain(.82)

$: s("hh*8 ~ oh hh").bank("tr909").gain(.18).hpf(6400)

$: n("12 ~ 10 9 7 ~ 5 3").scale("d:dorian").s("sine").gain(.18).room(.55)
`;

export const gpt55_song_15_quartz_migration = `
setcpm(116/4)

$: note("c2 g2 bb2 eb3 g3 eb3 bb2").s("sawtooth")
  .lpf(520).gain(.44).attack(.03).release(.4)

$: note("g4 bb4 c5 eb5 c5 bb4").s("triangle")
  .gain(.23).delay(.375).room(.45)

$: s("bd ~ cp ~ ~ bd sd ~").bank("rolandtr808").gain(.74)

$: s("~ hh hh ~ hh oh ~ hh").bank("rolandtr808").gain(.15).hpf(6000)
`;

export const gpt55_song_16_velvet_interrupt = `
setcpm(138/4)

$: n("0 0 3 5 7 10 7 5").scale("f:minor").s("square")
  .lpf("<280 500 850 600>").resonance(9).gain(.48).release(.08)

$: s("bd*4").bank("tr909").gain(.84)

$: s("~ hh ~ hh oh hh ~ hh").bank("tr909").gain(.2).hpf(7000)

$: note("c5 ab4 f4 eb4 f4 ab4").s("sine").gain(.2).delay(.25).room(.35)
`;

export const gpt55_song_17_bent_satellite = `
setcpm(124/4)

$: note("a2 c3 e3 g3 e3 c3").s("supersaw")
  .lpf("<700 1000 1600 900>").gain(.4).attack(.05).release(.55).room(.4)

$: n("0 2 4 ~ 7 5 4 2").scale("a:minor").s("sawtooth")
  .lpf(900).gain(.32)

$: s("bd ~ sd ~ bd bd ~ sd").bank("linn9000").gain(.75)
`;

export const gpt55_song_18_clouded_encoder = `
setcpm(92/4)

$: note("g2 bb2 d3 f3 d3 bb2").s("triangle")
  .gain(.36).attack(.1).release(.8).room(.7)

$: note("d4 f4 g4 bb4 a4 f4 d4").s("sawtooth")
  .lpf(1100).gain(.24).delay(.5)

$: s("bd ~ ~ sd ~ ~ bd ~").bank("rolandtr808").gain(.66)
`;

export const gpt55_song_19_polymer_arcade = `
setcpm(152/4)

$: n("0 3 7 10 7 3 5 8").scale("e:minor").s("square")
  .lpf("<450 750 1300 900>").resonance(7).gain(.46).release(.09)

$: s("bd*4").bank("tr909").gain(.82)

$: s("hh*16").bank("tr909").gain(.14).hpf(7600)

$: note("b4 d5 e5 g5 e5 d5").s("sine").gain(.18).delay(.25).room(.5)
`;

export const gpt55_song_20_afterimage_station = `
setcpm(120/4)

$: note("f3 a3 c4 e4 c4 a3").s("supersaw")
  .lpf("<800 1200 1800 1000>").gain(.42).attack(.04).release(.5).room(.5)

$: n("0 ~ 2 4 5 ~ 7 5").scale("f:lydian").s("triangle")
  .gain(.24).delay(.375)

$: s("bd ~ sd ~ ~ bd ~ sd").bank("linn9000").gain(.72)

$: s("~ hh hh ~ oh ~ hh ~").bank("linn9000").gain(.16).hpf(6200)
`;
