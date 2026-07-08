setcpm(122/4)

$: s("bd ~ sd ~").bank("linn9000").gain(.85)

$: s("hh*16").speed(.9).gain("[.2 .13]*8").pan(.5)

$: note("c2 g1 c2 g1").s("gm_electric_bass_finger:2").lpf(700).release(.2).gain(.5)

$: s("gm_synth_strings_1").note("c4 eb4 g4 bb4").clip(1).room(.6).release(.3).gain(.35)

$: n("<0 3 5 7>").scale("c:minor").s("sawtooth")
  .lpf(1900).resonance(5).release(.15).delay(.3).gain(.35)
