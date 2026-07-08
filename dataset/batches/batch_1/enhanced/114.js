setcpm(120/4)

$: s("bd*2 sd").bank("RolandTR909").gain(.85).pan(.55)

$: s("~ ~ bd ~").bank("RolandTR909").gain(.7)

$: s("hh*8").gain("[.2 .14]*4").pan(.45)

$: n("0 3 7 5 3 0").scale("g:minor").s("sawtooth")
  .lpf(1900).resonance(5).release(.15).delay(.3).gain(.4)

$: n("<g1 d2 bb1 d2>").scale("g:minor").s("square").lpf(600).release(.25).gain(.5)
