setcpm(118/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.6)

$: s("hh*8").gain("[.2 .13]*4")

$: note("c2 g1 c2 f1").s("sawtooth").lpf(800)
  .release(.2).gain(.45)

$: n("0 3 7 5").scale("c:minor").s("square")
  .lpf(1500).release(.2).gain(.4)
