setcpm(120/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("hh*8").gain("[.2 .12]*4").pan(.45)

$: note("bb3 d4 f4 bb4").s("sawtooth")
  .clip(.76).lpf(2000).resonance(5).release(.15).delay(.4).gain(.4)

$: n("-3 -3 -1 -1").scale("bb:lydian").s("square")
  .lpf(600).release(.2).gain(.5)
