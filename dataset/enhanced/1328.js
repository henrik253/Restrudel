setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4").gain(.2)

$: n("0 3 7 5").scale("e:minor").s("gm_lead_6_voice")
  .lpf(2400).release(.2).room(.3).gain(.35)

$: note("~ e2 ~ b1").s("gm_electric_bass_finger")
  .lpf(500).release(.3).gain(.55)
