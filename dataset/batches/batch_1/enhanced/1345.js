setcpm(120/4)

$: s("bd ~ snare ~ ~ snare ~ snare").bank("RolandTR909").gain(.85).room(.2)

$: s("hh*8").gain("[.2 .12]*4")

$: n("0 3 7 5").scale("e:minor").s("gm_overdriven_guitar")
  .lpf(2200).release(.2).gain(.35)

$: note("~ e2 ~ b1").s("gm_electric_bass_finger")
  .lpf(500).release(.3).gain(.55)
