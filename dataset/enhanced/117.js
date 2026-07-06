setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .14]*4").pan(.5)

$: note("c4 eb4 g4 f4").s("clavisynth")
  .lpf(2800).room(.6).release(.2).gain(.4)

$: note("c2 g1 eb2 bb1").s("gm_electric_bass_finger").lpf(700).release(.25).gain(.5)

$: n("<0 3 5 7>").scale("c:minor").s("sawtooth")
  .lpf(1900).resonance(5).release(.15).delay(.3).gain(.35)
