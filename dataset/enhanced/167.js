setcpm(126/4)

$: s("bd ~ sd*2 ~").bank("RolandTR909").clip(.95).gain(.7)

$: s("hh*2 ~ hh sd*2").gain(.5)

$: n("3 -1 ~ -1 -1 0").scale("a:minor").s("triangle")
  .lpf(2400).release(.2).room(.3).gain(.4)

$: note("a2*8").s("square").hpf(478).lpf(1000)
  .release(.15).gain(.45)
