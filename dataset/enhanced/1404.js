setcpm(126/4)

$: s("bd sd bd*2 ~ cp ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("g5 eb5 g5 bb5").sound("supersaw").lpf(1800)
  .release(.2).room(.4).gain(.4)

$: n("<c2 c2 g1 ab1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
