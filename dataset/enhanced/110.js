setcpm(128/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("hh*16").gain("[.2 .13]*8").hpf(600)

$: note("d2 g2 bb2 eb2 bb3 a2 d2 g2 bb2 eb2 f#2 b2").s("supersaw")
  .lpf(600).hpf(200).release(.15).gain(.4)

$: note("<d1 g1 bb1 eb1>").s("sawtooth").lpf(500).release(.3).gain(.5)
