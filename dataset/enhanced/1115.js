setcpm(108/4)

$: s("bd ~ sd ~").bank("linn9000").gain(.85)

$: s("sleighbells*4").hpf(80).lpf(2500).gain(.2)

$: note("c2 g1 c2 f1").s("sawtooth").lpf(2000)
  .release(.2).gain(.45)

$: n("0 3 7 5").scale("c:minor").s("square")
  .lpf(1500).release(.2).gain(.4)
