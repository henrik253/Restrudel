setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2).pan(.45)

$: n("0 3 7 5").scale("c:minor").s("gm_overdriven_guitar")
  .lpf(987).release(.2).room(.57).gain(.4)

$: n("<c2 g1 ab1 f1>").scale("c:minor").s("gm_electric_bass_finger")
  .lpf(700).release(.2).gain(.5)
