setcpm(104/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: n("<c2 g1 e2 g1>").scale("c:major").s("gm_electric_bass_finger")
  .lpf(700).release(.2).gain(.45)

$: note("c4 e4 g4 e4").s("gm_trombone").lpf(2000)
  .release(.3).room(.4).gain(.35)
