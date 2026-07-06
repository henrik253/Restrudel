setcpm(120/4)

$: s("bd ~ sd ~").bank("Linn9000").clip(.92).gain(.75).room(.4)

$: s("hh*2 hh hh*2 hh").gain(.2)

$: n("<0 3 5 3>").scale("e:minor").s("gm_electric_bass_finger")
  .lpf(967).room(.3).delay(.35).gain(.5)

$: n("0 ~ 3 ~ 5 3 0 ~").scale("e:minor").s("sawtooth")
  .lpf(1600).resonance(6).release(.2).delay(.3).gain(.4)
