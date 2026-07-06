setcpm(112/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR808").gain(.82)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: note("c4 eb4 g4 bb4 g4 eb4").s("gm_marimba")
  .release(.3).lpf(2500).room(.3).gain(.35)

$: note("<c2 c2 g1 ab1>").s("recorder_bass_sus")
  .lpf(700).release(.3).gain(.4)

$: note("<c3 eb3 g3 bb3>").s("sawtooth")
  .lpf(1400).release(.2).gain(.4)
