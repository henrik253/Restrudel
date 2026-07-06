setcpm(126/4)

$: s("bd*4").bank("RolandTR909").gain(.6)

$: s("hh*16").lpf(200).gain(.2).release(.07)

$: note("e1 ~ e1 ~").s("sawtooth").lpf(600)
  .release(.2).gain(.45)

$: n("0 3 7 5").scale("e:minor").s("square")
  .lpf(1500).release(.2).gain(.4)
