setcpm(116/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: note("d4 ~ f4 ~ a4 f4 d4 ~").s("square")
  .lpf(2000).resonance(7).release(.15).segment(16).delay(.3).gain(.4)

$: n("<0 3 5 7>").scale("d:minor").s("pad")
  .lpf(1800).room(.5).release(.4).gain(.3)

$: n("<d2 d2 bb1 c2>").scale("d:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
