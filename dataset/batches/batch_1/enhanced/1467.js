setcpm(128/4)

$: s("bd*4").bank("RolandTR909").gain(.8)

$: s("hh*2 sd").hpf(2000).bank("RolandTR909").gain(.4)

$: s("oh*4").crush(8).gain(.3)

$: n("0 ~ 3 5 ~ 3 0 ~").scale("a:minor").s("square")
  .lpf(1800).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<a1 a1 f1 g1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
