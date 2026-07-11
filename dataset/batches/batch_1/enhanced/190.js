setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ ~ ~ hh:0").bank("RolandTR808").gain(.2)

$: n("~ 8 6 8 9 13 12 9 ~ 6").scale("a:minor").s("sawtooth")
  .pan(.51).lpf(2400).release(.2).room(.3).gain(.4)

$: n("<a1 e2 f1 g1>").scale("a:minor").s("gm_electric_bass_pick")
  .lpf(700).release(.25).gain(.5)
