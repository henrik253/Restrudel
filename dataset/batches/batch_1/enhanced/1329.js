setcpm(128/4)

$: s("bd*2 bd*4").bank("RolandTR909").gain(.7)

$: s("~ sd ~ sd").gain(.7)

$: note("~ c2 ~ g1").s("gm_electric_bass_finger")
  .lpf(500).release(.3).gain(.55)

$: n("0 3 7 5").scale("c:minor").s("sawtooth")
  .lpf(1600).release(.2).gain(.4)
