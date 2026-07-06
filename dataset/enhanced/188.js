setcpm(120/4)

$: s("bd*3 ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.16)

$: n("0 -3 0 0").scale("d:minor").s("gm_drawbar_organ")
  .room(.3).release(.3).gain(.4)

$: n("-2 -1 0 -7").scale("d:minor").s("sawtooth")
  .lpf(2000).release(.2).gain("[.4 .25]*2")

$: n("<d2 a1 bb1 f1>").scale("d:minor").s("gm_electric_bass_finger:2")
  .lpf(700).release(.25).gain(.5)
