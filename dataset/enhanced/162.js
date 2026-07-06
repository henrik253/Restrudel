setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh27*8").gain(.18)

$: note("a2*8").s("sawtooth").room(.5).delay(.2)
  .lpf(1400).release(.2).gain(.4)

$: n("<0 3 5 7>").scale("a:minor").s("gm_vibraphone")
  .room(.4).speed(.91).gain(.35)

$: n("<a1 e2 f1 g1>").scale("a:minor").s("square")
  .lpf(600).release(.25).gain(.5)
