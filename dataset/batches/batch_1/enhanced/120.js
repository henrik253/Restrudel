setcpm(130/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("lt ~ mt ~").bank("RolandTR909").speed(1.3).gain(.5)

$: s("hh*16").gain("[.2 .13]*8").hpf(500)

$: n("0 3 7 5 3 0 5 3").scale("a:minor").s("square")
  .lpf(2200).resonance(6).release(.12).delay(.3).gain(.4)

$: n("<a1 e2 c2 e2>").scale("a:minor").s("sawtooth").lpf(600).release(.2).gain(.5)
