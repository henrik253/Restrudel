setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: n("0 3 7 5").scale("g:minor").s("gm_electric_guitar_jazz")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: note("g1 a1 a1 a1").sound("sawtooth").lpf(906)
  .release(.2).pan(.3).gain(.5)
