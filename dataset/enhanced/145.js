setcpm(120/4)

$: s("bd*2 ~ ~ bd").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("c1 f1 c1 f1").s("sawtooth")
  .cutoff(800).decay(.1).sustain(.8).delay(.4).hpf(200).lpf(2000).release(.2).gain(.5)

$: note("<c3 g2 eb3 bb2>").s("square").lpf(1800).release(.2).delay(.3).gain(.35)
