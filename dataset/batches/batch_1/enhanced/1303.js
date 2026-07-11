setcpm(122/4)

$: s("bd:1 ~ bd:1 ~").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("Linn9000").gain(.7)

$: note("c2*8 bb1 ab1 g1").s("sawtooth")
  .lpf(700).release(.12).gain(.4)

$: note("g2 b2 d3 g3").s("square")
  .gain("0.3 0.4 0.35 0.45").release(.4).lpf(1800).room(.3)
