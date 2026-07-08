setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("shaker*16").gain(.15).pan(.4)

$: n("0 3 7 5").scale("c:minor").s("supersaw")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("0 3 7 10 7 5 3 0").scale("c:minor").s("gm_distortion_guitar")
  .lpf(1500).release(.2).gain(.3)

$: n("<c2 c2 g1 ab1>").scale("c:minor").s("gm_electric_bass_finger")
  .lpf(700).release(.2).gain(.5)
