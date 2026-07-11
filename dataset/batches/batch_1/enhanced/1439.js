setcpm(114/4)

$: s("bd ~ sd ~").bank("AkaiLinn").gain(.85)

$: s("rd*4").gain(.2).pan(.4)

$: n("0 3 7 5 7 8 7 5").scale("d:minor").s("gm_oboe")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("0 3 7 10 7 5 3 0").scale("d:minor").s("gm_pad_bowed")
  .lpf(4000).release(.3).room(.4).gain(.3)

$: n("<d2 d2 a1 bb1>").scale("d:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
