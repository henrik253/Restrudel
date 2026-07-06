setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh!4").gain(.2).pan(.4)

$: s("~ cymbal ~ ~").gain(.25).room(.4)

$: n("6 8 5 3 6 8 10 8").scale("a:minor").s("gm_cello")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("<a1 a1 e1 f1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
