setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: n("7 5 3 5").scale("b:minor").s("triangle")
  .lpf(2000).release(.2).delay(.35).room(.3).gain(.4)

$: note("b2 b2 b1 f2").s("gm_electric_bass_finger:2")
  .lpf(700).release(.2).gain(.5)
