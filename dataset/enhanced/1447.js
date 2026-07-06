setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("cowbell ~ ~ ~").gain(.3).room(.4)

$: note("d2*4 e2 d2 c2 d2").sound("sawtooth").lpf(4813)
  .release(.5).gain(.5)

$: n("0 3 7 5 7 3 0 ~").scale("d:minor").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)
