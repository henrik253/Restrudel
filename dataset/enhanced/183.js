setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: note("a3 d4 d#4 d4 a3 d5 c#5 c5").s("sawtooth")
  .lpf(2400).release(.2).room(.3).gain(.4)

$: n("<0 3 5 7>").scale("a:minor").s("gm_electric_bass_finger:2")
  .lpf(700).release(.25).gain(.5)
