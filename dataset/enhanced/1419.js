setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.5 .3]*4").pan(.4)

$: note("a2*4 c3 a2 e2 a2").sound("sawtooth").lpf(2800)
  .release(.2).gain(.5)

$: n("0 3 7 5 7 3 0 ~").scale("a:minor").s("gm_overdriven_guitar")
  .lpf(2000).release(.2).room(.3).gain(.4)
