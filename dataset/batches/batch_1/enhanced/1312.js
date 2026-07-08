setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("shaker_small:3*4").gain(.2)

$: n("0 3 7 5").scale("d:minor").s("gm_piano")
  .clip(.95).release(2.5).attack(.043).gain(.4).room(.3)

$: n("<d1 a1 bb1 f1>").scale("d:minor").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
