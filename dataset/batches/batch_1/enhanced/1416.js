setcpm(120/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("linndrum_hh*8").gain(.2).pan(.4)

$: n("0 3 7 5").scale("e:minor").s("gm_electric_guitar_jazz")
  .lpf(2000).release(.2).room(.3).pan(.3).gain(.4)

$: n("<e2 e2 b1 c2>").scale("e:minor").s("gm_electric_bass_finger")
  .lpf(700).release(.2).delay(.4).delaytime(.1).delayfeedback(.5).gain(.5)
