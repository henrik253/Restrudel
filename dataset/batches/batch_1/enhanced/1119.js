setcpm(110/4)

$: s("bd!4 ~ sd ~ hh*2 sd ht hh").bank("linn9000").gain(.7)

$: s("sleighbells*4").gain(.2).hpf(80)

$: n("0 3 7 5").scale("c:minor").s("supersaw")
  .lpf(2000).release(.2).room(.4).gain(.4)

$: note("c2 g1 c2 f1").s("sawtooth").lpf(700)
  .release(.2).gain(.45)
