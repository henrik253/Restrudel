setcpm(124/4)

$: s("bd*2 sd bd*2 sd").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("c5 c5 c5 c5").s("sawtooth").lpf(1000)
  .resonance(6).release(.15).delay(.3).gain(.35)

$: note("<c2 g1 eb2 bb1>").s("square").lpf(600).release(.25).gain(.5)

$: n("<0 3 5 7>").scale("c:minor").s("sawtooth").lpf(1900).release(.15).room(.3).gain(.3)
